/* ======================================================================
   Cotidie — tables as a unit of study (2026-09-17, the rebuild)

   Until now the only thing the scheduler knew was the CELL: one form, asked
   cold. That is the right unit for a form he keeps missing and the wrong one
   for everything he already knows, because the cost of a question is mostly
   per QUESTION (read the prompt, recall, type, read the verdict, move on:
   about 9 s) and hardly at all per form. Six forms typed down a table cost
   about 25 s; the same six asked one at a time cost about 55.

   So a TABLE gets a card of its own. His calls, 2026-09-17:
     - the first pass is typing each table once;
     - a table typed entirely right is KNOWN and returns as a table;
     - a table with a miss is SHAKY: it returns sooner, and each missed form
       becomes an ordinary cell card, drilled alone until it holds;
     - the first pass is not a separate chore -- it is the new-material
       stream inside Start, core tables first.

   Pure logic, no DOM. Loads after engine.js, fsrs.js and time.js.

   ---- what is stored, and where ----
   store.cards['T|<class>|<sub>']  a table's card: the usual FSRS fields plus
                                   tb:1. The '|' keeps it out of the way of
                                   every reader that splits a cell id on ':'.
   store.cards['<word>:<cat>:<cell>']  unchanged. `rj` on one means the form
                                   has rejoined its table and is no longer
                                   asked alone.
   store.tlog[]                    one row per table typed or revealed:
                                   {ts, table, word, ms, n, miss[], first,
                                    rating, ivl, rv}. Its own log on purpose:
                                   store.log stays what it has always been,
                                   one row per form asked cold, so nothing
                                   fitted to it later is fitted to a mixture.
   ====================================================================== */

const TABLE_PREFIX = 'T|';
// Starting strengths, in days. Priors, not findings: Clepsydra's "known" and
// "shaky" words started at the same figures and were then refitted from his
// own first reviews. Flagged in in-progress/REBUILD_LOG.md for the same.
const TABLE_S_KNOWN = 18, TABLE_S_SHAKY = 4;
// A form drilled alone rejoins its table once it has held this long; and a
// table this strong may be reviewed by reveal-and-grade instead of typing.
const REJOIN_DAYS = 21, REVEAL_DAYS = 21;
// A table typed entirely right the first time is retired: he produced every
// form of it cold, which is the same evidence Clepsydra retires a word on.
// A QUARTER of them are given one audit at AUDIT_DAYS instead of going away
// for good -- retiring destroys the evidence that retiring was safe, and a
// sample large enough to estimate a proportion costs about half a minute a
// day. This is the tripwire; see in-progress/RETENTION_MEASUREMENT.md.
const AUDIT_DAYS = 120, AUDIT_SPREAD = 60, AUDIT_SHARE = 0.25;
const TABLE_FAR = 36500 * FSRS_DAY;

