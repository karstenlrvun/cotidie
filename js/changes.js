/* ======================================================================
   Cotidie — what changed, in the app rather than only in the repo.
   Added 2026-08-30. Ported from vocabula, with one instruction attached:
   keep it SHORT. Vocabula's own changelog grew into paragraphs nobody
   reads, which is the failure mode to avoid here, so the rule is one line
   per change, plain words, no version-speak and no file names. If a change
   cannot be said in a sentence it probably wants saying on its own screen.

   Newest first. Shared by both decks: the app changes, not the language.
   ====================================================================== */
const CHANGES = [
  ['2026.09.22.0', [
    '<b>Carrying the stem forward is back, and mended</b> — Settings › Repeating the stem, now three ways: <i>carried forward</i>, <i>only when I ask</i>, or off. A box you have not reached starts with the letters your own answers so far already share, so you type a word\u2019s stem once instead of once a cell. It can only ever show you letters you typed yourself.',
    '<b>Space steps through the alternatives</b> — in a box you have not typed in, press Space for your previous answer whole, again for empty, again for the shared run. Always those three, always in that order.',
    '<b>Stats › Time now says whether it is paying</b> — the keys you pressed against the keys the forms would have cost typed out, and the tables where it cost you rather than saved. On the twelve hardest tables it saved 37%; on the article, <i>οὗτος</i>, <i>εἰμί</i> and <i>sum</i> it costs a few keys, which is what <i>only when I ask</i> is for.'
  ]],
  ['2026.09.21.1', [
    '<b>Carrying the stem forward is switched off again for now</b> — Settings › Repeating the stem turns it back on. It had two faults worth more than the keystrokes it saved. Pressing a diacritic key on a letter that had been carried in typed the digit instead of the mark, so <i>χωρᾳ</i> came out as <i>χωρα8</i> — the dative singular of almost every feminine word. And a box you had already passed and accepted could be quietly shortened later, when some other form in the table turned out to share less. Both are fixed; it is off because a wrong answer on a form you know books a drill you do not need.',
    '<b>Diacritics now work on any letter already in a box</b> — nothing to do. They used to work only on a letter you had just typed yourself, so a form an undo put back could not be accented either.'
  ]],
  ['2026.09.21.0', [
    '<b>You no longer type the stem in every cell</b> — nothing to turn on. Type the first form of a table in full, and every box you have not reached yet starts with the letters your own answers so far already share. Type straight on from there, or backspace if it has gone too far. Across both decks that is about half the keys you used to press. It only ever shows you what you typed yourself, so an aorist table still asks you for its stem. Settings › Repeating the stem turns it off.'
  ]],
  ['2026.09.20.5', [
    'This screen now says <b>where</b> to find each new thing and how to use it, not only what changed. Everything back to the rebuild has been rewritten that way.'
  ]],
  ['2026.09.20.4', [
    '<b>The cold check</b> — Stats › Take a cold check. Twenty-five forms drawn at random from everything you have met, retired tables included. Type what you can, leave the rest blank, then Mark the sheet. Nothing in it counts as a review or changes your schedule. Once a month; the first one is worth taking soon, as a baseline.'
  ]],
  ['2026.09.20.3', [
    '<b>Missing one form no longer sets a whole table back</b> — nothing to do; you will notice tables coming back far less often. Get eleven of twelve right and the table keeps its place, instead of being treated as though you had known none of it. Only the form you missed is drilled on its own.',
    '<b>A table you type entirely right the first time is retired</b> — the results screen says so. You produced every form of it cold, so it is not put in the schedule at all. One in four comes back once, about four months later, to check that retiring it was safe.',
    '<b>Measured recall</b> — Stats › Time. Of the forms asked inside a table you have met before, how many you produced, against your target. It is the number that says whether the two changes above were safe. Worth watching from about the third week.'
  ]],
  ['2026.09.20.2', [
    '<b>Start it again</b> — Tables › open the table › Start it again. Puts a table back to one you have not met, forgetting its schedule and the times you have typed it, but not the answers themselves. The way back from a table you got right by luck. It asks first, and names what it is about to forget.'
  ]],
  ['2026.09.20.1', [
    '<b>Undo</b> — after you check a table, beside Next, or the <b>U</b> key. Puts the table back exactly as it was, with what you typed still in the boxes, as though you had never pressed Check. It reaches back one check, and only while that result is still on screen.'
  ]],
  ['2026.09.20.0', [
    '<b>A new icon</b> — to see it, remove Cotidie from your home screen and add it again. A chalk C on a slate, in the app’s own letter; a phone keeps whichever icon it saved the day you added it.'
  ]],
  ['2026.09.18.0', [
    '<b>Sync</b> — the dot beside the Latin/Greek switch says whether everything is on the server; click it to sync. The code, Pull, Push, both spares and a backup file are in Settings.',
    '<b>One page</b> — the old Latin and Greek pages and the launcher are gone.',
    'The type is bundled with the app, so it looks the same offline.'
  ]],
  ['2026.09.17.0', [
    '<b>A daily limit, in minutes</b> — Settings › Minutes a day. One limit for Latin and Greek together; 0 means no limit. When it is reached nothing more is asked — but the screen that stops you offers <b>Five more minutes</b> (the <b>M</b> key), as often as you like.',
    '<b>You meet the grammar a table at a time</b> — type a table right through. If it is all right it comes back as a table; only the forms you miss are asked one by one. Tables › shows every table and which you have met.',
    '<b>A map of the grammar</b> — on a laptop, beside Home: this week, the next seven days, and how often you are right by tense, voice, mood or case.',
    '<b>A new look</b> — Settings › Look. Three themes (Slate, Stone, Graph paper), Didot type, and a key on everything.'
  ]],
  ['2026.08.31.2', [
    'Sync can be set up inside each deck now — the code box and "Get a code for this device" are on the Settings screen, not only in the launcher.',
    'Settings remembers when it last synced instead of forgetting every time you reopen it, and says in plain words what the code does and where your reviews go.',
    'New: <b>Restore the copy this replaced</b>. This device keeps one step back of its own, so a bad merge can be undone even when the copy on the server is bad too.',
    'Home warns when a lot of reviews have piled up since the last copy reached the server.'
  ]],
  ['2026.08.31.1', [
    'Home was cramped. The paradigm groups are a list now, with the due counts lined up on the right, so it is obvious at a glance which one is the big one.',
    'Look up moved to the top bar beside Settings. Review takes the whole width instead and leads with the number.',
    'Spacing and type redone throughout: cards were set tighter than everything around them by accident, and there were nine text sizes doing the work of three.',
    'On a laptop, Home is one wide column with a narrower one beside it, instead of two half-empty ones.'
  ]],
  ['2026.08.30.3', [
    'The four buttons are two. Review takes most of the row, Look up is the magnifier beside it, and Stats and Settings are the icons in the top corners.',
    'New: <b>Where you keep slipping</b> — the cells you get wrong most, with a button that drills only those. Press a row to flag it; the full ranked list is behind it, and can be grouped by tense, voice, mood or case.',
    'Review now says how many cells and roughly how long, from your own answer times. If you have no daily limit set it offers to set one.',
    'The study-days strip is shaded by how much you did, so a light day and a heavy one no longer look the same.',
    'A wrong answer now says when the cell comes back and how often it has beaten you, and can be flagged on the spot.',
    'On a laptop, Home uses the width instead of a narrow column down the middle.',
    'Keyboard shortcuts, shown on the buttons and listed under the ⌨ icon while drilling.',
    'This screen.'
  ]],
  ['2026.08.30.2', [
    'Fixed: twenty-one futures were stored in the older uncontracted spelling — ἀγγελέω where Attic writes ἀγγελῶ. Two of them were spelled exactly like their own present, so those cards could not be answered at all.',
    'Fixed: two principal parts were wrong against LSJ — ἐπιτρέπω’s perfect, and ὄμνυμι’s future.',
    'Fixed: Stats counted 5,564 cells and drew 4,204. The whole Principal parts group was missing from the grid.',
    'Fixed: ἁθροίζω was shown with a smooth breathing and graded with a rough one.'
  ]],
  ['2026.08.30.1', [
    'New: principal parts as a deck — 301 verbs, each part its own cell.'
  ]],
  ['2026.08.23', [
    'Home is a short list of groups instead of every system at once. Greek’s was fifteen phone screens long.'
  ]],
  ['2026.08.21', [
    'Sync: two devices merge rather than overwrite. Reviews from both are kept.',
    'New: a daily limit on how many unseen cells are introduced. Cells already in progress are never held back.'
  ]]
];

// The running version, read off the newest entry rather than written down a
// second time. A changelog whose top line disagrees with the build number is
// worse than no changelog, and this makes the two the same fact. tests/run.sh
// checks it against the BUILD file, which is what the ?v= asset queries and
// the launcher's About box are stamped from.
const BUILD = CHANGES[0][0];
