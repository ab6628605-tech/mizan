(function(){
'use strict';
var KEY='mizan_data_v1';

function load(){try{return JSON.parse(localStorage.getItem(KEY))||{prs:[],pos:[],grns:[]}}catch(e){return{prs:[],pos:[],grns:[]}}}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
function addItem(t,it){var d=load();if(!d[t])d[t]=[];it._id=Date.now()+'-'+Math.random().toString(36).slice(2,7);it._created=new Date().toISOString();d[t].unshift(it);save(d);return it}
function fmt(n){n=parseFloat(n)||0;if(n>=1e6)return'$'+(n/1e6).toFixed(2)+'M';if(n>=1e3)return'$'+(n/1e3).toFixed(0)+'K';return'$'+n}
function uid(p){var y=new Date().getFullYear();var n=String(Math.floor(Math.random()*9999)+1).padStart(4,'0');return p+'-'+y+'-'+n}
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function tone(f,d){if(window.MZN&&MZN.tone)MZN.tone(f,d)}
function toast(m,t){if(window.MZN&&MZN.toast)MZN.toast(m,t)}

var root,sheet,backdrop;
function ensureRoot(){
  if(root)return;
  root=document.createElement('div');
  root.style.cssText='position:fixed;inset:0;z-index:2147483645;display:none';
  root.innerHTML='<div id="mznBd" style="position:absolute;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;transition:opacity .3s"></div><div id="mznSh" style="position:absolute;bottom:0;left:0;right:0;max-height:92vh;overflow-y:auto;background:linear-gradient(180deg,#0E1018,#08090E);border-radius:24px 24px 0 0;border-top:1px solid rgba(201,169,97,.25);transform:translateY(100%);transition:transform .4s cubic-bezier(.16,1,.3,1);padding:28px 20px 40px;box-shadow:0 -20px 60px rgba(0,0,0,.7);box-sizing:border-box"></div>';
  document.body.appendChild(root);
  backdrop=root.querySelector('#mznBd');
  sheet=root.querySelector('#mznSh');
  backdrop.addEventListener('click',closeModal);
}

function openModal(html){
  ensureRoot();
  sheet.innerHTML=html;
  root.style.display='block';
  requestAnimationFrame(function(){
    backdrop.style.opacity='1';
    sheet.style.transform=window.innerWidth>=700?'translateX(-50%) translateY(0)':'translateY(0)';
    if(window.innerWidth>=700){sheet.style.left='50%';sheet.style.right='auto';sheet.style.maxWidth='520px';sheet.style.transform='translateX(-50%) translateY(100%)';requestAnimationFrame(function(){sheet.style.transform='translateX(-50%) translateY(0)'})}
  });
  document.body.style.overflow='hidden';
  sheet.querySelectorAll('[data-close]').forEach(function(b){b.addEventListener('click',closeModal)});
}

function closeModal(){
  if(!root)return;
  backdrop.style.opacity='0';
  sheet.style.transform=window.innerWidth>=700?'translateX(-50%) translateY(100%)':'translateY(100%)';
  document.body.style.overflow='';
  setTimeout(function(){root.style.display='none'},350);
}

var css=document.createElement('style');
css.textContent=
'#mznSh h2{font-family:Inter,"IBM Plex Sans Arabic",sans-serif;font-weight:300;font-size:22px;color:#EDEDED;margin:0 0 6px}'+
'#mznSh .mzn-sub{font-size:12px;color:#7A8090;margin-bottom:20px}'+
'#mznSh label{display:block;font-size:11px;letter-spacing:.15em;color:#4A5060;text-transform:uppercase;font-weight:500;margin:14px 0 6px}'+
'#mznSh input,#mznSh select,#mznSh textarea{width:100%;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);color:#EDEDED;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box}'+
'#mznSh input:focus,#mznSh select:focus,#mznSh textarea:focus{border-color:rgba(201,169,97,.5);background:rgba(201,169,97,.03)}'+
'#mznSh textarea{min-height:70px;resize:vertical;line-height:1.7}'+
'#mznSh .mzn-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}'+
'#mznSh .mzn-actions{display:flex;gap:12px;margin-top:24px}'+
'#mznSh .mzn-submit{flex:1;padding:14px 24px;border-radius:99px;background:linear-gradient(135deg,#E8CE8B,#C9A961);color:#08090E;font-weight:600;font-size:13px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 10px 30px -8px rgba(201,169,97,.5)}'+
'#mznSh .mzn-cancel{padding:14px 22px;border-radius:99px;background:transparent;color:#7A8090;font-size:13px;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-family:inherit}'+
'#mznSh .mzn-x{position:absolute;top:16px;left:16px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.04);border:none;color:#7A8090;cursor:pointer;font-size:14px}'+
'@keyframes mznFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(css);

/* ============ PR MODAL ============ */
function openPRModal(){
  openModal(
    '<button class="mzn-x" data-close>✕</button>'+
    '<h2>طلب شراء جديد</h2>'+
    '<p class="mzn-sub">يُحفظ الطلب فوراً في متصفحك.</p>'+
    '<label>عنوان الطلب</label><input id="f_t" type="text" placeholder="مثال: توريد أجهزة شبكات — الدفعة الرابعة">'+
    '<div class="mzn-row2">'+
      '<div><label>القسم</label><select id="f_d"><option>تقنية المعلومات</option><option>العمليات</option><option>المالية</option><option>الموارد البشرية</option><option>التسويق</option></select></div>'+
      '<div><label>الأولوية</label><select id="f_p"><option>عادية</option><option>عالية</option><option>عاجلة</option></select></div>'+
    '</div>'+
    '<label>المبلغ التقديري (USD)</label><input id="f_a" type="number" placeholder="150000">'+
    '<label>المبرر (اختياري)</label><textarea id="f_r" placeholder="اشرح لماذا هذا الطلب ضروري..."></textarea>'+
    '<div class="mzn-actions"><button class="mzn-submit" id="f_s">حفظ الطلب</button><button class="mzn-cancel" data-close>إلغاء</button></div>'
  );
  setTimeout(function(){var x=document.getElementById('f_t');if(x)x.focus()},450);
  document.getElementById('f_s').addEventListener('click',submitPR);
}

function submitPR(){
  var t=(document.getElementById('f_t').value||'').trim();
  var d=document.getElementById('f_d').value;
  var p=document.getElementById('f_p').value;
  var a=parseFloat(document.getElementById('f_a').value)||0;
  var r=(document.getElementById('f_r').value||'').trim();
  if(!t){toast('أدخل عنوان الطلب','warning');tone(330,.15);return}
  if(a<=0){toast('أدخل مبلغاً صحيحاً','warning');tone(330,.15);return}
  var pr={id:uid('PR'),title:t,dept:d,priority:p,amount:a,reason:r,items:1};
  addItem('prs',pr);
  renderPRRow(pr,true);
  closeModal();
  tone(880,.12);setTimeout(function(){tone(1174,.15)},90);
  toast('✅ حُفظ الطلب '+pr.id,'success');
}

function renderPRRow(pr,prepend){
  var list=document.getElementById('prList');
  if(!list)return;
  var row=document.createElement('div');
  row.className='pr-row';
  row.style.animation='mznFade .6s cubic-bezier(.16,1,.3,1)';
  row.dataset.mznId=pr._id;
  row.innerHTML=
    '<div><p class="pr-id">'+pr.id+'</p><p class="pr-meta" style="margin-top:2px">'+pr.items+' صنف</p></div>'+
    '<div><p class="pr-title">'+esc(pr.title)+'</p><p class="pr-meta">'+esc(pr.dept)+' · '+esc(pr.priority)+'</p></div>'+
    '<div><div class="appr-chain"><span class="appr-dot current"></span><span class="appr-line"></span><span class="appr-dot"></span><span class="appr-line"></span><span class="appr-dot"></span><span class="appr-line"></span><span class="appr-dot"></span></div><p class="pr-meta" style="margin-top:6px">بانتظار مدير القسم</p></div>'+
    '<div style="text-align:left"><p class="pr-amount">'+fmt(pr.amount)+'</p></div>'+
    '<div style="text-align:left"><span class="stat-pill pill-pending"><span class="dot" style="background:var(--amber);box-shadow:0 0 6px var(--amber)"></span>قيد الموافقة</span></div>';
  row.addEventListener('click',function(){tone(660,.06);toast('→ فتح الطلب '+pr.id,'info')});
  if(prepend&&list.firstChild){list.insertBefore(row,list.firstChild)}else{list.appendChild(row)}
}

/* ============ PO MODAL ============ */
function openPOModal(){
  openModal(
    '<button class="mzn-x" data-close>✕</button>'+
    '<h2>أمر شراء جديد</h2>'+
    '<p class="mzn-sub">أنشئ أمر شراء لمورد معتمد.</p>'+
    '<label>المورد</label><select id="p_s"><option>STC Solutions</option><option>Huawei</option><option>Mobily</option><option>Aramco Services</option><option>Oracle</option><option>Siemens</option></select>'+
    '<label>الموضوع</label><input id="p_t" type="text" placeholder="مثال: توريد أجهزة شبكات">'+
    '<div class="mzn-row2">'+
      '<div><label>تاريخ التسليم</label><input id="p_d" type="date"></div>'+
      '<div><label>المبلغ (USD)</label><input id="p_a" type="number" placeholder="150000"></div>'+
    '</div>'+
    '<label>شروط الدفع</label><select id="p_pay"><option>30 يوم</option><option>45 يوم</option><option>60 يوم</option><option>دفع فوري</option></select>'+
    '<div class="mzn-actions"><button class="mzn-submit" id="p_btn">إصدار الأمر</button><button class="mzn-cancel" data-close>إلغاء</button></div>'
  );
  setTimeout(function(){var x=document.getElementById('p_t');if(x)x.focus()},450);
  document.getElementById('p_btn').addEventListener('click',submitPO);
}

function submitPO(){
  var s=document.getElementById('p_s').value;
  var t=(document.getElementById('p_t').value||'').trim();
  var d=document.getElementById('p_d').value;
  var a=parseFloat(document.getElementById('p_a').value)||0;
  var pay=document.getElementById('p_pay').value;
  if(!t){toast('أدخل موضوع الأمر','warning');tone(330,.15);return}
  if(a<=0){toast('أدخل مبلغاً صحيحاً','warning');tone(330,.15);return}
  var po={id:uid('PO'),supplier:s,title:t,delivery:d,amount:a,payment:pay,status:'sent'};
  addItem('pos',po);
  renderPORow(po,true);
  closeModal();
  tone(880,.12);setTimeout(function(){tone(1174,.15)},90);
  toast('✅ صدر الأمر '+po.id,'success');
}

function renderPORow(po,prepend){
  var list=document.getElementById('poList');
  if(!list)return;
  var initials=po.supplier.substring(0,3).toUpperCase();
  var row=document.createElement('div');
  row.className='po-row';
  row.style.animation='mznFade .6s cubic-bezier(.16,1,.3,1)';
  row.dataset.mznId=po._id;
  row.innerHTML=
    '<div><p class="po-id">'+po.id+'</p><p class="po-meta" style="margin-top:2px">1 صنف</p></div>'+
    '<div><p class="po-title">'+esc(po.title)+'</p><p class="po-meta">تاريخ الإصدار: '+new Date().toISOString().slice(0,10)+'</p></div>'+
    '<div class="po-supplier"><div class="po-sup-avatar" style="background:rgba(201,169,97,.1);color:var(--gb);border-color:rgba(201,169,97,.25)">'+initials+'</div><div><p style="font-size:13px;color:var(--text);margin-bottom:2px">'+esc(po.supplier)+'</p><p class="po-meta">تسليم: '+(po.delivery||'—')+'</p></div></div>'+
    '<div style="text-align:left"><p class="po-amount">'+fmt(po.amount)+'</p></div>'+
    '<div style="text-align:left"><span class="stat-pill pill-sent"><span class="dot" style="background:var(--ice);box-shadow:0 0 6px var(--ice)"></span>مرسل</span></div>';
  row.addEventListener('click',function(){tone(660,.06);toast('→ فتح الأمر '+po.id,'info')});
  if(prepend&&list.firstChild){list.insertBefore(row,list.firstChild)}else{list.appendChild(row)}
}

/* ============ GRN MODAL ============ */
function openGRNModal(){
  openModal(
    '<button class="mzn-x" data-close>✕</button>'+
    '<h2>سند استلام جديد</h2>'+
    '<p class="mzn-sub">اربط السند بأمر شراء موجود.</p>'+
    '<label>أمر الشراء</label><select id="g_po"><option>PO-2025-0087 — STC Solutions</option><option>PO-2025-0086 — Aramco Services</option><option>PO-2025-0085 — Adobe Enterprise</option></select>'+
    '<label>الموضوع</label><input id="g_t" type="text" placeholder="مثال: استلام أجهزة شبكات">'+
    '<div class="mzn-row2">'+
      '<div><label>المستودع</label><select id="g_w"><option>WH-01 · الرياض</option><option>WH-02 · الدمام</option><option>رقمي — تراخيص</option></select></div>'+
      '<div><label>القيمة (USD)</label><input id="g_a" type="number" placeholder="150000"></div>'+
    '</div>'+
    '<label>ملاحظات الاستلام</label><textarea id="g_n" placeholder="حالة العبوات، أرقام تسلسلية..."></textarea>'+
    '<div class="mzn-actions"><button class="mzn-submit" id="g_btn">تسجيل الاستلام</button><button class="mzn-cancel" data-close>إلغاء</button></div>'
  );
  setTimeout(function(){var x=document.getElementById('g_t');if(x)x.focus()},450);
  document.getElementById('g_btn').addEventListener('click',submitGRN);
}

function submitGRN(){
  var po=document.getElementById('g_po').value;
  var t=(document.getElementById('g_t').value||'').trim();
  var w=document.getElementById('g_w').value;
  var a=parseFloat(document.getElementById('g_a').value)||0;
  var n=(document.getElementById('g_n').value||'').trim();
  if(!t){toast('أدخل موضوع السند','warning');tone(330,.15);return}
  if(a<=0){toast('أدخل قيمة صحيحة','warning');tone(330,.15);return}
  var grn={id:uid('GRN'),refPO:po.split(' ')[0],supplier:po.split('— ')[1]||'',title:t,warehouse:w,amount:a,notes:n,status:'pending',items:1};
  addItem('grns',grn);
  renderGRNRow(grn,true);
  closeModal();
  tone(880,.12);setTimeout(function(){tone(1174,.15)},90);
  toast('✅ سُجّل السند '+grn.id,'success');
}

function renderGRNRow(g,prepend){
  var list=document.getElementById('docList');
  if(!list)return;
  var row=document.createElement('div');
  row.className='doc-row';
  row.style.animation='mznFade .6s cubic-bezier(.16,1,.3,1)';
  row.dataset.mznId=g._id;
  row.innerHTML=
    '<div><p class="doc-id">'+g.id+'</p><p class="doc-meta" style="margin-top:2px">'+g.items+' صنف</p></div>'+
    '<div><p class="doc-title">'+esc(g.title)+'</p><p class="doc-meta">'+esc(g.supplier)+' · '+esc(g.refPO)+'</p></div>'+
    '<div><p class="doc-meta" style="font-size:11px;letter-spacing:.1em;text-transform:uppercase">مرجع</p><p style="font-family:Inter;font-size:12px;color:var(--em);margin-top:2px">—</p></div>'+
    '<div style="text-align:left"><p class="doc-amount">'+fmt(g.amount)+'</p></div>'+
    '<div style="text-align:left"><span class="stat-pill pill-pending"><span class="dot" style="background:var(--amber);box-shadow:0 0 6px var(--amber)"></span>بانتظار الاستلام</span></div>';
  row.addEventListener('click',function(){tone(660,.06);toast('→ فتح السند '+g.id,'info')});
  if(prepend&&list.firstChild){list.insertBefore(row,list.firstChild)}else{list.appendChild(row)}
}

/* ============ INIT ============ */
function initPage(){
  var path=window.location.pathname.split('/').pop()||'index.html';
  var data=load();

  // Override openCreate
  window.openCreate=function(){
    if(path.indexOf('pr')!==-1) openPRModal();
    else if(path.indexOf('po')!==-1) openPOModal();
    else if(path.indexOf('grn')!==-1) openGRNModal();
    else openPRModal();
  };

  // Render saved items
  if(path.indexOf('pr')!==-1){ (data.prs||[]).slice().reverse().forEach(function(x){renderPRRow(x,true)}) }
  if(path.indexOf('po')!==-1){ (data.pos||[]).slice().reverse().forEach(function(x){renderPORow(x,true)}) }
  if(path.indexOf('grn')!==-1){ (data.grns||[]).slice().reverse().forEach(function(x){renderGRNRow(x,true)}) }
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initPage)}else{initPage()}
})();
