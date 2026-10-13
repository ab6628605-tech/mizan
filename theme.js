/* ============================================================
   MIZAN — Theme Engine (dark / light / auto)
   يُحمَّل في <head> بشكل متزامن لمنع الوميض عند فتح الصفحة.
   يقرأ الإعداد من mzn_settings.theme ويدعم: dark | light | auto
   v5 — حقن tokens في نهاية <body> + ألوان Status Pills داكنة
   ============================================================ */
(function(){
'use strict';
var KEY='mzn_settings';
var root=document.documentElement;
var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;

/* ============================================================
   القواعد الأساسية — تُحقَن في نهاية <body> فوراً
   ============================================================ */
var CSS=[
/* ---------- Tokens: الوضع الليلي (الافتراضي) ---------- */
':root{--w:255 255 255;--wk:1;--bg-rgb:8 9 14;--surface:#0E1018;--sh:0 0 0;--shk:1;',
'--h1a:#fff;--h1b:#6A7080;',
'--grad2:linear-gradient(135deg,#E8CE8B,#C9A961);',
'--grad3:linear-gradient(135deg,#E8CE8B,#C9A961,#B87333);',
'--btn-ink:#08090E;--surface-rgb:14 16 24;--ov:0 0 0;--ovk:1;color-scheme:dark}',

/* ---------- Tokens: الوضع النهاري ---------- */
'html[data-theme="light"]{',
'--bg:#F6F1E7;--bg-rgb:246 241 231;--surface:#FFFFFF;',
'--tx:#1C1A16;--td:#5A5446;--tm:#6B6455;--ln:rgba(60,45,15,.13);',
'--w:60 45 15;--wk:2.4;--sh:70 50 15;--shk:.22;',
'--gold:#856210;--gb:#6F520A;--copper:#8F5420;--cu:#8F5420;',
'--em:#0B7A45;--ice:#2A64A0;--am:#9A5F00;--ro:#B3304A;--rose:#B3304A;--vi:#5F4AAE;',
'--text:#1C1A16;--text-dim:#5A5446;--text-mute:#6B6455;--line:rgba(60,45,15,.13);--gold-bright:#6F520A;',
'--emerald:#0B7A45;--amber:#9A5F00;--violet:#5F4AAE;',
'--h1a:#1C1A16;--h1b:#5A5446;',
'--grad2:linear-gradient(135deg,#F1D88F,#D8B45E);',
'--grad3:linear-gradient(135deg,#F1D88F,#D8B45E,#C48B3F);',
'--btn-ink:#1C1A16;--surface-rgb:255 255 255;--ov:40 30 10;--ovk:.6;color-scheme:light}',

/* ---------- تعديلات الوضع النهاري العامة ---------- */
'html[data-theme="light"] body{background:var(--bg);color:var(--tx)}',
'html[data-theme="light"] .aura{opacity:.55}',
'html[data-theme="light"] .grain{opacity:.02}',
'html[data-theme="light"] .card,html[data-theme="light"] .file-card,html[data-theme="light"] .file-item,html[data-theme="light"] .form-card,html[data-theme="light"] .kpi,html[data-theme="light"] .row,html[data-theme="light"] .sample{background:#FFFFFF!important;border-color:var(--ln)!important;box-shadow:0 1px 2px rgba(70,50,15,.06),0 10px 28px -14px rgba(70,50,15,.18)}',
'html[data-theme="light"] input,html[data-theme="light"] select,html[data-theme="light"] textarea{border-color:rgba(60,45,15,.28);background-color:#FFFFFF;color:var(--tx)}',
'html[data-theme="light"] input:focus,html[data-theme="light"] select:focus,html[data-theme="light"] textarea:focus{border-color:var(--gold)!important;box-shadow:0 0 0 3px rgba(133,98,16,.18)!important}',
'html[data-theme="light"] input::placeholder,html[data-theme="light"] textarea::placeholder{color:var(--tm)}',
'html[data-theme="light"] #mznStatus{background:rgba(246,241,231,.94)!important;color:#0B7A45!important;border-color:rgba(11,122,69,.35)!important}',
'html[data-theme="light"] #mznStatus span:first-child{background:#0B7A45!important;box-shadow:0 0 6px rgba(11,122,69,.5)!important}',
'html[data-theme="light"] .mzn-nav{border-top-color:rgba(60,45,15,.16)!important}',
'html[data-theme="light"] ::selection{background:rgba(133,98,16,.25)}',

/* ============================================================
   FIX: ألوان الحالات (Status Pills) — داكنة واضحة
   ============================================================ */
'html[data-theme="light"] .pill-draft{background:#E8E4DA!important;color:#2A2620!important;border:1px solid #B8B0A0!important;font-weight:700!important}',
'html[data-theme="light"] .pill-pending{background:#FCEFC7!important;color:#4A2F00!important;border:1px solid #C9962E!important;font-weight:700!important}',
'html[data-theme="light"] .pill-approved{background:#C9EDD5!important;color:#04391F!important;border:1px solid #2E9A5C!important;font-weight:700!important}',
'html[data-theme="light"] .pill-rejected{background:#F7D5D5!important;color:#6B0F0F!important;border:1px solid #C44040!important;font-weight:700!important}',
'html[data-theme="light"] .pill-converted{background:#D5E6F7!important;color:#0A2E5C!important;border:1px solid #3A78B8!important;font-weight:700!important}',
'html[data-theme="light"] .pill-sent{background:#D5E6F7!important;color:#0A2E5C!important;border:1px solid #3A78B8!important;font-weight:700!important}',
'html[data-theme="light"] .pill-confirmed{background:#E4DCF7!important;color:#2E1F5C!important;border:1px solid #6E5BB8!important;font-weight:700!important}',
'html[data-theme="light"] .pill-progress{background:#FCEFC7!important;color:#4A2F00!important;border:1px solid #C9962E!important;font-weight:700!important}',
'html[data-theme="light"] .pill-received{background:#C9EDD5!important;color:#04391F!important;border:1px solid #2E9A5C!important;font-weight:700!important}',
'html[data-theme="light"] .pill-closed{background:#C9EDD5!important;color:#04391F!important;border:1px solid #2E9A5C!important;font-weight:700!important}',
'html[data-theme="light"] .pill-cancelled{background:#F7D5D5!important;color:#6B0F0F!important;border:1px solid #C44040!important;font-weight:700!important}',
'html[data-theme="light"] .pill-inspect{background:#E4DCF7!important;color:#2E1F5C!important;border:1px solid #6E5BB8!important;font-weight:700!important}',
'html[data-theme="light"] .pill-partial{background:#D5E6F7!important;color:#0A2E5C!important;border:1px solid #3A78B8!important;font-weight:700!important}',
'html[data-theme="light"] .pill-paid{background:#C9EDD5!important;color:#04391F!important;border:1px solid #2E9A5C!important;font-weight:700!important}',
'html[data-theme="light"] .pill-unpaid{background:#E8E4DA!important;color:#2A2620!important;border:1px solid #B8B0A0!important;font-weight:700!important}',
'html[data-theme="light"] .pill-matched{background:#C9EDD5!important;color:#04391F!important;border:1px solid #2E9A5C!important;font-weight:700!important}',
'html[data-theme="light"] .pill-variance{background:#F7D5D5!important;color:#6B0F0F!important;border:1px solid #C44040!important;font-weight:700!important}',
'html[data-theme="light"] .stat-pill .dot{box-shadow:none!important;opacity:.95!important}',

/* ============================================================
   FIX: Filter Chips
   ============================================================ */
'html[data-theme="light"] .filter-chip{background:#FFFFFF!important;color:#5A5446!important;border:1px solid rgba(60,45,15,.15)!important}',
'html[data-theme="light"] .filter-chip.active{background:#6F520A!important;color:#FFFFFF!important;border-color:#6F520A!important}',
'html[data-theme="light"] .filter-chip .count{background:rgba(60,45,15,.08)!important;color:#5A5446!important}',
'html[data-theme="light"] .filter-chip.active .count{background:rgba(255,255,255,.25)!important;color:#FFFFFF!important}',
'html[data-theme="light"] .fchip{background:#FFFFFF!important;color:#5A5446!important;border:1px solid rgba(60,45,15,.15)!important}',
'html[data-theme="light"] .fchip.active{background:#6F520A!important;color:#FFFFFF!important;border-color:#6F520A!important}',
'html[data-theme="light"] .fchip .fcount{background:rgba(60,45,15,.08)!important;color:#5A5446!important}',
'html[data-theme="light"] .fchip.active .fcount{background:rgba(255,255,255,.25)!important;color:#FFFFFF!important}',

/* ============================================================
   FIX: Buttons
   ============================================================ */
'html[data-theme="light"] .btn-primary{background:linear-gradient(135deg,#D8A855,#B8843A)!important;color:#FFFFFF!important;border:none!important;box-shadow:0 8px 20px -6px rgba(120,80,20,.4)!important;font-weight:600!important}',
'html[data-theme="light"] .btn-primary svg{stroke:#FFFFFF!important;fill:none!important}',
'html[data-theme="light"] .btn-wa{background:rgba(20,120,50,.1)!important;color:#0A6033!important;border:1px solid rgba(20,120,50,.35)!important}',
'html[data-theme="light"] .btn-outline{background:#FFFFFF!important;color:#6F520A!important;border:1px solid rgba(60,45,15,.2)!important}',
'html[data-theme="light"] .btn-min{color:#6F520A!important}',

/* ============================================================
   FIX: FAB + Export buttons
   ============================================================ */
'html[data-theme="light"] .fab{background:linear-gradient(135deg,#D8A855,#B8843A)!important;color:#FFFFFF!important}',
'html[data-theme="light"] .mzn-exp-btn{background:#FFFFFF!important;color:#4A4640!important;border:1px solid rgba(60,45,15,.18)!important;box-shadow:0 4px 12px rgba(70,50,15,.08)!important}',

/* ============================================================
   FIX: Back button + Side icons + Hero numbers
   ============================================================ */
'html[data-theme="light"] #mznBackBtn{background:#FFFFFF!important;color:#6F520A!important;border:1px solid rgba(60,45,15,.18)!important}',
'html[data-theme="light"] .side-icon.active{color:#6F520A!important}',
'html[data-theme="light"] .side-icon.active::after{background:#6F520A!important}',
'html[data-theme="light"] .hero-num,html[data-theme="light"] .hero-number{background:linear-gradient(180deg,#1C1A16,#5A5446)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important}',

/* ============================================================
   FIX: Tabs + Time chips
   ============================================================ */
'html[data-theme="light"] .tab{color:#5A5446!important}',
'html[data-theme="light"] .tab.active{background:rgba(133,98,16,.12)!important;color:#6F520A!important}',
'html[data-theme="light"] .time-chip{color:#5A5446!important}',
'html[data-theme="light"] .time-chip.active{background:rgba(133,98,16,.15)!important;color:#6F520A!important;border:1px solid rgba(133,98,16,.3)!important}',

/* ============================================================
   FIX: Toasts + Modals + Toggles + Inputs
   ============================================================ */
'html[data-theme="light"] .toast-min{background:rgba(255,255,255,.98)!important;border-color:rgba(60,45,15,.15)!important;color:#1C1A16!important;box-shadow:0 10px 30px rgba(70,50,15,.15)!important}',
'html[data-theme="light"] .modal-sh{background:linear-gradient(180deg,#FFFFFF,#F6F1E7)!important;border-top-color:rgba(133,98,16,.3)!important}',
'html[data-theme="light"] .modal-bd{background:rgba(40,30,10,.6)!important}',
'html[data-theme="light"] .input-field,html[data-theme="light"] .mzn-prof-i{background:#FFFFFF!important;border-color:rgba(60,45,15,.2)!important;color:#1C1A16!important}',
'html[data-theme="light"] .toggle{background:rgba(60,45,15,.15)!important}',
'html[data-theme="light"] .toggle.on{background:linear-gradient(135deg,#D8B45E,#C48B3F)!important;border-color:#A06B20!important}',
'html[data-theme="light"] .status-badge{background:rgba(20,120,50,.12)!important;color:#0A6033!important}',

/* ============================================================
   FIX: KPIs + Suppliers + Reports + Vault
   ============================================================ */
'html[data-theme="light"] .stat-mini-value{color:#1C1A16!important}',
'html[data-theme="light"] .cat-name{color:#1C1A16!important}',
'html[data-theme="light"] .cat-value{color:#6F520A!important}',
'html[data-theme="light"] .sup-name{color:#1C1A16!important}',
'html[data-theme="light"] .kpi-value{color:#1C1A16!important}',
'html[data-theme="light"] .kpi-value.gold{color:#6F520A!important}',
'html[data-theme="light"] .kpi-value.em{color:#0A6033!important}',
'html[data-theme="light"] .kpi-value.ice{color:#1A4D82!important}',
'html[data-theme="light"] .kpi-value.vi{color:#432E80!important}',
'html[data-theme="light"] .kpi-value.amber{color:#6B4500!important}',
'html[data-theme="light"] .hero-sub{color:#0A6033!important}',
'html[data-theme="light"] .btn-min:hover{color:#1C1A16!important}',

/* ---------- زر تبديل الوضع السريع ---------- */
'#mznThemeBtn{position:fixed;top:18px;right:92px;z-index:2147483645;width:30px;height:30px;border-radius:50%;',
'display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;',
'background:rgb(var(--bg-rgb) / .92);border:1px solid rgba(201,169,97,.35);color:var(--gb);',
'-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);transition:transform .2s ease}',
'#mznThemeBtn:active{transform:scale(.9)}',
'#mznThemeBtn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
'html[data-theme="light"] #mznThemeBtn{border-color:rgba(133,98,16,.4)}'
].join('');

/* ============================================================
   حقن <style> أساسي — نُدرجه في نهاية <body> ليتغلّب على CSS الصفحة
   ============================================================ */
var st=document.createElement('style');
st.id='mznThemeTokens';
st.textContent=CSS;

function _insertTokens(){
  if(document.head){
    document.head.appendChild(st);
  }
  if(document.body){
    document.body.appendChild(st);
  }
}

if(document.body){
  _insertTokens();
}else{
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',_insertTokens);
  }else{
    _insertTokens();
  }
}

/* ============================================================
   دوال مساعدة
   ============================================================ */
function stored(){
  try{var d=JSON.parse(localStorage.getItem(KEY)||'{}');return d.theme||'auto';}catch(e){return 'auto';}
}
function resolve(mode){
  if(mode==='light'||mode==='dark') return mode;
  return (mq&&mq.matches)?'dark':'light';
}
function save(mode){
  try{
    var d=JSON.parse(localStorage.getItem(KEY)||'{}');
    d.theme=mode;
    localStorage.setItem(KEY,JSON.stringify(d));
  }catch(e){}
}

/* ============================================================
   LATE_CSS — طبقة تأمين بألوان داكنة واضحة (الوضع النهاري)
   ============================================================ */
var LATE_CSS =
  'html[data-theme="light"] .pill-draft{background:#E8E4DA!important;color:#2A2620!important;border:1px solid #B8B0A0!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-pending{background:#FCEFC7!important;color:#4A2F00!important;border:1px solid #C9962E!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-approved{background:#C9EDD5!important;color:#04391F!important;border:1px solid #2E9A5C!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-rejected{background:#F7D5D5!important;color:#6B0F0F!important;border:1px solid #C44040!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-converted{background:#D5E6F7!important;color:#0A2E5C!important;border:1px solid #3A78B8!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-sent{background:#D5E6F7!important;color:#0A2E5C!important;border:1px solid #3A78B8!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-confirmed{background:#E4DCF7!important;color:#2E1F5C!important;border:1px solid #6E5BB8!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-progress{background:#FCEFC7!important;color:#4A2F00!important;border:1px solid #C9962E!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-received{background:#C9EDD5!important;color:#04391F!important;border:1px solid #2E9A5C!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-closed{background:#C9EDD5!important;color:#04391F!important;border:1px solid #2E9A5C!important;font-weight:700!important}' +
  'html[data-theme="light"] .pill-cancelled{background:#F7D5D5!important;color:#6B0F0F!important;border:1px solid #C44040!important;font-weight:700!important}';

/* ============================================================
   injectLate — حقن طبقة التأمين في نهاية <body>
   ============================================================ */
var _lastInjected='';
function injectLate(r){
  if(!document.body) return;
  var inject=document.getElementById('mznThemeLate');
  if(!inject){
    inject=document.createElement('style');
    inject.id='mznThemeLate';
    document.body.appendChild(inject);
  }
  var newContent = (r==='light') ? LATE_CSS : '';
  if(newContent === _lastInjected) return;
  _lastInjected = newContent;
  inject.textContent = newContent;
}

/* ============================================================
   apply — يطبّق الوضع
   ============================================================ */
function apply(mode){
  mode=mode||stored();
  var r=resolve(mode);
  root.setAttribute('data-theme',r);
  root.setAttribute('data-mzn-theme',mode);
  var m=document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute('content',r==='light'?'#F6F1E7':'#08090E');
  paintBtn(r);
  injectLate(r);
  return r;
}

/* ============================================================
   الزر
   ============================================================ */
var SUN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
var MOON='<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
var btn=null;

function paintBtn(r){
  if(!btn) return;
  btn.innerHTML=(r==='light')?MOON:SUN;
  btn.setAttribute('aria-label',r==='light'?'التبديل إلى الوضع الليلي':'التبديل إلى الوضع النهاري');
}

function mountBtn(){
  if(btn||!document.body) return;
  if(/mizan-login/.test(location.pathname)) return;
  btn=document.createElement('button');
  btn.id='mznThemeBtn';
  btn.type='button';
  btn.addEventListener('click',function(){
    var next=(root.getAttribute('data-theme')==='light')?'dark':'light';
    save(next);apply(next);
    document.querySelectorAll('[data-choice="theme"] .choice').forEach(function(c){
      var t=c.textContent.trim();
      c.classList.toggle('active',(next==='light'&&t.indexOf('فاتح')>-1)||(next==='dark'&&t.indexOf('داكن')>-1));
    });
  });
  document.body.appendChild(btn);
  paintBtn(root.getAttribute('data-theme'));
}

/* ============================================================
   التشغيل
   ============================================================ */
apply();

if(mq){
  var onChange=function(){ if(stored()==='auto') apply('auto'); };
  if(mq.addEventListener) mq.addEventListener('change',onChange);
  else if(mq.addListener) mq.addListener(onChange);
}

/* إعادة الحقن دورياً — لضمان التغلّب على CSS الصفحات */
function _startReinject(){
  var count = 0;
  var timer = setInterval(function(){
    count++;
    if(document.body && st.parentNode !== document.body){
      document.body.appendChild(st);
    }
    _lastInjected = '';
    injectLate(root.getAttribute('data-theme'));
    if(count >= 10) clearInterval(timer);
  }, 800);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', function(){
    mountBtn();
    _startReinject();
  });
} else {
  mountBtn();
  _startReinject();
}

/* حقن إضافي عند اكتمال تحميل الصفحة */
window.addEventListener('load', function(){
  setTimeout(function(){
    if(document.body && st.parentNode !== document.body){
      document.body.appendChild(st);
    }
    _lastInjected = '';
    injectLate(root.getAttribute('data-theme'));
  }, 200);
  setTimeout(function(){
    if(document.body && st.parentNode !== document.body){
      document.body.appendChild(st);
    }
    _lastInjected = '';
    injectLate(root.getAttribute('data-theme'));
  }, 1000);
});

window.MZNTheme={
  apply:function(m){save(m);return apply(m);},
  current:function(){return root.getAttribute('data-theme');}
};

console.log('[MIZAN] Theme engine v5 ready');
})();
