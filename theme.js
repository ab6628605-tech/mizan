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
'--btn-ink:#08090E;--surface-rgb:14 16 24;--ov:0 0 0;--ovk:1;color-scheme:dark}',

/* ---------- Tokens: الوضع النهاري (عاجي دافئ، تباين WCAG AA) ---------- */
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
'html[data-theme="light"] #mznStatus{background:rgba(246,241,231,.94)!important;color:#0B7A45!important;border-color:rgba(11,122,69,.35)!important}',
'html[data-theme="light"] #mznStatus span:first-child{background:#0B7A45!important;box-shadow:0 0 6px rgba(11,122,69,.5)!important}',
'html[data-theme="light"] .mzn-nav{border-top-color:rgba(60,45,15,.16)!important}',
'html[data-theme="light"] ::selection{background:rgba(133,98,16,.25)}',

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
}

apply();
if(mq){
  var onChange=function(){ if(stored()==='auto') apply('auto'); };
  if(mq.addEventListener) mq.addEventListener('change',onChange); else if(mq.addListener) mq.addListener(onChange);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mountBtn); else mountBtn();

window.MZNTheme={apply:function(m){save(m);return apply(m);},current:function(){return root.getAttribute('data-theme');}};
})();
