/* ======================================================================
   Cotidie — GitHub Gist cloud sync + device pairing (ported from vocabula,
   2026-08-09). Parametrized like js/fsrs.js -- no hardcoded language, every
   function takes gistId/gistTok/gistFile/store as arguments.

   One deliberate simplification vs. vocabula's design, not an oversight:
   vocabula stores gistId/gistTok INSIDE each deck's own S.settings, then
   has to reconcile that copy against a separate shared key
   (vocabula.gist.v1) whenever the two disagree -- real complexity, needed
   there because a user might pin latin.html/greek.html as separate iOS
   Home Screen icons with isolated storage, and vocabula wants each deck
   usable stand-alone even before pairing happens. Cotidie instead treats
   the shared key (cotidie.gist.v1, see loadSharedGist/saveSharedGist
   below) as the ONLY place credentials live -- nothing duplicates them
   into store.settings, so there is nothing to reconcile. The trade-off:
   a deck's Settings screen can't show a *locally* configured gist before
   the shared key has ever been written -- acceptable, since index.html is
   already the one intended place to set this up (see HANDOFF.md §10e).

   Loaded after js/fsrs.js in the decks (adoptStore() uses deProto()/
   defaultStore() from there); index.html loads this file standalone for
   pairing only (pairEncode/pairDecode/loadSharedGist/saveSharedGist need
   nothing from fsrs.js) -- as long as index.html never calls
   pushStore/fetchStore/adoptStore, their unresolved references to
   fsrs.js's globals are never evaluated, so this is safe to load alone.
   ====================================================================== */

const GIST_SHARED_KEY = 'cotidie.gist.v1';

// Credentials live ONLY here -- see this file's header comment.
function loadSharedGist(){
  if (typeof localStorage === 'undefined') return { gistId:'', gistTok:'' };
  try {
    const raw = localStorage.getItem(GIST_SHARED_KEY);
    if (!raw) return { gistId:'', gistTok:'' };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && Object.prototype.hasOwnProperty.call(parsed,'__proto__')) delete parsed['__proto__'];
    return {
      gistId: (parsed && typeof parsed.gistId === 'string') ? parsed.gistId : '',
      gistTok: (parsed && typeof parsed.gistTok === 'string') ? parsed.gistTok : ''
    };
  } catch(e){ return { gistId:'', gistTok:'' }; }
}
function saveSharedGist(cred){
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(GIST_SHARED_KEY, JSON.stringify({ gistId: cred.gistId||'', gistTok: cred.gistTok||'' })); }
  catch(e){}
}

// Strips nothing today -- Cotidie's store carries no embedded token, unlike
// vocabula's S (settings.gistTok lives only in the separate shared key
// above, never inside store.settings, so there's nothing to redact out of
// a push payload). Kept as a named function, called from pushStore(), so
// the "never let credentials leave the device in the synced payload"
// invariant has one place to enforce if that ever changes.
function sanitisedStore(store){ return store; }

async function pushStore(store, gistId, gistTok, gistFile){
  if (!gistId || !gistTok) return { ok:false, error:'missing gist id or token' };
  try {
    const r = await fetch('https://api.github.com/gists/'+gistId, {
      method: 'PATCH',
      headers: { 'Authorization':'Bearer '+gistTok, 'Accept':'application/vnd.github+json' },
      body: JSON.stringify({ files: { [gistFile]: { content: JSON.stringify(sanitisedStore(store)) } } })
    });
    if (!r.ok) return { ok:false, error:'HTTP '+r.status };
    return { ok:true };
  } catch(e){ return { ok:false, error:e.message||String(e) }; }
}

async function fetchStore(gistId, gistTok, gistFile){
  if (!gistId || !gistTok) return { ok:false, error:'missing gist id or token' };
  try {
    const r = await fetch('https://api.github.com/gists/'+gistId, {
      headers: { 'Authorization':'Bearer '+gistTok, 'Accept':'application/vnd.github+json' }
    });
    if (!r.ok) return { ok:false, error:'HTTP '+r.status };
    const j = await r.json();
    const f = j.files && j.files[gistFile];
    if (!f) return { ok:false, error:'no '+gistFile+' in that gist' };
    let parsed = null;
    if (!f.truncated){ try { parsed = JSON.parse(f.content); } catch(e){} }
    if (parsed == null){
      const rr = await fetch(f.raw_url);
      if (!rr.ok) return { ok:false, error:'raw fetch HTTP '+rr.status };
      parsed = JSON.parse(await rr.text());
    }
    return { ok:true, store: parsed };
  } catch(e){ return { ok:false, error:e.message||String(e) }; }
}

// Pure -- ported verbatim from vocabula. `base` is the log length both
// sides last agreed on (store.syncedLogLen equivalent -- see how callers
// track this in the decks' own sync wiring, HANDOFF.md §10e).
function syncDecision(localLen, remoteLen, base){
  const localMoved = localLen > base, remoteMoved = remoteLen > base;
  if (localMoved && remoteMoved) return 'conflict';
  if (remoteMoved) return 'take-remote';
  if (localMoved) return 'push-local';
  return 'in-sync';
}

// Swaps in a fetched store wholesale. Unlike vocabula's adopt(), there is
// no applyTheme()/applyLayout() to re-run afterward -- Cotidie has no theme
// system, so this really is simpler here, not a missing step. Runs the
// incoming payload through the same deProto()+defaultStore() hardening
// loadStore() applies to localStorage content (js/fsrs.js) -- a fetched
// gist is exactly the "arrived from outside this device" case that
// motivated deProto() in the first place.
function adoptStore(incoming){
  const clean = deProto(Object.assign({}, incoming));
  if (clean.settings) deProto(clean.settings);
  if (clean.cards) Object.keys(clean.cards).forEach(k => deProto(clean.cards[k]));
  return Object.assign(defaultStore(), clean);
}

// ---- pairing: paste-only, no camera/QR (matches vocabula's own current
// design -- Safari has never shipped BarcodeDetector, see HANDOFF.md §10e) ----
const PAIR_PREFIX = 'COTIDIE1:';

function b64FromStr(str){
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
}
function strFromB64(b64){
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function pairEncode(gistId, gistTok){
  return PAIR_PREFIX + b64FromStr(JSON.stringify({ g:gistId, t:gistTok }));
}
function pairDecode(code){
  code = (code||'').trim();
  if (code.slice(0, PAIR_PREFIX.length).toUpperCase() !== PAIR_PREFIX.toUpperCase()) return null;
  try {
    const obj = JSON.parse(strFromB64(code.slice(PAIR_PREFIX.length)));
    if (obj && typeof obj.g === 'string' && typeof obj.t === 'string' && obj.g && obj.t) return { gistId: obj.g, gistTok: obj.t };
  } catch(e){}
  return null;
}

// Confirm-before-overwrite safeguard (security pass, HANDOFF.md §10b/§10e):
// names the gist id on both sides, never the token; Cancel is a genuine
// no-op. Ported verbatim from vocabula's index.html.
function pairReplaceMessage(curId, curTok, res){
  const sameGist = curId === res.gistId;
  return (curId ? 'This device is already backing up to gist '+curId+'.' : 'This device already has a token set up.') + '\n\n' +
    (sameGist
      ? 'That code names the same gist but carries a different token.'
      : 'That code points at a different gist'+(res.gistId?' ('+res.gistId+')':'')+
        (curTok!==res.gistTok?', with a different token':'')+'.') + '\n\n' +
    'OK = use the code’s details from now on. Everything this device backs up goes there instead.\n' +
    'Cancel = keep what is set up here. Nothing changes.';
}
