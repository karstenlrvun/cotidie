/* ======================================================================
   Cotidie — Stats/calendar pure logic (ported from vocabula's own Stats
   screen and Study-days calendar, 2026-08-09). No DOM here, same convention
   as engine.js/fsrs.js -- every function takes the relevant store/table as
   a parameter. Shared by both decks; each deck's own <script> block builds
   the actual screen markup around these.

   One deliberate departure from vocabula's design, not an oversight: there
   is no persisted day-aggregate here (vocabula's `S.days`). Cotidie's
   `store.log` entries already carry every field a day index needs (`ts`,
   `cardId`), so computeDayIndex() below derives one on demand instead --
   vocabula's own STATS_TIME_PLAN.md notes its `S.days` had to be retrofitted
   after the fact (studyMs/stageMs) precisely because its raw log didn't
   carry enough; deriving from the log sidesteps that class of problem
   entirely, at the cost of a full log scan per render (fine at this app's
   personal-use scale).

   The other departure: vocabula's statusOf() is five-way (includes `susp`,
   a leech/set-aside flag). Cotidie has no such flag -- not in scope for
   this port -- so this is a four-way split.
   ====================================================================== */

const STATUS_ORDER = ['unseen', 'learning', 'young', 'mature'];
const STATUS_LABEL = {
  unseen: 'Still to meet',
  learning: 'In short-term steps',
  young: 'Settling (under 3 weeks)',
  mature: 'Holding (3 weeks or more)'
};

// card: a store.cards[id] entry, or undefined/null for a cell never rated.
function statusOf(card){
  if (!card || !card.reps) return 'unseen';
  if (card.st !== 'R') return 'learning';
  return card.s < 21 ? 'young' : 'mature';
}

// Whole-deck cell-status breakdown: totals across every (word, category,
// cell) triple in vocabList (not just what's due), plus a per-System detail
// list in vocabList's own iteration order. `table` is the language's
// PARADIGMS object; both already passed identically to dueCards() elsewhere.
function wholeDeckStats(store, vocabList, table){
  const totals = { unseen:0, learning:0, young:0, mature:0 };
  const bySystem = {};
  vocabList.forEach((entry) => {
    const sys = bySystem[entry.class] || (bySystem[entry.class] = { cells: [] });
    orderedCellsFor(table, entry).forEach(({ category, cell }) => {
      const id = cardId(entry.id, category, cell);
      const st = statusOf(store.cards[id]);
      totals[st]++;
      sys.cells.push(st);
    });
  });
  return { totals, bySystem };
}

// Aggregate status across every real (FSRS-tracked) vocab entry in
// `classKey`, for one specific (category, cell) -- backs the Table view's
// per-cell status dot (HANDOFF.md §10d). Table mode displays the class's
// own `example` specimen, which is a display-only specimen never drilled or
// logged (see engine.js's header comment) -- so a dot next to it can't
// point at a single card the way the Stats/Browse screens can. Instead it
// summarizes across the class's actual vocab words. Returns the
// LEAST-advanced status present (unseen > learning > young > mature) --
// a "how much is left to do on this cell" reading, not an average, so one
// still-unmet word in a class of ten keeps the dot honest rather than
// getting averaged away.
function cellStatusSummary(store, vocabList, classKey, category, cell){
  // only words that actually have this cell -- a word restricted out of it has
  // no card there, and counting its absence as "unseen" would keep the dot
  // permanently red for a form most of the class does not have
  const entries = vocabList.filter(e => e.class === classKey && entryHasCell(e, category, cell));
  if (!entries.length) return 'unseen';
  const rank = { unseen:0, learning:1, young:2, mature:3 };
  let worst = 3;
  entries.forEach(entry => {
    const st = statusOf(store.cards[cardId(entry.id, category, cell)]);
    worst = Math.min(worst, rank[st]);
  });
  return STATUS_ORDER[worst];
}

// {dayKey: {n, intro, cellIds:Set}} built by a single forward scan of
// store.log. n = every log entry that day (raw rating count, same-day
// repeats included); intro = entries that were the FIRST-EVER log entry for
// their cardId (relies on log being append-order, which recordReview()
// guarantees via push()); cellIds = every distinct cardId touched that day.
function computeDayIndex(log, rollover){
  const seen = new Set();
  const idx = {};
  log.forEach(e => {
    const dk = dayKey(e.ts, rollover);
    if (!idx[dk]) idx[dk] = { n:0, intro:0, cellIds:new Set() };
    const rec = idx[dk];
    rec.n++;
    rec.cellIds.add(e.cardId);
    if (!seen.has(e.cardId)){ seen.add(e.cardId); rec.intro++; }
  });
  return idx;
}

// {studied, intro, words, ratings} for one study day -- words is the number
// of distinct cells touched (Cotidie's analogue of vocabula's `words`,
// which counted distinct vocab words; here a "word" being touched at all
// means at least one of its cells was touched, so `words` here is at the
// cell granularity, matching what the calendar and stats screen both
// actually track).
function dayStatsFor(dayIndex, dk){
  const rec = dayIndex[dk];
  if (!rec || !rec.n) return { studied:false, intro:0, words:0, ratings:0 };
  return { studied:true, intro:rec.intro, words:rec.cellIds.size, ratings:rec.n };
}

function currentStreak(dayIndex, todayKey){
  let streak = 0;
  for (let k = todayKey; ; k--){
    if (dayIndex[k] && dayIndex[k].n) streak++;
    else { if (k !== todayKey) break; }
    if (todayKey - k > 3650) break;
  }
  return streak;
}

// the study-day key for a plain Gregorian calendar date -- local noon is
// safely inside the day regardless of rollover hour, same technique as
// vocabula's own dayKeyForDate.
function dayKeyForDate(y, m, day, rollover){
  return dayKey(new Date(y, m, day, 12, 0, 0).getTime(), rollover);
}

// a Gregorian month as weeks of 7 cells (Sun-Sat), padded with inMonth:false
// cells so every week is a full row; pure date math, no store/DOM access.
// Ported verbatim from vocabula -- this needed no adaptation at all.
function monthMatrix(y, m){
  const first = new Date(y, m, 1), start = first.getDay(),
        days = new Date(y, m+1, 0).getDate(), prevDays = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i=0; i<start; i++) cells.push({ y, m:m-1, d:prevDays-start+1+i, inMonth:false });
  for (let d=1; d<=days; d++) cells.push({ y, m, d, inMonth:true });
  while (cells.length % 7 !== 0) cells.push({ y, m:m+1, d:cells.length-start-days+1, inMonth:false });
  const weeks = [];
  for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i, i+7));
  return weeks;
}
