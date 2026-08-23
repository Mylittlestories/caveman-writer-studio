#!/usr/bin/env node
/**
 * Caveman Writer Studio — naming-consistency suite.
 * The author's dictated names & places are canon: the local roll, the
 * names/char prompts, the main prompt and the character chips must follow
 * the dictated register (greek / western / invented), not a fixed pool.
 * Run:  node tests/naming.js   (from repo root)
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
  const ctx = {
    document: doc, navigator: {}, localStorage: storage,
    TextEncoder: TextEncoder, TextDecoder: TextDecoder,
    Blob: function(){}, URL:{ createObjectURL(){ return 'x'; }, revokeObjectURL(){} },
    FileReader: function(){}, setTimeout: ()=>{}, clearTimeout(){}, console,
    window:{ addEventListener(){}, confirm(){ return true; }, prompt(){ return 'x' } },
    setInterval: function(){}, history:{ replaceState(){} },
    unescape, escape, atob, btoa, location:{ origin:'https://x', pathname:'/', hash:'', replaceState(){} }
  };
  vm.createContext(ctx);
  vm.runInContext(JS, ctx);
  return { els, created, store };
}
const setv = (els, id, v) => { els[id].value = v; els[id].dispatch('input'); };
const ev = (els, id, e) => els[id].dispatch(e);
const setGenre = (els, g) => { els['inGenre']._val = g; ev(els, 'inGenre', 'change'); };
const clearPlan = (els) => {
  setv(els, 'inGlossary', ''); setv(els, 'inWorld', ''); setv(els, 'inBible', ''); setv(els, 'inPremise', '');
};
const blogOut = (els) => els['blogOut'].textContent || '';

/* ============ 1 · register detection ============ */
{
  const b = boot();
  const { els } = b;
  // the user's exact scenario: protagonist typed as "Leopold"
  setv(els, 'inHero', 'Leopold');
  const p = els['promptOut']._val || '';
  chk('EN main prompt: naming canon line for a western hero', p.includes('Naming (canon)'), p.slice(0, 300));
  chk('EN main prompt: register labelled Western', p.includes('Western names'));
  chk('EN main prompt: never mixes Greek names in', p.includes('no \u0394\u03b7\u03bc\u03ae\u03c4\u03c1\u03b7\u03c2/\u0395\u03bb\u03ad\u03bd\u03b7'));
  // greek hero
  setv(els, 'inHero', '\u0394\u03b7\u03bc\u03ae\u03c4\u03c1\u03b7\u03c2 \u03a3\u03b5\u03c1\u03b1\u03c6\u03b5\u03af\u03bc, 41, \u03b2\u03b9\u03b2\u03bb\u03b9\u03bf\u03b8\u03b7\u03ba\u03ac\u03c1\u03b9\u03bf\u03c2');
  const p2 = els['promptOut']._val || '';
  chk('EN main prompt: greek hero gets everyday-Greek register', p2.includes('everyday Greek names'));
  chk('EN main prompt: greek cast never gets Leopold/Jack', p2.includes('no Leopold/Jack'));
  // invented hero
  setv(els, 'inHero', '\u039c\u03bf\u03c1\u03b1\u03ca\u03bd\u03b1');
  const p3 = els['promptOut']._val || '';
  chk('EN main prompt: invented hero gets invented register', p3.includes('invented names, same style'));
  chk('EN main prompt: invented world never real-world names', p3.includes('real-world or everyday Greek names'));
  // hero empty, antagonist set
  setv(els, 'inHero', '');
  setv(els, 'inAntagonist', 'Eleni Vrachou, 29');
  const p4 = els['promptOut']._val || '';
  chk('EN main prompt: antagonist-only still anchors (western)', p4.includes('Western names'));
}

