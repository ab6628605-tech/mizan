(function(){
'use strict';
var KEY='mizan_data_v2';
var V1='mizan_data_v1';
var path=(window.location.pathname.split('/').pop()||'index.html');
var type=null;
if(path.indexOf('pr')!==-1) type='prs';
else if(path.indexOf('po')!==-1) type='pos';
else if(path.indexOf('grn')!==-1) type='grns';

/* ============ STORAGE ============ */
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{prs:[],pos:[],grns:[]}}catch(e){return{prs:[],pos:[],grns:[]}}}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
function loadV1(){try{return JSON.parse(localStorage.getItem(V1))||{prs:[],pos:[],grns:[]}}catch(e){return{prs:[],pos:[],grns:[]}}}

/* ============ HELPERS ============ */
function fmt(n){n=parseFloat(n)||0;if(n>=1e6)return'$'+(n/1e6).toFixed(2)+'M';if(n>=1e3)return'$'+(n/1e3).toFixed(0)+'K';return'$'+Math.round(n)}
function fmtFull(n){n=parseFloat(n)||0;return'$'+n.toLocaleString('en-US')}
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function uid(p){var y=new Date().getFullYear();var n=String(Math.floor(Math.random()*9999)+1).padStart(4,'0');return p+'-'+y+'-'+n}
function tone(f,d,v){if(window.MZN&&MZN.tone)MZN.tone(f,d,'sine',v||0.05)}
function toast(m,t){if(window.MZN&&MZN.toast)MZN.toast(m,t||'info')}

/* ============ MIGRATE V1 ============ */
function migrateV1(){
  var d=load();
  if(d._v1migrated) return d;
  var v1=loadV1();
  if(v1.prs&&v1.prs.length) d.prs=(d.prs||[]).concat(v1.prs);
  if(v1.pos&&v1.pos.length) d.pos=(d.pos||[]).concat(v1.pos);
  if(v1.grns&&v1.grns.length) d.grns=(d.grns||[]).concat(v1.grns);
  d._v1migrated=true;
  save(d);
  return d;
}

/* ============ MIGRATE DOM ROWS ============ */
function migrateDOM(){
  if(!type) return;
  var d=load();
  if(d['_dom_'+type]) return;
  var rowSel = type==='prs'?'.pr-row':type==='pos'?'.po-row':'.doc-row';
  var idSel = type==='prs'?'.pr-id':type==='pos'?'.po-id':'.doc-id';
  var titleSel = type==='prs'?'.pr-title':type==='pos'?'.po-title':'.doc-title';
  var amtSel = type==='prs'?'.pr-amount':type==='pos'?'.po-amount':'.doc-amount';
  var existing={};
  (d[type]||[]).forEach(function(x){if(x.id) existing[x.id]=true});
  document.querySelectorAll(rowSel).forEach(function(row){
    var idEl=row.querySelector(idSel);
    var titleEl=row.querySelector(titleSel);
    var amtEl=row.querySelector(amtSel);
    var statusEl=row.querySelector('.stat-pill');
    var id=idEl?idEl.textContent.trim():'';
    if(!id||existing[id]) return;
    var amt=0;
    if(amtEl){
      var txt=amtEl.textContent;
      var num=parseFloat(txt.replace(/[^0-9.]/g,''))||0;
      if(txt.indexOf('M')!==-1) amt=num*1000000;
      else if(txt.indexOf('K')!==-1) amt=num*1000;
      else amt=num;
    }
    var statusText=statusEl?statusEl.textContent.trim():'';
    var st='pending';
    if(statusText.indexOf('معتمد')!==-1) st='approved';
    else if(statusText.indexOf('مرفوض')!==-1) st='rejected';
    else if(statusText.indexOf('مسودة')!==-1) st='draft';
    else if(statusText.indexOf('تحولت')!==-1) st='converted';
    else if(statusText.indexOf('مرسل')!==-1) st='sent';
    else if(statusText.indexOf('مؤكد')!==-1) st='confirmed';
    else if(statusText.indexOf('قيد التنفيذ')!==-1) st='progress';
    else if(statusText.indexOf('مغلق')!==-1) st='closed';
    else if(statusText.indexOf('مدفوعة')!==-1) st='paid';
    else if(statusText.indexOf('جزئي')!==-1) st='partial';
    else if(statusText.indexOf('فحص')!==-1) st='inspect';
    else if(statusText.indexOf('فرق')!==-1) st='variance';
    else if(statusText.indexOf('مقبول')!==-1) st='accepted';
    else if(statusText.indexOf('مستلم')!==-1) st='received';
    var meta=row.querySelector('.pr-meta,.po-meta,.doc-meta');
    var metaText=meta?meta.textContent.trim():'';
    d[type].push({
      _id:'dom-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
      _created:new Date(Date.now()-Math.random()*7*24*3600*1000).toISOString(),
      id:id,
      title:titleEl?titleEl.textContent.trim():'—',
      amount:amt,
      status:st,
      meta:metaText
    });
    existing[id]=true;
  });
  d['_dom_'+type]=true;
  save(d);
}

