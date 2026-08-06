/* ======================================================================
   Cotidie — Greek-specific grading.

   Latin's grading (normalize/checkAnswer in js/engine.js) drops macrons
   and nothing else. Greek needs two DIFFERENT rules, both confirmed
   directly against the real OCR A Level Classical Greek (H444)
   specification, not assumed (see data/greek-paradigms.js's header):
     - breathing marks are ALWAYS required (never stripped) -- the spec
       says learners are expected to write them.
     - accent marks (acute/grave/circumflex) are graded only if the user
       has turned that setting ON -- the spec says learners are NOT
       expected to write accents, only to recognize/distinguish by them,
       so the default here is OFF.
   Iota subscript is treated like breathing -- always required -- since
   the spec's "accentuation" language is about pitch accent specifically,
   not the iota subscript (which is closer to a spelling element).

   Also handles movable nu: several stored forms are written "ἐστί(ν)"
   meaning EITHER ἐστί or ἐστίν is correct (movable nu is genuinely
   optional before a consonant/pause in Attic prose) -- expanded into
   both real variants before grading, same "any accepted form passes"
   principle as Latin's alternate-form arrays.
   ====================================================================== */

// Unicode combining marks for the three Greek pitch accents: U+0301
// COMBINING ACUTE ACCENT, U+0300 COMBINING GRAVE ACCENT, U+0342 COMBINING
// GREEK PERISPOMENI (circumflex). Written as explicit \u escapes rather
// than pasting the combining characters literally -- those render
// attached to whatever precedes them and are impossible to visually
// verify in source, exactly the kind of thing "verify don't guess" warns
// against. Decompose (NFD), strip these three, recompose (NFC) -- relies
// on the platform's own correct Unicode normalization rather than a
// hand-rolled table of every precomposed character, which would be far
// more error-prone to get right for polytonic Greek.
const GREEK_ACCENT_MARKS = /[\u0301\u0300\u0342]/g;

function stripGreekAccents(s){
  return String(s).normalize('NFD').replace(GREEK_ACCENT_MARKS, '').normalize('NFC');
}

// "ἐστί(ν)" -> ["ἐστί", "ἐστίν"]. Forms without "(ν)" pass through
// unchanged as a single-element array.
function expandMovableNu(s){
  if (s.indexOf('(ν)') !== -1) return [s.replace('(ν)', ''), s.replace('(ν)', 'ν')];
  return [s];
}

// opts: { accents: bool } -- whether accent marks must match. Breathing
// marks and iota subscript are never stripped, per the spec.
function normalizeGreek(s, opts){
  opts = opts || {};
  if (s == null) return '';
  let out = String(s).normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ');
  if (!opts.accents) out = stripGreekAccents(out);
  return out;
}

function checkAnswerGreek(userInput, accepted, opts){
  const got = normalizeGreek(userInput, opts);
  if (!got) return false;
  const variants = accepted.reduce((acc, a) => acc.concat(expandMovableNu(a)), []);
  return variants.some(a => normalizeGreek(a, opts) === got);
}