/* ============ 2 · local roll follows the dictated hero ============ */
{
  const b = boot();
  const { els } = b;
  clearPlan(els);
  // a) western hero in a greek genre → person from the western pool
  setGenre(els, 'horror');
  setv(els, 'inHero', 'Leopold Hartmann, 52, archivist');
  els['btnNamesLocal'].click();
  const out = blogOut(els);
  chk('local roll: reason names the dictated hero', out.includes('matching your dictated names: \u00abLeopold Hartmann\u00bb'), out);
  const person = (out.split('\n').find(l => l.indexOf('PERSON') !== -1) || '');
  chk('local roll: western person (no greek pool)',
      !/Dimitris|Eleni|Anna|Markos|Ilias|Phaedra|Homer|Lefteris|Kalliopi|Thodoris|Nefeli|Orestis|Daphne|Melina|Zoi|Rinio|Smaro|Alexandra|\u0394\u03b7\u03bc\u03ae\u03c4\u03c1\u03b7\u03c2|\u0395\u03bb\u03ad\u03bd\u03b7/.test(person), person);
  // b) greek hero in a greek genre → greek pool
  setv(els, 'inHero', '\u0394\u03b7\u03bc\u03ae\u03c4\u03c1\u03b7\u03c2 \u03a3\u03b5\u03c1\u03b1\u03c6\u03b5\u03af\u03bc, 41');
  els['btnNamesLocal'].click();
  const out2 = blogOut(els);
  const person2 = (out2.split('\n').find(l => l.indexOf('PERSON') !== -1) || '');
  chk('local roll: greek hero → greek person',
      /Dimitris|Eleni|Anna|Markos|Ilias|Phaedra|Homer|Lefteris|Kalliopi|Thodoris|Nefeli|Orestis|Daphne|Melina|Zoi|Rinio|Smaro|Alexandra/.test(person2), person2);
  // c) invented hero in a greek genre → invented pool
  setv(els, 'inHero', 'Talvir Lithvorn, 34, cartographer');
  els['btnNamesLocal'].click();
  const out3 = blogOut(els);
  const person3 = (out3.split('\n').find(l => l.indexOf('PERSON') !== -1) || '');
  chk('local roll: invented hero → invented person',
      /Calethir|Thandiril|Moraina|Orynthas|Velianda|Nervalta|Sabrel|Kaelthis|Morniel|Altarion|Nymelis|Talvir|Elanthys|Rochanor|Veralina|Nychtarithas|Feron|Lysianta|Aeron|Mimik|Tennius|Ting|Varos|Loumos|Semba|Ourda/.test(person3), person3);
}

/* ============ 3 · local roll follows the dictated places (canon) ============ */
{
  const b = boot();
  const { els } = b;
  clearPlan(els);
  setGenre(els, 'fantasy');
  setv(els, 'inHero', '');
  setv(els, 'inWorld', 'The ruined port of Marestan, beyond the North Mountain, where the bell never rings.');
  els['btnNamesLocal'].click();
  const out = blogOut(els);
  chk('local roll: plan places labelled canon', out.includes('PLACE (canon \u2014 from your plan):'), out);
  chk('local roll: reuses a dictated place (Marestan / North Mountain)',
      out.includes('Marestan') || out.includes('North Mountain'), out);
  // glossary as a plan source
  setv(els, 'inWorld', '');
  setv(els, 'inGlossary', 'Marestan \u2014 the salt port \u00b7 the Unwritten \u2014 the blank on the map');
  els['btnNamesLocal'].click();
  const out2 = blogOut(els);
  chk('local roll: glossary proper nouns are canon places',
      out2.includes('Marestan') || out2.includes('Unwritten'), out2);
}