/* ============ STATUS CONFIG ============ */
var STATUS = {
  prs: {
    draft:{l:'مسودة',c:'var(--text-mute)',bg:'rgba(255,255,255,.04)'},
    pending:{l:'قيد الموافقة',c:'var(--amber)',bg:'rgba(240,196,116,.1)'},
    approved:{l:'معتمدة',c:'var(--em)',bg:'rgba(110,231,160,.1)'},
    rejected:{l:'مرفوضة',c:'var(--rose)',bg:'rgba(240,160,176,.1)'},
    converted:{l:'تحولت إلى PO',c:'var(--ice)',bg:'rgba(157,196,232,.1)'}
  },
  pos: {
    draft:{l:'مسودة',c:'var(--text-mute)',bg:'rgba(255,255,255,.04)'},
    sent:{l:'مرسل',c:'var(--ice)',bg:'rgba(157,196,232,.1)'},
    confirmed:{l:'مؤكد',c:'var(--vi)',bg:'rgba(184,165,232,.1)'},
    progress:{l:'قيد التنفيذ',c:'var(--amber)',bg:'rgba(240,196,116,.1)'},
    received:{l:'مستلم',c:'var(--em)',bg:'rgba(110,231,160,.1)'},
    closed:{l:'مغلق',c:'#4A9A6E',bg:'rgba(110,231,160,.06)'}
  },
  grns: {
    pending:{l:'بانتظار الاستلام',c:'var(--amber)',bg:'rgba(240,196,116,.1)'},
    inspect:{l:'قيد الفحص',c:'var(--vi)',bg:'rgba(184,165,232,.1)'},
    accepted:{l:'مقبول',c:'var(--em)',bg:'rgba(110,231,160,.1)'},
    partial:{l:'استلام جزئي',c:'var(--ice)',bg:'rgba(157,196,232,.1)'},
    rejected:{l:'مرفوض',c:'var(--rose)',bg:'rgba(240,160,176,.1)'},
    paid:{l:'مدفوعة',c:'#4A9A6E',bg:'rgba(110,231,160,.06)'},
    variance:{l:'فرق',c:'var(--rose)',bg:'rgba(240,160,176,.1)'}
  }
};

function statusPill(t, st){
  var s=(STATUS[t]&&STATUS[t][st])||{l:st,c:'var(--text-dim)',bg:'rgba(255,255,255,.04)'};
  return '<span class="stat-pill" style="background:'+s.bg+';color:'+s.c+';display:inline-flex;align-items:center;gap:6px;font-size:11px;padding:5px 10px;border-radius:99px;white-space:nowrap"><span class="dot" style="width:6px;height:6px;border-radius:50%;background:'+s.c+';box-shadow:0 0 6px '+s.c+'"></span>'+s.l+'</span>';
}

