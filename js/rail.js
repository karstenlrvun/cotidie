/* ======================================================================
   Cotidie — the figures beside Home (2026-09-17, the rebuild)

   Four panels, chosen by one test: does it change what he does next, and does
   it work on day one with no history? The grammar map (tableStatus() in
   tables.js), this week's minutes, the next seven days, and how often a form
   is right by tense / voice / mood / case. Pure logic, no DOM.

   Left out on purpose, his call to revisit in Stats later: streaks, review
   totals, and measured retention against the target (needs a month of data).
   ====================================================================== */

// Minutes studied on each day of the week containing `now`, Monday first.
// `stores` is one store or several -- the limit is one limit for all of
// Cotidie, so the week is drawn across both languages.
function weekMinutes(stores, now){
  const list = Array.isArray(stores) ? stores : [stores];
  const roll = effRollover(list[0].settings, now), today = dayKey(now, roll);
  // dayStart() of a study day falls inside the calendar day it is named for
  const dow = (new Date(dayStart(today, roll) + 12*FSRS_HOUR).getDay() + 6) % 7;   // Monday = 0
  const out = [];
  for (let i=0; i<7; i++){
    const d = today - dow + i;
    let ms = 0; list.forEach(st => { ms += usedMs(st, d, roll); });
    out.push({ day:d, ms, today: d === today, future: d > today });
  }
  return out;
}

// Minutes of review falling due on each of the next `days` days, today first.
// Everything already overdue counts as today. Expected cost of what is
// SCHEDULED, nothing more: it does not guess at failures or at new tables, so
// it reads low rather than high -- said on the panel.
function forecastMinutes(store, table, now, days){
  days = days || 7;
  const roll = effRollover(store.settings, now), today = dayKey(now, roll);
  const perDay = new Array(days).fill(0);
  const cellR = costMs(store, 'R', roll), cellL = costMs(store, 'L', roll), perCell = costMs(store, 'T', roll);
  const size = Object.create(null);
  tablesOf(table).forEach(t => { size[t.key] = t.cells.length; });
  Object.keys(store.cards).forEach(id => {
    const c = store.cards[id];
    if (!c || c.due == null || c.rj) return;
    const k = Math.max(dayKey(c.due, roll) - today, 0);
    if (k >= days) return;
    if (isTableId(id)){ if (size[id]) perDay[k] += perCell * size[id]; }
    else perDay[k] += (c.st === 'R') ? cellR : cellL;
  });
  return perDay;
}

// How often a form is right, along one axis. Counts every form he has
// produced: those asked cold (store.log) and those typed inside a table
// (store.tlog, where a row records the misses and the table says the rest).
// Summed, never averaged across cells -- the rule troubleByAxis() follows.
function axisAccuracy(store, table, axis){
  const by = Object.create(null);
  const add = (category, correct) => {
    const ax = categoryAxes(category);
    if ((axis === 'case') !== (ax.shape === 'case')) return;
    const key = ax[axis]; if (key == null) return;
    const e = by[key] || (by[key] = { key, n:0, ok:0 });
    e.n++; if (correct) e.ok++;
  };
  (store.log || []).forEach(r => { if (r && r.category) add(r.category, !!r.correct); });
  const byKey = Object.create(null);
  tablesOf(table).forEach(t => { byKey[t.key] = t; });
  (store.tlog || []).forEach(r => {
    const t = r && byKey[r.table];
    if (!t || r.rv) return;                       // a reveal says nothing about single forms
    const miss = new Set(r.miss || []);
    t.cells.forEach(c => add(c.category, !miss.has(cardId(r.word, c.category, c.cell))));
  });
  return Object.keys(by).map(k => by[k]).map(e => Object.assign(e, { rate: e.ok / e.n }));
}

// When the first pass finishes at the pace of the last `window` study days on
// which a new table was met. Null until there is a pace to speak of.
function firstPassPace(store, now, unmet, coreUnmet, window){
  window = window || 7;
  const roll = effRollover(store.settings, now), today = dayKey(now, roll);
  const perDay = Object.create(null);
  (store.tlog || []).forEach(r => { if (r && r.first){ const d = dayKey(r.ts, roll); perDay[d] = (perDay[d] || 0) + 1; } });
  const days = Object.keys(perDay).map(Number).sort((a,b) => b - a).slice(0, window);
  if (!days.length) return null;
  const span = Math.max(today - days[days.length - 1] + 1, 1);
  let n = 0; days.forEach(d => { n += perDay[d]; });
  const rate = n / span;                          // tables a calendar day, rest days included
  if (!(rate > 0)) return null;
  return { rate, allDay: today + Math.ceil(unmet / rate), coreDay: today + Math.ceil(coreUnmet / rate) };
}
