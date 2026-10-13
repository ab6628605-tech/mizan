(function(){
var path=(window.location.pathname.split('/').pop()||'index.html').split('?')[0];

/* ============ AUTH CHECK ============ */
if(path!=='mizan-login.html'){
  var authed=false;
  try{ authed=!!localStorage.getItem('mzn_auth'); }catch(e){}
  if(!authed){
    window.location.replace('mizan-login.html');
    return;
  }
}
  /* ============ PWA SETUP ============ */
(function setupPWA(){
  try{
    /* Theme color */
    if(!document.querySelector('meta[name="theme-color"]')){
      var m=document.createElement('meta');
      m.name='theme-color';
      m.content='#08090E';
      document.head.appendChild(m);
    }
    /* Viewport (mobile) */
    if(!document.querySelector('meta[name="viewport"]')){
      var v=document.createElement('meta');
      v.name='viewport';
      v.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
      document.head.appendChild(v);
    }
    /* Manifest */
    if(!document.querySelector('link[rel="manifest"]')){
      var l=document.createElement('link');
      l.rel='manifest';
      l.href='manifest.json';
      document.head.appendChild(l);
    }
    /* Apple touch icon */
    if(!document.querySelector('link[rel="apple-touch-icon"]')){
      var a=document.createElement('link');
      a.rel='apple-touch-icon';
      a.href='icon.svg';
      document.head.appendChild(a);
    }
    /* Apple mobile web app */
    if(!document.querySelector('meta[name="apple-mobile-web-app-capable"]')){
      var ac=document.createElement('meta');
      ac.name='apple-mobile-web-app-capable';
      ac.content='yes';
      document.head.appendChild(ac);

      var ast=document.createElement('meta');
      ast.name='apple-mobile-web-app-status-bar-style';
      ast.content='black-translucent';
      document.head.appendChild(ast);

      var at=document.createElement('meta');
      at.name='apple-mobile-web-app-title';
      at.content='MIZAN';
      document.head.appendChild(at);
    }
    /* Register service worker */
    if('serviceWorker' in navigator && location.protocol==='https:'){
      window.addEventListener('load', function(){
        var hadController=!!navigator.serviceWorker.controller;
        navigator.serviceWorker.addEventListener('controllerchange',function(){
          /* نسخة جديدة تسلّمت التحكم: أعد التحميل مرة واحدة فقط لتتّسق الملفات */
          if(!hadController) return;
          try{ if(sessionStorage.getItem('mzn_sw_reloaded')==='1') return; sessionStorage.setItem('mzn_sw_reloaded','1'); }catch(e){}
          window.location.reload();
        });
        navigator.serviceWorker.register('sw.js').then(function(reg){
          console.log('[MIZAN] SW registered');
          try{ reg.update(); }catch(e){}
        }).catch(function(e){
          console.warn('[MIZAN] SW failed:', e);
        });
      });
    }
  }catch(e){ console.warn('[MIZAN] PWA setup error:', e); }
})();

var ICONS={
vault:'<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/><circle cx="12" cy="18" r="1"/>',  
vault:'<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/><circle cx="12" cy="18" r="1"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
grid:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
scale:'<line x1="12" y1="3" x2="12" y2="21"/><polyline points="5 8 12 3 19 8"/><path d="M3 8l-1 6h8L9 8M21 8l1 6h-8l1-6"/>',
pr:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/>',
po:'<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
grn:'<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>',
users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
chart:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
};
var items=[
{href:'index.html',icon:'home',label:'الرئيسية'},
{href:'dashboard.html',icon:'grid',label:'لوحة'},
{href:'upload.html',icon:'upload',label:'رفع'},
  {href:'mizan-rfq.html',icon:'file',label:'RFQ'},
{href:'mizan-compare.html',icon:'scale',label:'مقارنة'},
{href:'mizan-pr.html',icon:'pr',label:'طلبات'},
{href:'mizan-po.html',icon:'po',label:'أوامر'},
{href:'mizan-grn.html',icon:'grn',label:'استلام'},
{href:'mizan-suppliers.html',icon:'users',label:'موردون'},
{href:'mizan-reports.html',icon:'chart',label:'تقارير'},
{href:'mizan-vault.html',icon:'vault',label:'خزنة'},
{href:'mizan-settings.html',icon:'settings',label:'إعدادات'}
];

var style=document.createElement('style');
style.id='mznNavStyle';
style.textContent=
/* ==== Layout base ==== */
'@media(max-width:900px){'+
'html,body{padding-bottom:130px!important;min-height:100vh!important}'+
'.main{padding-right:0!important;padding-bottom:130px!important;margin-right:0!important}'+
'.side,.sidebar{display:none!important;visibility:hidden!important;pointer-events:none!important;width:0!important;height:0!important;overflow:hidden!important;position:absolute!important;left:-99999px!important}'+
'}'+

/* ==== Hide old navs & filters ==== */
'#filterBarGrn,#filterBar,.filter-bar,.tabs,.tab,'+
'nav:not(.mzn-nav),aside.side,aside.sidebar,.side,.sidebar'+
'{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;overflow:hidden!important;position:absolute!important;left:-99999px!important;top:-99999px!important}'+
'.back,.back-link,.back-btn,.back-arrow{display:none!important}'+

/* ==== New nav ==== */
'.mzn-nav{position:fixed!important;bottom:0!important;left:0!important;right:0!important;height:66px!important;background:rgb(var(--bg-rgb) / 0.99)!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;border-top:1px solid rgba(201,169,97,0.2)!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 4px!important;z-index:2147483647!important;box-shadow:0 -12px 48px rgb(var(--sh) / calc(0.8 * var(--shk)))!important;box-sizing:border-box!important;width:100%!important}'+
'.mzn-item{display:flex!important;align-items:center!important;justify-content:center!important;flex:1 1 0!important;max-width:44px!important;height:44px!important;border-radius:12px!important;color:#5A6180!important;text-decoration:none!important;transition:all .2s ease!important;position:relative!important;margin:0!important;padding:0!important;-webkit-tap-highlight-color:rgba(201,169,97,0.2)!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important;user-select:none!important;-webkit-user-select:none!important;box-sizing:border-box!important}'+
'.mzn-item svg{width:21px!important;height:21px!important;pointer-events:none!important;display:block!important}'+
'.mzn-item:active{color:var(--gb)!important;background:rgba(201,169,97,0.15)!important;transform:scale(0.92)!important}'+
'.mzn-item.active{color:var(--gb)!important;background:rgba(201,169,97,0.12)!important}'+
'.mzn-item.active::after{content:""!important;position:absolute!important;bottom:3px!important;left:50%!important;transform:translateX(-50%)!important;width:4px!important;height:4px!important;border-radius:50%!important;background:#E8CE8B!important;box-shadow:0 0 8px #E8CE8B!important}'+

/* ==== Fix rows layout on mobile (RTL) ==== */
'@media(max-width:900px){'+
'.doc-row,.pr-row,.po-row{'+
'display:grid!important;'+
'grid-template-columns:1fr auto!important;'+
'grid-auto-rows:min-content!important;'+
'gap:10px 16px!important;'+
'padding:20px 8px!important;'+
'align-items:center!important;'+
'border-bottom:1px solid rgb(var(--w) / calc(0.05 * var(--wk)))!important;'+
'text-align:right!important;'+
'}'+
'.doc-row>*:nth-child(1),.pr-row>*:nth-child(1),.po-row>*:nth-child(1){display:none!important}'+
'.doc-row>*:nth-child(2),.pr-row>*:nth-child(2),.po-row>*:nth-child(2){'+
'grid-column:1/-1!important;'+
'grid-row:1!important;'+
'text-align:right!important;'+
'min-width:0!important;'+
'}'+
'.doc-row>*:nth-child(3),.pr-row>*:nth-child(3),.po-row>*:nth-child(3){display:none!important}'+
'.doc-row>*:nth-child(4),.pr-row>*:nth-child(4),.po-row>*:nth-child(4){'+
'grid-column:1!important;'+
'grid-row:2!important;'+
'text-align:right!important;'+
'}'+
'.doc-row>*:nth-child(5),.pr-row>*:nth-child(5),.po-row>*:nth-child(5){'+
'grid-column:2!important;'+
'grid-row:2!important;'+
'text-align:left!important;'+
'}'+
'.doc-title,.pr-title,.po-title{white-space:normal!important;word-break:keep-all!important;overflow-wrap:break-word!important;line-height:1.5!important}'+
'.doc-meta,.pr-meta,.po-meta{white-space:normal!important;line-height:1.5!important}'+
'.doc-amount,.pr-amount,.po-amount{font-size:16px!important}'+
'.stat-pill{display:inline-flex!important;white-space:nowrap!important}'+
'}';
document.head.appendChild(style);

/* ===== Aggressive cleanup ===== */
function hideOldNavs(){
  var sel='aside.side,aside.sidebar,.side,.sidebar,.filter-bar,#filterBarGrn,#filterBar';
  document.querySelectorAll(sel).forEach(function(el){
    if(el.classList.contains('mzn-nav')) return;
    el.style.setProperty('display','none','important');
    el.style.setProperty('visibility','hidden','important');
    el.setAttribute('aria-hidden','true');
  });
  document.querySelectorAll('nav').forEach(function(n){
    if(n.classList.contains('mzn-nav')) return;
    n.style.setProperty('display','none','important');
    n.style.setProperty('visibility','hidden','important');
  });
  document.querySelectorAll('.back,.back-link,.back-btn,.back-arrow').forEach(function(el){
    el.style.setProperty('display','none','important');
  });
}
hideOldNavs();
setInterval(hideOldNavs, 250);
if(window.MutationObserver){
  new MutationObserver(hideOldNavs).observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:['class','style']});
}