// A small deterministic hash of an id, in [0,1) -- so two devices agree on how
// each table's first return is spread without having to store the spread.
function idUnit(id, salt){
  let h = 2166136261 >>> 0; const s = String(id) + '|' + (salt || '');
  for (let i=0; i<s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

function isTableId(id){ return typeof id === 'string' && id.indexOf(TABLE_PREFIX) === 0; }

// Which printed table a cell belongs to, within its class.
//   nouns, principal parts   the whole word is one table
//   adjectivals              one table per gender (that is how they are printed)
//   verbs                    one table per tense/voice/mood -- except that the
//                            infinitives, one cell each, are gathered into one
function tableSubOf(cls, classKey, category, cell){
  if (cls.kind === 'adj') return String(cell).split('.')[0];
  if (cls.kind === 'verb' && classKey.indexOf('pp_') !== 0) return /\.inf$/.test(category) ? 'inf' : category;
  return '';
}

// Every table of a language, in data order: [{key, classKey, sub, cells[]}].
let _tablesCache = new Map();
function tablesOf(table){
  if (_tablesCache.has(table)) return _tablesCache.get(table);
  const out = [], byKey = Object.create(null);
  Object.keys(table).forEach(classKey => {
    const cls = table[classKey];
    orderedCells(table, classKey).forEach(c => {
      const sub = tableSubOf(cls, classKey, c.category, c.cell);
      const key = TABLE_PREFIX + classKey + '|' + sub;
      let t = byKey[key];
      if (!t){ t = byKey[key] = { key, classKey, sub, cells: [] }; out.push(t); }
      t.cells.push({ category: c.category, cell: c.cell });
    });
  });
  _tablesCache.set(table, out);
  return out;
}

// The cells of table `t` that this particular word really has.
function tableCellsFor(entry, t){
  return t.cells.filter(c => entryHasCell(entry, c.category, c.cell));
}

// The words a table can be shown with: those of its class that have the most
// of its cells (sedeō has one passive form; amō has all six, so amō it is).
function tableWords(vocab, t){
  const words = vocab.filter(e => e.class === t.classKey);
  let best = 0;
  words.forEach(e => { best = Math.max(best, tableCellsFor(e, t).length); });
  return best ? words.filter(e => tableCellsFor(e, t).length === best) : [];
}

// Which word a table is shown with this time. Latin classes hold many words on
// one pattern, so each return uses the next one; a Greek class holds one.
function tableWordFor(store, vocab, t){
  const words = tableWords(vocab, t);
  if (!words.length) return null;
  const c = store.cards[t.key];
  return words[((c && c.reps) | 0) % words.length];
}

// ---- core first ----
// The order the first pass meets tables in. Lower is sooner. Deliberately a
// short list of plain rules rather than a hand-ranked list of 1,000 tables.
function tableRank(t, cls){
  const k = t.classKey, sub = t.sub;
  const mood = /\.(subj|opt|imper)$/.test(sub) ? 2 : sub === 'inf' ? 1 : 0;
  if (k === 'article') return 0;
  if (/^(decl[12]|sum$)/.test(k)) return 1;
  if (k === 'thematic' || /^conj/.test(k)) return 2 + mood * 3;
  if (k === 'athematic_eimi') return 3 + mood * 3;
  if (/^decl3/.test(k)) return 4;
  if (/^(adj_|pron_|rel_)/.test(k)) return 5;
  if (/^(possum|eo|fero|volo|nolo|malo|fio)$/.test(k)) return 6;
  if (/^contract_/.test(k)) return 7 + mood * 2;
  if (/^part_(pres|fut|aor|perf)_/.test(k)) return 9;
  if (/^num_/.test(k)) return 10;
  if (/^athematic/.test(k)) return 12 + mood;
  if (/^athaor_/.test(k)) return 14;
  if (/^part_/.test(k)) return 15;
  if (/^cmp_/.test(k)) return 16;
  if (/^pp_/.test(k)) return 17;
  return 11;
}
let _rankedCache = new Map();
function rankedTables(table){
  if (_rankedCache.has(table)) return _rankedCache.get(table);
  const out = tablesOf(table).map((t, i) => ({ t, i, r: tableRank(t, table[t.classKey]) }))
    .sort((a, b) => (a.r - b.r) || (a.i - b.i)).map(x => x.t);
  _rankedCache.set(table, out);
  return out;
}

// ---- recording a table ----
// results: [{category, cell, correct}] for the cells shown. `opts.reveal` marks
// a reveal-and-grade review, where a miss cannot say WHICH forms were missed.
// Mutates the store; returns {first, allRight, card, ivl, missIds}.
function recordTable(store, t, entry, results, ms, now, opts){
  now = now == null ? Date.now() : now;
  const roll = effRollover(store.settings, now), today = dayKey(now, roll);
  const prior = store.cards[t.key], first = !prior;
  const missIds = results.filter(r => !r.correct).map(r => cardId(entry.id, r.category, r.cell));
  const allRight = missIds.length === 0 && !(opts && opts.revealMissed);
  // Everything this is about to overwrite, kept so undoTable() can put it
  // back exactly. See the note above that function for why it is this and
  // not a copy of the store.
  const undo = { table:t.key, card: prior ? Object.assign({}, prior) : null,
                 cells: [], row: null, hadTlog: Array.isArray(store.tlog) };
  let card, rating;

  const audit = !first && !!prior.ret;          // this return is a retired table's one audit
  if (first){
    rating = allRight ? GOOD : HARD;
    const s = allRight ? TABLE_S_KNOWN : TABLE_S_SHAKY;
    const days = nextInterval(s, store.settings.retention, store.settings.maxIvl);
    card = { st:'R', step:null, s, d:initD(rating, true), due:dayStart(today + days, roll),
             last:now, reps:1, lapses:0, tb:1 };
    // Typed entirely right, cold: retired, which replaces that due date.
    if (allRight) retire(card, t, today, roll, now);
  } else if (allRight){
    card = schedule(prior, GOOD, now, store.settings).card;
    card.tb = 1;
    rating = GOOD;
    // An audit passed is the end of it: retired for good, no second audit.
    if (audit){ card.ret = 1; delete card.aud; card.due = now + TABLE_FAR; }
  } else {
    /* A miss HOLDS the table where it is (2026-09-20, from the workload
       simulation). It used to lapse: one form wrong out of twelve cut the
       table's strength more than fourfold and brought it back in days, so a
       large table could never settle -- at 95% a form, a twelve-form table
       comes back imperfect 47% of the time. Holding gives it no credit either
       (strength and difficulty are untouched); it simply comes back after the
       same interval it has just served, while the forms actually missed are
       drilled one by one below, which is where the relearning belongs.

       Honest by construction: the row still carries every missed form, so
       form-level recall -- the number that says whether this was safe -- is
       computed from the log, not from the rating. */
    rating = HARD;
    const served = (prior.due != null && prior.last != null) ? prior.due - prior.last
                 : nextInterval(prior.s, store.settings.retention, store.settings.maxIvl) * FSRS_DAY;
    card = Object.assign({}, prior, { st:'R', step:null, tb:1, last:now,
             reps:(prior.reps | 0) + 1, holds:(prior.holds | 0) + 1 });
    delete card.ret; delete card.aud;          // an audit with a miss un-retires it
    card.due = dayStart(today + Math.max(1, Math.round(served / FSRS_DAY)), roll);
  }
  store.cards[t.key] = card;

  missIds.forEach(id => {
    const c = store.cards[id];
    undo.cells.push({ id, card: c ? Object.assign({}, c) : null });
    if (!c){ const f = freshCard(); f.due = now; store.cards[id] = f; }
    else { delete c.rj; c.due = Math.min(c.due == null ? now : c.due, now); }
  });

  if (!Array.isArray(store.tlog)) store.tlog = [];
  const row = { ts:now, table:t.key, word:entry.id, ms:Math.max(ms|0, 0), n:results.length,
                miss:missIds, first:first ? 1 : 0, rating, ivl:card.due - now };
  if (opts && (opts.reveal || opts.revealMissed)) row.rv = 1;
  // Which rule this return was scheduled under, so a month of these can be
  // read back and the change judged rather than assumed.
  if (card.ret) row.ret = 1;
  if (audit) row.aud = 1;
  if (!first && !allRight) row.hold = 1;
  store.tlog.push(row);
  undo.row = row;
  return { first, allRight, card, ivl: card.due - now, missIds, undo };
}

// Retiring a table typed entirely right the first time. A quarter of them keep
// one audit date; the rest go past the end of the calendar.
function retire(card, t, today, roll, now){
  card.ret = 1;
  if (idUnit(t.key, 'audit') < AUDIT_SHARE){
    // Spread over the two months after AUDIT_DAYS. A sitting's worth of tables
    // retired on one day would otherwise all come back for audit on one day --
    // which is what the first-return spread used to prevent, before retiring
    // took over that due date.
    card.aud = 1;
    card.due = dayStart(today + AUDIT_DAYS + Math.round(AUDIT_SPREAD * idUnit(t.key, 'spread')), roll);
  } else card.due = now + TABLE_FAR;
}

/* ---- taking a table check back (2026-09-20) --------------------------------
   recordTable is the one place in the app where a single keystroke writes
   eight forms at once: Enter on a table not yet typed grades every cell as
   blank. Nothing else can go so wrong so fast, so this is the one place with
   a way back.

   What it restores is the inverse of the writes above -- one table card, the
   cell cards the misses made or touched, one log row -- rather than a copy of
   the whole store. A store copy would mean cloning a log of tens of thousands
   of rows every time a table is checked, on the phone, to cover a button
   almost never pressed.

   The row is found by identity, not by position, and that is the whole safety
   check: if a merge has landed in between, the log has been rebuilt out of
   different objects, this one is not in it, and the undo refuses rather than
   deleting somebody else's row. It cannot reach a copy already pushed to the
   server; index.html reschedules the push instead, so in practice the bad
   copy never leaves the device.
   ------------------------------------------------------------------------ */
function undoTable(store, u){
  if (!store || !u || !u.row) return false;
  const tl = Array.isArray(store.tlog) ? store.tlog : [];
  const i = tl.lastIndexOf(u.row);
  if (i < 0) return false;
  tl.splice(i, 1);
  if (u.card) store.cards[u.table] = u.card; else delete store.cards[u.table];
  u.cells.forEach(c => { if (c.card) store.cards[c.id] = c.card; else delete store.cards[c.id]; });
  if (!u.hadTlog && !tl.length) delete store.tlog;
  return true;
}

// Called after a cell has been reviewed alone: once it has held long enough it
// goes back to being part of its table and stops being asked by itself.
function afterCellReview(store, id){
  const c = store.cards[id];
  if (c && c.st === 'R' && c.s >= REJOIN_DAYS){ c.rj = 1; return true; }
  return false;
}

/* ---- starting a table again (2026-09-20) -----------------------------------
   His ask, the same day as the undo: the undo only reaches a check still on
   screen, and a table can be wrong about him days later -- above all one he
   FLUKED, which goes straight to eighteen days' strength and is not asked
   again for a fortnight.

   What this removes is everything that says the table has been met: its own
   card, the cell cards its forms carry, and its rows in the table log. The
   cell cards have to be looked up across every word the table can be shown
   with, because a Latin table is a pattern that rotates through its class and
   may have been typed with more than one of them.

   `store.log` is deliberately left alone. Those are answers he really gave,
   and this is a scheduling decision, not a claim that they did not happen.
   ------------------------------------------------------------------------ */
function tableFootprint(store, t, vocab){
  const ids = [];
  tableWords(vocab, t).forEach(entry => tableCellsFor(entry, t).forEach(c => {
    const id = cardId(entry.id, c.category, c.cell);
    if (store.cards[id]) ids.push(id);
  }));
  const rows = (Array.isArray(store.tlog) ? store.tlog : []).filter(r => r && r.table === t.key).length;
  return { ids, rows, met: !!store.cards[t.key] };
}
function forgetTable(store, t, vocab){
  const f = tableFootprint(store, t, vocab);
  delete store.cards[t.key];
  f.ids.forEach(id => { delete store.cards[id]; });
  if (f.rows) store.tlog = store.tlog.filter(r => !(r && r.table === t.key));
  return f;
}

/* ---- the number that says whether the two rules above were safe ------------
   Form-level recall inside a table he has met before: of every form asked in
   a returning table, how many did he actually produce? This is the honest
   measure now that a miss no longer lapses the table -- the rating on the row
   says the table kept its place, while `miss` still names every form that was
   wrong, so the truth is in the log whatever the scheduler did with it.

   Reveal-and-grade returns are excluded: a miss there cannot say WHICH forms,
   so they would enter as an unknown number of wrong answers.

   Audits are the retired tables' tripwire, reported separately, because they
   answer a different question: not "is the schedule right" but "was retiring
   these at all a safe thing to do".
   ------------------------------------------------------------------------ */
function tableRecall(store){
  const rows = Array.isArray(store.tlog) ? store.tlog : [];
  const o = { returns:0, asked:0, right:0, held:0, audits:0, auditsPassed:0,
              auditAsked:0, auditRight:0, retired:0, rate:null, auditRate:null, firstPerfect:0, firsts:0 };
  rows.forEach(r => {
    if (!r || typeof r !== 'object') return;
    const n = r.n | 0, miss = Array.isArray(r.miss) ? r.miss.length : 0;
    if (r.first){ o.firsts++; if (!miss) o.firstPerfect++; return; }
    if (r.rv) return;
    o.returns++; o.asked += n; o.right += n - miss;
    if (r.hold) o.held++;
    if (r.aud){ o.audits++; o.auditAsked += n; o.auditRight += n - miss; if (!miss) o.auditsPassed++; }
  });
  Object.keys(store.cards || {}).forEach(k => { if (isTableId(k) && store.cards[k] && store.cards[k].ret) o.retired++; });
  if (o.asked) o.rate = o.right / o.asked;
  if (o.auditAsked) o.auditRate = o.auditRight / o.auditAsked;
  return o;
}

/* ---- the cold sheet (2026-09-20) -------------------------------------------
   Every other measure in the app is conditioned on what the scheduler chose to
   ask. That is the one thing they cannot escape: a scheduler that stops asking
   the hard things shows rising recall while knowledge falls, and retiring a
   table removes it from the asking altogether.

   So this samples UNIFORMLY from every form he has ever met -- retired tables
   included, due or not, asked yesterday or not -- and is recorded nowhere that
   the scheduler can see. It is the only unbiased number in the app, and the
   closest thing in it to the exam.

   One form per cell of every table he has a card for, shown with the word that
   table would be shown with now. Forms drilled alone are cells of met tables,
   so they are already in the pool.
   ------------------------------------------------------------------------ */
function metForms(store, vocab, table){
  const out = [];
  rankedTables(table).forEach(t => {
    if (!store.cards[t.key]) return;
    const entry = tableWordFor(store, vocab, t); if (!entry) return;
    tableCellsFor(entry, t).forEach(c => out.push({ table:t.key, entry, category:c.category, cell:c.cell }));
  });
  return out;
}

// `rnd` is passed in so the tests can pin the sampling; the app passes
// Math.random, because a sheet drawn the same way every month would stop being
// a sample of what he knows and start being a deck of its own.
function coldSample(store, vocab, table, n, rnd){
  rnd = rnd || Math.random;
  const pool = metForms(store, vocab, table);
  for (let i = pool.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); const x = pool[i]; pool[i] = pool[j]; pool[j] = x; }
  return pool.slice(0, Math.min(n, pool.length));
}

// The result, kept apart from every log the scheduler reads. Capped, because
// it is a record of measurements and not of reviews.
const COLD_KEEP = 24;
function recordCold(store, n, right, ms, now){
  if (!Array.isArray(store.cold)) store.cold = [];
  store.cold.push({ ts: now == null ? Date.now() : now, n:n|0, right:right|0, ms:Math.max(ms|0,0) });
  if (store.cold.length > COLD_KEEP) store.cold = store.cold.slice(-COLD_KEEP);
  return store.cold[store.cold.length - 1];
}

function tableMode(store, t){
  const c = store.cards[t.key];
  const on = !store.settings || store.settings.revealOld !== false;
  return (on && c && c.s >= REVEAL_DAYS) ? 'reveal' : 'typed';
}

// ---- what is due ----
// Cell cards that exist and are being drilled alone. A cell with no card is
// NOT due here (dueCards() in fsrs.js would say it was): an unmet form arrives
// inside its table, never cold.
function dueCells(store, vocab, table, now){
  return dueCards(store, vocab, table, now).filter(item => item.card && !item.card.rj);
}
function dueTables(store, table, now){
  return rankedTables(table).filter(t => { const c = store.cards[t.key]; return c && c.due != null && c.due <= now; });
}
function unmetTables(store, table, vocab){
  return rankedTables(table).filter(t => !store.cards[t.key] && tableWords(vocab, t).length);
}

// The next thing a sitting should ask, or null when there is nothing (or
// nothing the day's minutes allow). Asked again after every answer rather than
// planned up front, so a form on a one-minute step reappears when it is due.
//   {type:'cell', item}  {type:'table', t, entry, mode, first}
//   {type:'limit'}       the day's minutes are spent
function nextItem(store, vocab, table, now, rng, other){
  now = now == null ? Date.now() : now;
  if (limitReached(store, now, other)) return { type:'limit' };
  const cells = dueCells(store, vocab, table, now);
  if (cells.length){
    const r = rng || Math.random;
    return { type:'cell', item: cells[Math.floor(r() * cells.length)] };
  }
  const due = dueTables(store, table, now);
  if (due.length){ const t = due[0]; return { type:'table', t, entry:tableWordFor(store, vocab, t), mode:tableMode(store, t), first:false }; }
  const unmet = unmetTables(store, table, vocab);
  if (unmet.length){ const t = unmet[0]; return { type:'table', t, entry:tableWordFor(store, vocab, t), mode:'typed', first:true }; }
  return null;
}

// ---- for the map and for Home ----
// 'unmet' | 'due' | 'rotation' | 'known'
function tableStatus(store, t, vocab, now){
  const c = store.cards[t.key];
  if (!c) return 'unmet';
  if (c.due != null && c.due <= now) return 'due';
  let rot = false, due = false;
  vocab.forEach(e => {
    if (e.class !== t.classKey) return;
    tableCellsFor(e, t).forEach(x => {
      const cc = store.cards[cardId(e.id, x.category, x.cell)];
      if (cc && !cc.rj){ rot = true; if (cc.due == null || cc.due <= now) due = true; }
    });
  });
  return due ? 'due' : (rot || c.s < TABLE_S_KNOWN) ? 'rotation' : 'known';
}

// What Home prints: counts, the minutes the due work will take, and how many
// new tables today still has room for.
function homePlan(store, vocab, table, now, other){
  now = now == null ? Date.now() : now;
  const roll = effRollover(store.settings, now), d = dayKey(now, roll);
  const cells = dueCells(store, vocab, table, now), tabs = dueTables(store, table, now);
  let dueMs = 0;
  cells.forEach(i => { dueMs += costMs(store, (i.card.st === 'L' || i.card.st === 'X' || i.card.s == null) ? 'L' : 'R', roll); });
  const perCell = costMs(store, 'T', roll);
  tabs.forEach(t => { dueMs += perCell * t.cells.length; });
  const used = usedTodayMs(store, now, other), budget = budgetTodayMs(store, now, other);
  const left = limitOn(store) ? Math.max(budget - used, 0) : Infinity;
  const spare = left === Infinity ? Infinity : Math.max(left - dueMs, 0);
  const unmet = unmetTables(store, table, vocab);
  let room = 0, acc = 0;
  for (let i=0; i<unmet.length; i++){
    acc += perCell * unmet[i].cells.length * 1.6;      // a new table also spawns single-form drills
    if (acc > spare) break;
    room++;
  }
  const all = rankedTables(table).filter(t => tableWords(vocab, t).length);
  return { cells:cells.length, tables:tabs.length, dueMs, usedMs:used, budgetMs:budget, leftMs:left,
           newRoom:room, unmet:unmet.length, total:all.length, met:all.length - unmet.length,
           next: unmet[0] || null };
}
