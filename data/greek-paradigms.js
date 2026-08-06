/* ======================================================================
   Cotidie — Greek paradigm data ("Systems" in the plan's taxonomy)
   ======================================================================

   Scope, set 2026-08-06 after reviewing the actual OCR A Level in
   Classical Greek (H444) specification (§5d, "Classical Greek Accidence
   and Syntax" -- fetched and read directly, not assumed): the real
   syllabus requires "verbs of all standard types, common irregular,
   impersonal and defective verbs from both conjugations [thematic and
   athematic] in all moods, voices and tenses." That is enormous. v1 here
   is a deliberate SLICE of it, at Karsten's explicit direction:
     - INDICATIVE MOOD ONLY. Subjunctive, optative, imperative, and the
       participle/infinitive system are all future work.
     - Present, imperfect, future, aorist, perfect, pluperfect, and future
       perfect (mp only -- see below) for the one thematic paradigm verb.
     - Six athematic (-μι) verbs, present/imperfect/future only (their
       aorist and perfect systems are future work).
     - Noun cases: nominative, vocative, accusative, genitive, dative.
       No ablative (Greek doesn't have one) and, per the OCR spec itself,
       NO DUAL NUMBER ("A knowledge of the dual form will not be
       required") -- singular/plural only, same cellKeys shape as Latin.
   Also confirmed directly from that spec, which changes a default from
   what the original Cotidianum plan assumed: "Learners will not be
   expected to WRITE accents, but should be able to distinguish words of
   identical spelling but with differing accentuation" -- so accent
   grading defaults OFF (recognition only), while "learners will be
   expected to write breathing marks" -- so breathing grading defaults ON.
   Both stay toggleable (js/greek.js), this only sets the default.

   ---- Why nouns and most verbs are `literal: true` here, unlike Latin ----
   Latin's regular endings are pure suffix concatenation with no further
   surprises once macrons are graded away. Greek accent is NOT like that:
   it's "persistent" (stays on the syllable it occupies in the citation
   form, as far as later rules allow) for nouns, and while verb accent is
   "recessive" (as far back as allowed) it still depends on the specific
   word's syllable count and vowel lengths. Concretely, the -ης
   masculine's vocative singular (e.g. πολῖτα, short vowel + shifted
   accent, genuinely not "stem + ending") is one visible symptom of a
   much broader fact: a stem+ending FORMULA verified correct for one word
   is not safely assumed correct for a second, differently-accented word
   in "the same declension." Rather than build (and get subtly wrong
   under time pressure) a real accent-recession rule engine, EVERY class
   in this file is `literal: true` -- hand-written, per HANDOFF.md's
   "verify don't guess" rule, and deliberately ONE example word per class
   for v1 (see *_VOCAB below). This includes lyo itself: its
   present/imperfect/future/aorist really is clean root+ending, but the
   perfect system runs on the REDUPLICATED stem (le-ly-) instead of the
   bare root, and this engine has no reduplication mechanism -- rather
   than mix "mostly formula, but three categories secretly need a
   different base" (exactly the shape that invites a silent bug), every
   one of its ~90 cells is written out fully too. All were individually
   cross-checked against two independent sources (Wiktionary and Wm.
   Jones White's "First Greek Book" via daedalus.umkc.edu) while this
   file was written. Expanding any class beyond its one example word
   needs either per-word accent verification or, for the thematic class,
   a real reduplication + accent-recession engine -- tracked as an open
   item in HANDOFF.md, not silently assumed away.

   ---- Data shape ----
   Same shape as latin-paradigms.js: kind, label, subtitle, example,
   categories (recitation order), cellKeys, endings[category][cell],
   optionally `literal: true` (see js/engine.js's formsFor()). Greek has
   no FROM_LEMMA cells -- literal classes just write every cell out fully
   instead, which subsumes what FROM_LEMMA was for.
   ====================================================================== */