/* ===== Build new nav — "Dock + Hub" ===== */
/* الشريط السفلي: 4 وجهات أساسية + زر مركزي يفتح لوحة الأقسام (مجمّعة حسب دورة العمل) */
var DOCK_LEFT=['mizan-po.html','mizan-settings.html'];   /* يسار زر الأقسام */
var DOCK_RIGHT=['index.html','dashboard.html'];         /* يمين زر الأقسام */
var byHref={};items.forEach(function(it){byHref[it.href]=it;});

var HUB_GROUPS=[
  {title:'دورة الشراء',accent:'gold',list:[
    {href:'mizan-rfq.html',icon:'file',label:'طلب عرض سعر',sub:'RFQ'},
    {href:'upload.html',icon:'upload',label:'رفع العروض',sub:'استخراج ذكي'},
    {href:'mizan-compare.html',icon:'scale',label:'المقارنة',sub:'التوصية'},
    {href:'mizan-pr.html',icon:'pr',label:'طلبات الشراء',sub:'PR'},
    {href:'mizan-po.html',icon:'po',label:'أوامر الشراء',sub:'PO'},
    {href:'mizan-grn.html',icon:'grn',label:'سندات الاستلام',sub:'GRN'}
  ]},
  {title:'الإدارة والتحليل',accent:'ice',list:[
    {href:'dashboard.html',icon:'grid',label:'لوحة التحكم',sub:'المؤشرات'},
    {href:'mizan-suppliers.html',icon:'users',label:'الموردون',sub:'التقييم'},
    {href:'mizan-reports.html',icon:'chart',label:'التقارير',sub:'التوفير'},
    {href:'mizan-vault.html',icon:'vault',label:'خزنة الملفات',sub:'المستندات'}
  ]},
  {title:'النظام',accent:'vi',list:[
    {href:'index.html',icon:'home',label:'الرئيسية',sub:'البوابة'},
    {href:'mizan-settings.html',icon:'settings',label:'الإعدادات',sub:'الأصوات والصلاحيات'}
  ]}
];
var DOCK_SET={};DOCK_LEFT.concat(DOCK_RIGHT).forEach(function(h){DOCK_SET[h]=1;});

