(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
var type=null;
if(path.indexOf('mizan-pr')===0) type='prs';
else if(path.indexOf('mizan-po')===0) type='pos';
else if(path.indexOf('mizan-grn')===0) type='grns';
if(!type) return;

var STORE='mzn_data';
function load(){try{return JSON.parse(localStorage.getItem(STORE))||{}}catch(e){return{}}}
function save(d){try{localStorage.setItem(STORE,JSON.stringify(d))}catch(e){}}
function get(key){var d=load();return d[key]||{}}
function set(key,obj){var d=load();d[key]=obj;save(d)}

function fmt(n){n=parseFloat(n)||0;if(n>=1e6)return'$'+(n/1e6).toFixed(2)+'M';if(n>=1e3)return'$'+(n/1e3).toFixed(0)+'K';return'$'+Math.round(n)}
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function tone(f,d,v){if(window.MZN&&MZN.tone)MZN.tone(f,d,'sine',v||0.05)}
function toast(m,t){if(window.MZN&&MZN.toast)MZN.toast(m,t||'info')}
function uid(p){var y=new Date().getFullYear();var n=String(Math.floor(Math.random()*9999)+1).padStart(4,'0');return p+'-'+y+'-'+n}

var ROWSEL=type==='prs'?'.pr-row':type==='pos'?'.po-row':'.doc-row';
var IDSEL=type==='prs'?'.pr-id':type==='pos'?'.po-id':'.doc-id';
var TITLESEL=type==='prs'?'.pr-title':type==='pos'?'.po-title':'.doc-title';
var AMTSEL=type==='prs'?'.pr-amount':type==='pos'?'.po-amount':'.doc-amount';

/* ============ INJECT FILTER BAR ============ */
function injectFilterBar(){
  var list = document.getElementById(type==='prs'?'prList':type==='pos'?'poList':'docList');
  if(!list) return;
  if(document.querySelector('.mzn-filters')) return;

  var filters = type==='prs'?[
    {k:'all',l:'الكل'},{k:'draft',l:'مسودة'},{k:'pending',l:'قيد الموافقة'},
    {k:'approved',l:'معتمدة'},{k:'rejected',l:'مرفوضة'},{k:'converted',l:'إلى PO'}
  ]:type==='pos'?[
    {k:'all',l:'الكل'},{k:'draft',l:'مسودة'},{k:'sent',l:'مرسل'},
    {k:'confirmed',l:'مؤكد'},{k:'progress',l:'تنفيذ'},{k:'received',l:'مستلم'},{k:'closed',l:'مغلق'}
  ]:[
    {k:'all',l:'الكل'},{k:'pending',l:'بانتظار'},{k:'inspect',l:'فحص'},
    {k:'accepted',l:'مقبول'},{k:'partial',l:'جزئي'},{k:'rejected',l:'مرفوض'}
  ];

  var bar=document.createElement('div');
  bar.className='mzn-filters';
  bar.innerHTML=filters.map(function(f,i){
    return '<button class="mzn-fchip'+(i===0?' active':'')+'" data-k="'+f.k+'"><span>'+f.l+'</span><span class="mzn-fcount">0</span></button>';
  }).join('');
  list.parentElement.insertBefore(bar, list);

  bar.querySelectorAll('.mzn-fchip').forEach(function(chip){
    chip.addEventListener('click', function(e){
      e.preventDefault();
      bar.querySelectorAll('.mzn-fchip').forEach(function(c){c.classList.remove('active')});
      chip.classList.add('active');
      applyFilter(chip.dataset.k);
      tone(660,.06);
    });
  });
}

function applyFilter(k){
  var rows=document.querySelectorAll(ROWSEL);
  rows.forEach(function(row){
    if(k==='all') { row.style.display=''; return; }
    var status=row.dataset.mznStatus||detectStatus(row);
    row.style.display = (status===k) ? '' : 'none';
  });
  updateCounts();
}

function detectStatus(row){
  var pill=row.querySelector('.stat-pill');
  if(!pill) return 'pending';
  var txt=pill.textContent;
  if(txt.indexOf('مسودة')!==-1) return 'draft';
  if(txt.indexOf('قيد الموافقة')!==-1) return 'pending';
  if(txt.indexOf('معتمد')!==-1) return 'approved';
  if(txt.indexOf('مرفوض')!==-1) return 'rejected';
  if(txt.indexOf('تحولت')!==-1) return 'converted';
  if(txt.indexOf('مرسل')!==-1) return 'sent';
  if(txt.indexOf('مؤكد')!==-1) return 'confirmed';
  if(txt.indexOf('قيد التنفيذ')!==-1) return 'progress';
  if(txt.indexOf('مستلم')!==-1) return 'received';
  if(txt.indexOf('مغلق')!==-1) return 'closed';
  if(txt.indexOf('مدفوعة')!==-1) return 'paid';
  if(txt.indexOf('جزئي')!==-1) return 'partial';
  if(txt.indexOf('فحص')!==-1) return 'inspect';
  if(txt.indexOf('فرق')!==-1) return 'variance';
  if(txt.indexOf('مقبول')!==-1) return 'accepted';
  if(txt.indexOf('بانتظار')!==-1) return 'pending';
  return 'pending';
}

function updateCounts(){
  var rows=document.querySelectorAll(ROWSEL);
  var counts={};
  rows.forEach(function(row){
    var st=row.dataset.mznStatus||detectStatus(row);
    counts[st]=(counts[st]||0)+1;
  });
  counts.all=rows.length;
  document.querySelectorAll('.mzn-filters .mzn-fchip').forEach(function(chip){
    var c=chip.querySelector('.mzn-fcount');
    if(c) c.textContent=counts[chip.dataset.k]||0;
  });
}

/* ============ TAG ROWS ============ */
function tagRows(){
  document.querySelectorAll(ROWSEL).forEach(function(row){
    if(!row.dataset.mznStatus){
      row.dataset.mznStatus=detectStatus(row);
    }
    if(!row.dataset.mznTagged){
      row.dataset.mznTagged='1';
      attachLongPress(row);
    }
  });
}

/* ============ LONG PRESS / RIGHT CLICK ============ */
function attachLongPress(row){
  var timer=null;
  var moved=false;
  row.addEventListener('touchstart', function(){
    moved=false;
    timer=setTimeout(function(){
      if(!moved){
        tone(880,.08);
        if(navigator.vibrate) navigator.vibrate(15);
        showMenu(row);
      }
    }, 550);
  }, {passive:true});
  row.addEventListener('touchmove', function(){ moved=true; clearTimeout(timer); }, {passive:true});
  row.addEventListener('touchend', function(){ clearTimeout(timer); }, {passive:true});
  row.addEventListener('contextmenu', function(e){ e.preventDefault(); showMenu(row); });
}

var activeMenu=null;
function showMenu(row){
  hideMenu();
  var m=document.createElement('div');
  m.className='mzn-amenu';
  m.innerHTML=
    '<button data-act="edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span>تعديل</span></button>'+
    '<button data-act="delete" class="danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg><span>حذف</span></button>';
  document.body.appendChild(m);

  var r=row.getBoundingClientRect();
  var left=Math.max(10, Math.min(window.innerWidth-190, r.left+r.width/2-90));
  var top=Math.max(10, r.top-100);
  m.style.left=left+'px';
  m.style.top=top+'px';
  requestAnimationFrame(function(){ m.classList.add('show'); });

  m.querySelector('[data-act="edit"]').addEventListener('click', function(e){
    e.stopPropagation();
    hideMenu();
    var title=row.querySelector(TITLESEL)?.textContent.trim()||'';
    var amt=row.querySelector(AMTSEL)?.textContent.trim()||'';
    openEditDialog(title, amt, row);
  });

  m.querySelector('[data-act="delete"]').addEventListener('click', function(e){
    e.stopPropagation();
    hideMenu();
    confirmDelete(row);
  });

  activeMenu=m;
  setTimeout(function(){
    document.addEventListener('click', outsideOnce, {once:true});
  }, 50);
}
function outsideOnce(e){ if(activeMenu&&!activeMenu.contains(e.target)) hideMenu(); }
function hideMenu(){ if(activeMenu){activeMenu.classList.remove('show'); var a=activeMenu; activeMenu=null; setTimeout(function(){a.remove()},250);} }

function confirmDelete(row){
  var title=row.querySelector(TITLESEL)?.textContent.trim()||'';
  var w=document.createElement('div');
  w.className='mzn-conf show';
  w.innerHTML='<div class="mzn-cbd"></div><div class="mzn-cbox"><h3>تأكيد الحذف</h3><p>هل تريد حذف "<b style="color:#E8CE8B">'+esc(title)+'</b>"؟<br>لا يمكن التراجع.</p><div class="mzn-cact"><button class="mzn-del">حذف</button><button class="mzn-cncl">إلغاء</button></div></div>';
  document.body.appendChild(w);
  w.querySelector('.mzn-cbd').addEventListener('click', function(){w.remove()});
  w.querySelector('.mzn-cncl').addEventListener('click', function(){tone(500,.1); w.remove()});
  w.querySelector('.mzn-del').addEventListener('click', function(){
    tone(330,.2);
    row.style.transition='all .3s ease';
    row.style.opacity='0';
    row.style.transform='translateX(-40px)';
    setTimeout(function(){ row.remove(); updateCounts(); applyFilter(document.querySelector('.mzn-fchip.active')?.dataset.k||'all'); }, 300);
    w.remove();
    toast('🗑 حُذف العنصر','info');
  });
}

/* ============ EDIT DIALOG ============ */
function openEditDialog(title, amount, row){
  var num=parseFloat(amount.replace(/[^0-9.]/g,''))||0;
  if(amount.indexOf('M')!==-1) num*=1000000;
  else if(amount.indexOf('K')!==-1) num*=1000;
  var w=document.createElement('div');
  w.className='mzn-conf show';
  w.innerHTML='<div class="mzn-cbd"></div><div class="mzn-cbox mzn-edit"><h3>تعديل العنصر</h3>'+
    '<label>العنوان</label><input id="mzn_et" type="text" value="'+esc(title)+'">'+
    '<label>المبلغ (USD)</label><input id="mzn_ea" type="number" value="'+Math.round(num)+'">'+
    '<label>الحالة</label><select id="mzn_es">'+
      (type==='prs'?'<option value="draft">مسودة</option><option value="pending" selected>قيد الموافقة</option><option value="approved">معتمدة</option><option value="rejected">مرفوضة</option><option value="converted">تحولت إلى PO</option>':
       type==='pos'?'<option value="draft">مسودة</option><option value="sent" selected>مرسل</option><option value="confirmed">مؤكد</option><option value="progress">قيد التنفيذ</option><option value="received">مستلم</option><option value="closed">مغلق</option>':
       '<option value="pending" selected>بانتظار الاستلام</option><option value="inspect">قيد الفحص</option><option value="accepted">مقبول</option><option value="partial">استلام جزئي</option><option value="rejected">مرفوض</option>')+
    '</select>'+
    '<div class="mzn-cact"><button class="mzn-save">حفظ</button><button class="mzn-cncl">إلغاء</button></div></div>';
  document.body.appendChild(w);
  w.querySelector('.mzn-cbd').addEventListener('click', function(){w.remove()});
  w.querySelector('.mzn-cncl').addEventListener('click', function(){tone(500,.1); w.remove()});
  w.querySelector('.mzn-save').addEventListener('click', function(){
    var nt=document.getElementById('mzn_et').value.trim()||title;
    var na=parseFloat(document.getElementById('mzn_ea').value)||0;
    var ns=document.getElementById('mzn_es').value;
    var tEl=row.querySelector(TITLESEL);
    var aEl=row.querySelector(AMTSEL);
    if(tEl) tEl.textContent=nt;
    if(aEl) aEl.textContent=fmt(na);
    row.dataset.mznStatus=ns;
    var pill=row.querySelector('.stat-pill');
    if(pill) pill.outerHTML=pillHTML(ns);
    w.remove();
    tone(880,.12); setTimeout(function(){tone(1174,.15)},90);
    toast('✏️ حُدّث العنصر','success');
    updateCounts();
  });
}

function pillHTML(st){
  var map={
    draft:['مسودة','#4A5060','rgba(255,255,255,.04)'],
    pending:['قيد الموافقة','#F0C474','rgba(240,196,116,.1)'],
    approved:['معتمدة','#6EE7A0','rgba(110,231,160,.1)'],
    rejected:['مرفوضة','#F0A0B0','rgba(240,160,176,.1)'],
    converted:['تحولت إلى PO','#9DC4E8','rgba(157,196,232,.1)'],
    sent:['مرسل','#9DC4E8','rgba(157,196,232,.1)'],
    confirmed:['مؤكد','#B8A5E8','rgba(184,165,232,.1)'],
    progress:['قيد التنفيذ','#F0C474','rgba(240,196,116,.1)'],
    received:['مستلم','#6EE7A0','rgba(110,231,160,.1)'],
    closed:['مغلق','#4A9A6E','rgba(110,231,160,.06)'],
    inspect:['قيد الفحص','#B8A5E8','rgba(184,165,232,.1)'],
    accepted:['مقبول','#6EE7A0','rgba(110,231,160,.1)'],
    partial:['استلام جزئي','#9DC4E8','rgba(157,196,232,.1)'],
    paid:['مدفوعة','#4A9A6E','rgba(110,231,160,.06)'],
    variance:['فرق','#F0A0B0','rgba(240,160,176,.1)']
  };
  var m=map[st]||map.pending;
  return '<span class="stat-pill" style="background:'+m[2]+';color:'+m[1]+';display:inline-flex;align-items:center;gap:6px;font-size:11px;padding:5px 10px;border-radius:99px;white-space:nowrap"><span class="dot" style="width:6px;height:6px;border-radius:50%;background:'+m[1]+';box-shadow:0 0 6px '+m[1]+'"></span>'+m[0]+'</span>';
}

/* ============ ADD NEW ITEM ============ */
function addNew(){
  var w=document.createElement('div');
  w.className='mzn-conf show';
  w.innerHTML='<div class="mzn-cbd"></div><div class="mzn-cbox mzn-edit"><h3>إضافة عنصر جديد</h3>'+
    '<label>العنوان</label><input id="mzn_nt" type="text" placeholder="عنوان جديد">'+
    '<label>المبلغ (USD)</label><input id="mzn_na" type="number" placeholder="150000">'+
    '<label>الحالة</label><select id="mzn_ns">'+
      (type==='prs'?'<option value="pending" selected>قيد الموافقة</option><option value="draft">مسودة</option><option value="approved">معتمدة</option>':
       type==='pos'?'<option value="sent" selected>مرسل</option><option value="draft">مسودة</option><option value="progress">قيد التنفيذ</option>':
       '<option value="pending" selected>بانتظار الاستلام</option><option value="inspect">قيد الفحص</option><option value="accepted">مقبول</option>')+
    '</select>'+
    '<div class="mzn-cact"><button class="mzn-save">إضافة</button><button class="mzn-cncl">إلغاء</button></div></div>';
  document.body.appendChild(w);
  w.querySelector('.mzn-cbd').addEventListener('click', function(){w.remove()});
  w.querySelector('.mzn-cncl').addEventListener('click', function(){tone(500,.1); w.remove()});
  w.querySelector('.mzn-save').addEventListener('click', function(){
    var nt=(document.getElementById('mzn_nt').value||'').trim();
    var na=parseFloat(document.getElementById('mzn_na').value)||0;
    var ns=document.getElementById('mzn_ns').value;
    if(!nt){toast('أدخل عنواناً','warning');tone(330,.15);return}
    if(na<=0){toast('أدخل مبلغاً','warning');tone(330,.15);return}
    var list=document.getElementById(type==='prs'?'prList':type==='pos'?'poList':'docList');
    var pfx=type==='prs'?'PR':type==='pos'?'PO':'GRN';
    var row=document.createElement('div');
    row.className=ROWSEL.substring(1);
    row.dataset.mznStatus=ns;
    row.dataset.mznTagged='1';
    row.style.animation='mznRowIn .5s cubic-bezier(.16,1,.3,1)';
    var clsPrefix=type==='prs'?'pr':type==='pos'?'po':'doc';
    row.innerHTML=
      '<div><p class="'+clsPrefix+'-id">'+uid(pfx)+'</p><p class="'+clsPrefix+'-meta" style="margin-top:2px">1 صنف</p></div>'+
      '<div><p class="'+clsPrefix+'-title">'+esc(nt)+'</p><p class="'+clsPrefix+'-meta">'+(type==='prs'?'تقنية المعلومات · عادية':type==='pos'?'STC Solutions · جديد':'WH-01 · الرياض')+'</p></div>'+
      '<div style="text-align:left"><p class="'+clsPrefix+'-amount">'+fmt(na)+'</p></div>'+
      '<div style="text-align:left">'+pillHTML(ns)+'</div>';
    if(list&&list.firstChild) list.insertBefore(row, list.firstChild);
    else if(list) list.appendChild(row);
    attachLongPress(row);
    w.remove();
    tone(880,.12); setTimeout(function(){tone(1174,.15)},90);
    toast('✅ أُضيف العنصر','success');
    updateCounts();
  });
}

/* ============ HOOK BUTTONS ============ */
function hookAddButtons(){
  var addBtns=document.querySelectorAll('.btn-primary, [onclick*="openCreate"], button');
  addBtns.forEach(function(b){
    var txt=(b.textContent||'').trim();
    if(txt.indexOf('طلب شراء جديد')!==-1 || txt.indexOf('أمر شراء جديد')!==-1 || txt.indexOf('سند استلام جديد')!==-1){
      b.removeAttribute('onclick');
      if(!b.dataset.mznHooked){
        b.dataset.mznHooked='1';
        b.addEventListener('click', function(e){
          e.preventDefault();e.stopPropagation();
          addNew();
        }, true);
      }
    }
  });
}

/* ============ CSS ============ */
var css=document.createElement('style');
css.textContent=
'@keyframes mznRowIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}'+
'.mzn-filters{display:flex;gap:6px;overflow-x:auto;padding:0 0 16px 0;margin-bottom:8px;scrollbar-width:none;-webkit-overflow-scrolling:touch}'+
'.mzn-filters::-webkit-scrollbar{display:none}'+
'.mzn-fchip{display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:99px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);color:#7A8090;font-family:inherit;font-size:12px;cursor:pointer;transition:all .25s ease;white-space:nowrap;flex-shrink:0}'+
'.mzn-fchip.active{background:rgba(201,169,97,.12);border-color:rgba(201,169,97,.35);color:#E8CE8B}'+
'.mzn-fcount{font-family:Inter;font-size:10px;padding:1px 6px;border-radius:99px;background:rgba(255,255,255,.05);color:#4A5060}'+
'.mzn-fchip.active .mzn-fcount{background:rgba(201,169,97,.2);color:#E8CE8B}'+
'.mzn-amenu{position:fixed;z-index:2147483640;min-width:180px;background:rgba(14,16,24,.98);backdrop-filter:blur(24px);border:1px solid rgba(201,169,97,.3);border-radius:16px;padding:8px;box-shadow:0 20px 60px rgba(0,0,0,.7);opacity:0;transform:scale(.9);transition:all .25s cubic-bezier(.16,1,.3,1);pointer-events:none}'+
'.mzn-amenu.show{opacity:1;transform:scale(1);pointer-events:auto}'+
'.mzn-amenu button{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border-radius:11px;background:transparent;border:none;color:#EDEDED;font-family:inherit;font-size:13px;cursor:pointer;text-align:right}'+
'.mzn-amenu button:hover,.mzn-amenu button:active{background:rgba(201,169,97,.08)}'+
'.mzn-amenu button.danger{color:#F0A0B0}'+
'.mzn-amenu button.danger:hover,.mzn-amenu button.danger:active{background:rgba(240,160,176,.08)}'+
'.mzn-amenu svg{width:15px;height:15px;flex-shrink:0}'+
'.mzn-conf{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:20px}'+
'.mzn-conf.show{display:flex}'+
'.mzn-cbd{position:absolute;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(10px)}'+
'.mzn-cbox{position:relative;background:linear-gradient(180deg,#0E1018,#08090E);border:1px solid rgba(201,169,97,.3);border-radius:20px;padding:28px 24px;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.7);animation:mznRowIn .3s;max-height:90vh;overflow-y:auto}'+
'.mzn-cbox h3{margin:0 0 8px;font-weight:400;font-size:17px;color:#EDEDED;font-family:Inter,"IBM Plex Sans Arabic",sans-serif}'+
'.mzn-cbox p{margin:0 0 20px;font-size:13px;color:#7A8090;line-height:1.7}'+
'.mzn-cbox label{display:block;font-size:11px;letter-spacing:.15em;color:#4A5060;text-transform:uppercase;font-weight:500;margin:14px 0 6px}'+
'.mzn-cbox input,.mzn-cbox select{width:100%;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);color:#EDEDED;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box}'+
'.mzn-cbox input:focus,.mzn-cbox select:focus{border-color:rgba(201,169,97,.5)}'+
'.mzn-cact{display:flex;gap:12px;margin-top:24px}'+
'.mzn-save,.mzn-del{flex:1;padding:13px 20px;border-radius:99px;background:linear-gradient(135deg,#E8CE8B,#C9A961);color:#08090E;font-weight:600;font-size:13px;border:none;cursor:pointer;font-family:inherit}'+
'.mzn-del{background:linear-gradient(135deg,#F0A0B0,#D06A80)}'+
'.mzn-cncl{padding:13px 22px;border-radius:99px;background:transparent;color:#7A8090;font-size:13px;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-family:inherit}';
document.head.appendChild(css);

/* ============ INIT ============ */
function init(){
  tagRows();
  injectFilterBar();
  updateCounts();
  hookAddButtons();
  setTimeout(hookAddButtons, 1000);
  setTimeout(tagRows, 1000);
  setTimeout(updateCounts, 1200);
  setInterval(function(){ tagRows(); hookAddButtons(); }, 2500);
  var inp=document.getElementById('searchInput');
  if(inp){
    inp.addEventListener('input', function(){
      var q=(this.value||'').toLowerCase();
      document.querySelectorAll(ROWSEL).forEach(function(row){
        var txt=row.textContent.toLowerCase();
        row.style.display = (!q || txt.indexOf(q)!==-1) ? '' : 'none';
      });
    });
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
