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
var existingSide=document.querySelector('.side');
if(existingSide){existingSide.style.display='none';document.querySelectorAll('.main').forEach(function(m){m.style.paddingRight='0';m.style.paddingBottom='80px';});}
var nav=document.createElement('nav');
nav.className='mzn-nav';
nav.innerHTML=items.map(function(item){
var active=path===item.href?' active':'';
return '<a href="'+item.href+'" class="mzn-item'+active+'" title="'+item.label+'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+ICONS[item.icon]+'</svg></a>';
}).join('');
var style=document.createElement('style');
style.textContent='body{padding-bottom:80px!important}.mzn-nav{position:fixed;bottom:0;left:0;right:0;height:68px;background:rgba(8,9,14,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(201,169,97,0.15);display:flex;align-items:center;justify-content:space-around;padding:0 6px;z-index:9999;font-family:sans-serif;box-shadow:0 -10px 40px rgba(0,0,0,0.5);gap:2px;overflow-x:auto}.mzn-nav::-webkit-scrollbar{display:none}.mzn-item{display:flex;align-items:center;justify-content:center;min-width:42px;height:44px;border-radius:12px;color:#4A5060;text-decoration:none;transition:all .3s ease;flex-shrink:0;position:relative}.mzn-item:hover{color:#E8CE8B;background:rgba(201,169,97,0.05)}.mzn-item.active{color:#E8CE8B;background:rgba(201,169,97,0.1)}.mzn-item.active::after{content:"";position:absolute;top:5px;width:4px;height:4px;border-radius:50%;background:#E8CE8B;box-shadow:0 0 8px #E8CE8B}';
document.head.appendChild(style);
document.body.appendChild(nav);
})();