var dStyle=document.createElement('style');
dStyle.id='mznDockStyle';
dStyle.textContent=[
'.mzn-nav.mzd{height:calc(64px + env(safe-area-inset-bottom,0px))!important;padding:0 6px env(safe-area-inset-bottom,0px)!important;justify-content:space-around!important;align-items:stretch!important;overflow:visible!important;direction:rtl!important}',
'.mzd-item{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:var(--td);text-decoration:none;position:relative;-webkit-tap-highlight-color:transparent;cursor:pointer;touch-action:manipulation;border:0;background:none;padding:0;font-family:inherit;transition:color .2s ease,transform .15s ease}',
'.mzd-item svg{width:22px;height:22px;display:block;pointer-events:none;transition:transform .25s cubic-bezier(.16,1,.3,1)}',
'.mzd-item span{font-size:10.5px;line-height:1;font-weight:500;letter-spacing:.01em;pointer-events:none;white-space:nowrap}',
'.mzd-item:active{transform:scale(.92)}',
'.mzd-item.active{color:var(--gb)}',
'.mzd-item.active svg{transform:translateY(-1px) scale(1.08)}',
'.mzd-item.active::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:22px;height:3px;border-radius:0 0 4px 4px;background:var(--gold);box-shadow:0 2px 10px rgba(201,169,97,.55)}',
/* الزر المركزي */
'.mzd-hub{flex:0 0 74px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;border:0;background:none;padding:0 0 8px;cursor:pointer;color:var(--gb);font-family:inherit;-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
'.mzd-hub .orb{position:absolute;top:-20px;width:54px;height:54px;border-radius:50%;background:var(--grad3);color:var(--btn-ink);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px -6px rgba(201,169,97,.65),0 0 0 5px rgb(var(--bg-rgb) / 1),inset 0 1px 0 rgba(255,255,255,.45);transition:transform .35s cubic-bezier(.16,1,.3,1)}',
'.mzd-hub .orb svg{width:24px;height:24px;transition:transform .35s cubic-bezier(.16,1,.3,1)}',
'.mzd-hub:active .orb{transform:scale(.92)}',
'.mzd-hub.open .orb svg{transform:rotate(90deg) scale(.9)}',
'.mzd-hub span{font-size:10.5px;line-height:1;font-weight:600;color:var(--gb)}',
'.mzd-hub .dot{position:absolute;top:-16px;right:12px;width:9px;height:9px;border-radius:50%;background:var(--em);border:2px solid rgb(var(--bg-rgb) / 1);display:none}',
'.mzd-hub.in-hub .dot{display:block}',
/* اللوحة */
'.mzd-back{position:fixed;inset:0;background:rgb(var(--ov) / calc(.55 * var(--ovk)));-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .28s ease;z-index:2147483646}',
'.mzd-back.show{opacity:1;pointer-events:auto}',
'.mzd-sheet{position:fixed;left:0;right:0;bottom:0;max-height:86vh;overflow-y:auto;-webkit-overflow-scrolling:touch;background:linear-gradient(180deg,var(--surface),rgb(var(--bg-rgb) / 1));border-top:1px solid rgba(201,169,97,.35);border-radius:26px 26px 0 0;padding:10px 18px calc(22px + env(safe-area-inset-bottom,0px));box-shadow:0 -24px 60px -12px rgb(var(--sh) / calc(.7 * var(--shk)));transform:translateY(105%);transition:transform .42s cubic-bezier(.16,1,.3,1);z-index:2147483647;direction:rtl;overscroll-behavior:contain}',
'.mzd-sheet.show{transform:translateY(0)}',
'.mzd-grab{width:42px;height:4px;border-radius:4px;background:rgb(var(--w) / calc(.2 * var(--wk)));margin:2px auto 14px}',
'.mzd-head{display:flex;align-items:baseline;justify-content:space-between;margin:0 2px 6px}',
'.mzd-head b{font-size:18px;font-weight:600;color:var(--tx)}',
'.mzd-head i{font-style:normal;font-size:11px;letter-spacing:.2em;color:var(--tm);font-family:ui-monospace,Menlo,monospace}',
'.mzd-gt{display:flex;align-items:center;gap:10px;margin:16px 2px 10px;font-size:11.5px;font-weight:600;letter-spacing:.04em;color:var(--td)}',
'.mzd-gt::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--ln),transparent)}',
'.mzd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}',
'.mzd-tile{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:9px;padding:13px 12px 12px;border-radius:18px;background:rgb(var(--w) / calc(.035 * var(--wk)));border:1px solid var(--ln);color:var(--tx);text-decoration:none;min-height:92px;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .15s ease,border-color .2s ease,background .2s ease;opacity:0;transform:translateY(10px)}',
'.mzd-sheet.show .mzd-tile{opacity:1;transform:none;transition:opacity .35s ease,transform .45s cubic-bezier(.16,1,.3,1),border-color .2s,background .2s}',
'.mzd-tile:active{transform:scale(.96)!important}',
'.mzd-ic{width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--tint);color:var(--acc)}',
'.mzd-ic svg{width:19px;height:19px}',
'.mzd-tile b{font-size:12.5px;font-weight:600;line-height:1.25;color:var(--tx)}',
'.mzd-tile small{display:block;font-size:10px;font-weight:400;color:var(--tm);margin-top:2px}',
'.mzd-tile.cur{border-color:var(--gold);background:rgba(201,169,97,.12)}',
'.mzd-tile.cur::after{content:"";position:absolute;top:10px;left:10px;width:7px;height:7px;border-radius:50%;background:var(--gold);box-shadow:0 0 8px var(--gold)}',
'.mzd-g-gold{--acc:var(--gb);--tint:rgba(201,169,97,.16)}',
'.mzd-g-ice{--acc:var(--ice);--tint:rgba(120,170,220,.16)}',
'.mzd-g-vi{--acc:var(--vi);--tint:rgba(150,125,225,.16)}',
'html[data-theme="light"] .mzd-g-ice{--tint:rgba(42,100,160,.10)}',
'html[data-theme="light"] .mzd-g-vi{--tint:rgba(95,74,174,.10)}',
'html[data-theme="light"] .mzd-g-gold{--tint:rgba(133,98,16,.10)}',
'html[data-theme="light"] .mzd-tile{background:#FFFFFF;box-shadow:0 1px 2px rgba(70,50,15,.05)}',
'html[data-theme="light"] .mzd-tile.cur{background:#FBF3DC}',
'html[data-theme="light"] .mzd-hub .orb{box-shadow:0 10px 22px -6px rgba(133,98,16,.45),0 0 0 5px rgb(var(--bg-rgb) / 1),inset 0 1px 0 rgba(255,255,255,.6)}',
'@media(max-width:340px){.mzd-grid{grid-template-columns:repeat(2,1fr)}}',
'@media(prefers-reduced-motion:reduce){.mzd-sheet,.mzd-back,.mzd-tile,.mzd-hub .orb,.mzd-hub .orb svg{transition:none!important}}'
].join('');
document.head.appendChild(dStyle);