/* ============ RENDER ROWS ============ */
function renderRow(item, t){
  var row=document.createElement('div');
  row.dataset.mznId=item._id;
  row.dataset.mznStatus=item.status||'pending';
  row.dataset.mznTitle=(item.title||'').toLowerCase();
  row.dataset.mznAmount=item.amount||0;

  if(t==='prs'){
    row.className='pr-row';
    row.innerHTML=
      '<div><p class="pr-id">'+esc(item.id)+'</p><p class="pr-meta" style="margin-top:2px">'+(item.items||1)+' صنف</p></div>'+
      '<div><p class="pr-title">'+esc(item.title)+'</p><p class="pr-meta">'+esc(item.dept||'—')+' · '+esc(item.priority||'عادية')+'</p></div>'+
      '<div><div class="appr-chain"><span class="appr-dot done"></span><span class="appr-line done"></span><span class="appr-dot current"></span><span class="appr-line"></span><span class="appr-dot"></span><span class="appr-line"></span><span class="appr-dot"></span></div><p class="pr-meta" style="margin-top:6px">'+(item.status==='pending'?'بانتظار المشتريات':(STATUS.prs[item.status]||{}).l||'')+'</p></div>'+
      '<div style="text-align:left"><p class="pr-amount">'+fmt(item.amount)+'</p></div>'+
      '<div style="text-align:left">'+statusPill('prs', item.status)+'</div>';
  } else if(t==='pos'){
    row.className='po-row';
    var init=(item.supplier||'—').substring(0,3).toUpperCase();
    row.innerHTML=
      '<div><p class="po-id">'+esc(item.id)+'</p><p class="po-meta" style="margin-top:2px">'+(item.items||1)+' صنف</p></div>'+
      '<div><p class="po-title">'+esc(item.title)+'</p><p class="po-meta">'+esc(item.date||'—')+'</p></div>'+
      '<div class="po-supplier"><div class="po-sup-avatar" style="background:rgba(201,169,97,.1);color:var(--gb);border-color:rgba(201,169,97,.25)">'+init+'</div><div><p style="font-size:13px;color:var(--text);margin-bottom:2px">'+esc(item.supplier||'—')+'</p><p class="po-meta">تسليم: '+esc(item.delivery||'—')+'</p></div></div>'+
      '<div style="text-align:left"><p class="po-amount">'+fmt(item.amount)+'</p></div>'+
      '<div style="text-align:left">'+statusPill('pos', item.status)+'</div>';
  } else {
    row.className='doc-row';
    row.innerHTML=
      '<div><p class="doc-id">'+esc(item.id)+'</p><p class="doc-meta" style="margin-top:2px">'+(item.items||1)+' صنف</p></div>'+
      '<div><p class="doc-title">'+esc(item.title)+'</p><p class="doc-meta">'+esc(item.supplier||'—')+' · '+esc(item.refPO||'—')+'</p></div>'+
      '<div><p class="doc-meta" style="font-size:11px;letter-spacing:.1em;text-transform:uppercase">مرجع</p><p style="font-family:Inter;font-size:12px;color:var(--em);margin-top:2px">'+(item.refINV||'—')+'</p></div>'+
      '<div style="text-align:left"><p class="doc-amount">'+fmt(item.amount)+'</p></div>'+
      '<div style="text-align:left">'+statusPill('grns', item.status)+'</div>';
  }
  row.style.animation='mznRowIn .5s cubic-bezier(.16,1,.3,1)';
  attachRowActions(row, t, item);
  row.addEventListener('click', function(e){
    if(e.target.closest('.mzn-actions-menu')) return;
    tone(660,.06); openEditModal(t, item);
  });
  return row;
}

/* ============ RENDER ALL ============ */
var currentFilter='all';
var currentSearch='';

function getListEl(t){
  return document.getElementById(t==='prs'?'prList':t==='pos'?'poList':'docList');
}

function renderAll(){
  if(!type) return;
  var list=getListEl(type);
  if(!list) return;
  var d=load();
  var items=(d[type]||[]).slice().sort(function(a,b){
    return (b._created||'').localeCompare(a._created||'');
  });
  list.innerHTML='';
  items.forEach(function(item){
    if(currentFilter!=='all' && item.status!==currentFilter) return;
    if(currentSearch && (item.title||'').toLowerCase().indexOf(currentSearch)===-1 &&
       (item.id||'').toLowerCase().indexOf(currentSearch)===-1 &&
       (item.supplier||'').toLowerCase().indexOf(currentSearch)===-1) return;
    list.appendChild(renderRow(item,type));
  });
  if(!list.children.length){
    list.innerHTML='<div style="padding:60px 20px;text-align:center;color:var(--tm);font-size:13px">لا توجد عناصر مطابقة</div>';
  }
  updateCounts();
}

function updateCounts(){
  if(!type) return;
  var d=load();
  var items=d[type]||[];
  document.querySelectorAll('.mzn-filters .mzn-fchip').forEach(function(chip){
    var k=chip.dataset.mznK;
    var c=chip.querySelector('.mzn-fcount');
    if(!c) return;
    if(k==='all') c.textContent=items.length;
    else c.textContent=items.filter(function(x){return x.status===k}).length;
  });
}

/* ============ FILTER BAR INJECTION ============ */
function injectFilterBar(){
  if(!type) return;
  var list=getListEl(type);
  if(!list) return;
  if(document.querySelector('.mzn-filters')) return;

  var configs={
    prs:[
      {k:'all',l:'الكل'},{k:'draft',l:'مسودة'},{k:'pending',l:'قيد الموافقة'},
      {k:'approved',l:'معتمدة'},{k:'rejected',l:'مرفوضة'},{k:'converted',l:'إلى PO'}
    ],
    pos:[
      {k:'all',l:'الكل'},{k:'draft',l:'مسودة'},{k:'sent',l:'مرسل'},
      {k:'confirmed',l:'مؤكد'},{k:'progress',l:'تنفيذ'},{k:'received',l:'مستلم'},{k:'closed',l:'مغلق'}
    ],
    grns:[
      {k:'all',l:'الكل'},{k:'pending',l:'بانتظار'},{k:'inspect',l:'فحص'},
      {k:'accepted',l:'مقبول'},{k:'partial',l:'جزئي'},{k:'rejected',l:'مرفوض'}
    ]
  };

  var bar=document.createElement('div');
  bar.className='mzn-filters';
  var html='';
  configs[type].forEach(function(f){
    var active=f.k===currentFilter?' active':'';
    html+='<button class="mzn-fchip'+active+'" data-mzn-k="'+f.k+'"><span>'+f.l+'</span><span class="mzn-fcount">0</span></button>';
  });
  bar.innerHTML=html;
  list.parentElement.insertBefore(bar, list);

  bar.querySelectorAll('.mzn-fchip').forEach(function(chip){
    chip.addEventListener('click', function(){
      bar.querySelectorAll('.mzn-fchip').forEach(function(c){c.classList.remove('active')});
      chip.classList.add('active');
      currentFilter=chip.dataset.mznK;
      tone(660,.06);
      renderAll();
    });
  });
}

