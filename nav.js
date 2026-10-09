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
{href:'dashboard.html',icon:'grid',label:'لوحة التحكم'},
{href:'upload.html',icon:'upload',label:'رفع العروض'},
{href:'mizan-compare.html',icon:'scale',label:'المقارنة'},
{href:'mizan-pr.html',icon:'pr',label:'طلبات الشراء'},
{href:'mizan-po.html',icon:'po',label:'أوامر الشراء'},
{href:'mizan-grn.html',icon:'grn',label:'الاستلام'},
{href:'mizan-suppliers.html',icon:'users',label:'الموردون'},
{href:'mizan-reports.html',icon:'chart',label:'التقارير'},
{href:'mizan-settings.html',icon:'settings',label:'الإعدادات'}
];

var style=document.createElement('style');
style.textContent='html,body{padding-bottom:96px!important}.side,.sidebar{display:none!important}.main{padding-right:0!important;padding-bottom:96px!important;margin-right:0!important}nav:not(.mzn-nav){display:none!important}.mzn-nav{position:fixed!important;bottom:0!important;left:0!important;right:0!important;height:76px!important;background:rgba(8,9,14,0.97)!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;border-top:1px solid rgba(201,169,97,0.18)!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;padding:0 10px!important;z-index:2147483647!important;box-shadow:0 -12px 48px rgba(0,0,0,0.7)!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none!important;-ms-overflow-style:none!important}.mzn-nav::-webkit-scrollbar{display:none!important}.mzn-item{display:flex!important;align-items:center!important;justify-content:center!important;min-width:48px!important;height:48px!important;border-radius:14px!important;color:#5A6180!important;text-decoration:none!important;transition:all .25s ease!important;flex-shrink:0!important;position:relative!important;margin:0 1px!important;-webkit-tap-highlight-color:transparent!important}.mzn-item svg{width:22px!important;height:22px!important;pointer-events:none!important}.mzn-item:hover,.mzn-item:active{color:#E8CE8B!important;background:rgba(201,169,97,0.08)!important}.mzn-item.active{color:#E8CE8B!important;background:rgba(201,169,97,0.12)!important}.mzn-item.active::after{content:""!important;position:absolute!important;bottom:4px!important;left:50%!important;transform:translateX(-50%)!important;width:5px!important;height:5px!important;border-radius:50%!important;background:#E8CE8B!important;box-shadow:0 0 10px #E8CE8B!important}';
document.head.appendChild(style);

document.querySelectorAll('.side,.sidebar,.nav,.navigation').forEach(function(el){
if(el.tagName!=='NAV'||!el.classList.contains('mzn-nav')){el.style.display='none';}
});
document.querySelectorAll('nav').forEach(function(n){
if(!n.classList.contains('mzn-nav'))n.style.display='none';
});

var nav=document.createElement('nav');
nav.className='mzn-nav';
nav.innerHTML=items.map(function(item){
var active=path===item.href?' active':'';
return '<a href="'+item.href+'" class="mzn-item'+active+'" aria-label="'+item.label+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+ICONS[item.icon]+'</svg></a>';
}).join('');
document.body.appendChild(nav);

document.querySelectorAll('.mzn-item').forEach(function(a){
a.addEventListener('click',function(e){
e.stopPropagation();
window.location.href=this.getAttribute('href');
});
});
})();
