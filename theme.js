/* ============================================================
   MIZAN — Theme Engine (dark / light / auto)
   يُحمَّل في <head> بشكل متزامن لمنع الوميض عند فتح الصفحة.
   يقرأ الإعداد من mzn_settings.theme ويدعم: dark | light | auto
   ============================================================ */
(function(){
'use strict';
var KEY='mzn_settings';
var root=document.documentElement;
var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;

var CSS=[
/* ---------- Tokens: الوضع الليلي (الافتراضي) ---------- */
':root{--w:255 255 255;--wk:1;--bg-rgb:8 9 14;--surface:#0E1018;--sh:0 0 0;--shk:1;',
'--h1a:#fff;--h1b:#6A7080;',
'--grad2:linear-gradient(135deg,#E8CE8B,#C9A961);',
'--grad3:linear-gradient(135deg,#E8CE8B,#C9A961,#B87333);',
'--btn-ink:#08090E;--ok-a:110 231 160;--warn-a:240 196 116;--bad-a:240 160 176;--info-a:157 196 232;--vi-a:184 165 232;--em-dim:#4A9A6E;--st-draft-bg:rgb(var(--w) / .04);--st-warn-bg:rgba(240,196,116,.1);--st-ok-bg:rgba(110,231,160,.1);--st-ok-soft:rgba(110,231,160,.06);--st-bad-bg:rgba(240,160,176,.1);--st-info-bg:rgba(157,196,232,.1);--st-vi-bg:rgba(184,165,232,.1);--surface-rgb:14 16 24;--ov:0 0 0;--ovk:1;color-scheme:dark}',

/* ---------- Tokens: الوضع النهاري (عاجي دافئ، تباين WCAG AA) ---------- */
'html[data-theme="light"]{',
'--bg:#F6F1E7;--bg-rgb:246 241 231;--surface:#FFFFFF;',
'--tx:#1C1A16;--td:#4F493C;--tm:#5E5748;--ln:rgba(60,45,15,.13);',
'--w:60 45 15;--wk:2.4;--sh:70 50 15;--shk:.22;',
'--gold:#856210;--gb:#6F520A;--copper:#8F5420;--cu:#8F5420;',
'--em:#06603A;--ice:#1D4F86;--am:#7A4800;--ro:#9B2239;--rose:#9B2239;--vi:#4A369A;',
'--text:#1C1A16;--text-dim:#4F493C;--text-mute:#5E5748;--line:rgba(60,45,15,.13);--gold-bright:#6F520A;',
'--emerald:#06603A;--amber:#7A4800;--violet:#4A369A;',
'--h1a:#1C1A16;--h1b:#4F493C;',
'--grad2:linear-gradient(135deg,#F1D88F,#D8B45E);',
'--grad3:linear-gradient(135deg,#F1D88F,#D8B45E,#C48B3F);',
'--btn-ink:#1C1A16;--ok-a:6 96 58;--warn-a:122 72 0;--bad-a:155 34 57;--info-a:29 79 134;--vi-a:74 54 154;--em-dim:#2F6B4C;--st-draft-bg:rgba(60,45,15,.07);--st-warn-bg:rgba(122,72,0,.12);--st-ok-bg:rgba(6,96,58,.11);--st-ok-soft:rgba(6,96,58,.07);--st-bad-bg:rgba(155,34,57,.10);--st-info-bg:rgba(29,79,134,.10);--st-vi-bg:rgba(74,54,154,.10);--surface-rgb:255 255 255;--ov:40 30 10;--ovk:.6;color-scheme:light}',

/* ---------- تعديلات الوضع النهاري ---------- */
'html[data-theme="light"] body{background:var(--bg);color:var(--tx)}',
'html[data-theme="light"] .aura{opacity:.55}',
'html[data-theme="light"] .grain{opacity:.02}',
'html[data-theme="light"] .card,html[data-theme="light"] .file-card,html[data-theme="light"] .file-item,',
'html[data-theme="light"] .form-card,html[data-theme="light"] .kpi,html[data-theme="light"] .row,',
'html[data-theme="light"] .sample{background:#FFFFFF!important;border-color:var(--ln)!important;',
'box-shadow:0 1px 2px rgba(70,50,15,.06),0 10px 28px -14px rgba(70,50,15,.18)}',
'html[data-theme="light"] input,html[data-theme="light"] select,html[data-theme="light"] textarea{',
'border-color:rgba(60,45,15,.28);background-color:#FFFFFF;color:var(--tx)}',
'html[data-theme="light"] input:focus,html[data-theme="light"] select:focus,html[data-theme="light"] textarea:focus{',
'border-color:var(--gold)!important;box-shadow:0 0 0 3px rgba(133,98,16,.18)!important}',
'html[data-theme="light"] input::placeholder,html[data-theme="light"] textarea::placeholder{color:var(--tm)}',
'html[data-theme="light"] #mznStatus{background:rgba(246,241,231,.94)!important;color:#06603A!important;border-color:rgba(6,96,58,.35)!important}',
'html[data-theme="light"] #mznStatus span:first-child{background:#06603A!important;box-shadow:0 0 6px rgba(6,96,58,.5)!important}',
'html[data-theme="light"] .mzn-nav{border-top-color:rgba(60,45,15,.16)!important}',
'html[data-theme="light"] ::selection{background:rgba(133,98,16,.25)}',

/* ---------- شبكة الأمان والأزرار ---------- */
' '+' /* ---- شبكة أمان: ألوان ثابتة للوضع الليلي داخل عناصر مولَّدة بالـ JS ---- */ html[data-theme="light"] [stroke="#E8CE8B" i]{stroke:#6F520A!important} html[data-theme="light"] [fill="#E8CE8B" i]{fill:#6F520A!important} html[data-theme="light"] [style*="color:#E8CE8B" i],html[data-theme="light"] [style*="color: #E8CE8B" i]{color:#6F520A!important} html[data-theme="light"] [stroke="#C9A961" i]{stroke:#856210!important} html[data-theme="light"] [fill="#C9A961" i]{fill:#856210!important} html[data-theme="light"] [style*="color:#C9A961" i],html[data-theme="light"] [style*="color: #C9A961" i]{color:#856210!important} html[data-theme="light"] [stroke="#B87333" i]{stroke:#8F5420!important} html[data-theme="light"] [fill="#B87333" i]{fill:#8F5420!important} html[data-theme="light"] [style*="color:#B87333" i],html[data-theme="light"] [style*="color: #B87333" i]{color:#8F5420!important} html[data-theme="light"] [stroke="#6EE7A0" i]{stroke:#06603A!important} html[data-theme="light"] [fill="#6EE7A0" i]{fill:#06603A!important} html[data-theme="light"] [style*="color:#6EE7A0" i],html[data-theme="light"] [style*="color: #6EE7A0" i]{color:#06603A!important} html[data-theme="light"] [stroke="#F0C474" i]{stroke:#7A4800!important} html[data-theme="light"] [fill="#F0C474" i]{fill:#7A4800!important} html[data-theme="light"] [style*="color:#F0C474" i],html[data-theme="light"] [style*="color: #F0C474" i]{color:#7A4800!important} html[data-theme="light"] [stroke="#F0A0B0" i]{stroke:#9B2239!important} html[data-theme="light"] [fill="#F0A0B0" i]{fill:#9B2239!important} html[data-theme="light"] [style*="color:#F0A0B0" i],html[data-theme="light"] [style*="color: #F0A0B0" i]{color:#9B2239!important} html[data-theme="light"] [stroke="#9DC4E8" i]{stroke:#1D4F86!important} html[data-theme="light"] [fill="#9DC4E8" i]{fill:#1D4F86!important} html[data-theme="light"] [style*="color:#9DC4E8" i],html[data-theme="light"] [style*="color: #9DC4E8" i]{color:#1D4F86!important} html[data-theme="light"] [stroke="#B8A5E8" i]{stroke:#4A369A!important} html[data-theme="light"] [fill="#B8A5E8" i]{fill:#4A369A!important} html[data-theme="light"] [style*="color:#B8A5E8" i],html[data-theme="light"] [style*="color: #B8A5E8" i]{color:#4A369A!important} html[data-theme="light"] [stroke="#4A9A6E" i]{stroke:#2F6B4C!important} html[data-theme="light"] [fill="#4A9A6E" i]{fill:#2F6B4C!important} html[data-theme="light"] [style*="color:#4A9A6E" i],html[data-theme="light"] [style*="color: #4A9A6E" i]{color:#2F6B4C!important} html[data-theme="light"] [stroke="#7A8090" i]{stroke:#4F493C!important} html[data-theme="light"] [fill="#7A8090" i]{fill:#4F493C!important} html[data-theme="light"] [style*="color:#7A8090" i],html[data-theme="light"] [style*="color: #7A8090" i]{color:#4F493C!important} html[data-theme="light"] [stroke="#4A5060" i]{stroke:#5E5748!important} html[data-theme="light"] [fill="#4A5060" i]{fill:#5E5748!important} html[data-theme="light"] [style*="color:#4A5060" i],html[data-theme="light"] [style*="color: #4A5060" i]{color:#5E5748!important} html[data-theme="light"] [stroke="#EDEDED" i]{stroke:#1C1A16!important} html[data-theme="light"] [fill="#EDEDED" i]{fill:#1C1A16!important} html[data-theme="light"] [style*="color:#EDEDED" i],html[data-theme="light"] [style*="color: #EDEDED" i]{color:#1C1A16!important}'+' '+' /* ---- أزرار الذهب: خلفية ثابتة مضمونة في النهاري ---- */ html[data-theme="light"] .btn-primary,html[data-theme="light"] .btn-pick,html[data-theme="light"] .btn-analyze,html[data-theme="light"] .btn-login,html[data-theme="light"] .mzn-save{background:linear-gradient(135deg,#F1D88F,#D8B45E,#C48B3F)!important;color:#1C1A16!important} ',

/* ---------- شارات الحالة: ألوان داكنة واضحة تحت الشمس (نص / خلفية / حد) ---------- */
'html[data-theme="light"] .stat-pill,html[data-theme="light"] [class*="pill-"]{font-weight:600!important;border-width:1px!important;border-style:solid!important}',
'html[data-theme="light"] .stat-pill::before{background:var(--pd,currentColor)!important;box-shadow:none!important;opacity:1!important}',
'html[data-theme=\"light\"] .pill-pending,html[data-theme=\"light\"] .pill-progress,html[data-theme=\"light\"] .pill-partial,html[data-theme=\"light\"] .pill-unpaid{color:#4A2F00!important;background:#FCEFC7!important;border-color:#C9962E!important;--pd:#C9962E}',
'html[data-theme=\"light\"] .pill-sent,html[data-theme=\"light\"] .pill-converted{color:#0A2E5C!important;background:#D5E6F7!important;border-color:#3A78B8!important;--pd:#3A78B8}',
'html[data-theme=\"light\"] .pill-approved,html[data-theme=\"light\"] .pill-received,html[data-theme=\"light\"] .pill-accepted,html[data-theme=\"light\"] .pill-matched,html[data-theme=\"light\"] .pill-paid{color:#04391F!important;background:#C9EDD5!important;border-color:#2E9A5C!important;--pd:#2E9A5C}',
'html[data-theme=\"light\"] .pill-rejected,html[data-theme=\"light\"] .pill-cancelled,html[data-theme=\"light\"] .pill-variance{color:#5C0F1F!important;background:#F8D9DE!important;border-color:#C0455A!important;--pd:#C0455A}',
'html[data-theme=\"light\"] .pill-draft,html[data-theme=\"light\"] .pill-closed{color:#2E2A22!important;background:#E7E2D6!important;border-color:#8A8272!important;--pd:#8A8272}',
'html[data-theme=\"light\"] .pill-confirmed,html[data-theme=\"light\"] .pill-inspect{color:#2B1A63!important;background:#E3DCF6!important;border-color:#7A62C9!important;--pd:#7A62C9}',

/* ---------- زر تبديل الوضع السريع ---------- */
'#mznThemeBtn{position:fixed;top:18px;right:92px;z-index:2147483645;width:30px;height:30px;border-radius:50%;',
'display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;',
'background:rgb(var(--bg-rgb) / .92);border:1px solid rgba(201,169,97,.35);color:var(--gb);',
'-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);transition:transform .2s ease}',
'#mznThemeBtn:active{transform:scale(.9)}',
'#mznThemeBtn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
'html[data-theme="light"] #mznThemeBtn{border-color:rgba(133,98,16,.4)}'
].join('');

var st=document.createElement('style');
st.id='mznThemeTokens';
st.textContent=CSS;
(document.head||root).insertBefore(st,(document.head||root).firstChild);

function stored(){
  try{var d=JSON.parse(localStorage.getItem(KEY)||'{}');return d.theme||'auto';}catch(e){return 'auto';}
}
function resolve(mode){
  if(mode==='light'||mode==='dark') return mode;
  return (mq&&mq.matches)?'dark':'light';
}
function apply(mode){
  mode=mode||stored();
  var r=resolve(mode);
  root.setAttribute('data-theme',r);
  root.setAttribute('data-mzn-theme',mode);
  var m=document.querySelector('meta[name="theme-color"]');
  if(!m && document.head){
    m=document.createElement('meta');
    m.name='theme-color';
    document.head.appendChild(m);
  }
  if(m) m.setAttribute('content',r==='light'?'#F6F1E7':'#08090E');
  paintBtn(r);
  return r;
}
function save(mode){
  try{
    var d=JSON.parse(localStorage.getItem(KEY)||'{}');
    d.theme=mode;
    localStorage.setItem(KEY,JSON.stringify(d));
  }catch(e){}
}

/* ---------- الزر ---------- */
var SUN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
var MOON='<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
var btn=null;
function paintBtn(r){
  if(!btn) return;
  btn.innerHTML=(r==='light')?MOON:SUN;
  btn.setAttribute('aria-label',r==='light'?'التبديل إلى الوضع الليلي':'التبديل إلى الوضع النهاري');
}
function mountBtn(){
  if(btn||!document.body||/mizan-login/.test(location.pathname)&&false) return;
  btn=document.createElement('button');
  btn.id='mznThemeBtn';
  btn.type='button';
  btn.addEventListener('click',function(){
    var next=(root.getAttribute('data-theme')==='light')?'dark':'light';
    save(next);apply(next);
    /* مزامنة أزرار صفحة الإعدادات إن وُجدت */
    document.querySelectorAll('[data-choice="theme"] .choice').forEach(function(c){
      var t=c.textContent.trim();
      c.classList.toggle('active',(next==='light'&&t.indexOf('فاتح')>-1)||(next==='dark'&&t.indexOf('داكن')>-1));
    });
  });
  document.body.appendChild(btn);
  paintBtn(root.getAttribute('data-theme'));
  /* nav.js ينشئ meta theme-color متأخراً، فنزامنه بعد التحميل */
  setTimeout(function(){apply();},600);
}

apply();
if(mq){
  var onChange=function(){ if(stored()==='auto') apply('auto'); };
  if(mq.addEventListener) mq.addEventListener('change',onChange); else if(mq.addListener) mq.addListener(onChange);
}

/* حماية: تأكد أن أنماط الثيم موجودة وفي آخر <head> بعد اكتمال التحميل */
function keepTokens(){
  try{
    var el=document.getElementById('mznThemeTokens');
    if(!el){ el=st; }
    if(document.head && el.parentNode!==document.head){ document.head.appendChild(el); }
    else if(document.head && document.head.lastElementChild!==el){ document.head.appendChild(el); }
  }catch(e){}
}
window.addEventListener('load',function(){ keepTokens(); setTimeout(keepTokens,600); setTimeout(keepTokens,2000); });
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mountBtn); else mountBtn();

window.MZNTheme={apply:function(m){save(m);return apply(m);},current:function(){return root.getAttribute('data-theme');}};
})();