/* ============ STYLES ============ */
var css=document.createElement('style');
css.textContent=
'@keyframes mznRowIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}'+
'.mzn-filters{display:flex;gap:6px;overflow-x:auto;padding:0 0 16px 0;margin-bottom:8px;scrollbar-width:none;-webkit-overflow-scrolling:touch}'+
'.mzn-filters::-webkit-scrollbar{display:none}'+
'.mzn-fchip{display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:99px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);color:#7A8090;font-family:inherit;font-size:12px;cursor:pointer;transition:all .25s ease;white-space:nowrap;flex-shrink:0;-webkit-tap-highlight-color:rgba(201,169,97,.2)}'+
'.mzn-fchip:active{transform:scale(.96)}'+
'.mzn-fchip.active{background:rgba(201,169,97,.12);border-color:rgba(201,169,97,.35);color:#E8CE8B}'+
'.mzn-fcount{font-family:Inter;font-size:10px;padding:1px 6px;border-radius:99px;background:rgba(255,255,255,.05);color:#4A5060}'+
'.mzn-fchip.active .mzn-fcount{background:rgba(201,169,97,.2);color:#E8CE8B}'+

/* Action menu */
'.mzn-actions-menu{position:fixed;z-index:2147483640;min-width:180px;background:rgba(14,16,24,.98);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(201,169,97,.3);border-radius:16px;padding:8px;box-shadow:0 20px 60px rgba(0,0,0,.7);opacity:0;transform:scale(.9);transition:all .25s cubic-bezier(.16,1,.3,1);pointer-events:none}'+
'.mzn-actions-menu.show{opacity:1;transform:scale(1);pointer-events:auto}'+
'.mzn-abtn{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border-radius:11px;background:transparent;border:none;color:#EDEDED;font-family:inherit;font-size:13px;cursor:pointer;text-align:right;transition:background .2s}'+
'.mzn-abtn:active,.mzn-abtn:hover{background:rgba(201,169,97,.08)}'+
'.mzn-abtn.danger{color:#F0A0B0}'+
'.mzn-abtn.danger:active,.mzn-abtn.danger:hover{background:rgba(240,160,176,.08)}'+
'.mzn-abtn svg{width:15px;height:15px;flex-shrink:0}'+