/* ============ 4 · names & char prompts carry the CANON block ============ */
{
  const b = boot();
  const { els } = b;
  clearPlan(els);
  setGenre(els, 'horror'); // genre default says greek — the dictation must override it
  setv(els, 'inHero', 'Leopold, 52, archivist');
  els['btnNames'].click();
  const np = blogOut(els);
  chk('names prompt: CANON block present', np.includes('## CANON'), np.slice(0, 400));
  chk('names prompt: fixed hero listed', np.includes('Fixed names: \u00abLeopold\u00bb'));
  chk('names prompt: dictation overrides the genre default', np.includes('override this default'));
  chk('names prompt: genre rule demoted to DEFAULT', np.includes('is the DEFAULT'));
  chk('names prompt: still carries the genre discipline', np.includes('NAMING DISCIPLINE'));
  // places dictation
  setv(els, 'inWorld', 'The town of Marestan and the Salt Sea.');
  els['btnNames'].click();
  const np2 = blogOut(els);
  chk('names prompt: fixed places listed', np2.includes('Fixed places: Marestan') || np2.includes('Fixed places: Salt Sea'), np2.slice(0, 500));
  // character prompt gets the same CANON block
  els['btnCharGen'].click();
  const cp = blogOut(els);
  chk('char prompt: CANON block present', cp.includes('## CANON'), cp.slice(0, 400));
}

/* ============ 5 · character chips follow the register ============ */
{
  const b = boot();
  const { els } = b;
  clearPlan(els);
  setv(els, 'inHero', '');
  chk('chips (default): greek set', (els['charSug']._html || '').includes('Dimitris Serafeim'), els['charSug']._html.slice(0,200));
  setv(els, 'inHero', 'Leopold Hartmann, 52');
  chk('chips (western hero): western set, no greek', (els['charSug']._html || '').includes('Hartmann') && !(els['charSug']._html || '').includes('Dimitris Serafeim'), els['charSug']._html.slice(0,300));
  setv(els, 'inHero', '\u039c\u03bf\u03c1\u03b1\u03ca\u03bd\u03b1');
  chk('chips (invented hero): invented set', (els['charSug']._html || '').includes('Silara'), els['charSug']._html.slice(0,300));
}

/* ============ 6 · myth prompt carries dictated places ============ */
{
  const b = boot();
  const { els } = b;
  clearPlan(els);
  setv(els, 'inWorld', 'The town of Marestan.');
  els['btnMythGen'].click();
  const mp = els['mythOut'].textContent || '';
  chk('myth prompt: dictated places (canon)', mp.includes('Dictated places (canon): Marestan'), mp.slice(0, 400));
}

/* ============ 7 · EL language ============ */
{
  const b = boot();
  const { els, created } = b;
  clearPlan(els);
  setGenre(els, 'horror');
  setv(els, 'inHero', 'Leopold, 52');
  const elBtn = created.find(e => e.textContent === '\u0395\u039b');
  chk('EL button found', !!elBtn);
  if(elBtn) elBtn.onclick();
  const p = els['promptOut']._val || '';
  chk('EL main prompt: naming canon line', p.includes('\u0388\u03bd\u03bf\u03bc\u03b1\u03c3\u03af\u03b1 (\u03ba\u03b1\u03bd\u03cc\u03bd\u03b1\u03c2)') || p.includes('\u039f\u03bd\u03bf\u03bc\u03b1\u03c3\u03af\u03b1 (\u03ba\u03b1\u03bd\u03cc\u03bd\u03b1\u03c2)'), p.slice(0, 400));
  chk('EL main prompt: western register in greek', p.includes('\u03b4\u03c5\u03c4\u03b9\u03ba\u03ac \u03bf\u03bd\u03cc\u03bc\u03b1\u03c4\u03b1'));
  els['btnNamesLocal'].click();
  const out = blogOut(els);
  chk('EL local roll: reason in greek', out.includes('\u03c4\u03b1\u03b9\u03c1\u03b9\u03ac\u03b6\u03b5\u03b9 \u03c3\u03c4\u03b1 \u03bf\u03c1\u03b9\u03c3\u03bc\u03ad\u03bd\u03b1 \u03c3\u03b1\u03c2 \u03bf\u03bd\u03cc\u03bc\u03b1\u03c4\u03b1'), out);
}

console.log('\n=== NAMING: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
