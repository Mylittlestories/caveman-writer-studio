#!/usr/bin/env node
/**
 * Caveman Writer Studio — v28 feature smoke test (stage pack, commission
 * strength, dramatic question, craft locks, character need/lie).
 * Run:  node tests/v28smoke.js   (from repo root)
 * Dependency-free: same vm + DOM stub approach as tests/bullet.js, with a
 * capturing Blob so export contents can be asserted.
 */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'caveman-writer-studio.html'), 'utf8');
const JS = (HTML.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
let pass = 0, fail = 0;
const chk = (name, cond, extra) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (cond ? '' : '   [' + (extra || '') + ']'));
  cond ? pass++ : fail++;
};

/* ---------- DOM/VM stub (from bullet.js) + capturing Blob ---------- */
function makeEl(id) {
  const L = {};
  const el = {
    id, _html: '', _val: '', style: {}, className: '', textContent: '', checked: false,
    placeholder: '', hidden: false, disabled: false, _cls: [], _attrs: {},
    classList: {
      add(c){ if(!el._cls.includes(c)) el._cls.push(c); },
      remove(c){ el._cls = el._cls.filter(x => x !== c); },
      toggle(c,f){ if(f===undefined){ el._cls.includes(c)?el.classList.remove(c):el.classList.add(c); } else { f?el.classList.add(c):el.classList.remove(c); } },
      contains(c){ return el._cls.includes(c); }
    },
    set innerHTML(v){ this._html = v; }, get innerHTML(){ return this._html; },
    set value(v){ this._val = v; }, get value(){ return this._val; },
    addEventListener(e,f){ (L[e] = L[e] || []).push(f); },
    dispatch(e,a){ (L[e] || []).forEach(f => f.call(this, a)); },
    setAttribute(k,v){ this._attrs[k]=v; if(k==='placeholder') this.placeholder=v; },
    getAttribute(k){ return this._attrs[k] !== undefined ? this._attrs[k] : null; },
    appendChild(c){ if(c && c._html !== undefined) this._html += c._html || c.textContent || ''; },
    focus(){}, select(){}, remove(){}, click(){ this.dispatch('click'); }, onclick: null,
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    childNodes: [], firstChild: null, scrollIntoView(){}, removeAttribute(){}
  };
  return el;
}

function boot() {
  const els = {}, created = [], store = {};
  const captures = { blobs: [], fname: null };
  const doc = {
    getElementById(id){ if(!els[id]) els[id] = makeEl(id); return els[id]; },
    createElement(){ const e = makeEl('t'); created.push(e); return e; },
    addEventListener(e,f){ if(e==='DOMContentLoaded') f(); },
    body:{ appendChild(){}, classList:{ add(){}, remove(){}, toggle(){} } },
    execCommand(){ return true; }, documentElement:{ setAttribute(){} }, querySelectorAll(){ return []; }
  };
  const storage = {
    getItem(k){ return store[k] !== undefined ? store[k] : null; },
    setItem(k,v){ store[k] = String(v); },
    removeItem(k){ delete store[k]; }
  };
  class FakeBlob { constructor(parts, opts){ this.parts = parts; this.type = (opts||{}).type; captures.blobs.push(this); } }
  const ctx = {
    document: doc, navigator: {}, localStorage: storage,
    TextEncoder: TextEncoder, TextDecoder: TextDecoder,
    Blob: FakeBlob,
    URL:{ createObjectURL(){ return 'x'; }, revokeObjectURL(){} },
    FileReader: function(){}, setTimeout: ()=>{}, clearTimeout(){}, console,
    window:{ addEventListener(){}, confirm(){ return true; }, prompt(){ return 'Test Book'; } },
    setInterval: function(){}, history:{ replaceState(){} },
    unescape, escape, atob, btoa, location:{ origin:'https://x', pathname:'/', hash:'', replaceState(){} }
  };
  const origCreate = doc.createElement;
  const origAppend = doc.body.appendChild;
  doc.createElement = function(){ const e = origCreate(); const oc = e.click; e.click = function(){ oc.call(this); if(this.download){ captures.fname = this.download; } }; return e; };
  vm.createContext(ctx);
  vm.runInContext(JS, ctx);
  return { els, created, captures, store };
}