/* Modal (for edit/add) */
'.mzn-mo{position:fixed;inset:0;z-index:2147483645;display:none}'+
'.mzn-mo-bd{position:absolute;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;transition:opacity .3s}'+
'.mzn-mo.show .mzn-mo-bd{opacity:1}'+
'.mzn-mo-sh{position:absolute;bottom:0;left:0;right:0;max-height:90vh;overflow-y:auto;background:linear-gradient(180deg,#0E1018,#08090E);border-radius:24px 24px 0 0;border-top:1px solid rgba(201,169,97,.25);transform:translateY(100%);transition:transform .35s cubic-bezier(.16,1,.3,1);padding:28px 20px 40px;box-shadow:0 -20px 60px rgba(0,0,0,.7);box-sizing:border-box}'+
'.mzn-mo.show .mzn-mo-sh{transform:translateY(0)}'+
'@media(min-width:700px){.mzn-mo-sh{max-width:520px;left:50%;right:auto;transform:translateX(-50%) translateY(100%);border-radius:24px;margin-bottom:40px}.mzn-mo.show .mzn-mo-sh{transform:translateX(-50%) translateY(0)}}'+
'.mzn-mo h2{font-family:Inter,"IBM Plex Sans Arabic",sans-serif;font-weight:300;font-size:22px;color:#EDEDED;margin:0 0 6px}'+
'.mzn-mo .mzn-mo-sub{font-size:12px;color:#7A8090;margin-bottom:20px}'+
'.mzn-mo label{display:block;font-size:11px;letter-spacing:.15em;color:#4A5060;text-transform:uppercase;font-weight:500;margin:14px 0 6px}'+
'.mzn-mo input,.mzn-mo select,.mzn-mo textarea{width:100%;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);color:#EDEDED;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box}'+
'.mzn-mo input:focus,.mzn-mo select:focus,.mzn-mo textarea:focus{border-color:rgba(201,169,97,.5);background:rgba(201,169,97,.03)}'+
'.mzn-mo textarea{min-height:70px;resize:vertical;line-height:1.7}'+
'.mzn-mo .mzn-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}'+
'.mzn-mo .mzn-acts{display:flex;gap:12px;margin-top:24px}'+
'.mzn-mo .mzn-submit{flex:1;padding:14px 24px;border-radius:99px;background:linear-gradient(135deg,#E8CE8B,#C9A961);color:#08090E;font-weight:600;font-size:13px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 10px 30px -8px rgba(201,169,97,.5)}'+
'.mzn-mo .mzn-cancel{padding:14px 22px;border-radius:99px;background:transparent;color:#7A8090;font-size:13px;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-family:inherit}'+
'.mzn-mo .mzn-x{position:absolute;top:16px;left:16px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.04);border:none;color:#7A8090;cursor:pointer;font-size:14px}'+
/* Confirm */
'.mzn-conf{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:20px}'+
'.mzn-conf.show{display:flex}'+
'.mzn-conf-bd{position:absolute;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(10px)}'+
'.mzn-conf-box{position:relative;background:linear-gradient(180deg,#0E1018,#08090E);border:1px solid rgba(201,169,97,.3);border-radius:20px;padding:28px 24px;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.7);animation:mznRowIn .3s}'+
'.mzn-conf-box h3{margin:0 0 8px;font-weight:400;font-size:17px;color:#EDEDED;font-family:Inter,"IBM Plex Sans Arabic",sans-serif}'+
'.mzn-conf-box p{margin:0 0 20px;font-size:13px;color:#7A8090;line-height:1.7}'+
'.mzn-conf-box .mzn-conf-act{display:flex;gap:12px}'+
'.mzn-conf-box .mzn-del{flex:1;padding:13px 20px;border-radius:99px;background:linear-gradient(135deg,#F0A0B0,#D06A80);color:#08090E;font-weight:600;font-size:13px;border:none;cursor:pointer;font-family:inherit}'+
'.mzn-conf-box .mzn-cncl{padding:13px 22px;border-radius:99px;background:transparent;color:#7A8090;font-size:13px;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-family:inherit}';
document.head.appendChild(css);

/* ============ ACTION MENU ============ */
var actionMenu=null;
function showActionMenu(row, t, item){
  hideActionMenu();
  var menu=document.createElement('div');
  menu.className='mzn-actions-menu';
  menu.innerHTML=
    '<button class="mzn-abtn" data-act="edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span>تعديل</span></button>'+
    '<button class="mzn-abtn danger" data-act="delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg><span>حذف</span></button>';
  document.body.appendChild(menu);
  var rect=row.getBoundingClientRect();
  var mw=180;
  var left=Math.max(10, Math.min(window.innerWidth-mw-10, rect.left+rect.width/2-mw/2));
  var top=Math.max(10, rect.top-90);
  menu.style.left=left+'px';
  menu.style.top=top+'px';
  requestAnimationFrame(function(){menu.classList.add('show')});
  menu.querySelector('[data-act="edit"]').addEventListener('click', function(e){
    e.stopPropagation();
    hideActionMenu();
    tone(660,.06);
    openEditModal(t, item);
  });
  menu.querySelector('[data-act="delete"]').addEventListener('click', function(e){
    e.stopPropagation();
    hideActionMenu();
    tone(330,.15);
    confirmDelete(t, item);
  });
  actionMenu=menu;
  setTimeout(function(){
    document.addEventListener('click', outsideClick, {once:true});
    document.addEventListener('touchstart', outsideClickTouch, {once:true, passive:true});
  }, 50);
}
function outsideClick(e){ if(actionMenu&&!actionMenu.contains(e.target)) hideActionMenu(); }
function outsideClickTouch(e){ if(actionMenu&&!actionMenu.contains(e.target)) hideActionMenu(); }
function hideActionMenu(){ if(actionMenu){actionMenu.classList.remove('show'); var m=actionMenu; actionMenu=null; setTimeout(function(){m.remove()},300);} }

function attachRowActions(row, t, item){
  var timer=null;
  var moved=false;
  row.addEventListener('touchstart', function(){
    moved=false;
    timer=setTimeout(function(){ if(!moved){ tone(880,.08); showActionMenu(row,t,item); } }, 550);
  }, {passive:true});
  row.addEventListener('touchmove', function(){ moved=true; clearTimeout(timer); }, {passive:true});
  row.addEventListener('touchend', function(){ clearTimeout(timer); }, {passive:true});
  row.addEventListener('contextmenu', function(e){ e.preventDefault(); showActionMenu(row,t,item); });
}

