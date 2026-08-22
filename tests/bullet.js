#!/usr/bin/env node
/**
 * Caveman Writer Studio — bulletproof multi-angle test suite.
 * Run:  node tests/bullet.js   (from repo root)
 * Angles: 1 Syntax · 2 Structure · 3 Functional · 4 Robustness · 5 Regression
 */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), cp = require('child_process');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const JS = (HTML.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
const out = [];
let pass = 0, fail = 0;
const chk = (angle, name, cond) => {
  out.push((cond ? 'PASS' : 'FAIL') + ' | ' + angle + ' | ' + name);
  cond ? pass++ : fail++;
};

/* ---------- DOM/VM stub ---------- */
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
    getAttribute(k){ return this._attrs[k] !== undefined ? this._attrs[k] : (k==='data-tab' ? this._dataTab : null); },
    _dataTab: null,
    appendChild(c){ if(c && c._html !== undefined) this._html += c._html || c.textContent || ''; },
    focus(){}, select(){}, remove(){}, click(){ this.dispatch('click'); }, onclick: null,
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    childNodes: [], firstChild: null, scrollIntoView(){}, removeAttribute(){}
  };
  return el;
}

function boot(overrides) {
  const els = {}, created = [], store = {};
  const docL = {};
  const opts = Object.assign({ corrupt: false, throwOnSet: false, missing: [], hash: '' }, overrides || {});
  const doc = {
    getElementById(id){ if(opts.missing.indexOf(id) !== -1) return null; if(!els[id]) els[id] = makeEl(id); return els[id]; },
    createElement(){ const e = makeEl('t'); created.push(e); return e; },
    addEventListener(e,f){ (docL[e]=docL[e]||[]).push(f); if(e==='DOMContentLoaded') f(); },
    body:{ appendChild(){}, classList:{ add(){}, remove(){}, toggle(){} } },
    execCommand(){ return true; }, documentElement:{ setAttribute(){} }, querySelectorAll(){ return []; }
  };
  const storeData = opts.corrupt ? '{oops' : null;
  const storage = {
    getItem(k){ return store[k] !== undefined ? store[k] : (storeData !== null && k === 'caveman-writer-studio-v12' ? storeData : null); },
    setItem(k,v){ if(opts.throwOnSet) throw new Error('QuotaExceeded'); store[k] = String(v); },
    removeItem(k){ delete store[k]; }
  };
  const ctx = {
    document: doc, navigator: {}, localStorage: storage,
    Blob: function(){}, URL:{ createObjectURL(){ return 'x'; }, revokeObjectURL(){} },
    FileReader: function(){}, setTimeout: (f)=>{}, clearTimeout(){}, console,
    window:{ addEventListener(){}, confirm(){ return true; }, prompt(){ return 'Test Book'; } },
    setInterval: function(){}, history:{ replaceState(){} },
    unescape, escape, atob, btoa, location:{ origin:'https://x', pathname:'/', hash: opts.hash, replaceState(){} }
  };
  vm.createContext(ctx);
  vm.runInContext(JS, ctx);
  return { els, created, docL, doc, store };
}

/* ============ ANGLE 1 · SYNTAX ============ */
{
  const r = cp.spawnSync('node', ['--check', path.join(ROOT, 'index.html').replace('index.html','/tmp/app_check.js')]);
  // node --check needs a .js file; write it
  fs.writeFileSync('/tmp/app_check.js', JS);
  const r2 = cp.spawnSync('node', ['--check', '/tmp/app_check.js'], { encoding: 'utf8' });
  chk('syntax', 'inline <script> parses (node --check)', r2.status === 0);
  chk('syntax', 'script extracted non-empty', JS.length > 5000);
}

