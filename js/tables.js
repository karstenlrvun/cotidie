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
  let card, rating;

  if (first){
    rating = allRight ? GOOD : HARD;
    const s = allRight ? TABLE_S_KNOWN : TABLE_S_SHAKY;
    let days = nextInterval(s, store.settings.retention, store.settings.maxIvl);
    // Spread a known table's first return over 0.4-1.0 of its interval: a
    // sitting's worth of tables would otherwise all come back on one day.
    if (allRight) days = Math.max(1, Math.round(days * (0.4 + 0.6 * idUnit(t.key, 'spread'))));
    card = { st:'R', step:null, s, d:initD(rating, true), due:dayStart(today + days, roll),
             last:now, reps:1, lapses:0, tb:1 };
  } else {
    rating = allRight ? GOOD : AGAIN;
    card = schedule(prior, rating, now, store.settings).card;
    card.tb = 1;
    if (rating === AGAIN){
      // No ten-minute relearning step for a table: the forms that were missed
      // are what gets relearned, one by one. The table itself just comes back
      // at whatever its reduced strength now asks for.
      card.st = 'R'; card.step = null;
      const days = nextInterval(card.s, store.settings.retention, store.settings.maxIvl);
      card.due = dayStart(today + Math.max(days, 1), roll);
    }
  }
  store.cards[t.key] = card;

  missIds.forEach(id => {
    const c = store.cards[id];
    if (!c){ const f = freshCard(); f.due = now; store.cards[id] = f; }
    else { delete c.rj; c.due = Math.min(c.due == null ? now : c.due, now); }
  });

  if (!Array.isArray(store.tlog)) store.tlog = [];
  const row = { ts:now, table:t.key, word:entry.id, ms:Math.max(ms|0, 0), n:results.length,
                miss:missIds, first:first ? 1 : 0, rating, ivl:card.due - now };
  if (opts && (opts.reveal || opts.revealMissed)) row.rv = 1;
  store.tlog.push(row);
  return { first, allRight, card, ivl: card.due - now, missIds };
}

// Called after a cell has been reviewed alone: once it has held long enough it
// goes back to being part of its table and stops being asked by itself.
function afterCellReview(store, id){
  const c = store.cards[id];
  if (c && c.st === 'R' && c.s >= REJOIN_DAYS){ c.rj = 1; return true; }
  return false;
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
