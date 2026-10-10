(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

console.log('[MIZAN Export] loaded for path:', path);

function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function tone(f,d,v){ if(window.MZN&&MZN.tone) MZN.tone(f,d,'sine',v||0.05); }
function toast(m,t){ if(window.MZN&&MZN.toast) MZN.toast(m,t||'info'); }

/* ============ GET DATA FROM PAGE ============ */
function collectRows(){
  var listId=null, type='';
  if(path.indexOf('mizan-pr')===0){ listId='prList'; type='prs'; }
  else if(path.indexOf('mizan-po')===0){ listId='poList'; type='pos'; }
  else if(path.indexOf('mizan-grn')===0){ listId='docList'; type='grns'; }
  if(!listId) return null;
  var list=document.getElementById(listId);
  if(!list) return null;

  var rowSel=type==='prs'?'.pr-row':type==='pos'?'.po-row':'.doc-row';
  var idSel=type==='prs'?'.pr-id':type==='pos'?'.po-id':'.doc-id';
  var titleSel=type==='prs'?'.pr-title':type==='pos'?'.po-title':'.doc-title';
  var metaSel=type==='prs'?'.pr-meta':type==='pos'?'.po-meta':'.doc-meta';
  var amtSel=type==='prs'?'.pr-amount':type==='pos'?'.po-amount':'.doc-amount';

  var rows=[];
  list.querySelectorAll(rowSel).forEach(function(r){
    if(r.classList.contains('mzn-hidden')) return;
    if(r.style.display==='none') return;
    var id=r.querySelector(idSel);
    var t=r.querySelector(titleSel);
    var m=r.querySelector(metaSel);
    var a=r.querySelector(amtSel);
    var p=r.querySelector('.stat-pill');
    rows.push({
      id:id?id.textContent.trim():'',
      title:t?t.textContent.trim():'',
      meta:m?m.textContent.trim():'',
      amount:a?a.textContent.trim():'',
      status:p?p.textContent.trim():''
    });
  });
  return {type:type, rows:rows};
}

/* ============ CSV EXPORT ============ */
function exportCSV(){
  var data=collectRows();
  if(!data || !data.rows.length){ toast('⚠️ لا توجد بيانات','warning'); return; }

  var headers=['الرقم','الموضوع','المرجع','المبلغ','الحالة'];
  var csv='\uFEFF';
  csv+=headers.join(',')+'\n';
  data.rows.forEach(function(r){
    csv+='"'+String(r.id).replace(/"/g,'""')+'","'+String(r.title).replace(/"/g,'""')+'","'+String(r.meta).replace(/"/g,'""')+'","'+String(r.amount).replace(/"/g,'""')+'","'+String(r.status).replace(/"/g,'""')+'"\n';
  });

  var blob=new Blob([csv], {type:'text/csv;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  var today=new Date();
  var stamp=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  a.download='MIZAN-'+data.type+'-'+stamp+'.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ a.remove(); URL.revokeObjectURL(url); }, 100);
  tone(880,.12); setTimeout(function(){tone(1174,.15)},90);
  toast('📊 حُفظ ملف CSV','success');
}

/* ============ DETAILED PDF REPORT ============ */
function exportDetailPDF(){
  var poId='';
  var el=document.querySelector('.po-id,.pr-id,.doc-id');
  if(el){
    var txt=el.textContent||'';
    var m=txt.match(/(PO|PR|GRN)-\d{4}-\d+/);
    if(m) poId=m[0];
  }
  if(!poId){
    var h=document.querySelector('h1,h2,.display');
    if(h){
      var m2=(h.textContent||'').match(/(PO|PR|GRN)-\d{4}-\d+/);
      if(m2) poId=m2[0];
    }
  }
  if(!poId) poId='تقرير تفاصيل';

  var items=[];
  document.querySelectorAll('.item-line,.receive-line').forEach(function(line){
    var cells=line.querySelectorAll('.col-right');
    if(!cells.length) return;
    var nameEl=line.querySelector('.item-name, p');
    var name=nameEl?nameEl.textContent.trim():'';
    if(!name) return;
    items.push({
      name:name,
      qty:cells[0]?cells[0].textContent.trim():'—',
      price:cells[1]?cells[1].textContent.trim():'—',
      total:cells[2]?cells[2].textContent.trim():(cells[1]?cells[1].textContent.trim():'—')
    });
  });

  if(!items.length){
    toast('⚠️ لا يمكن إنشاء تقرير تفاصيل','warning');
    return;
  }

  var b=(window.MZN_BRANDING && window.MZN_BRANDING.get())||{
    company:'MIZAN', tagline:'EXECUTIVE PROCUREMENT',
    primary:'#C9A961', primaryBright:'#E8CE8B', copper:'#B87333',
    signer:'Executive Procurement Officer'
  };
  var today=new Date();
  var dateStr=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');

  var itemsHTML='';
  items.forEach(function(it, i){
    itemsHTML+='<tr>'+
      '<td style="font-family:Inter;font-size:11px;color:#999">'+String(i+1).padStart(2,'0')+'</td>'+
      '<td><strong>'+esc(it.name)+'</strong></td>'+
      '<td class="num">'+esc(it.qty)+'</td>'+
      '<td class="num">'+esc(it.price)+'</td>'+
      '<td class="num" style="color:'+b.copper+'">'+esc(it.total)+'</td>'+
    '</tr>';
  });

  var html='<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>'+esc(poId)+' · '+esc(b.company)+'</title>'+
  '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">'+
  '<style>'+
  '*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
  'body{font-family:"IBM Plex Sans Arabic",sans-serif;background:#fff;color:#111;padding:40px 32px;line-height:1.6}'+
  '.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid '+b.primary+';padding-bottom:20px;margin-bottom:28px}'+
  '.logo{display:flex;align-items:center;gap:12px}'+
  '.logo-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,'+b.primaryBright+','+b.copper+');display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px}'+
  '.logo-text h1{font-family:"Inter";font-size:20px;letter-spacing:.25em;color:'+b.copper+';font-weight:400}'+
  '.logo-text p{font-size:10px;letter-spacing:.2em;color:#666;text-transform:uppercase;margin-top:2px}'+
  '.meta{text-align:left;font-size:11px;color:#666;line-height:1.8}'+
  '.doc-title{background:#f8f6f1;padding:24px;border-radius:12px;border:1px solid #e8e0d0;margin-bottom:24px;text-align:center}'+
  '.doc-title h2{font-family:"Inter";font-size:24px;letter-spacing:.15em;color:'+b.copper+';font-weight:400;margin-bottom:6px}'+
  '.doc-title .num{font-family:"Inter";font-size:14px;color:#666;letter-spacing:.05em}'+
  'table{width:100%;border-collapse:collapse;margin-bottom:24px}'+
  'thead th{text-align:right;padding:12px 10px;background:#f8f6f1;font-size:10px;letter-spacing:.15em;color:#666;text-transform:uppercase;font-weight:500;border-bottom:2px solid '+b.primary+'}'+
  'tbody td{padding:12px 10px;font-size:12px;border-bottom:1px solid #eee;vertical-align:top}'+
  'tbody td.num{text-align:left;font-family:"Inter";font-weight:400}'+
  'tbody tr:nth-child(even){background:#fafafa}'+
  '.signature{margin-top:40px;padding-top:30px;border-top:1px dashed #ccc;display:flex;justify-content:space-between;gap:40px}'+
  '.sig-box{flex:1;text-align:center}'+
  '.sig-line{height:50px;border-bottom:1px solid #999;margin-bottom:8px;position:relative}'+
  '.sig-line::after{content:"";position:absolute;left:50%;bottom:-3px;width:6px;height:6px;border-radius:50%;background:'+b.primary+';transform:translateX(-50%)}'+
  '.sig-label{font-size:10px;color:#666;letter-spacing:.1em;text-transform:uppercase}'+
  '.sig-name{font-size:11px;color:#333;margin-top:4px;font-weight:500}'+
  '.foot{margin-top:30px;padding-top:20px;border-top:1px solid #ddd;font-size:10px;color:#999;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}'+
  '.foot-brand{color:'+b.copper+';font-family:"Inter";letter-spacing:.2em}'+
  '@media print{body{padding:20px}@page{size:A4;margin:14mm}}'+
  '</style></head><body>'+
  '<div class="head">'+
    '<div class="logo">'+
      '<div class="logo-icon">⚖</div>'+
      '<div class="logo-text"><h1>'+esc(b.company)+'</h1><p>'+esc(b.tagline)+'</p></div>'+
    '</div>'+
    '<div class="meta"><div>'+dateStr+'</div></div>'+
  '</div>'+
  '<div class="doc-title">'+
    '<h2>'+esc(poId)+'</h2>'+
    '<div class="num">تقرير تفاصيل الأصناف</div>'+
  '</div>'+
  '<table>'+
  '<thead><tr><th style="width:40px">#</th><th>الصنف</th><th class="num" style="width:80px">الكمية</th><th class="num" style="width:100px">السعر</th><th class="num" style="width:110px">الإجمالي</th></tr></thead>'+
  '<tbody>'+itemsHTML+'</tbody>'+
  '</table>'+
  '<div class="signature">'+
    '<div class="sig-box"><div class="sig-line"></div><div class="sig-label">مُعتمَد من</div><div class="sig-name">'+esc(b.signer)+'</div></div>'+
    '<div class="sig-box"><div class="sig-line"></div><div class="sig-label">التاريخ</div><div class="sig-name">'+dateStr+'</div></div>'+
  '</div>'+
  '<div class="foot"><div>'+esc(b.company)+' · '+esc(b.tagline)+'</div><div class="foot-brand">mizan-pearl-nine.vercel.app</div></div>'+
  '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script>'+
  '</body></html>';

  var w=window.open('', '_blank');
  if(!w){ toast('⚠️ اسمح بالنوافذ المنبثقة','warning'); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
  toast('📄 فتح تقرير التفاصيل','success');
}

/* ============ BUILD TOOLBAR ============ */
function buildToolbar(){
  /* Determine page type */
  var listId=null, type='';
  if(path.indexOf('mizan-pr')===0){ listId='prList'; type='prs'; }
  else if(path.indexOf('mizan-po')===0){ listId='poList'; type='pos'; }
  else if(path.indexOf('mizan-grn')===0){ listId='docList'; type='grns'; }

  /* Only on list pages */
  if(!listId) return;
  var list=document.getElementById(listId);
  if(!list) return;

  /* Remove existing toolbar */
  var existing=document.getElementById('mznExportBar');
  if(existing) existing.remove();

  /* Build container */
  var bar=document.createElement('div');
  bar.id='mznExportBar';
  bar.style.cssText='position:fixed;bottom:86px;left:18px;z-index:2147483644;display:flex;flex-direction:column;gap:10px;pointer-events:none';

  /* PDF Button */
  var pdfBtn=document.createElement('button');
  pdfBtn.className='mzn-exp-btn';
  pdfBtn.style.cssText='pointer-events:auto;display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:99px;background:rgba(8,9,14,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(201,169,97,.35);color:#E8CE8B;font-family:Inter,"IBM Plex Sans Arabic",sans-serif;font-size:11.5px;font-weight:500;letter-spacing:.05em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.5);white-space:nowrap;-webkit-tap-highlight-color:rgba(201,169,97,.25)';
  pdfBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span style="pointer-events:none">تصدير PDF</span>';
  pdfBtn.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    tone(880,.1);
    if(window.exportPDF) window.exportPDF();
    else {
      /* Fallback: trigger click on existing button */
      var old=document.getElementById('mznExport');
      if(old) old.click();
    }
  });
  bar.appendChild(pdfBtn);

  /* CSV Button */
  var csvBtn=document.createElement('button');
  csvBtn.className='mzn-exp-btn';
  csvBtn.style.cssText='pointer-events:auto;display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:99px;background:rgba(8,9,14,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(110,231,160,.35);color:#6EE7A0;font-family:Inter,"IBM Plex Sans Arabic",sans-serif;font-size:11.5px;font-weight:500;letter-spacing:.05em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.5);white-space:nowrap;-webkit-tap-highlight-color:rgba(110,231,160,.25)';
  csvBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg><span style="pointer-events:none">تصدير CSV</span>';
  csvBtn.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    tone(880,.1);
    exportCSV();
  });
  bar.appendChild(csvBtn);

  /* Detail PDF Button — only on detail pages */
  var isDetail=!!document.querySelector('.po-doc,.match-zone,.approval-flow,.item-line,.receive-line');
  if(isDetail){
    var detailBtn=document.createElement('button');
    detailBtn.className='mzn-exp-btn';
    detailBtn.style.cssText='pointer-events:auto;display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:99px;background:rgba(8,9,14,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(157,196,232,.35);color:#9DC4E8;font-family:Inter,"IBM Plex Sans Arabic",sans-serif;font-size:11.5px;font-weight:500;letter-spacing:.05em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.5);white-space:nowrap;-webkit-tap-highlight-color:rgba(157,196,232,.25)';
    detailBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span style="pointer-events:none">تفاصيل PDF</span>';
    detailBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      tone(880,.1);
      exportDetailPDF();
    });
    bar.appendChild(detailBtn);
  }

  /* Hide old separate buttons */
  ['mznExport','mznCSV','mznDetailPDF'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.style.setProperty('display','none','important');
  });

  document.body.appendChild(bar);
}

/* ============ HIDE OLD BUTTONS FROM PDF.JS ============ */
function hideOldButtons(){
  ['mznExport'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.style.setProperty('display','none','important');
  });
}

/* ============ INIT ============ */
function init(){
  console.log('[MIZAN Export] init called');
  buildToolbar();
  hideOldButtons();
  setInterval(function(){
    buildToolbar();
    hideOldButtons();
  }, 2000);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();

/* Also run after a small delay to catch late-rendered rows */
setTimeout(init, 800);
setTimeout(init, 2000);

console.log('[MIZAN] Export toolbar ready');
})();