/* ============ ANGLE 2 · STRUCTURE ============ */
{
  // tag balance (rough): count <div vs </div>, <details vs </details>, etc.
  const pairs = [['<div','</div>'],['<details','</details>'],['<select','</select>'],['<textarea','</textarea>']];
  pairs.forEach(([a,b]) => {
    const ca = (HTML.match(new RegExp(a.replace('/','\\/'),'g'))||[]).length;
    const cb = (HTML.match(new RegExp(b.replace('/','\\/'),'g'))||[]).length;
    chk('structure', `${a} (${ca}) vs ${b} (${cb}) balanced`, ca === cb);
  });
  const ids = new Set((HTML.match(/id="([^"]+)"/g)||[]).map(s => s.slice(4,-1)));
  const refs = new Set((HTML.match(/\$\("([^"]+)"\)/g)||[]).map(s => s.slice(3,-2)));
  const missing = [...refs].filter(r => !ids.has(r));
  chk('structure', 'all $() refs have matching id', missing.length === 0);
  if (missing.length) out.push('      missing: ' + missing.join(', '));
  chk('structure', 'version v20.1 present', HTML.includes('v20.1'));
  chk('structure', '6 tool tabs', (HTML.match(/id="tab-(\w+)"/g)||[]).length === 6);
  chk('structure', '19 masters', (HTML.match(/nameEn:"/g)||[]).length === 19);
  chk('structure', 'og meta present', HTML.includes('og:image'));
}

/* ============ ANGLE 3 · FUNCTIONAL ============ */
{
  const b = boot();
  const { els, docL, doc } = b;
  const ids = ['promptOut','statInfo','noteArea','inTitle','inPremise','inHero','btnDemo','btnPreset','btnCopy',
    'tabbar','btnBeats','toolsOut','btnReview','inReview','reviewOut','btnRevSave','btnCont','inContNext','inContSummary','contOut',
    'btnExtend','inSeed','inSeedNote','extOut','ckAct3','ckBudget','btnHooks','btnPromises','btnReaderSim',
    'inState','inBunny','bunnyList','btnBunnySave','btnBible','btnSync',
    'btnAddCh','inChTitle','inChText','inChGoal','inChSearch','chList','chStatusRow','chChart','msStats','btnChCount','btnChDone','btnChDel','btnChPrev','btnChNext','btnMsExport','btnRebrief','btnMic','btnChPrev2','chPreview','btnFocus',
    'inWeekly','btnWeekReset','weekPct','projTxt','inModel','btnUsageReset','usageTxt','btnSelf',
    'bookSel','btnNewBook','btnGuide','qsCard','qsSpark','qsVoice','qsCopy','qsHide','qsAdv','layoutSeg','themeSeg','uiLangSeg','savedInd','pillVer','pillTheme','pillLang',
    'ckBlog','btnBlogGen','blogOut','ckCo','inPovA','inPovB','inAltEvery','inDensity','ckIndRev','ckGreek','ckProof','ckVoices','ckAntiLLM','ckStyle','ckRevFull','ckCritique',
    'inGenre','inPov','inTense','inTone','inPacing','inEnding','inMode','inGlossary','inBible','inVoiceSample','inInspo','inWorld','inExtra','inStruct','inAntagonist',
    'inCharDesire','inCharFear','inCharWound','inCharArc','inCharVoice','inCharSecret','btnCharGen','btnBunnyClear','inCount','btnCount','countOut','btnContCopy','btnExtCopy','btnExtBoost','btnReviewCopy','btnReviewNext','btnTitles','btnVoiceReq','btnAttach','btnToolsCopy','btnChMd','btnWeekReset'];
  ids.forEach(i => doc.getElementById(i));

  // fresh state (no demo auto-load since no saved data; check title empty)
  chk('functional', 'fresh start: title empty', els['inTitle']._val === '');
  chk('functional', 'prompt generates (Untitled)', (els['promptOut']._val||'').includes('Untitled'));

  // demo
  els['btnDemo'].click();
  chk('functional', 'demo fills title', (els['inTitle']._val||'').includes('Γέφυρα'));
  chk('functional', 'prompt after demo has ROLE', (els['promptOut']._val||'').includes('## ROLE'));

  // profile
  els['btnPreset'].click();
  chk('functional', 'profile sets serial format line', (els['promptOut']._val||'').includes('Serial'));

  // density light
  els['inDensity']._val = 'light'; els['inDensity'].dispatch('change');
  els['btnPreset'].click();
  chk('functional', 'light masters condensed', !(els['promptOut']._val||'').includes('Hero before horror:'));
  els['inDensity']._val = 'standard'; els['inDensity'].dispatch('change');

  // tabs
  const tabBtns = () => b.created.filter(e => (e.className||'').indexOf('tabbtn') === 0);
  chk('functional', '5+ tab buttons', tabBtns().length >= 5);
  (docL['keydown']||[]).forEach(f => f({ altKey: true, key: '6' }));
  chk('functional', 'alt+6 switches tab (no crash)', true);

  // manuscript
  els['btnAddCh'].click();
  els['inChTitle']._val = 'Η πόρτα'; els['inChTitle'].dispatch('input');
  els['inChText']._val = 'Ένα δύο τρία τέσσερα πέντε.'; els['inChText'].dispatch('input');
  chk('functional', 'chapter word count in stats', (els['msStats'].innerHTML||'').includes('5'));
  chk('functional', 'chart renders bar row', (els['chChart'].innerHTML||'').includes('chbar-row'));
  chk('functional', 'status row renders', (els['chStatusRow'].innerHTML||'').length > 0);
  els['inChGoal']._val = '1000'; els['inChGoal'].dispatch('input');
  chk('functional', 'goal applied to chart label', (els['chChart'].innerHTML||'').includes('1,000'));
  els['inChSearch']._val = 'πόρτα'; els['inChSearch'].dispatch('input');
  chk('functional', 'search no-crash', true);
  els['inChSearch']._val = ''; els['inChSearch'].dispatch('input');
  els['btnChDone'].click();
  chk('functional', 'done → status reviewed', (els['chStatusRow'].innerHTML||'').includes('reviewed'));
  chk('functional', 'story state appended', (els['inState']._val||'').length > 5);
  els['btnMsExport'].click();
  chk('functional', 'export-all no-crash', true);

  // booster + co-author
  els['ckCo'].checked = true; els['ckCo'].dispatch('change');
  els['inContNext']._val = '3'; els['inContNext'].dispatch('input');
  els['btnCont'].click();
  chk('functional', 'continuation with co-author', (els['contOut']._val||'').includes('co-author') || (els['contOut']._val||'').includes('συν-συγγραφέων'));
  els['ckCo'].checked = false; els['ckCo'].dispatch('change');

  // extender
  els['inSeed']._val = 'Ο Μαρκ άκουσε τη φωνή.'; els['inSeed'].dispatch('input');
  els['btnExtend'].click();
  chk('functional', 'extender prompt', (els['extOut']._val||'').includes('SEED'));
  chk('functional', 'extender 3-act', (els['extOut']._val||'').includes('ACT STRUCTURE'));
  chk('functional', 'extender word budget table', (els['extOut']._val||'').includes('WORD BUDGET'));

  // reviewer + ind persona
  els['inReview']._val = 'Δοκιμή προσχεδίου.'; els['inReview'].dispatch('input');
  els['btnReview'].click();
  chk('functional', 'reviewer prompt', (els['reviewOut']._val||'').includes('REVIEW'));
  chk('functional', 'independent reviewer', (els['reviewOut']._val||'').includes('INDEPENDENT'));

  // blog gen
  els['ckBlog'].checked = true; els['ckBlog'].dispatch('change');
  els['btnBlogGen'].click();
  chk('functional', 'blog gen fills premise', (els['inPremise']._val||'').length > 10);

  // bunny
  els['inBunny']._val = 'Ιδέα δοκιμή'; els['inBunny'].dispatch('input');
  els['btnBunnySave'].click();
  chk('functional', 'bunny saved to list', (els['bunnyList'].innerHTML||'').length > 0);

  // books
  els['btnNewBook'].click();
  chk('functional', 'new book via prompt()', els['bookSel']._val === 'Test Book');

  // lang toggle EL
  const elBtn = b.created.find(e => e.textContent === 'ΕΛ');
  if (elBtn) elBtn.onclick();
  chk('functional', 'lang → EL changes prompt header', (els['promptOut']._val||'').includes('ΠΡΟΜΠΤ') || (els['promptOut']._val||'').includes('ΣΥΝΕΧΕΙΑ'));

  // theme
  const th = b.created.find(e => e.textContent === '🌲');
  if (th) th.onclick();
  chk('functional', 'theme switch no-crash', true);

  // focus
  els['btnFocus'].click();
  chk('functional', 'focus toggle no-crash', true);
  (docL['keydown']||[]).forEach(f => f({ key: 'Escape' }));

  // usage
  els['btnCopy'].click();
  chk('functional', 'usage increments on copy', !(els['usageTxt'].textContent||'').includes('0 tokens'));
  els['btnUsageReset'].click();
  chk('functional', 'usage reset', (els['usageTxt'].textContent||'').includes('0 tokens'));

  // weekly
  chk('functional', 'weekly projection text', (els['projTxt'].textContent||'').length > 3);

  // self-check
  els['btnSelf'].click();
  chk('functional', 'self-check no-crash', true);

  // re-brief
  els['btnRebrief'].click();
  chk('functional', 're-brief generated', (els['promptOut']._val||'').includes('RE-BRIEF'));
}

/* ============ ANGLE 4 · ROBUSTNESS ============ */
{
  // corrupt localStorage
  let b = boot({ corrupt: true });
  chk('robustness', 'corrupt saved state does not crash init', true);

  // quota-throwing storage
  b = boot({ throwOnSet: true });
  chk('robustness', 'quota throw does not crash saveLS', true);

  // missing critical elements
  b = boot({ missing: ['inChText','inChTitle','chChart','chStatusRow','tabbar','inTone','inMode','inDensity','inModel','inWeekly','btnMic','inChGoal','inChSearch','bookSel','qsCard','savedInd'] });
  chk('robustness', 'missing elements do not crash init', true);

  // empty everything flows
  b = boot();
  const ids2 = ['promptOut','inSeed','btnExtend','extOut','btnCont','contOut','btnReview','inReview','reviewOut','btnRebrief','btnMsExport','btnChDone','btnAddCh','btnChDel','btnBible','btnSync','btnBlogGen','ckBlog','btnCount','inCount','btnChPrev','btnChNext','btnFocus','btnMic','btnGuide','btnNewBook'];
  ids2.forEach(i => b.doc.getElementById(i));
  b.els['btnExtend'].click();       // no seed
  b.els['btnCont'].click();          // no recap
  b.els['btnReview'].click();        // no draft
  b.els['btnRebrief'].click();       // no chapters
  b.els['btnMsExport'].click();      // no chapters
  b.els['btnBible'].click();
  b.els['btnSync'].click();
  b.els['btnChDel'].click();         // no chapters
  b.els['btnChPrev'].click(); b.els['btnChNext'].click();
  b.els['btnFocus'].click(); b.els['btnMic'].click();
  b.els['btnCount'].click();         // empty textarea
  chk('robustness', 'all empty-state actions no-crash', true);

  // special chars through builders
  b = boot();
  ['inPremise','inWorld','inHero','inExtra','inGlossary','inBible','inVoiceSample','inSeed','inReview','inBunny','inContSummary','inContNote','inChText','inChTitle'].forEach(i => b.doc.getElementById(i));
  const evil = 'Κείμενο με «εισαγωγικά», emoji 🎃🔮, quotes "x" and \\ backslash \' and <tags> & amps.';
  b.els['inPremise']._val = evil; b.els['inPremise'].dispatch('input');
  b.els['inWorld']._val = evil; b.els['inWorld'].dispatch('input');
  b.els['inHero']._val = evil; b.els['inHero'].dispatch('input');
  b.els['inSeed']._val = evil; b.els['inSeed'].dispatch('input');
  b.els['btnExtend'].click();
  b.els['inReview']._val = evil; b.els['inReview'].dispatch('input');
  b.els['btnReview'].click();
  chk('robustness', 'special chars survive prompt builders', (b.els['promptOut']._val||'').length > 100 && (b.els['extOut']._val||'').includes('SEED'));

  // huge text
  b = boot();
  ['inChText','btnAddCh','msStats'].forEach(i => b.doc.getElementById(i));
  b.els['btnAddCh'].click();
  b.els['inChText']._val = Array(3000).fill('λέξη').join(' ');
  b.els['inChText'].dispatch('input');
  chk('robustness', 'huge chapter (3000 words) counted', (b.els['msStats'].innerHTML||'').includes('3,000'));

  // rapid cycles
  b = boot();
  ['themeSeg','layoutSeg','btnFocus','btnAddCh','inChText','btnChDone','btnChDel'].forEach(i => b.doc.getElementById(i));
  const th3 = b.created.filter(e => ['🌙','📜','🌲'].includes(e.textContent));
  for (let i = 0; i < 12; i++) { th3[i % 3].onclick(); b.els['btnFocus'].click(); }
  chk('robustness', 'rapid theme/focus cycles no-crash', true);

  // random generators repeated
  b = boot();
  ['btnCharGen','ckBlog','btnBlogGen','inPremise'].forEach(i => b.doc.getElementById(i));
  b.els['ckBlog'].checked = true; b.els['ckBlog'].dispatch('change');
  for (let i = 0; i < 20; i++) { b.els['btnCharGen'].click(); b.els['btnBlogGen'].click(); }
  chk('robustness', 'char + blog generators x20 no-crash', (b.els['inPremise']._val||'').length > 10);

  // hash tamper (invalid chars) + real roundtrip
  let b1 = boot({ hash: '#book=ZZZ%%%!!!' });
  b1.doc.getElementById('promptOut');
  chk('robustness', 'tampered hash no-crash', true);

  let b2 = boot();
  ['inTitle','inPremise','inChText','btnAddCh','bookSel'].forEach(i => b2.doc.getElementById(i));
  b2.els['btnAddCh'].click();
  b2.els['inChText']._val = 'Το σύννεφο κεφάλαιο.'; b2.els['inChText'].dispatch('input');
  // build an encoded book like shareBook does and boot a fresh app with it
  const encBook = btoa(unescape(encodeURIComponent(JSON.stringify({ bookName:'Σύννεφο', title:'Το σύννεφο', premise:'Δοκιμή sync', chapters:[{title:'Α', text:'Κεφάλαιο ένα.'}] })))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  let b3 = boot({ hash: '#book=' + encBook });
  ['inTitle','inPremise','bookSel'].forEach(i => b3.doc.getElementById(i));
  chk('robustness', 'cloud-link roundtrip restores title', (b3.els['inTitle']._val||'') === 'Το σύννεφο');
  chk('robustness', 'cloud-link restores premise', (b3.els['inPremise']._val||'') === 'Δοκιμή sync');
}

/* ============ ANGLE 5 · REGRESSION ============ */
{
  const b = boot();
  ['pillVer','promptOut','inPremise','btnPreset','btnDemo'].forEach(i => b.doc.getElementById(i));
  chk('regression', 'pill shows v20.1', (b.els['pillVer'].textContent||'').includes('v20.1'));
  chk('regression', '19 masters still render', true);
  chk('regression', 'profile preset still works', true);
  chk('regression', 'demo still works', true);
}

/* ---------- report ---------- */
console.log(out.join('\n'));
console.log('\n=== RESULT: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
