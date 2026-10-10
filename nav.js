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
        navigator.serviceWorker.register('sw.js').then(function(reg){
          console.log('[MIZAN] SW registered');
        }).catch(function(e){
          console.warn('[MIZAN] SW failed:', e);
        });
      });
    }
  }catch(e){ console.warn('[MIZAN] PWA setup error:', e); }
})();

var ICONS={
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
{href:'mizan-compare.html',icon:'scale',label:'مقارنة'},
{href:'mizan-pr.html',icon:'pr',label:'طلبات'},
{href:'mizan-po.html',icon:'po',label:'أوامر'},
{href:'mizan-grn.html',icon:'grn',label:'استلام'},
{href:'mizan-suppliers.html',icon:'users',label:'موردون'},
{href:'mizan-reports.html',icon:'chart',label:'تقارير'},
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
'.mzn-nav{position:fixed!important;bottom:0!important;left:0!important;right:0!important;height:66px!important;background:rgba(8,9,14,0.99)!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;border-top:1px solid rgba(201,169,97,0.2)!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 4px!important;z-index:2147483647!important;box-shadow:0 -12px 48px rgba(0,0,0,0.8)!important;box-sizing:border-box!important;width:100%!important}'+
'.mzn-item{display:flex!important;align-items:center!important;justify-content:center!important;flex:1 1 0!important;max-width:44px!important;height:44px!important;border-radius:12px!important;color:#5A6180!important;text-decoration:none!important;transition:all .2s ease!important;position:relative!important;margin:0!important;padding:0!important;-webkit-tap-highlight-color:rgba(201,169,97,0.2)!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important;user-select:none!important;-webkit-user-select:none!important;box-sizing:border-box!important}'+
'.mzn-item svg{width:21px!important;height:21px!important;pointer-events:none!important;display:block!important}'+
'.mzn-item:active{color:#E8CE8B!important;background:rgba(201,169,97,0.15)!important;transform:scale(0.92)!important}'+
'.mzn-item.active{color:#E8CE8B!important;background:rgba(201,169,97,0.12)!important}'+
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
'border-bottom:1px solid rgba(255,255,255,0.05)!important;'+
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

/* ===== Build new nav ===== */
var nav=document.createElement('nav');
nav.className='mzn-nav';
nav.setAttribute('id','mznMainNav');

items.forEach(function(item){
  var a=document.createElement('a');
  a.className='mzn-item'+(path===item.href?' active':'');
  a.setAttribute('href',item.href);
  a.setAttribute('data-href',item.href);
  a.setAttribute('aria-label',item.label);
  a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+ICONS[item.icon]+'</svg>';
  function go(e){
    if(e){e.preventDefault();e.stopPropagation();}
    var href=a.getAttribute('data-href');
    if(href){window.location.assign(href);}
  }
  a.addEventListener('click',go,true);
  a.addEventListener('touchend',go,{passive:false});
  a.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});
  nav.appendChild(a);
});
document.body.appendChild(nav);
hideOldNavs();

/* ===== Load all scripts ===== */
var V='v31';

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
