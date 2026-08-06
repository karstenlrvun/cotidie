/* ======================================================================
   Cotidie — Greek starter vocabulary

   Deliberately ONE word per class for v1 -- see the provenance note at
   the top of greek-paradigms.js for why (Greek accent is word-specific,
   not a safe stem+ending formula the way Latin's macron-optional grading
   sidesteps it). Each entry here is identical in content to its class's
   own `example` field; kept as a separate array anyway so the UI code
   (wordsOfClass, dueCards, etc.) works identically for Latin and Greek
   without special-casing a language with only one word per class.
   Expanding this list is an open item in HANDOFF.md.
   ====================================================================== */

const GREEK_VOCAB = [
  { lemma:'τιμή',    class:'decl1_e',    gender:'f', meaning:'honor' },
  { lemma:'πολίτης', class:'decl1_es',   gender:'m', meaning:'citizen' },
  { lemma:'λόγος',   class:'decl2_os',   gender:'m', meaning:'word' },
  { lemma:'δῶρον',   class:'decl2_on',   gender:'n', meaning:'gift' },
  { lemma:'σῶμα',    class:'decl3_ma',   gender:'n', meaning:'body' },
  { lemma:'φύλαξ',   class:'decl3_velar',gender:'m', meaning:'guard' },

  { lemma:'λύω',      class:'thematic',           meaning:'to loose, free' },
  { lemma:'εἰμί',     class:'athematic_eimi',     meaning:'to be' },
  { lemma:'δίδωμι',   class:'athematic_didomi',   meaning:'to give' },
  { lemma:'τίθημι',   class:'athematic_tithemi',  meaning:'to put, place' },
  { lemma:'ἵστημι',   class:'athematic_histemi',  meaning:'to make stand, set up' },
  { lemma:'ἵημι',     class:'athematic_hiemi',    meaning:'to send, let go' },
  { lemma:'δείκνυμι', class:'athematic_deiknymi', meaning:'to show' }
];
