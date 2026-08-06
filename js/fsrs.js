/* ======================================================================
   Cotidie — FSRS-6 scheduler (forked from vocabula's own implementation)
   plus the auto-grading translation layer the Cotidianum plan called for.

   The weight array P[] below is copied verbatim from vocabula's latin.html,
   which was itself checked directly against FSRS-6's published defaults
   (byte-for-byte match, confirmed in the Cotidianum addendum session 3 --
   not re-verified independently here, inherited as already-confirmed).

   Deliberately NOT forked from vocabula for v1: the "drill layer" (same-day
   repetition / consecutive-day requirement) and the "weekly review day"
   nudge. Both are real refinements vocabula earned through actual use;
   porting them before Cotidie has any real review history of its own would
   be tuning against nothing. Core FSRS-6 math is forked faithfully; the
   wrapper around it is intentionally simpler. Revisit once there's real
   daily-use data (see HANDOFF.md open items).

   Plain top-level declarations, no module wrapping -- loads after
   engine.js (uses its orderedCells()); see latin-paradigms.js's tail note.
   ====================================================================== */

const P=[0.212,1.2931,2.3065,8.2956,6.4133,0.8334,3.0194,0.001,1.8722,0.1666,0.796,
         1.4835,0.0614,0.2629,1.6483,0.6014,1.8729,0.5425,0.0912,0.0658,0.1542];
const DECAY=-P[20], FACTOR=Math.pow(0.9,1/DECAY)-1;
const FSRS_MIN=60000, FSRS_HOUR=3600000, FSRS_DAY=86400000;
const S_MIN=0.001;
const AGAIN=1, HARD=2, GOOD=3, EASY=4;
const LEARN_STEPS=[1*FSRS_MIN,10*FSRS_MIN], RELEARN_STEPS=[10*FSRS_MIN];

// ---- day-boundary math, same rollover convention as vocabula ----
function dayKey(ts, rolloverHour){
  const h = (rolloverHour==null) ? 4 : rolloverHour;
  return Math.floor((ts - new Date(ts).getTimezoneOffset()*60000 - h*FSRS_HOUR) / FSRS_DAY);
}
function dayStart(k, rolloverHour){
  const h = (rolloverHour==null) ? 4 : rolloverHour;
  const off = h*FSRS_HOUR;
  let t = k*FSRS_DAY + off;
  for(let i=0;i<3;i++) t = k*FSRS_DAY + off + new Date(t).getTimezoneOffset()*60000;
  return t;
}

const clampD = d => Math.min(Math.max(d,1),10);
const clampS = s => Math.max(s,S_MIN);
const initS = r => clampS(P[r-1]);
const initD = (r,clamp) => { const d=P[4]-Math.exp(P[5]*(r-1))+1; return clamp?clampD(d):d; };

function retrievability(card, now){
  if (card.s==null || card.last==null) return 0;
  const el = Math.max((now-card.last)/FSRS_DAY, 0);
  return Math.pow(1+FACTOR*el/card.s, DECAY);
}
function nextInterval(s, retention, maxIvl){
  let d = (s/FACTOR)*(Math.pow(retention,1/DECAY)-1);
  d = Math.round(d);
  return Math.min(Math.max(d,1), maxIvl);
}
function shortTermS(s,r){
  let inc = Math.exp(P[17]*(r-3+P[18]))*Math.pow(s,-P[19]);
  if (r===GOOD||r===EASY) inc = Math.max(inc,1);
  return clampS(s*inc);
}
function nextD(d,r){
  const a1 = initD(EASY,false);
  const delta = -(P[6]*(r-3));
  const a2 = d+(10-d)*delta/9;
  return clampD(P[7]*a1+(1-P[7])*a2);
}
function forgetS(d,s,R){
  const long = P[11]*Math.pow(d,-P[12])*(Math.pow(s+1,P[13])-1)*Math.exp((1-R)*P[14]);
  const short = s/Math.exp(P[17]*P[18]);
  return Math.min(long,short);
}
function recallS(d,s,R,r){
  const hard=(r===HARD)?P[15]:1, easy=(r===EASY)?P[16]:1;
  return s*(1+Math.exp(P[8])*(11-d)*Math.pow(s,-P[9])*(Math.exp((1-R)*P[10])-1)*hard*easy);
}
function nextS(d,s,R,r){
  return clampS(r===AGAIN ? forgetS(d,s,R) : recallS(d,s,R,r));
}

function freshCard(){
  return { st:'L', step:0, s:null, d:null, due:null, last:null, reps:0, lapses:0 };
}

