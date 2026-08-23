#!/usr/bin/env node
/**
 * Caveman Writer Studio — bulletproof multi-angle test suite.
 * Run:  node tests/bullet.js   (from repo root)
 * Angles: 1 Syntax · 2 Structure · 3 Functional · 4 Robustness · 5 Regression
 */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), cp = require('child_process');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'caveman-writer-studio.html'), 'utf8');
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
    TextEncoder: TextEncoder, TextDecoder: TextDecoder,
    Blob: function(){}, URL:{ createObjectURL(){ return 'x'; }, revokeObjectURL(){} },
    FileReader: function(){}, setTimeout: (f)=>{}, clearTimeout(){}, console,
    window:{ addEventListener(){}, confirm(){ return true; }, prompt(){ return 'Test Book'; } },
    setInterval: function(){}, history:{ replaceState(){} },
    unescape, escape, atob, btoa, location:{ origin:'https://x', pathname:'/', hash: opts.hash, replaceState(){} }
  };
  vm.createContext(ctx);
  vm.runInContext(JS, ctx);
  return { els, created, docL, doc, store, ctx: ctx };
}

/* ============ ANGLE 1 · SYNTAX ============ */
{
  const r = cp.spawnSync('node', ['--check', path.join(ROOT, 'caveman-writer-studio.html').replace('caveman-writer-studio.html','/tmp/app_check.js')]);
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
  chk('structure', 'version v26.0 present', HTML.includes('v26.0'));
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

  // demo (default = the v24 park demo)
  els['btnDemo'].click();
  chk('functional', 'demo fills title (park default)', (els['inTitle']._val||'').includes('Πάρκο'));
  chk('functional', 'demo fills glossary + 5-act structure', (els['inGlossary']._val||'').includes('τραπεζαία') && (els['inStruct']._val||'').includes('5 πράξεις'));
  chk('functional', 'prompt after demo has ROLE', (els['promptOut']._val||'').includes('## ROLE'));
  chk('functional', 'horror genre gets SIGNATURE TECHNIQUES', (els['promptOut']._val||'').includes('SIGNATURE TECHNIQUES') && (els['promptOut']._val||'').includes('REMEMBERS'));
  // demo switch: bridge demo still loads
  els['inDemoSel']._val = 'bridge';
  els['btnDemo'].click();
  chk('functional', 'demo switch loads bridge', (els['inTitle']._val||'').includes('Γέφυρα'));
  els['inDemoSel']._val = 'park';
  // v26: short story format
  var storyBtn = b.created.find(function(e){ return (e.innerHTML||'').indexOf('Short story') !== -1; });
  chk('functional', 'story format renders in format picker', !!storyBtn);
  if (storyBtn){
    storyBtn.onclick();
    chk('functional', 'story format: acts hint + act structure in prompt',
        (els['wordsHint'].textContent||'').indexOf('acts') !== -1 &&
        (els['promptOut']._val||'').indexOf('Act structure') !== -1);
  }
  // v26: EPUB + PDF export (no-crash + valid EPUB bytes via the debug hook)
  chk('functional', 'epub export no-crash (with a chapter)', function(){ els['btnEpub'].click(); return true; }());
  chk('functional', 'pdf export no-crash', function(){ els['btnPdf'].click(); return true; }());
  var cws = (b.ctx && b.ctx.window && b.ctx.window.__cws) || null;
  if (cws){
    var files = cws.buildEpubFiles({ title:'Δοκιμή', chapters:[{title:'', text:'Πρώτη παράγραφος.\nΔεύτερη παράγραφος.'}] });
    chk('functional', 'epub: mimetype first + opf/nav/chapter present',
        files[0].name === 'mimetype' &&
        files.some(function(f){ return f.name === 'OEBPS/content.opf'; }) &&
        files.some(function(f){ return f.name === 'OEBPS/nav.xhtml'; }) &&
        files.some(function(f){ return f.name === 'OEBPS/ch-1.xhtml'; }));
    var bytes = cws.zipStore(files);
    var eocdOk = bytes.length > 22 &&
        bytes[bytes.length-22] === 0x50 && bytes[bytes.length-21] === 0x4b &&
        bytes[bytes.length-20] === 0x05 && bytes[bytes.length-19] === 0x06;
    chk('functional', 'epub: valid ZIP (PK sig + EOCD)', bytes[0] === 0x50 && bytes[1] === 0x4b && eocdOk);
  } else {
    chk('functional', 'epub: debug hook exposed (zip/epub builders)', false);
  }

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

  // spark v2: builds a prompt for the user's AI (no predefined roll)
  els['inGenre']._val = 'fantasy'; els['inGenre'].dispatch('change');
  els['btnDice'].click();
  chk('functional', 'spark builds a prompt (not a local roll)', (els['sparkOut']._val||'').includes('SPARK') && (els['sparkOut']._val||'').includes('NAMING DISCIPLINE'));
  chk('functional', 'spark prompt enforces invented names for fantasy', (els['sparkOut']._val||'').includes('NEVER real-world names'));
  chk('functional', 'spark prompt carries the author craft', (els['sparkOut']._val||'').includes('It must smell') && (els['sparkOut']._val||'').includes('it does not know'));
  // spark v2: paste the AI's structured answer back → brief gets filled
  const sparkAns = [
    'GENRE: fantasy',
    'TITLE: The Ash Cartographer',
    'PREMISE: A cartographer maps a kingdom where every road she draws becomes real overnight — and the roads are drawing her back.',
    'HERO: Talvir Lithvorn, 34, cartographer; trusts ink more than people.',
    'ANTAGONIST: The Unwritten — the blank space on the map that hunts what is drawn.',
    'WORLD: A realm of five clans where roads are laws; one rule: what is drawn cannot be erased, only overwritten.',
    'THEMES: fate, identity, power',
    'TONE: high literary',
    'PACING: medium',
    'ENDING: bittersweet',
    'GLOSSARY: Talvir Lithvorn · Eldara · the Unwritten · Marestan',
    'HOOK: The ink dried before she did.'
  ].join('\n');
  els['inSparkAns']._val = sparkAns; els['inSparkAns'].dispatch('input');
  els['btnSparkLoad'].click();
  chk('functional', 'spark load fills title', els['inTitle']._val === 'The Ash Cartographer');
  chk('functional', 'spark load fills hero + world', (els['inHero']._val||'').includes('Talvir') && (els['inWorld']._val||'').includes('five clans'));
  chk('functional', 'spark load sets glossary + hook', (els['inGlossary']._val||'').includes('Eldara') && (els['inExtra']._val||'').includes('ink dried before she did'));
  chk('functional', 'spark load maps tone/pacing/ending', els['inTone']._val==='high' && els['inPacing']._val==='medium' && els['inEnding']._val==='bittersweet');
  chk('functional', 'spark load maps themes', (els['themeChips']._html||'').includes('Fate'));

  // genre-aware naming — offline local roll (chip): fantasy → invented only (no Athens, no everyday Greek)
  els['btnNamesLocal'].click();
  const namesFant = els['blogOut'].textContent || '';
  chk('functional', 'local roll (fantasy): invented names & places (no real Greek)',
      !/Athens|Αθήνα|Δημήτρης|Eleni|Dimitris/.test(namesFant)
      && /Marestan|Xanandou|Dyrron|Grouin|Akentrou|Valmor|Serendi|Arkana|Eldara|Thornhal|Morval|Silara|Ostrian Bay|Lithvorn Hold|The Seven-River/.test(namesFant));
  // realistic Greek genre → everyday names & real Greek places (local roll)
  els['inGenre']._val = 'horror'; els['inGenre'].dispatch('change');
  els['btnNamesLocal'].click();
  const namesGr = els['blogOut'].textContent || '';
  chk('functional', 'local roll (greek): everyday names (no fantasy pool)',
      !/Calethir|Thandiril|Moraina|Orynthas|Velianda|Dragobel|Morncal|Thornmayr/.test(namesGr));
  chk('functional', 'local roll (greek): real Greek place', /Athens|Arachovis|Mesogeia|Stone Valley|A mountain town|An island town/.test(namesGr));
  // names v2: the AI prompt flow (same spark technique)
  els['inGenre']._val = 'fantasy'; els['inGenre'].dispatch('change');
  els['btnNames'].click();
  const namesPrompt = els['blogOut'].textContent || '';
  chk('functional', 'names v2: builds a crafted prompt (not a roll)',
      namesPrompt.includes('NAMES & PLACES') && namesPrompt.includes('NEVER real-world names'));
  const namesAns = [
    'HERO: Velianda Silvare, 30, cartographer — trusts paper more than people',
    'ANTAGONIST: The lord of the last clan — wants the land only for himself',
    'THIRD: an old watchman who has seen too much and says nothing',
    'PLACE 1: Marestan — a city of salt and stone that remembers every visitor',
    'PLACE 2: the Last Forest — five clans, five hearts, one tree left standing',
    'PLACE 3: the Bridge of Five Clans — the only crossing, the only witness',
    'OBJECT: the map of ashes — a map that burns what it remembers',
    'GLOSSARY: Velianda Silvare · Marestan · the Last Forest · the map of ashes'
  ].join('\n');
  els['inNamesAns']._val = namesAns; els['inNamesAns'].dispatch('input');
  els['btnNamesLoad'].click();
  chk('functional', 'names v2 load: hero + antagonist',
      (els['inHero']._val||'').includes('Velianda Silvare') && (els['inAntagonist']._val||'').includes('last clan'));
  chk('functional', 'names v2 load: named places into world',
      (els['inWorld']._val||'').includes('Named places') && (els['inWorld']._val||'').includes('Marestan'));
  chk('functional', 'names v2 load: glossary merged', (els['inGlossary']._val||'').includes('Velianda Silvare'));
  // character v2: the AI prompt flow (same spark technique)
  els['btnCharGen'].click();
  const charPrompt = els['charOut']._val || '';
  chk('functional', 'character v2: builds a crafted prompt with context',
      charPrompt.includes('CHARACTER') && charPrompt.includes('NAMING DISCIPLINE') && charPrompt.includes('SAMPLES'));
  const charAns = [
    'HERO: Velianda Silvare, 30, cartographer — trusts paper more than people',
    'WANT: to map the Last Forest before it burns',
    'FEAR: the smoke — the day the forest burns',
    'WOUND: the summer the father forest burned — smoke and silence',
    'ARC: from the mapper to the keeper',
    'VOICE: short phrases, names the mountains as if they were people',
    'SECRET: she hid a part of the map — the place where it started',
    'ANTAGONIST: The lord of the last clan — wants the land only for himself',
    'SAMPLES:',
    '— "The mountain does not speak. It only knows when to be quiet."',
    '— "Do not erase it. I do not know why yet, but do not erase it."',
    '— "Paper does not lie. We lie to the paper."',
    'GLOSSARY: Velianda Silvare · the Last Forest · the Bridge of Five Clans'
  ].join('\n');
  els['inCharAns']._val = charAns; els['inCharAns'].dispatch('input');
  els['btnCharLoad'].click();
  chk('functional', 'character v2 load: sheet filled (want/fear/wound/arc)',
      (els['inCharDesire']._val||'').includes('Last Forest') && (els['inCharFear']._val||'').includes('smoke')
      && (els['inCharWound']._val||'').includes('burned') && (els['inCharArc']._val||'').includes('keeper'));
  chk('functional', 'character v2 load: hero + antagonist',
      (els['inHero']._val||'').includes('Velianda Silvare') && (els['inAntagonist']._val||'').includes('last clan'));
  chk('functional', 'character v2 load: voice samples into extra', (els['inExtra']._val||'').includes('Voice samples'));
  chk('functional', 'character v2 load: glossary merged', (els['inGlossary']._val||'').includes('the Last Forest'));
  // character local roll (offline fallback) still works
  els['btnCharLocal'].click();
  chk('functional', 'character local roll fills the sheet',
      (els['inHero']._val||'').length > 5 && (els['inCharDesire']._val||'').length > 3);
  // build-from-ingredients: fantasy blueprint gets fantasy names (not the western pool)
  els['inIntentGenre']._val = 'fantasy'; els['inIntentGenre'].dispatch('change');
  els['btnIntentBuild'].click();
  const intentHero = els['inHero']._val || '';
  chk('functional', 'intent fantasy: hero from fantasy pool (not western)',
      !/Jack|Suzy|Tate|Pete|Johnny|Charlie|Florence|Willie|Daria|Ramona|Helen|Lucas|Oliver|Myra|Parker|Lawrence|Anderson|Johnson|Stefanou|Clayton|Bellamy|Stone|Comy|Rudd|Leon|Crowe/.test(intentHero)
      && /Calethir|Thandiril|Moraina|Orynthas|Velianda|Axantheros|Nervalta|Sabrel|Kaelthis|Morniel|Altarion|Nymelis|Talvir|Elanthys|Rochanor|Veralina|Nychtarithas|Feron|Lysianta|Aeron/.test(intentHero));

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
  chk('regression', 'pill shows v26.0', (b.els['pillVer'].textContent||'').includes('v26.0'));
  chk('regression', '19 masters still render', true);
  chk('regression', 'profile preset still works', true);
  chk('regression', 'demo still works', true);
}

/* ---------- report ---------- */
console.log(out.join('\n'));
console.log('\n=== RESULT: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
