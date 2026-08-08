/* ======================================================================
   Cotidie — taxonomy + form-generation engine (System -> Category -> Cell)

   Pure logic, no DOM. Shared by Latin and Greek: every function below takes
   a `table` (a PARADIGMS object, e.g. LATIN_PARADIGMS or GREEK_PARADIGMS)
   as its first argument, rather than hardcoding one language's global --
   this file used to hardcode LATIN_PARADIGMS, which worked when there was
   only Latin, but obviously breaks the moment a second language exists.
   Grading normalization stays language-specific (see the Latin section
   below and js/greek.js for Greek's), since what "counts as correct" is a
   genuinely different rule per language (macron-insensitive vs
   breathing-required/accent-toggleable).

   Depends on the relevant data/*-paradigms.js being loaded first (for
   FROM_LEMMA). Plain top-level declarations, no module wrapping -- see the
   note at the bottom of latin-paradigms.js for why (matches vocabula's own
   test-concatenation convention).
   ====================================================================== */

// ---- form generation (language-agnostic) ----
// entry: a row from a *_VOCAB array. categoryKey/cellKey: keys into the
// class's `endings` table. Returns {primary, accepted} -- accepted always
// includes primary, additional entries are alternate accepted spellings
// (e.g. Latin's -ris/-re passive 2nd-singular doublet).
//
// Two ending-value conventions, both supported:
//   - normal classes: `base` (entry.stem for nouns, entry.root for verbs)
//     is concatenated with the ending, except the FROM_LEMMA sentinel
//     which uses entry.lemma verbatim instead (for cells that aren't
//     predictable from the oblique stem, e.g. 3rd-declension nom. sg.).
//   - `table[classKey].literal === true` classes: every ending value IS
//     the complete form already; no concatenation happens at all. This is
//     for irregular verbs (Latin sum, Greek eiμí, etc.) and, for now,
//     Greek's 3rd-declension nouns (consonant-cluster sandhi in the
//     dative plural isn't modeled as a rule yet -- see HANDOFF.md), where
//     hand-writing every form is more honest than a formula that's wrong
//     for some inputs.
function formsFor(table, entry, categoryKey, cellKey){
  const cls = table[entry.class];
  if (!cls) throw new Error('Unknown class: ' + entry.class);
  const spec = cls.endings[categoryKey] && cls.endings[categoryKey][cellKey];
  if (spec === undefined) throw new Error('No ending for ' + entry.class + ' ' + categoryKey + '/' + cellKey);
  const base = cls.literal ? null : ((cls.kind === 'verb') ? entry.root : entry.stem);

  function build(one){
    if (cls.literal) return one;
    return (one === FROM_LEMMA) ? entry.lemma : (base + one);
  }

  const variants = Array.isArray(spec) ? spec.map(build) : [build(spec)];
  return { primary: variants[0], accepted: variants };
}

// The canonical recitation order for a class -- this matches how a paper
// paradigm table is actually read aloud, and nouns and verbs are recited in
// two DIFFERENT shapes, not one shared nesting:
//   nouns: number-major, case-minor -- the whole singular column case by
//     case, THEN the whole plural column.
//   verbs: category-major, person-minor -- all six persons of one
//     tense/voice (e.g. all of present active), THEN the next tense/voice.
// See HANDOFF.md.
function orderedCells(table, classKey){
  const cls = table[classKey];
  if (!cls) throw new Error('Unknown class: ' + classKey);
  const out = [];
  if (cls.kind === 'noun'){
    cls.cellKeys.forEach(cell => {
      cls.categories.forEach(category => out.push({ category, cell }));
    });
  } else {
    cls.categories.forEach(category => {
      cls.cellKeys.forEach(cell => out.push({ category, cell }));
    });
  }
  return out;
}

// The fully realized paradigm for one vocab entry, in canonical order --
// what Table and Recite modes both render from.
function fullParadigm(table, entry){
  return orderedCells(table, entry.class).map(({ category, cell }) => {
    const f = formsFor(table, entry, category, cell);
    return { category, cell, primary: f.primary, accepted: f.accepted };
  });
}

function classesOfKind(table, kind){
  return Object.keys(table).filter(k => table[k].kind === kind);
}

/* ======================================================================
   Latin grading: macrons dropped, case-insensitive, whitespace-collapsed.
   (Ground rule, confirmed in the Cotidianum plan: "Latin macrons dropped
   from grading.") This is a GRADING-time normalization only -- the stored
   canonical forms keep their macrons for table/recite display.
   ====================================================================== */
const MACRON_MAP = { 'ā':'a','ē':'e','ī':'i','ō':'o','ū':'u','ȳ':'y',
                      'Ā':'A','Ē':'E','Ī':'I','Ō':'O','Ū':'U','Ȳ':'Y' };

function stripMacrons(s){
  return String(s).replace(/[āēīōūȳĀĒĪŌŪȲ]/g, c => MACRON_MAP[c] || c);
}

function normalize(s){
  if (s == null) return '';
  return stripMacrons(String(s))
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// True if userInput matches any accepted form for this cell (grading-time
// normalization applied to both sides). Latin-specific (see checkAnswerGreek
// in js/greek.js for Greek's breathing-required/accent-toggleable rule).
function checkAnswer(userInput, accepted){
  const got = normalize(userInput);
  if (!got) return false;
  return accepted.some(a => normalize(a) === got);
}

/* ======================================================================
   HTML escaping -- shared by both decks' render functions (security pass,
   ported from vocabula 2026-08-08). Escapes quotes as well as angle
   brackets, and coerces a non-string rather than throwing. Today's own
   vocab/paradigm data has no & < > in it to prove this matters, and the
   store has no external-input path yet either -- but that stays true only
   until gist sync (HANDOFF.md §10e, planned) lands, at which point a value inside
   `store.log`/`store.cards` can arrive from another device's push rather
   than from this device's own typing. Escape at the boundary function now,
   not after there's a real incident to point at, same lesson vocabula's own
   HANDOFF documents about its `row()` fix. */
function escHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