/* ============ CONFIRM DELETE ============ */
function confirmDelete(t, item){
  var w=document.createElement('div');
  w.className='mzn-conf show';
  w.innerHTML=
    '<div class="mzn-conf-bd"></div>'+
    '<div class="mzn-conf-box">'+
      '<h3>تأكيد الحذف</h3>'+
      '<p>هل تريد حذف <b style="color:#E8CE8B">'+esc(item.id)+'</b>؟<br>لا يمكن التراجع عن هذا الإجراء.</p>'+
      '<div class="mzn-conf-act"><button class="mzn-del">حذف نهائياً</button><button class="mzn-cncl">إلغاء</button></div>'+
    '</div>';
  document.body.appendChild(w);
  w.querySelector('.mzn-conf-bd').addEventListener('click', function(){w.remove()});
  w.querySelector('.mzn-cncl').addEventListener('click', function(){tone(500,.1); w.remove()});
  w.querySelector('.mzn-del').addEventListener('click', function(){
    tone(330,.2);
    setTimeout(function(){tone(220,.3)}, 120);
    var d=load();
    d[t]=(d[t]||[]).filter(function(x){return x._id!==item._id});
    save(d);
    var row=document.querySelector('[data-mzn-id="'+item._id+'"]');
    if(row){
      row.style.transition='all .3s ease';
      row.style.opacity='0';
      row.style.transform='translateX(-40px)';
      setTimeout(function(){renderAll()},300);
    } else { renderAll(); }
    w.remove();
    toast('🗑 حُذف العنصر '+item.id, 'info');
  });
}

/* ============ MODAL SYSTEM ============ */
var modalRoot=null;
function ensureModal(){
  if(modalRoot) return modalRoot;
  modalRoot=document.createElement('div');
  modalRoot.className='mzn-mo';
  modalRoot.innerHTML='<div class="mzn-mo-bd"></div><div class="mzn-mo-sh"></div>';
  document.body.appendChild(modalRoot);
  modalRoot.querySelector('.mzn-mo-bd').addEventListener('click', closeModal);
  return modalRoot;
}
function openModal(html){
  var m=ensureModal();
  var sh=m.querySelector('.mzn-mo-sh');
  sh.innerHTML='<button class="mzn-x" data-close>✕</button>'+html;
  m.style.display='block';
  document.body.style.overflow='hidden';
  requestAnimationFrame(function(){ m.classList.add('show'); });
  sh.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click', closeModal); });
}
function closeModal(){
  if(!modalRoot) return;
  modalRoot.classList.remove('show');
  document.body.style.overflow='';
  setTimeout(function(){ if(modalRoot){modalRoot.style.display='none'; modalRoot.querySelector('.mzn-mo-sh').innerHTML='';} }, 350);
}

/* ============ FORM BUILDERS ============ */
function prForm(item){
  var isEdit=!!item;
  return '<h2>'+(isEdit?'تعديل طلب شراء':'طلب شراء جديد')+'</h2>'+
  '<p class="mzn-mo-sub">'+(isEdit?'عدّل البيانات ثم اضغط حفظ.':'يُحفظ الطلب فوراً في متصفحك.')+'</p>'+
  '<label>عنوان الطلب</label><input id="f_t" type="text" value="'+esc(item?item.title:'')+'" placeholder="مثال: توريد أجهزة شبكات">'+
  '<div class="mzn-row2">'+
    '<div><label>القسم</label><select id="f_d">'+
      ['تقنية المعلومات','العمليات','المالية','الموارد البشرية','التسويق'].map(function(o){
        return '<option'+(item&&item.dept===o?' selected':'')+'>'+o+'</option>';
      }).join('')+
    '</select></div>'+
    '<div><label>الأولوية</label><select id="f_p">'+
      ['عادية','عالية','عاجلة'].map(function(o){
        return '<option'+(item&&item.priority===o?' selected':'')+'>'+o+'</option>';
      }).join('')+
    '</select></div>'+
  '</div>'+
  '<label>المبلغ التقديري (USD)</label><input id="f_a" type="number" value="'+(item?item.amount:'')+'" placeholder="150000">'+
  '<label>الحالة</label><select id="f_st">'+
    Object.keys(STATUS.prs).map(function(k){
      return '<option value="'+k+'"'+(item&&item.status===k?' selected':'')+'>'+STATUS.prs[k].l+'</option>';
    }).join('')+
  '</select>'+
  '<div class="mzn-acts"><button class="mzn-submit" id="f_s">'+(isEdit?'حفظ التعديلات':'حفظ الطلب')+'</button><button class="mzn-cancel" data-close>إلغاء</button></div>';
}