const setv = (els, id, v) => { els[id].value = v; els[id].dispatch('input'); };
const fillAll = (els) => {
  setv(els, 'inTitle', 'Οι Βάρδοι του Πέτρου');
  setv(els, 'inPremise', 'Ένας βάρδος που έχει χάσει τη φωνή του πρέπει να τραγουδήσει ξανά για να σώσει τη πόλη του, αλλά η τελευταία μέρα πριν το φεστιβάλ.');
  setv(els, 'inHero', 'Νίκος, 34, βάρδος');
  setv(els, 'inAntagonist', 'Ο σιωπηλός δάσκαλος');
  setv(els, 'inDramQ', 'Θα βρει τη φωνή του πριν χτυπήσει η καμπάνη;');
  setv(els, 'inWorld', 'Μία ορεινή πόλη με νόμους περί τραγουδιού, τιμές στα τραγούδια, και μία πληγή που δεν κλείνει από την τελευταία γιορτή.');
  setv(els, 'inCharNeed', 'να εμπιστευτεί άλλη φωνή');
  setv(els, 'inCharLie', '«αν τραγουδώ μόνο εγώ, δεν με ξεχνάνε»');
  setv(els, 'inMustInclude', 'ένα κελί με κλειδωμένο τραγούδι');
  setv(els, 'inMustAvoid', 'εκλεκτός');
  setv(els, 'inComps', 'Ο Βασιλιάς των Τεχνών');
  setv(els, 'inGlossary', 'Βάρδος = τραγουδιστής της πόλης');
  setv(els, 'inVoiceSample', 'Δύο παράγραφοι δείγμα φωνής για τον έλεγχο της αγκύρωσης της φωνής.');
};

/* ============ 1 · structure: new elements exist in HTML ============ */
['inDramQ','inCharNeed','inCharLie','inMustInclude','inMustAvoid','inComps','btnStagePack',
 'strengthBox','strengthBar','strengthLbl','strengthDiag','dramQHint','locksHint']
 .forEach(id => chk('structure: id ' + id, HTML.includes('id="' + id + '"')));