var SVG=function(k,sw){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.8)+'" stroke-linecap="round" stroke-linejoin="round">'+ICONS[k]+'</svg>';};
var GRID_ICON='<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>';

var nav=document.createElement('nav');
nav.className='mzn-nav mzd';
nav.setAttribute('id','mznMainNav');

function navTo(href){
  if(navigator.vibrate) try{navigator.vibrate(8);}catch(e){}
  window.location.assign(href);
}
function dockLink(href){
  var it=byHref[href]; if(!it) return null;
  var a=document.createElement('a');
  a.className='mzd-item'+(path===href?' active':'');
  a.setAttribute('href',href);
  a.setAttribute('aria-label',it.label);
  if(path===href) a.setAttribute('aria-current','page');
  a.innerHTML=SVG(it.icon)+'<span>'+it.label+'</span>';
  function go(e){ if(e){e.preventDefault();e.stopPropagation();} navTo(href); }
  a.addEventListener('click',go,true);
  a.addEventListener('touchend',go,{passive:false});
  a.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});
  return a;
}
DOCK_RIGHT.forEach(function(h){var a=dockLink(h); if(a) nav.appendChild(a);});

var hub=document.createElement('button');
hub.type='button';
hub.className='mzd-hub'+((!DOCK_SET[path]&&path!=='')?' in-hub':'');
hub.setAttribute('aria-label','كل الأقسام');
hub.setAttribute('aria-expanded','false');
hub.innerHTML='<span class="dot"></span><div class="orb">'+GRID_ICON+'</div><span>الأقسام</span>';
nav.appendChild(hub);