const GREEK_PARADIGMS = {

  /* ---- nouns (one example word each; see the note above on why) ---- */

  decl1_e: {
    kind: 'noun', label: '1st Declension (η-stem, feminine)', literal: true,
    subtitle: 'τιμή, τιμῆς, ἡ — honor',
    example: { lemma:'τιμή', class:'decl1_e', gender:'f', meaning:'honor' },
    categories: ['nom','voc','acc','gen','dat'],
    cellKeys: ['sg','pl'],
    endings: {
      nom: { sg:'τιμή',  pl:'τιμαί'  },
      voc: { sg:'τιμή',  pl:'τιμαί'  },
      acc: { sg:'τιμήν', pl:'τιμάς'  },
      gen: { sg:'τιμῆς', pl:'τιμῶν'  },
      dat: { sg:'τιμῇ',  pl:'τιμαῖς' }
    }
  },

  decl1_es: {
    kind: 'noun', label: '1st Declension (masculine, -ης)', literal: true,
    subtitle: 'πολίτης, πολίτου, ὁ — citizen',
    example: { lemma:'πολίτης', class:'decl1_es', gender:'m', meaning:'citizen' },
    categories: ['nom','voc','acc','gen','dat'],
    cellKeys: ['sg','pl'],
    // voc. sg. πολῖτα is the well-known exception -- short vowel, shifted
    // accent, genuinely not stem+ending (part of why this class is
    // literal). gen. sg. -ου is borrowed from 2nd declension, also not
    // predictable from the nom./acc./dat. stem shape.
    endings: {
      nom: { sg:'πολίτης', pl:'πολῖται'  },
      voc: { sg:'πολῖτα',  pl:'πολῖται'  },
      acc: { sg:'πολίτην', pl:'πολίτας'  },
      gen: { sg:'πολίτου', pl:'πολιτῶν'  },
      dat: { sg:'πολίτῃ',  pl:'πολίταις' }
    }
  },

  decl2_os: {
    kind: 'noun', label: '2nd Declension (masculine, -ος)', literal: true,
    subtitle: 'λόγος, λόγου, ὁ — word',
    example: { lemma:'λόγος', class:'decl2_os', gender:'m', meaning:'word' },
    categories: ['nom','voc','acc','gen','dat'],
    cellKeys: ['sg','pl'],
    endings: {
      nom: { sg:'λόγος', pl:'λόγοι'  },
      voc: { sg:'λόγε',  pl:'λόγοι'  },
      acc: { sg:'λόγον', pl:'λόγους' },
      gen: { sg:'λόγου', pl:'λόγων'  },
      dat: { sg:'λόγῳ',  pl:'λόγοις' }
    }
  },

  decl2_on: {
    kind: 'noun', label: '2nd Declension (neuter, -ον)', literal: true,
    subtitle: 'δῶρον, δώρου, τό — gift',
    example: { lemma:'δῶρον', class:'decl2_on', gender:'n', meaning:'gift' },
    categories: ['nom','voc','acc','gen','dat'],
    cellKeys: ['sg','pl'],
    endings: {
      nom: { sg:'δῶρον', pl:'δῶρα'   },
      voc: { sg:'δῶρον', pl:'δῶρα'   },
      acc: { sg:'δῶρον', pl:'δῶρα'   },
      gen: { sg:'δώρου', pl:'δώρων'  },
      dat: { sg:'δώρῳ',  pl:'δώροις' }
    }
  },

  decl3_ma: {
    kind: 'noun', label: '3rd Declension (neuter, -μα)', literal: true,
    subtitle: 'σῶμα, σώματος, τό — body',
    example: { lemma:'σῶμα', class:'decl3_ma', gender:'n', meaning:'body' },
    categories: ['nom','voc','acc','gen','dat'],
    cellKeys: ['sg','pl'],
    // dat. pl. σώμασι(ν) is stem "σωματ" + "-σι" with a real sandhi rule
    // (dental stop drops before sigma) -- not modeled as a rule (see the
    // file header), just written out correctly here.
    endings: {
      nom: { sg:'σῶμα', pl:'σώματα'    },
      voc: { sg:'σῶμα', pl:'σώματα'    },
      acc: { sg:'σῶμα', pl:'σώματα'    },
      gen: { sg:'σώματος', pl:'σωμάτων'  },
      dat: { sg:'σώματι',  pl:'σώμασι(ν)' }
    }
  },

  decl3_velar: {
    kind: 'noun', label: '3rd Declension (masc./fem., velar stem)', literal: true,
    subtitle: 'φύλαξ, φύλακος, ὁ — guard',
    example: { lemma:'φύλαξ', class:'decl3_velar', gender:'m', meaning:'guard' },
    categories: ['nom','voc','acc','gen','dat'],
    cellKeys: ['sg','pl'],
    // dat. pl. φύλαξι(ν): stem "φυλακ" + "-σι", κ+σ -> ξ sandhi, same
    // reason as decl3_ma's dative plural -- see that class's note.
    endings: {
      nom: { sg:'φύλαξ',  pl:'φύλακες'  },
      voc: { sg:'φύλαξ',  pl:'φύλακες'  },
      acc: { sg:'φύλακα', pl:'φύλακας'  },
      gen: { sg:'φύλακος', pl:'φυλάκων'  },
      dat: { sg:'φύλακι',  pl:'φύλαξι(ν)' }
    }
  },

  /* ---- the one thematic (-ω) paradigm verb ----
     `literal: true`, like everything else in this file -- NOT because
     λύω's own present/imperfect/future/aorist system needs it (that part
     really is clean root "λυ" + ending, and was drafted that way first),
     but because the perfect system (perfect, pluperfect, future perfect)
     is built on the REDUPLICATED stem λελυ-, not the bare root, and this
     engine has no reduplication mechanism -- mixing "mostly formula, but
     three categories secretly need a different base" is exactly the kind
     of thing that produces a silent wrong answer, so every cell is
     written out fully instead. categories are grouped by the traditional
     three systems (present, future, aorist, perfect), each in active-
     then-middle-then-passive order where more than one voice exists for
     that tense. Every cell verified against Wiktionary's λύω conjugation
     table and Wm. Jones White's First Greek Book (daedalus.umkc.edu),
     both fetched directly while writing this file -- see HANDOFF.md. */
  thematic: {
    kind: 'verb', label: 'Thematic (-ω) verbs', literal: true,
    subtitle: 'λύω, λύσω, ἔλυσα, λέλυκα — to loose, free',
    example: { lemma:'λύω', class:'thematic', meaning:'to loose, free' },
    categories: [
      'pres.act','pres.mp','impf.act','impf.mp',
      'fut.act','fut.mid','fut.pass',
      'aor.act','aor.mid','aor.pass',
      'perf.act','perf.mp','plup.act','plup.mp','futperf.mp'
    ],
    cellKeys: ['1sg','2sg','3sg','1pl','2pl','3pl'],
    endings: {
      'pres.act': { '1sg':'λύω',   '2sg':'λύεις',  '3sg':'λύει',   '1pl':'λύομεν',  '2pl':'λύετε',  '3pl':'λύουσι(ν)' },
      'pres.mp':  { '1sg':'λύομαι','2sg':['λύῃ','λύει'],'3sg':'λύεται','1pl':'λυόμεθα','2pl':'λύεσθε','3pl':'λύονται' },
      'impf.act': { '1sg':'ἔλυον',  '2sg':'ἔλυες',   '3sg':'ἔλυε(ν)', '1pl':'ἐλύομεν',  '2pl':'ἐλύετε',  '3pl':'ἔλυον' },
      'impf.mp':  { '1sg':'ἐλυόμην','2sg':'ἐλύου',   '3sg':'ἐλύετο',  '1pl':'ἐλυόμεθα', '2pl':'ἐλύεσθε', '3pl':'ἐλύοντο' },
      'fut.act':  { '1sg':'λύσω',  '2sg':'λύσεις', '3sg':'λύσει',  '1pl':'λύσομεν', '2pl':'λύσετε', '3pl':'λύσουσι(ν)' },
      'fut.mid':  { '1sg':'λύσομαι','2sg':['λύσῃ','λύσει'],'3sg':'λύσεται','1pl':'λυσόμεθα','2pl':'λύσεσθε','3pl':'λύσονται' },
      'fut.pass': { '1sg':'λυθήσομαι','2sg':['λυθήσῃ','λυθήσει'],'3sg':'λυθήσεται','1pl':'λυθησόμεθα','2pl':'λυθήσεσθε','3pl':'λυθήσονται' },
      'aor.act':  { '1sg':'ἔλυσα',  '2sg':'ἔλυσας',  '3sg':'ἔλυσε(ν)','1pl':'ἐλύσαμεν', '2pl':'ἐλύσατε', '3pl':'ἔλυσαν' },
      'aor.mid':  { '1sg':'ἐλυσάμην','2sg':'ἐλύσω',  '3sg':'ἐλύσατο', '1pl':'ἐλυσάμεθα','2pl':'ἐλύσασθε','3pl':'ἐλύσαντο' },
      'aor.pass': { '1sg':'ἐλύθην', '2sg':'ἐλύθης',  '3sg':'ἐλύθη',   '1pl':'ἐλύθημεν', '2pl':'ἐλύθητε', '3pl':'ἐλύθησαν' },
      'perf.act': { '1sg':'λέλυκα',  '2sg':'λέλυκας',  '3sg':'λέλυκε(ν)','1pl':'λελύκαμεν', '2pl':'λελύκατε', '3pl':'λελύκασι(ν)' },
      'perf.mp':  { '1sg':'λέλυμαι', '2sg':'λέλυσαι',  '3sg':'λέλυται',  '1pl':'λελύμεθα',  '2pl':'λέλυσθε',  '3pl':'λέλυνται' },
      'plup.act': { '1sg':'ἐλελύκη',  '2sg':'ἐλελύκης',  '3sg':'ἐλελύκει',  '1pl':'ἐλελύκεμεν', '2pl':'ἐλελύκετε', '3pl':'ἐλελύκεσαν' },
      'plup.mp':  { '1sg':'ἐλελύμην', '2sg':'ἐλέλυσο',   '3sg':'ἐλέλυτο',   '1pl':'ἐλελύμεθα',  '2pl':'ἐλέλυσθε',  '3pl':'ἐλέλυντο' },
      'futperf.mp':{'1sg':'λελύσομαι','2sg':['λελύσῃ','λελύσει'],'3sg':'λελύσεται','1pl':'λελυσόμεθα','2pl':'λελύσεσθε','3pl':'λελύσονται'}
    }
  },

  /* ---- athematic (-μι) verbs, six of them, each fully literal ----
     Present/imperfect/future indicative only for v1 (aorist and perfect
     systems for these are a follow-up -- see HANDOFF.md). Every cell
     cross-checked against Wiktionary while writing this file. */

  athematic_eimi: {
    kind: 'verb', label: 'εἰμί (to be)', literal: true,
    subtitle: 'εἰμί, ἔσομαι — to be',
    example: { lemma:'εἰμί', class:'athematic_eimi', meaning:'to be' },
    // "to be" has no separate voice -- its future ἔσομαι is middle in
    // FORM but there is no contrasting active future to distinguish it
    // from, so it's simply labelled fut.act here for a uniform category
    // set across the athematic verbs (see HANDOFF.md).
    categories: ['pres.act','impf.act','fut.act'],
    cellKeys: ['1sg','2sg','3sg','1pl','2pl','3pl'],
    endings: {
      'pres.act': { '1sg':'εἰμί', '2sg':'εἶ',   '3sg':'ἐστί(ν)', '1pl':'ἐσμέν', '2pl':'ἐστέ', '3pl':'εἰσί(ν)' },
      'impf.act': { '1sg':'ἦν',   '2sg':'ἦσθα', '3sg':'ἦν',      '1pl':'ἦμεν',  '2pl':'ἦτε',  '3pl':'ἦσαν' },
      'fut.act':  { '1sg':'ἔσομαι','2sg':['ἔσῃ','ἔσει'],'3sg':'ἔσται','1pl':'ἐσόμεθα','2pl':'ἔσεσθε','3pl':'ἔσονται' }
    }
  },

  athematic_didomi: {
    kind: 'verb', label: 'δίδωμι (to give)', literal: true,
    subtitle: 'δίδωμι, δώσω — to give',
    example: { lemma:'δίδωμι', class:'athematic_didomi', meaning:'to give' },
    categories: ['pres.act','pres.mp','impf.act','impf.mp','fut.act'],
    cellKeys: ['1sg','2sg','3sg','1pl','2pl','3pl'],
    endings: {
      'pres.act': { '1sg':'δίδωμι', '2sg':'δίδως',  '3sg':'δίδωσι(ν)', '1pl':'δίδομεν',  '2pl':'δίδοτε',  '3pl':'διδόασι(ν)' },
      'pres.mp':  { '1sg':'δίδομαι','2sg':'δίδοσαι','3sg':'δίδοται',   '1pl':'διδόμεθα', '2pl':'δίδοσθε', '3pl':'δίδονται' },
      'impf.act': { '1sg':'ἐδίδουν','2sg':'ἐδίδους','3sg':'ἐδίδου',   '1pl':'ἐδίδομεν', '2pl':'ἐδίδοτε', '3pl':'ἐδίδοσαν' },
      'impf.mp':  { '1sg':'ἐδιδόμην','2sg':'ἐδίδοσο','3sg':'ἐδίδοτο', '1pl':'ἐδιδόμεθα','2pl':'ἐδίδοσθε','3pl':'ἐδίδοντο' },
      'fut.act':  { '1sg':'δώσω',   '2sg':'δώσεις', '3sg':'δώσει',    '1pl':'δώσομεν',  '2pl':'δώσετε',  '3pl':'δώσουσι(ν)' }
    }
  },

  athematic_tithemi: {
    kind: 'verb', label: 'τίθημι (to put, place)', literal: true,
    subtitle: 'τίθημι, θήσω — to put, place',
    example: { lemma:'τίθημι', class:'athematic_tithemi', meaning:'to put, place' },
    categories: ['pres.act','pres.mp','impf.act','impf.mp','fut.act'],
    cellKeys: ['1sg','2sg','3sg','1pl','2pl','3pl'],
    endings: {
      'pres.act': { '1sg':'τίθημι', '2sg':'τίθης',  '3sg':'τίθησι(ν)', '1pl':'τίθεμεν',  '2pl':'τίθετε',  '3pl':'τιθέασι(ν)' },
      'pres.mp':  { '1sg':'τίθεμαι','2sg':'τίθεσαι','3sg':'τίθεται',   '1pl':'τιθέμεθα', '2pl':'τίθεσθε', '3pl':'τίθενται' },
      'impf.act': { '1sg':'ἐτίθην', '2sg':'ἐτίθεις','3sg':'ἐτίθει',    '1pl':'ἐτίθεμεν', '2pl':'ἐτίθετε', '3pl':'ἐτίθεσαν' },
      'impf.mp':  { '1sg':'ἐτιθέμην','2sg':'ἐτίθεσο','3sg':'ἐτίθετο', '1pl':'ἐτιθέμεθα','2pl':'ἐτίθεσθε','3pl':'ἐτίθεντο' },
      'fut.act':  { '1sg':'θήσω',   '2sg':'θήσεις', '3sg':'θήσει',    '1pl':'θήσομεν',  '2pl':'θήσετε',  '3pl':'θήσουσι(ν)' }
    }
  },

  athematic_histemi: {
    kind: 'verb', label: 'ἵστημι (to make stand)', literal: true,
    subtitle: 'ἵστημι, στήσω — to make stand, set up',
    example: { lemma:'ἵστημι', class:'athematic_histemi', meaning:'to make stand, set up' },
    // note (worth knowing, not modeled separately): ἵστημι is transitive
    // ("set up") in the present/imperfect/future/1st-aorist active shown
    // here, but functions intransitively ("stand") in its 2nd aorist and
    // perfect -- those tenses are out of v1 scope anyway (see above).
    categories: ['pres.act','pres.mp','impf.act','impf.mp','fut.act'],
    cellKeys: ['1sg','2sg','3sg','1pl','2pl','3pl'],
    endings: {
      'pres.act': { '1sg':'ἵστημι', '2sg':'ἵστης',  '3sg':'ἵστησι(ν)', '1pl':'ἵσταμεν',  '2pl':'ἵστατε',  '3pl':'ἱστᾶσι(ν)' },
      'pres.mp':  { '1sg':'ἵσταμαι','2sg':'ἵστασαι','3sg':'ἵσταται',   '1pl':'ἱστάμεθα', '2pl':'ἵστασθε', '3pl':'ἵστανται' },
      'impf.act': { '1sg':'ἵστην',  '2sg':'ἵστης',  '3sg':'ἵστη',      '1pl':'ἵσταμεν',  '2pl':'ἵστατε',  '3pl':'ἵστασαν' },
      'impf.mp':  { '1sg':'ἱστάμην','2sg':'ἵστασο', '3sg':'ἵστατο',    '1pl':'ἱστάμεθα', '2pl':'ἵστασθε', '3pl':'ἵσταντο' },
      'fut.act':  { '1sg':'στήσω',  '2sg':'στήσεις','3sg':'στήσει',    '1pl':'στήσομεν', '2pl':'στήσετε', '3pl':'στήσουσι(ν)' }
    }
  },

  athematic_hiemi: {
    kind: 'verb', label: 'ἵημι (to send, let go)', literal: true,
    subtitle: 'ἵημι, ἥσω — to send, let go',
    example: { lemma:'ἵημι', class:'athematic_hiemi', meaning:'to send, let go' },
    categories: ['pres.act','pres.mp','impf.act','impf.mp','fut.act'],
    cellKeys: ['1sg','2sg','3sg','1pl','2pl','3pl'],
    endings: {
      'pres.act': { '1sg':'ἵημι', '2sg':'ἵης',  '3sg':'ἵησι(ν)', '1pl':'ἵεμεν',  '2pl':'ἵετε',  '3pl':'ἱᾶσι(ν)' },
      'pres.mp':  { '1sg':'ἵεμαι','2sg':'ἵεσαι','3sg':'ἵεται',   '1pl':'ἱέμεθα', '2pl':'ἵεσθε', '3pl':'ἵενται' },
      'impf.act': { '1sg':'ἵην',  '2sg':'ἵεις', '3sg':'ἵει(ν)',  '1pl':'ἵεμεν',  '2pl':'ἵετε',  '3pl':'ἵεσαν' },
      'impf.mp':  { '1sg':'ἱέμην','2sg':'ἵεσο', '3sg':'ἵετο',    '1pl':'ἱέμεθα', '2pl':'ἵεσθε', '3pl':'ἵεντο' },
      'fut.act':  { '1sg':'ἥσω',  '2sg':'ἥσεις','3sg':'ἥσει',    '1pl':'ἥσομεν', '2pl':'ἥσετε', '3pl':'ἥσουσι(ν)' }
    }
  },

  athematic_deiknymi: {
    kind: 'verb', label: 'δείκνυμι (to show)', literal: true,
    subtitle: 'δείκνυμι, δείξω — to show',
    example: { lemma:'δείκνυμι', class:'athematic_deiknymi', meaning:'to show' },
    // the -νυμι sub-type -- morphologically more regular than the
    // reduplicating four above (no reduplication, stable stem δεικνυ-),
    // kept literal anyway for now since it's still the only word in its
    // class; a natural candidate to become a real root+ending formula
    // class once more -νυμι verbs are added. See HANDOFF.md.
    categories: ['pres.act','pres.mp','impf.act','impf.mp','fut.act'],
    cellKeys: ['1sg','2sg','3sg','1pl','2pl','3pl'],
    endings: {
      'pres.act': { '1sg':'δείκνυμι', '2sg':'δείκνυς',  '3sg':'δείκνυσι(ν)', '1pl':'δείκνυμεν',  '2pl':'δείκνυτε',  '3pl':'δεικνύασι(ν)' },
      'pres.mp':  { '1sg':'δείκνυμαι','2sg':'δείκνυσαι','3sg':'δείκνυται',   '1pl':'δεικνύμεθα', '2pl':'δείκνυσθε', '3pl':'δείκνυνται' },
      'impf.act': { '1sg':'ἐδείκνυν', '2sg':'ἐδείκνυς', '3sg':'ἐδείκνυ',     '1pl':'ἐδείκνυμεν', '2pl':'ἐδείκνυτε', '3pl':'ἐδείκνυσαν' },
      'impf.mp':  { '1sg':'ἐδεικνύμην','2sg':'ἐδείκνυσο','3sg':'ἐδείκνυτο', '1pl':'ἐδεικνύμεθα','2pl':'ἐδείκνυσθε','3pl':'ἐδείκνυντο' },
      'fut.act':  { '1sg':'δείξω',    '2sg':'δείξεις',  '3sg':'δείξει',      '1pl':'δείξομεν',   '2pl':'δείξετε',   '3pl':'δείξουσι(ν)' }
    }
  }

};

const GREEK_CATEGORY_LABELS = {
  nom:'Nominative', voc:'Vocative', acc:'Accusative', gen:'Genitive', dat:'Dative',
  'pres.act':'Present Active', 'pres.mp':'Present Middle/Passive',
  'impf.act':'Imperfect Active', 'impf.mp':'Imperfect Middle/Passive',
  'fut.act':'Future Active', 'fut.mid':'Future Middle', 'fut.pass':'Future Passive',
  'aor.act':'Aorist Active', 'aor.mid':'Aorist Middle', 'aor.pass':'Aorist Passive',
  'perf.act':'Perfect Active', 'perf.mp':'Perfect Middle/Passive',
  'plup.act':'Pluperfect Active', 'plup.mp':'Pluperfect Middle/Passive',
  'futperf.mp':'Future Perfect Middle/Passive'
};

const GREEK_CELL_LABELS = {
  sg:'Singular', pl:'Plural',
  '1sg':'1st sg.', '2sg':'2nd sg.', '3sg':'3rd sg.',
  '1pl':'1st pl.', '2pl':'2nd pl.', '3pl':'3rd pl.'
};
