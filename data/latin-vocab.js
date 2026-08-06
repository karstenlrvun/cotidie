/* ======================================================================
   Cotidie — Latin starter vocabulary

   Deliberately regular-only (see HANDOFF.md §4): every entry here inflects
   by mechanically applying its class's endings (data/latin-paradigms.js)
   with no further irregularity. Verbs with irregular perfect stems (e.g.
   videō -> vīdī, veniō -> vēnī) are still included where their PRESENT
   SYSTEM is fully regular, since v1 only drills the present system.
   Excluded deliberately: dō/dare (irregular short-a throughout), gaudeō
   (semi-deponent), -ius/-ium 2nd-declension nouns, -er 2nd-declension
   nouns (puer, ager), 3rd-declension i-stems, deus/locus (irregular
   plurals).

   Each entry:
     lemma    citation form shown to the user (nom. sg. for nouns,
              1st sg. pres. act. indic. for verbs)
     stem     (nouns) oblique stem the paradigm endings attach to
     root     (verbs) bare consonantal root the paradigm endings attach to
     class    key into LATIN_PARADIGMS
     gender   'm' | 'f' | 'n' (nouns only)
     meaning  short gloss, for the UI only -- never graded
   ====================================================================== */

const LATIN_VOCAB = [

  // ---- 1st declension (f., a few conventionally m.) ----
  { lemma:'mensa',    stem:'mens',    class:'decl1', gender:'f', meaning:'table' },
  { lemma:'puella',   stem:'puell',   class:'decl1', gender:'f', meaning:'girl' },
  { lemma:'aqua',     stem:'aqu',     class:'decl1', gender:'f', meaning:'water' },
  { lemma:'terra',    stem:'terr',    class:'decl1', gender:'f', meaning:'land, earth' },
  { lemma:'vīta',     stem:'vīt',     class:'decl1', gender:'f', meaning:'life' },
  { lemma:'fēmina',   stem:'fēmin',   class:'decl1', gender:'f', meaning:'woman' },
  { lemma:'īnsula',   stem:'īnsul',   class:'decl1', gender:'f', meaning:'island' },
  { lemma:'via',      stem:'vi',      class:'decl1', gender:'f', meaning:'road, way' },
  { lemma:'stella',   stem:'stell',   class:'decl1', gender:'f', meaning:'star' },
  { lemma:'rosa',     stem:'ros',     class:'decl1', gender:'f', meaning:'rose' },
  { lemma:'fortūna',  stem:'fortūn',  class:'decl1', gender:'f', meaning:'fortune' },
  { lemma:'cūra',     stem:'cūr',     class:'decl1', gender:'f', meaning:'care, worry' },
  { lemma:'silva',    stem:'silv',    class:'decl1', gender:'f', meaning:'forest' },
  { lemma:'lūna',     stem:'lūn',     class:'decl1', gender:'f', meaning:'moon' },
  { lemma:'patria',   stem:'patri',   class:'decl1', gender:'f', meaning:'fatherland' },
  { lemma:'epistula', stem:'epistul', class:'decl1', gender:'f', meaning:'letter' },
  { lemma:'agricola', stem:'agricol', class:'decl1', gender:'m', meaning:'farmer' },
  { lemma:'nauta',    stem:'naut',    class:'decl1', gender:'m', meaning:'sailor' },

  // ---- 2nd declension, masculine (-us) ----
  { lemma:'dominus', stem:'domin', class:'decl2m', gender:'m', meaning:'master, lord' },
  { lemma:'servus',  stem:'serv',  class:'decl2m', gender:'m', meaning:'slave, servant' },
  { lemma:'amīcus',  stem:'amīc',  class:'decl2m', gender:'m', meaning:'friend' },
  { lemma:'equus',   stem:'equ',   class:'decl2m', gender:'m', meaning:'horse' },
  { lemma:'populus', stem:'popul', class:'decl2m', gender:'m', meaning:'people' },
  { lemma:'campus',  stem:'camp',  class:'decl2m', gender:'m', meaning:'field' },
  { lemma:'lupus',   stem:'lup',   class:'decl2m', gender:'m', meaning:'wolf' },
  { lemma:'mūrus',   stem:'mūr',   class:'decl2m', gender:'m', meaning:'wall' },
  { lemma:'annus',   stem:'ann',   class:'decl2m', gender:'m', meaning:'year' },
  { lemma:'ventus',  stem:'vent',  class:'decl2m', gender:'m', meaning:'wind' },
  { lemma:'numerus', stem:'numer', class:'decl2m', gender:'m', meaning:'number' },
  { lemma:'modus',   stem:'mod',   class:'decl2m', gender:'m', meaning:'manner, way' },
  { lemma:'lūdus',   stem:'lūd',   class:'decl2m', gender:'m', meaning:'game, school' },
  { lemma:'morbus',  stem:'morb',  class:'decl2m', gender:'m', meaning:'disease' },
  { lemma:'oculus',  stem:'ocul',  class:'decl2m', gender:'m', meaning:'eye' },
  { lemma:'animus',  stem:'anim',  class:'decl2m', gender:'m', meaning:'mind, spirit' },
  { lemma:'hortus',  stem:'hort',  class:'decl2m', gender:'m', meaning:'garden' },

  // ---- 2nd declension, neuter (-um) ----
  { lemma:'bellum',     stem:'bell',     class:'decl2n', gender:'n', meaning:'war' },
  { lemma:'verbum',     stem:'verb',     class:'decl2n', gender:'n', meaning:'word' },
  { lemma:'dōnum',      stem:'dōn',      class:'decl2n', gender:'n', meaning:'gift' },
  { lemma:'templum',    stem:'templ',    class:'decl2n', gender:'n', meaning:'temple' },
  { lemma:'oppidum',    stem:'oppid',    class:'decl2n', gender:'n', meaning:'town' },
  { lemma:'perīculum',  stem:'perīcul',  class:'decl2n', gender:'n', meaning:'danger' },
  { lemma:'caelum',     stem:'cael',     class:'decl2n', gender:'n', meaning:'sky' },
  { lemma:'frūmentum',  stem:'frūment',  class:'decl2n', gender:'n', meaning:'grain' },
  { lemma:'signum',     stem:'sign',     class:'decl2n', gender:'n', meaning:'sign, standard' },
  { lemma:'rēgnum',     stem:'rēgn',     class:'decl2n', gender:'n', meaning:'kingdom' },
  { lemma:'vīnum',      stem:'vīn',      class:'decl2n', gender:'n', meaning:'wine' },
  { lemma:'tēctum',     stem:'tēct',     class:'decl2n', gender:'n', meaning:'roof, house' },
  { lemma:'aurum',      stem:'aur',      class:'decl2n', gender:'n', meaning:'gold' },
  { lemma:'astrum',     stem:'astr',     class:'decl2n', gender:'n', meaning:'star' },
  { lemma:'factum',     stem:'fact',     class:'decl2n', gender:'n', meaning:'deed' },
  { lemma:'vōtum',      stem:'vōt',      class:'decl2n', gender:'n', meaning:'vow' },

  // ---- 3rd declension, m./f., consonant stem ----
  { lemma:'mīles',   stem:'mīlit',   class:'decl3mf', gender:'m', meaning:'soldier' },
  { lemma:'rēx',     stem:'rēg',     class:'decl3mf', gender:'m', meaning:'king' },
  { lemma:'dux',     stem:'duc',     class:'decl3mf', gender:'m', meaning:'leader' },
  { lemma:'pēs',     stem:'ped',     class:'decl3mf', gender:'m', meaning:'foot' },
  { lemma:'mōs',     stem:'mōr',     class:'decl3mf', gender:'m', meaning:'custom' },
  { lemma:'comes',   stem:'comit',   class:'decl3mf', gender:'m', meaning:'companion' },
  { lemma:'custōs',  stem:'custōd',  class:'decl3mf', gender:'m', meaning:'guard' },
  { lemma:'virtūs',  stem:'virtūt',  class:'decl3mf', gender:'f', meaning:'courage, virtue' },
  { lemma:'salūs',   stem:'salūt',   class:'decl3mf', gender:'f', meaning:'safety, health' },
  { lemma:'lēx',     stem:'lēg',     class:'decl3mf', gender:'f', meaning:'law' },
  { lemma:'vōx',     stem:'vōc',     class:'decl3mf', gender:'f', meaning:'voice' },
  { lemma:'pāx',     stem:'pāc',     class:'decl3mf', gender:'f', meaning:'peace' },
  { lemma:'homō',    stem:'homin',   class:'decl3mf', gender:'m', meaning:'human being' },
  { lemma:'sermō',   stem:'sermōn',  class:'decl3mf', gender:'m', meaning:'speech, conversation' },
  { lemma:'legiō',   stem:'legiōn',  class:'decl3mf', gender:'f', meaning:'legion' },
  { lemma:'regiō',   stem:'regiōn',  class:'decl3mf', gender:'f', meaning:'region' },
  { lemma:'ratiō',   stem:'ratiōn',  class:'decl3mf', gender:'f', meaning:'reason' },

  // ---- 3rd declension, neuter, consonant stem ----
  { lemma:'corpus',  stem:'corpor',  class:'decl3n', gender:'n', meaning:'body' },
  { lemma:'tempus',  stem:'tempor',  class:'decl3n', gender:'n', meaning:'time' },
  { lemma:'genus',   stem:'gener',   class:'decl3n', gender:'n', meaning:'kind, race' },
  { lemma:'opus',    stem:'oper',    class:'decl3n', gender:'n', meaning:'work' },
  { lemma:'onus',    stem:'oner',    class:'decl3n', gender:'n', meaning:'burden' },
  { lemma:'scelus',  stem:'sceler',  class:'decl3n', gender:'n', meaning:'crime' },
  { lemma:'vulnus',  stem:'vulner',  class:'decl3n', gender:'n', meaning:'wound' },
  { lemma:'pectus',  stem:'pector',  class:'decl3n', gender:'n', meaning:'chest, heart' },
  { lemma:'lītus',   stem:'lītor',   class:'decl3n', gender:'n', meaning:'shore' },
  { lemma:'nōmen',   stem:'nōmin',   class:'decl3n', gender:'n', meaning:'name' },
  { lemma:'flūmen',  stem:'flūmin',  class:'decl3n', gender:'n', meaning:'river' },
  { lemma:'crīmen',  stem:'crīmin',  class:'decl3n', gender:'n', meaning:'accusation, crime' },
  { lemma:'carmen',  stem:'carmin',  class:'decl3n', gender:'n', meaning:'song, poem' },
  { lemma:'iter',    stem:'itiner',  class:'decl3n', gender:'n', meaning:'journey, route' },
  { lemma:'foedus',  stem:'foeder',  class:'decl3n', gender:'n', meaning:'treaty' },

  // ---- 1st conjugation ----
  { lemma:'amō',      root:'am',      class:'conj1', meaning:'to love' },
  { lemma:'laudō',    root:'laud',    class:'conj1', meaning:'to praise' },
  { lemma:'vocō',     root:'voc',     class:'conj1', meaning:'to call' },
  { lemma:'parō',     root:'par',     class:'conj1', meaning:'to prepare' },
  { lemma:'portō',    root:'port',    class:'conj1', meaning:'to carry' },
  { lemma:'spērō',    root:'spēr',    class:'conj1', meaning:'to hope' },
  { lemma:'ōrō',      root:'ōr',      class:'conj1', meaning:'to pray, beg' },
  { lemma:'pugnō',    root:'pugn',    class:'conj1', meaning:'to fight' },
  { lemma:'nāvigō',   root:'nāvig',   class:'conj1', meaning:'to sail' },
  { lemma:'habitō',   root:'habit',   class:'conj1', meaning:'to dwell' },
  { lemma:'mōnstrō',  root:'mōnstr',  class:'conj1', meaning:'to show' },
  { lemma:'servō',    root:'serv',    class:'conj1', meaning:'to save, guard' },
  { lemma:'superō',   root:'super',   class:'conj1', meaning:'to overcome' },
  { lemma:'occupō',   root:'occup',   class:'conj1', meaning:'to seize' },
  { lemma:'cōgitō',   root:'cōgit',   class:'conj1', meaning:'to think' },
  { lemma:'ambulō',   root:'ambul',   class:'conj1', meaning:'to walk' },

  // ---- 2nd conjugation ----
  { lemma:'moneō',     root:'mon',     class:'conj2', meaning:'to warn' },
  { lemma:'videō',     root:'vid',     class:'conj2', meaning:'to see' },
  { lemma:'habeō',     root:'hab',     class:'conj2', meaning:'to have' },
  { lemma:'teneō',     root:'ten',     class:'conj2', meaning:'to hold' },
  { lemma:'dēbeō',     root:'dēb',     class:'conj2', meaning:'to owe, ought' },
  { lemma:'timeō',     root:'tim',     class:'conj2', meaning:'to fear' },
  { lemma:'maneō',     root:'man',     class:'conj2', meaning:'to remain' },
  { lemma:'doceō',     root:'doc',     class:'conj2', meaning:'to teach' },
  { lemma:'moveō',     root:'mov',     class:'conj2', meaning:'to move' },
  { lemma:'respondeō', root:'respond', class:'conj2', meaning:'to answer' },
  { lemma:'terreō',    root:'terr',    class:'conj2', meaning:'to frighten' },
  { lemma:'iubeō',     root:'iub',     class:'conj2', meaning:'to order' },
  { lemma:'sedeō',     root:'sed',     class:'conj2', meaning:'to sit' },
  { lemma:'careō',     root:'car',     class:'conj2', meaning:'to lack' },
  { lemma:'studeō',    root:'stud',    class:'conj2', meaning:'to study, be eager for' },

  // ---- 4th conjugation ----
  { lemma:'audiō',    root:'aud',    class:'conj4', meaning:'to hear' },
  { lemma:'veniō',    root:'ven',    class:'conj4', meaning:'to come' },
  { lemma:'sentiō',   root:'sent',   class:'conj4', meaning:'to feel, perceive' },
  { lemma:'dormiō',   root:'dorm',   class:'conj4', meaning:'to sleep' },
  { lemma:'inveniō',  root:'inven',  class:'conj4', meaning:'to find' },
  { lemma:'sciō',     root:'sc',     class:'conj4', meaning:'to know' },
  { lemma:'nesciō',   root:'nesc',   class:'conj4', meaning:'to not know' },
  { lemma:'mūniō',    root:'mūn',    class:'conj4', meaning:'to fortify' },
  { lemma:'custōdiō', root:'custōd', class:'conj4', meaning:'to guard' },
  { lemma:'fīniō',    root:'fīn',    class:'conj4', meaning:'to finish' },
  { lemma:'pūniō',    root:'pūn',    class:'conj4', meaning:'to punish' },
  { lemma:'vestiō',   root:'vest',   class:'conj4', meaning:'to clothe' },

  // ---- 3rd conjugation ----
  { lemma:'dūcō',    root:'dūc',    class:'conj3', meaning:'to lead' },
  { lemma:'mittō',   root:'mitt',   class:'conj3', meaning:'to send' },
  { lemma:'regō',    root:'reg',    class:'conj3', meaning:'to rule' },
  { lemma:'scrībō',  root:'scrīb',  class:'conj3', meaning:'to write' },
  { lemma:'vincō',   root:'vinc',   class:'conj3', meaning:'to conquer' },
  { lemma:'dīcō',    root:'dīc',    class:'conj3', meaning:'to say' },
  { lemma:'agō',     root:'ag',     class:'conj3', meaning:'to do, drive' },
  { lemma:'petō',    root:'pet',    class:'conj3', meaning:'to seek' },
  { lemma:'currō',   root:'curr',   class:'conj3', meaning:'to run' },
  { lemma:'crēdō',   root:'crēd',   class:'conj3', meaning:'to believe' },
  { lemma:'vertō',   root:'vert',   class:'conj3', meaning:'to turn' },
  { lemma:'pōnō',    root:'pōn',    class:'conj3', meaning:'to place' },

  // ---- 3rd conjugation, -iō ----
  { lemma:'capiō',  root:'cap',  class:'conj3io', meaning:'to take, seize' },
  { lemma:'faciō',  root:'fac',  class:'conj3io', meaning:'to make, do' },
  { lemma:'iaciō',  root:'iac',  class:'conj3io', meaning:'to throw' },
  { lemma:'fugiō',  root:'fug',  class:'conj3io', meaning:'to flee' },
  { lemma:'cupiō',  root:'cup',  class:'conj3io', meaning:'to desire' },
  { lemma:'rapiō',  root:'rap',  class:'conj3io', meaning:'to seize, snatch' },
  { lemma:'pariō',  root:'par',  class:'conj3io', meaning:'to give birth to, produce' },

  // ---- irregular verbs ----
  // No stem/root: these classes are `literal` (see latin-paradigms.js) --
  // formsFor() uses the class's endings table directly, unchanged.
  { lemma:'sum',    class:'sum',    meaning:'to be' },
  { lemma:'possum', class:'possum', meaning:'to be able' },
  { lemma:'eō',     class:'eo',     meaning:'to go' },
  { lemma:'ferō',   class:'fero',   meaning:'to carry, bear' },
  { lemma:'volō',   class:'volo',   meaning:'to want, wish' },
  { lemma:'nōlō',   class:'nolo',   meaning:'to not want, be unwilling' },
  { lemma:'mālō',   class:'malo',   meaning:'to prefer' },
  { lemma:'fīō',    class:'fio',    meaning:'to become, be made' }

];