DOCK_LEFT.forEach(function(h){var a=dockLink(h); if(a) nav.appendChild(a);});
document.body.appendChild(nav);

/* ---- لوحة الأقسام ---- */
var back=document.createElement('div');back.className='mzd-back';
var sheet=document.createElement('div');sheet.className='mzd-sheet';
sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label','الأقسام');
var html='<div class="mzd-grab"></div><div class="mzd-head"><b>الأقسام</b><i>MIZAN</i></div>';
var tileIdx=0;
HUB_GROUPS.forEach(function(g){
  html+='<div class="mzd-gt">'+g.title+'</div><div class="mzd-grid mzd-g-'+g.accent+'">';
  g.list.forEach(function(t){
    html+='<a class="mzd-tile'+(path===t.href?' cur':'')+'" href="'+t.href+'" data-href="'+t.href+'" style="transition-delay:'+(tileIdx*28)+'ms">'+
      '<div class="mzd-ic">'+SVG(t.icon)+'</div><div><b>'+t.label+'</b><small>'+t.sub+'</small></div></a>';
    tileIdx++;
  });
  html+='</div>';
});
sheet.innerHTML=html;
document.body.appendChild(back);
document.body.appendChild(sheet);

function openHub(){
  back.classList.add('show');sheet.classList.add('show');
  hub.classList.add('open');hub.setAttribute('aria-expanded','true');
  document.documentElement.style.overflow='hidden';
  if(navigator.vibrate) try{navigator.vibrate(10);}catch(e){}
}
function closeHub(){
  back.classList.remove('show');sheet.classList.remove('show');
  hub.classList.remove('open');hub.setAttribute('aria-expanded','false');
  document.documentElement.style.overflow='';
}
hub.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();sheet.classList.contains('show')?closeHub():openHub();});
back.addEventListener('click',closeHub);
document.addEventListener('keydown',function(e){if(e.key==='Escape') closeHub();});
sheet.addEventListener('click',function(e){
  var t=e.target.closest&&e.target.closest('.mzd-tile');
  if(!t) return;
  e.preventDefault();
  var href=t.getAttribute('data-href');
  if(href===path){closeHub();return;}
  navTo(href);
});
/* السحب للأسفل للإغلاق */
(function(){
  var y0=null,dy=0;
  sheet.addEventListener('touchstart',function(e){ if(sheet.scrollTop<=0){y0=e.touches[0].clientY;dy=0;} },{passive:true});
  sheet.addEventListener('touchmove',function(e){
    if(y0===null) return;
    dy=e.touches[0].clientY-y0;
    if(dy>0){sheet.style.transition='none';sheet.style.transform='translateY('+dy+'px)';}
  },{passive:true});
  sheet.addEventListener('touchend',function(){
    if(y0===null) return;
    sheet.style.transition='';sheet.style.transform='';
    if(dy>90) closeHub();
    y0=null;dy=0;
  });
})();