/* ============ 2 · EN functional ============ */
{
  const b = boot();
  const { els, captures } = b;
  fillAll(els);

  const p = els['promptOut']._val || '';
  chk('EN prompt: dramatic question block', p.includes('**Dramatic question (the engine):** Θα βρει τη φωνή του'));
  chk('EN prompt: constraints header', p.includes('## CONSTRAINTS — CRAFT LOCKS'));
  chk('EN prompt: must include line', p.includes('- Must include (concrete, on the page): ένα κελί με κλειδωμένο τραγούδι'));
  chk('EN prompt: must never line', p.includes('- Must never do / must never appear (the trap named, the ban named): εκλεκτός'));
  chk('EN prompt: comps line', p.includes('- Comps (spirit, not imitation — calibrate craft, never content): Ο Βασιλιάς των Τεχνών'));
  chk('EN prompt: comps discipline line', p.includes('No characters, settings, plots or names from them may appear'));
  chk('EN prompt: character need', p.includes('**The need (what the book will force them to become):** να εμπιστευτεί άλλη φωνή'));
  chk('EN prompt: character lie', p.includes('**The lie they believe:** «αν τραγουδώ μόνο εγώ, δεν με ξεχνάνε»'));

  // strength: every craft field set → 100%
  chk('EN strength: 100%', (els['strengthLbl'].textContent || '').startsWith('100%'), els['strengthLbl'].textContent);
  chk('EN strength: commission-grade tier', (els['strengthLbl'].textContent || '').includes('Commission-grade'));
  chk('EN strength: bar at 100%', (els['strengthBar'].style.width || '') === '100%');
  chk('EN strength: ok message (no diag buttons)', (els['strengthDiag']._html || '').includes('Commission-grade — every craft field is set.'));

  // stage pack export
  els['btnStagePack'].click();
  const packBlob = captures.blobs[captures.blobs.length - 1];
  chk('stage pack: blob exported', !!packBlob);
  const pack = packBlob ? packBlob.parts.join('') : '';
  ['STAGE 1 — IGNIS · The commission','STAGE 2 — LUX · The world','STAGE 3 — ANIMA · The souls',
   'STAGE 4 — VOCES · The voice','STAGE 5 — PRIMA · Chapter 1'].forEach(h =>
    chk('stage pack: header ' + h, pack.includes(h)));
  chk('stage pack: canon title embedded', pack.includes('- Title: Οι Βάρδοι του Πέτρου'));
  chk('stage pack: canon dramatic question', pack.includes('- Dramatic question: Θα βρει τη φωνή του πριν χτυπήσει η καμπάνη;'));
  chk('stage pack: canon must include', pack.includes('- Must include: ένα κελί με κλειδωμένο τραγούδι'));
  chk('stage pack: locked commission task', pack.includes('LOCKED COMMISSION'));
  chk('stage pack: voice sample embedded', pack.includes('Δύο παράγραφοι δείγμα φωνής'));
  chk('stage pack: filename from title', captures.fname === 'Οι-Βάρδοι-του-Πέτρου-stage-pack.md', captures.fname);

  // JSON save carries the new fields
  els['btnSaveJson'].click();
  const jsonBlob = captures.blobs[captures.blobs.length - 1];
  const jtxt = jsonBlob ? jsonBlob.parts.join('') : '';
  let okJson = false, flds = {};
  try { flds = JSON.parse(jtxt.replace(/^\ufeff/,'')); okJson = true; } catch(e) {}
  chk('json: parses', okJson);
  ['dramQ','comps','mustInclude','mustAvoid','charNeed','charLie'].forEach(k =>
    chk('json: field ' + k, okJson && !!flds[k], JSON.stringify(flds[k]||null)));

  /* ---- EL mode ---- */
  const elBtn = b.created.find(e => e.textContent === 'ΕΛ');
  chk('EL button found', !!elBtn);
  if (elBtn) elBtn.onclick();
  const p2 = els['promptOut']._val || '';
  chk('EL prompt: δραματική ερώτηση', p2.includes('**Δραματική ερώτηση (ο κινητήρας):** Θα βρει τη φωνή του'));
  chk('EL prompt: περιορισμοί header', p2.includes('## ΠΕΡΙΟΡΙΣΜΟΙ — ΣΦΡΑΓΙΔΕΣ ΤΕΧΝΟΤΡΟΠΙΑΣ'));
  chk('EL prompt: never line', p2.includes('ΠΟΤΕ να μην κάνει / να μην υπάρχει'));
  chk('EL prompt: need line', p2.includes('Η ανάγκη (τι θα την/τον αναγκάσει να γίνει):'));
  chk('EL prompt: lie line', p2.includes('Η ψευδής πίστη:'));
  chk('EL strength: tier in Greek', (els['strengthLbl'].textContent || '').includes('Επίπεδο παραγγελίας'));

  els['btnStagePack'].click();
  const pack2 = (captures.blobs[captures.blobs.length - 1] || {parts:[]}).parts.join('');
  ['ΣΚΑΛΙ 1 — IGNIS · Η παραγγελία','ΣΚΑΛΙ 2 — LUX · Ο κόσμος','ΣΚΑΛΙ 3 — ANIMA · Οι ψυχές',
   'ΣΚΑΛΙ 4 — VOCES · Η φωνή','ΣΚΑΛΙ 5 — PRIMA · Κεφάλαιο 1'].forEach(h =>
    chk('EL stage pack: header ' + h, pack2.includes(h)));
  chk('EL stage pack: ΚΟΣΜΟΒΙΒΛΙΟ task', pack2.includes('ΚΟΣΜΟΒΙΒΛΙΟ'));
}

/* ============ 3 · partial state → diagnostics ============ */
{
  const b = boot();
  const { els } = b;
  setv(els, 'inTitle', 'Half done');
  // premise empty, everything else empty
  const lbl = els['strengthLbl'].textContent || '';
  chk('partial: score below 100', lbl.startsWith('100%') === false, lbl);
  const diag = els['strengthDiag']._html || '';
  chk('partial: diag button targets premise', diag.includes('data-focus="inPremise"'), diag.slice(0,120));
  chk('partial: diag button targets hero', diag.includes('data-focus="inHero"'));
  chk('partial: top-3 only', (diag.match(/strength-diag"/g) || []).length <= 3, String((diag.match(/strength-diag"/g)||[]).length));

  // fragment premise (short) gives the "fragment" message
  setv(els, 'inPremise', 'tiny');
  const lbl2 = els['strengthLbl'].textContent || '';
  chk('partial: short premise still not 100', lbl2.startsWith('100%') === false, lbl2);
}

/* ============ 4 · robustness ============ */
{
  const captures_last = (x) => x.captures.blobs[x.captures.blobs.length - 1] || { parts: [] };
  const b = boot();
  const { els } = b;
  // empty state, click stage pack: must not throw, filename falls back
  els['btnStagePack'].click();
  const pack = (captures_last(b).parts || []).join('');
  chk('empty stage pack: no crash + fallback fname', b.captures.fname === 'book-stage-pack.md', b.captures.fname);
  chk('empty stage pack: still 5 stages', (pack.match(/STAGE [1-5] —/g) || []).length === 5);
}

console.log('\n=== V28 SMOKE: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