function poForm(item){
  var isEdit=!!item;
  var sups=['STC Solutions','Huawei','Mobily','Aramco Services','Oracle','Siemens','Adobe Enterprise'];
  return '<h2>'+(isEdit?'تعديل أمر شراء':'أمر شراء جديد')+'</h2>'+
  '<p class="mzn-mo-sub">'+(isEdit?'عدّل الأمر ثم احفظ.':'أنشئ أمر شراء لمورد معتمد.')+'</p>'+
  '<label>المورد</label><select id="p_s">'+
    sups.map(function(o){
      return '<option'+(item&&item.supplier===o?' selected':'')+'>'+o+'</option>';
    }).join('')+
  '</select>'+
  '<label>الموضوع</label><input id="p_t" type="text" value="'+esc(item?item.title:'')+'" placeholder="مثال: توريد أجهزة شبكات">'+
  '<div class="mzn-row2">'+
    '<div><label>تاريخ التسليم</label><input id="p_d" type="date" value="'+(item&&item.delivery?item.delivery:'')+'"></div>'+
    '<div><label>المبلغ (USD)</label><input id="p_a" type="number" value="'+(item?item.amount:'')+'" placeholder="150000"></div>'+
  '</div>'+
  '<label>شروط الدفع</label><select id="p_pay">'+
    ['30 يوم','45 يوم','60 يوم','دفع فوري'].map(function(o){
      return '<option'+(item&&item.payment===o?' selected':'')+'>'+o+'</option>';
    }).join('')+
  '</select>'+
  '<label>الحالة</label><select id="p_st">'+
    Object.keys(STATUS.pos).map(function(k){
      return '<option value="'+k+'"'+(item&&item.status===k?' selected':'')+'>'+STATUS.pos[k].l+'</option>';
    }).join('')+
  '</select>'+
  '<div class="mzn-acts"><button class="mzn-submit" id="p_btn">'+(isEdit?'حفظ التعديلات':'إصدار الأمر')+'</button><button class="mzn-cancel" data-close>إلغاء</button></div>';
}

function grnForm(item){
  var isEdit=!!item;
  var pos=['PO-2025-0087 — STC Solutions','PO-2025-0086 — Aramco Services','PO-2025-0085 — Adobe Enterprise','PO-2025-0084 — Mobily'];
  return '<h2>'+(isEdit?'تعديل سند استلام':'سند استلام جديد')+'</h2>'+
  '<p class="mzn-mo-sub">'+(isEdit?'عدّل السند ثم احفظ.':'اربط السند بأمر شراء موجود.')+'</p>'+
  '<label>أمر الشراء</label><select id="g_po">'+
    pos.map(function(o){
      return '<option'+(item&&item.refPO===o.split(' ')[0]?' selected':'')+'>'+o+'</option>';
    }).join('')+
  '</select>'+
  '<label>الموضوع</label><input id="g_t" type="text" value="'+esc(item?item.title:'')+'" placeholder="مثال: استلام أجهزة شبكات">'+
  '<div class="mzn-row2">'+
    '<div><label>المستودع</label><select id="g_w">'+
      ['WH-01 · الرياض','WH-02 · الدمام','رقمي — تراخيص'].map(function(o){
        return '<option'+(item&&item.warehouse===o?' selected':'')+'>'+o+'</option>';
      }).join('')+
    '</select></div>'+
    '<div><label>القيمة (USD)</label><input id="g_a" type="number" value="'+(item?item.amount:'')+'" placeholder="150000"></div>'+
  '</div>'+
  '<label>الحالة</label><select id="g_st">'+
    Object.keys(STATUS.grns).map(function(k){
      return '<option value="'+k+'"'+(item&&item.status===k?' selected':'')+'>'+STATUS.grns[k].l+'</option>';
    }).join('')+
  '</select>'+
  '<div class="mzn-acts"><button class="mzn-submit" id="g_btn">'+(isEdit?'حفظ التعديلات':'تسجيل الاستلام')+'</button><button class="mzn-cancel" data-close>إلغاء</button></div>';
}

