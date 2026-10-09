(function(){
var path=(window.location.pathname.split('/').pop()||'index.html');
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
style.textContent=
'@media(max-width:900px){html,body{padding-bottom:82px!important}.side,.sidebar{display:none!important}.main{padding-right:0!important;padding-bottom:82px!important;margin-right:0!important}}'+
/* Hide ALL existing back/home links */
'.back,.back-link,.back-btn,.back-arrow,[class*="back-"],[onclick*="goBack"],[onclick*="backToList"],[onclick*="location.href"][onclick*="index"]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;overflow:hidden!important;position:absolute!important;left:-9999px!important}'+
'.mzn-nav{position:fixed!important;bottom:0!important;left:0!important;right:0!important;height:66px!important;background:rgba(8,9,14,0.98)!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;border-top:1px solid rgba(201,169,97,0.2)!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 4px!important;z-index:2147483647!important;box-shadow:0 -12px 48px rgba(0,0,0,0.8)!important;box-sizing:border-box!important;width:100%!important}'+
'.mzn-item{display:flex!important;align-items:center!important;justify-content:center!important;flex:1 1 0!important;max-width:44px!important;height:44px!important;border-radius:12px!important;color:#5A6180!important;text-decoration:none!important;transition:all .2s ease!important;position:relative!important;margin:0!important;padding:0!important;-webkit-tap-highlight-color:rgba(201,169,97,0.2)!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important;user-select:none!important;-webkit-user-select:none!important;box-sizing:border-box!important}'+
'.mzn-item svg{width:21px!important;height:21px!important;pointer-events:none!important;display:block!important}'+
'.mzn-item:active{color:#E8CE8B!important;background:rgba(201,169,97,0.15)!important;transform:scale(0.92)!important}'+
'.mzn-item.active{color:#E8CE8B!important;background:rgba(201,169,97,0.12)!important}'+
'.mzn-item.active::after{content:""!important;position:absolute!important;bottom:3px!important;left:50%!important;transform:translateX(-50%)!important;width:4px!important;height:4px!important;border-radius:50%!important;background:#E8CE8B!important;box-shadow:0 0 8px #E8CE8B!important}'+
/* Floating home button - always on non-index */
'.mzn-home{position:fixed!important;top:18px!important;left:18px!important;z-index:2147483646!important;display:inline-flex!important;align-items:center!important;gap:6px!important;padding:8px 14px!important;border-radius:99px!important;background:rgba(8,9,14,0.9)!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;border:1px solid rgba(201,169,97,0.3)!important;color:#E8CE8B!important;font-family:"IBM Plex Sans Arabic","Inter",sans-serif!important;font-size:12px!important;font-weight:500!important;text-decoration:none!important;box-shadow:0 8px 28px rgba(0,0,0,0.55)!important;transition:all .25s ease!important;-webkit-tap-highlight-color:rgba(201,169,97,0.25)!important;touch-action:manipulation!important;cursor:pointer!important;white-space:nowrap!important}'+
'.mzn-home svg{width:13px!important;height:13px!important;pointer-events:none!important;display:block!important}'+
'.mzn-home span{pointer-events:none!important}'+
'.mzn-home:active{transform:scale(0.94)!important;background:rgba(201,169,97,0.18)!important}';
document.head.appendChild(style);

/* Hide old sidebars/navs */
var oldNavs=document.querySelectorAll('nav:not(.mzn-nav), aside.side, aside.sidebar, .side, .sidebar');
oldNavs.forEach(function(el){el.style.setProperty('display','none','important');});

/* Hide ALL existing back elements (visible or not) */
document.querySelectorAll('.back, .back-link, .back-btn, .back-arrow').forEach(function(el){
el.style.setProperty('display','none','important');
});

/* Bottom Navigation */
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

/* Floating Home Button - always on non-index pages */
if(path!=='index.html'){
var homeBtn=document.createElement('a');
homeBtn.className='mzn-home';
homeBtn.href='index.html';
homeBtn.setAttribute('aria-label','العودة للرئيسية');
homeBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg><span>الرئيسية</span>';

function goHome(e){
if(e){e.preventDefault();e.stopPropagation();}
window.location.assign('index.html');
}
homeBtn.addEventListener('click',goHome,true);
homeBtn.addEventListener('touchend',goHome,{passive:false});
homeBtn.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});

document.body.appendChild(homeBtn);
}
})();