hideOldNavs();
  /* ============ UNIVERSAL BACK BUTTON ============ */
setTimeout(function(){
  if(document.getElementById('mznBackBtn')) return;
  if(path==='index.html' || path==='' || path==='mizan-login.html') return;

  var backBtn=document.createElement('button');
  backBtn.id='mznBackBtn';
  backBtn.setAttribute('aria-label','العودة للرئيسية');
  backBtn.style.cssText='position:fixed;top:18px;left:18px;z-index:2147483645;width:38px;height:38px;border-radius:50%;background:rgb(var(--bg-rgb) / .88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(201,169,97,.3);color:var(--gb);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .25s ease;-webkit-tap-highlight-color:rgba(201,169,97,.2);padding:0;box-shadow:0 8px 24px rgb(var(--sh) / calc(.5 * var(--shk)))';
  backBtn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;transform:scaleX(-1)"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';

  function goHome(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    if(navigator.vibrate) navigator.vibrate(15);
    if(window.MZN && MZN.tone) MZN.tone(500,.08);
    setTimeout(function(){
      window.location.href='index.html';
    }, 100);
  }
  backBtn.addEventListener('click', goHome, true);
  backBtn.addEventListener('touchend', goHome, {passive:false});
  backBtn.addEventListener('touchstart', function(e){ e.stopPropagation(); }, {passive:true});

  document.body.appendChild(backBtn);
}, 1200);

