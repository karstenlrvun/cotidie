/* ======================================================================
   Cotidie — time (2026-09-17, the rebuild)

   What a sitting costs in minutes, how many of today's minutes are spent,
   and whether the day's limit has been reached. Pure logic, no DOM. Loads
   after fsrs.js (uses dayKey, effRollover, FSRS_DAY, FSRS_MIN).

   ---- everything here is DERIVED from the log, nothing is counted ----
   The same choice introducedOn() makes in fsrs.js, for the same reason: a
   counter would have to survive sync, import and a rollover change, and a
   derived figure cannot disagree with the rows it came from. Two devices
   that merge their logs agree on the minutes without any extra rule.

   ---- what one answer costs ----
   A log row is stamped when the answer is SUBMITTED, so the gap between two
   consecutive stamps is the first answer's time on the verdict plus the
   second answer's thinking and typing: the whole cost of a press, including
   the part `latencyMs` never sees. A gap longer than TIME_CAP_MS is a break,
   not a slow answer, and falls back to the row's own latency.

   Table rows (store.tlog, see tables.js) carry their own duration,
   because a table takes longer than any sensible break threshold.

   Borrowed from Clepsydra as an idea, not as code: means rather than medians
   (a budget is a SUM of presses, and n presses cost n times the mean), a
   prior that the first few answers ease away from, and a limit at which
   nothing new opens.
   ====================================================================== */

const TIME_CAP_MS = 60000;
// Priors, in ms per answer, used until his own answers replace them.
//   N  a cell met for the first time      L  a learning / relearning step
//   R  a spaced review                    T  one CELL of a typed table
// Typed production is slow next to a vocabulary card's 5 seconds: the form
// has to be built, then typed, and Greek diacritics are a fifth of all keys.
const TIME_PRIOR = { N:14000, L:9000, R:9000, T:4500 };
const TIME_PRIOR_WEIGHT = 8;      // the prior counts as this many answers
const TIME_WINDOW = 300;          // only the most recent answers of a kind
const EXTEND_STEP_MIN = 5;

let _timeCache = { log:null, fp:null, n:-1, m:-1, roll:null, out:null };

// One entry per review row and per first-pass row, in time order:
//   { ts, day, kind, ms, cells }
// `cells` is 1 for a review and the table's size for a first-pass row, so a
// per-cell cost can be had from either.
function timeLine(store, rollover){
  const log = Array.isArray(store.log) ? store.log : [];
  const fp = Array.isArray(store.tlog) ? store.tlog : [];
  const c = _timeCache;
  if (c.log===log && c.fp===fp && c.n===log.length && c.m===fp.length && c.roll===rollover) return c.out;

  const ev = [];
  log.forEach(r => { if (r && Number.isFinite(r.ts)) ev.push({ ts:r.ts, row:r, fp:false }); });
  fp.forEach(r => { if (r && Number.isFinite(r.ts)) ev.push({ ts:r.ts, row:r, fp:true }); });
  ev.sort((a,b) => a.ts - b.ts);

  const seen = Object.create(null), lastIvl = Object.create(null), out = [];
  let prevTs = null;
  ev.forEach(e => {
    const r = e.row;
    if (e.fp){
      const ms = Math.max(Math.min(r.ms|0, 10*FSRS_MIN), 0);
      out.push({ ts:e.ts, day:dayKey(e.ts, rollover), kind:'T', ms, cells:Math.max(r.n|0, 1) });
      (r.miss || []).forEach(id => { seen[id] = true; });
    } else {
      const id = r.cardId;
      const kind = !seen[id] ? 'N' : (lastIvl[id]!=null && lastIvl[id] < FSRS_DAY) ? 'L' : 'R';
      seen[id] = true; lastIvl[id] = r.ivl;
      const gap = prevTs==null ? -1 : e.ts - prevTs;
      const own = Math.min(Math.max(r.latencyMs|0, 0), TIME_CAP_MS);
      const ms = (gap > 0 && gap <= TIME_CAP_MS && gap >= own) ? gap : own;
      out.push({ ts:e.ts, day:dayKey(e.ts, rollover), kind, ms, cells:1 });
    }
    prevTs = e.ts;
  });
  _timeCache = { log, fp, n:log.length, m:fp.length, roll:rollover, out };
  return out;
}

// Minutes spent on study day `dayK`, in ms.
function usedMs(store, dayK, rollover){
  let ms = 0;
  timeLine(store, rollover).forEach(e => { if (e.day === dayK) ms += e.ms; });
  return ms;
}

// What one answer of this kind is expected to cost him, in ms. For 'T' it is
// the cost of one CELL of a table, so a table of six costs six of these.
function costMs(store, kind, rollover){
  const prior = TIME_PRIOR[kind] || TIME_PRIOR.R;
  const line = timeLine(store, rollover);
  let sum = 0, n = 0;
  for (let i=line.length-1; i>=0 && n<TIME_WINDOW; i--){
    const e = line[i];
    if (e.kind !== kind) continue;
    sum += e.ms / e.cells; n++;
  }
  return (sum + TIME_PRIOR_WEIGHT*prior) / (n + TIME_PRIOR_WEIGHT);
}

// ---- the daily limit ----
// settings.minutesPerDay: 0 means no limit. store.extra[dayK] holds minutes
// he added by hand on that day ("five more"), in ms.
function limitOn(store){ return ((store.settings && store.settings.minutesPerDay)|0) > 0; }
function budgetMs(store, dayK){
  if (!limitOn(store)) return 0;
  const extra = (store.extra && store.extra[dayK])|0;
  return (store.settings.minutesPerDay|0)*FSRS_MIN + extra;
}
// `other` is the other language's store: the limit is ONE limit for all of
// Cotidie, so minutes spent on Latin count against Greek's day and the other
// way round. The minutes figure itself lives in whichever store is asking
// (the page writes a change to both).
function usedTodayMs(store, now, other){
  const roll = effRollover(store.settings, now), d = dayKey(now, roll);
  return usedMs(store, d, roll) + (other ? usedMs(other, d, roll) : 0);
}
function budgetTodayMs(store, now, other){
  if (!limitOn(store)) return 0;
  const roll = effRollover(store.settings, now), d = dayKey(now, roll);
  return budgetMs(store, d) + ((other && other.extra && other.extra[d])|0);
}
function limitReached(store, now, other){
  if (!limitOn(store)) return false;
  return usedTodayMs(store, now, other) >= budgetTodayMs(store, now, other);
}
function extendToday(store, now, minutes){
  const roll = effRollover(store.settings, now), d = dayKey(now, roll);
  if (!store.extra || typeof store.extra !== 'object') store.extra = {};
  store.extra[d] = ((store.extra[d])|0) + (minutes==null ? EXTEND_STEP_MIN : minutes)*FSRS_MIN;
  return store.extra[d];
}

// What Home says before a sitting: how long the due cards will take, and how
// much of today is left after them for new material. `due` is dueCards()'s
// list (an item with no card is a never-seen cell).
function sittingPlan(store, due, now){
  const roll = effRollover(store.settings, now), d = dayKey(now, roll);
  let dueMs = 0;
  due.forEach(item => {
    const c = item.card;
    const kind = !c ? 'N' : (c.st==='L' || c.st==='X') ? 'L' : 'R';
    dueMs += costMs(store, kind, roll);
  });
  const used = usedMs(store, d, roll), budget = budgetMs(store, d);
  const left = limitOn(store) ? Math.max(budget - used, 0) : Infinity;
  return { usedMs:used, budgetMs:budget, leftMs:left, dueMs,
           spareMs: left===Infinity ? Infinity : Math.max(left - dueMs, 0) };
}