/* ============ SAVE HANDLERS ============ */
function savePR(item){
  var t=(document.getElementById('f_t').value||'').trim();
  var a=parseFloat(document.getElementById('f_a').value)||0;
  if(!t){toast('أدخل عنوان الطلب','warning');tone(330,.15);return false}
  if(a<=0){toast('أدخل مبلغاً صحيحاً','warning');tone(330,.15);return false}
  var d=load();
  if(item){
    var it=d.prs.find(function(x){return x._id===item._id});
    if(it){ it.title=t; it.dept=document.getElementById('f_d').value; it.priority=document.getElementById('f_p').value; it.amount=a; it.status=document.getElementById('f_st').value; }
    toast('✏️ حُدّث الطلب '+item.id,'success');
  } else {
    var newItem={_id:'x-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),_created:new Date().toISOString(),id:uid('PR'),title:t,dept:document.getElementById('f_d').value,priority:document.getElementById('f_p').value,amount:a,status:document.getElementById('f_st').value||'pending',items:1};
    d.prs.unshift(newItem);
    toast('✅ حُفظ الطلب '+newItem.id,'success');
  }
  save(d); return true;
}

function savePO(item){
  var t=(document.getElementById('p_t').value||'').trim();
  var a=parseFloat(document.getElementById('p_a').value)||0;
  if(!t){toast('أدخل موضوع الأمر','warning');tone(330,.15);return false}
  if(a<=0){toast('أدخل مبلغاً صحيحاً','warning');tone(330,.15);return false}
  var d=load();
  var s=document.getElementById('p_s').value;
  if(item){
    var it=d.pos.find(function(x){return x._id===item._id});
    if(it){ it.title=t; it.supplier=s; it.delivery=document.getElementById('p_d').value; it.amount=a; it.payment=document.getElementById('p_pay').value; it.status=document.getElementById('p_st').value; }
    toast('✏️ حُدّث الأمر '+item.id,'success');
  } else {
    var newItem={_id:'x-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),_created:new Date().toISOString(),id:uid('PO'),title:t,supplier:s,delivery:document.getElementById('p_d').value,amount:a,payment:document.getElementById('p_pay').value,status:document.getElementById('p_st').value||'sent',items:1,date:new Date().toISOString().slice(0,10)};
    d.pos.unshift(newItem);
    toast('✅ صدر الأمر '+newItem.id,'success');
  }
  save(d); return true;
}

function saveGRN(item){
  var t=(document.getElementById('g_t').value||'').trim();
  var a=parseFloat(document.getElementById('g_a').value)||0;
  if(!t){toast('أدخل موضوع السند','warning');tone(330,.15);return false}
  if(a<=0){toast('أدخل قيمة صحيحة','warning');tone(330,.15);return false}
  var d=load();
  var po=document.getElementById('g_po').value;
  if(item){
    var it=d.grns.find(function(x){return x._id===item._id});
    if(it){ it.title=t; it.refPO=po.split(' ')[0]; it.supplier=po.split('— ')[1]||''; it.warehouse=document.getElementById('g_w').value; it.amount=a; it.status=document.getElementById('g_st').value; }
    toast('✏️ حُدّث السند '+item.id,'success');
  } else {
    var newItem={_id:'x-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),_created:new Date().toISOString(),id:uid('GRN'),title:t,refPO:po.split(' ')[0],supplier:po.split('— ')[1]||'',warehouse:document.getElementById('g_w').value,amount:a,status:document.getElementById('g_st').value||'pending',items:1};
    d.grns.unshift(newItem);
    toast('✅ سُجّل السند '+newItem.id,'success');
  }
  save(d); return true;
}

/* ============ OPEN MODALS ============ */
function openPRModal(item){
  openModal(prForm(item));
  setTimeout(function(){var x=document.getElementById('f_t');if(x&&!item)x.focus()},450);
  document.getElementById('f_s').addEventListener('click', function(){
    if(savePR(item)){ closeModal(); tone(880,.12); setTimeout(function(){tone(1174,.15)},90); renderAll(); }
  });
}
function openPOModal(item){
  openModal(poForm(item));
  setTimeout(function(){var x=document.getElementById('p_t');if(x&&!item)x.focus()},450);
  document.getElementById('p_btn').addEventListener('click', function(){
    if(savePO(item)){ closeModal(); tone(880,.12); setTimeout(function(){tone(1174,.15)},90); renderAll(); }
  });
}
function openGRNModal(item){
  openModal(grnForm(item));
  setTimeout(function(){var x=document.getElementById('g_t');if(x&&!item)x.focus()},450);
  document.getElementById('g_btn').addEventListener('click', function(){
    if(saveGRN(item)){ closeModal(); tone(880,.12); setTimeout(function(){tone(1174,.15)},90); renderAll(); }
  });
}

function openEditModal(t, item){
  if(t==='prs') openPRModal(item);
  else if(t==='pos') openPOModal(item);
  else openGRNModal(item);
}

/* ============ SEARCH ============ */
function hookSearch(){
  var inp=document.getElementById('searchInput');
  if(!inp) return;
  inp.addEventListener('input', function(){
    currentSearch=(this.value||'').toLowerCase();
    renderAll();
  });
}

/* ============ INIT ============ */
function init(){
  migrateV1();
  migrateDOM();
  injectFilterBar();
  renderAll();
  hookSearch();
  window.openCreate=function(){
    if(type==='pos') openPOModal();
    else if(type==='grns') openGRNModal();
    else openPRModal();
  };
  window.MZN_ACTIONS={delete:function(t,id){var d=load();d[t]=(d[t]||[]).filter(function(x){return x._id!==id});save(d);renderAll()}};
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