/* ===== Load all scripts ===== */
var V='v45';

/* 1. Supabase (must be first) */
  if(!window.MZN_BRANDING_LOADED){
  window.MZN_BRANDING_LOADED=true;
  var bScript=document.createElement('script');
  bScript.src='branding.js?'+V;
  bScript.async=true;
  document.head.appendChild(bScript);
}
if(!window.MZN_SUPABASE_LOADED){
  window.MZN_SUPABASE_LOADED=true;
  var supScript=document.createElement('script');
  supScript.src='supabase.js?'+V;
  supScript.async=true;
  document.head.appendChild(supScript);
}

/* 2. App, Actions, Stats, AI (staggered to avoid conflicts) */
setTimeout(function(){
  if(!window.MZN_APP_LOADED){
    window.MZN_APP_LOADED=true;
    var appScript=document.createElement('script');
    appScript.src='app.js?'+V;
    appScript.async=true;
    document.head.appendChild(appScript);
  }
  if(!window.MZN_ACTIONS_LOADED){
    window.MZN_ACTIONS_LOADED=true;
    var actScript=document.createElement('script');
    actScript.src='actions.js?'+V;
    actScript.async=true;
    document.head.appendChild(actScript);
  }
  if(!window.MZN_STATS_LOADED){
    window.MZN_STATS_LOADED=true;
    var sScript=document.createElement('script');
    sScript.src='stats.js?'+V;
    sScript.async=true;
    document.head.appendChild(sScript);
  }
  if(!window.MZN_NOTIFY_LOADED){
  window.MZN_NOTIFY_LOADED=true;
  var nScript=document.createElement('script');
  nScript.src='notify.js?'+V;
  nScript.async=true;
  document.head.appendChild(nScript);
}
  if(!window.MZN_VAULT_LOADED){
  window.MZN_VAULT_LOADED=true;
  var vScript=document.createElement('script');
  vScript.src='vault.js?'+V;
  vScript.async=true;
  document.head.appendChild(vScript);
}
  if(!window.MZN_SETTINGS_LOADED){
  window.MZN_SETTINGS_LOADED=true;
  var setScript=document.createElement('script');
  setScript.src='settings.js?'+V;
  setScript.async=true;
  document.head.appendChild(setScript);
}
  if(!window.MZN_APPROVE_LOADED){
  window.MZN_APPROVE_LOADED=true;
  var apScript=document.createElement('script');
  apScript.src='approve.js?'+V;
  apScript.async=true;
  document.head.appendChild(apScript);
}
  if(!window.MZN_EXPORT_EXTRA_LOADED){
  window.MZN_EXPORT_EXTRA_LOADED=true;
  var eScript=document.createElement('script');
  eScript.src='export-extra.js?'+V;
  eScript.async=true;
  document.head.appendChild(eScript);
}
  if(!window.MZN_PDF_LOADED){
  window.MZN_PDF_LOADED=true;
  var pScript=document.createElement('script');
  pScript.src='pdf.js?'+V;
  pScript.async=true;
  document.head.appendChild(pScript);
}
  if(!window.MZN_AI_LOADED){
    window.MZN_AI_LOADED=true;
    var aScript=document.createElement('script');
    aScript.src='ai.js?'+V;
    aScript.async=true;
    document.head.appendChild(aScript);
  }
}, 200);

})();