// card.st: 'L' learning, 'R' review, 'X' relearning
// settings: {retention, maxIvl, rollover}
function schedule(card, rating, now, settings){
  const c = Object.assign({}, card);
  const daysSince = (c.last!=null) ? (dayKey(now,settings.rollover)-dayKey(c.last,settings.rollover)) : null;
  let ivl = 0;
  const toReview = () => { c.st='R'; c.step=null; ivl=nextInterval(c.s, settings.retention, settings.maxIvl)*FSRS_DAY; };
  const steps = (c.st==='L') ? LEARN_STEPS : RELEARN_STEPS;

  if (c.st==='L' || c.st==='X'){
    if (c.s==null || c.d==null){ c.s=initS(rating); c.d=initD(rating,true); }
    else if (daysSince!=null && daysSince<1){ c.s=shortTermS(c.s,rating); c.d=nextD(c.d,rating); }
    else { c.s=nextS(c.d,c.s,retrievability(c,now),rating); c.d=nextD(c.d,rating); }

    if (steps.length===0 || (c.step>=steps.length && rating!==AGAIN)) toReview();
    else if (rating===AGAIN){ c.step=0; ivl=steps[0]; }
    else if (rating===GOOD){
      if (c.step+1===steps.length) toReview();
      else { c.step+=1; ivl=steps[c.step]; }
    }
    else if (rating===HARD){ c.step=Math.min(c.step|0, steps.length-1); ivl=steps[c.step]; }
    else toReview(); // Easy
  } else { // Review
    if (daysSince!=null && daysSince<1) c.s=shortTermS(c.s,rating);
    else c.s=nextS(c.d,c.s,retrievability(c,now),rating);
    c.d=nextD(c.d,rating);
    if (rating===AGAIN){
      c.lapses=(c.lapses||0)+1;
      if (RELEARN_STEPS.length===0) ivl=nextInterval(c.s, settings.retention, settings.maxIvl)*FSRS_DAY;
      else { c.st='X'; c.step=0; ivl=RELEARN_STEPS[0]; }
    } else ivl = nextInterval(c.s, settings.retention, settings.maxIvl)*FSRS_DAY;
  }

  c.last=now; c.due=now+ivl; c.reps=(c.reps||0)+1;

  // Review cards are due by study day, not by clock -- a batch studied at
  // 14:00 shouldn't be held back until 14:00 the next day.
  if (c.st==='R' && c.due-now>=FSRS_DAY){
    const ivlDays = Math.max(Math.round((c.due-now)/FSRS_DAY),1);
    c.due = dayStart(dayKey(now,settings.rollover)+ivlDays, settings.rollover);
  }
  return { card:c, ivl:c.due-now };
}

// ---- auto-grading translation layer ----
// correctness + latency -> Again/Hard/Good/Easy. Thresholds are an initial
// guess (typing a full inflected Latin form is slower than recalling an
// English gloss) -- NOT yet tuned against real usage. Revisit once there
// is real review-log data; see HANDOFF.md open items.
const LATENCY_EASY_MS = 4000;
const LATENCY_HARD_MS = 15000;
function gradeToRating(correct, latencyMs){
  if (!correct) return AGAIN;
  if (latencyMs <= LATENCY_EASY_MS) return EASY;
  if (latencyMs >= LATENCY_HARD_MS) return HARD;
  return GOOD;
}

// ---- storage: log every rep from day one, independent of which analysis
// features exist yet (explicit ground rule from the Cotidianum plan) ----
// Each language gets its own localStorage key (passed in, not hardcoded --
// this used to be a single hardcoded 'cotidie.latin.v1' constant, which
// worked when there was only Latin but would have silently merged Greek's
// review history into Latin's the moment a second language existed).
function defaultStore(){
  return {
    version: 1,
    created: Date.now(),
    settings: { retention: 0.90, maxIvl: 36500, rollover: 4 },
    cards: {},   // cardId -> card state
    log: []      // {ts, cardId, lemma, category, cell, correct, latencyMs, rating, ivl}
  };
}

function loadStore(key){
  if (typeof localStorage === 'undefined') return defaultStore();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultStore(), parsed);
  } catch(e){ return defaultStore(); }
}
function saveStore(key, store){
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(store)); } catch(e){}
}

function cardId(vocabIndex, category, cell){
  return vocabIndex + ':' + category + ':' + cell;
}

// Records one rep against the store (mutates and returns it), applying the
// grading translation layer and FSRS schedule together. `now` is injectable
// for tests; defaults to Date.now().
function recordReview(store, meta, correct, latencyMs, now){
  now = now==null ? Date.now() : now;
  const id = cardId(meta.vocabIndex, meta.category, meta.cell);
  const prior = store.cards[id] || freshCard();
  const rating = gradeToRating(correct, latencyMs);
  const { card, ivl } = schedule(prior, rating, now, store.settings);
  store.cards[id] = card;
  store.log.push({
    ts: now, cardId: id, lemma: meta.lemma, category: meta.category, cell: meta.cell,
    correct: !!correct, latencyMs: latencyMs|0, rating, ivl
  });
  return { rating, ivl, card };
}

// pool: the (possibly filtered, e.g. "drill this system") slice being
// searched. fullVocabList: the language's complete *_VOCAB array -- cardId
// is always keyed on THIS list's index, never pool's position, because
// pool.indexOf(entry) would silently diverge from the global index
// recordReview() uses whenever pool is filtered. That divergence was a
// real bug caught during manual testing: a system-filtered drill would
// check due-ness under one cardId and write the review under another.
// table: the language's PARADIGMS object (LATIN_PARADIGMS / GREEK_PARADIGMS),
// passed through to orderedCells() from engine.js, which must be loaded first.
function dueCards(store, pool, fullVocabList, table, now){
  now = now==null ? Date.now() : now;
  const due = [];
  pool.forEach((entry) => {
    const vi = fullVocabList.indexOf(entry);
    orderedCells(table, entry.class).forEach(({category,cell}) => {
      const id = cardId(vi, category, cell);
      const c = store.cards[id];
      if (!c || c.due==null || c.due<=now) due.push({ vocabIndex:vi, entry, category, cell, card:c||null });
    });
  });
  return due;
}
