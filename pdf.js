(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(n){n=parseFloat(n)||0;if(n>=1e6)return'$'+(n/1e6).toFixed(2)+'M';if(n>=1e3)return'$'+(n/1e3).toFixed(0)+'K';return'$'+Math.round(n)}
function tone(f,d,v){ if(window.MZN&&MZN.tone) MZN.tone(f,d,'sine',v||0.05); }
function toast(m,t){ if(window.MZN&&MZN.toast) MZN.toast(m,t||'info'); }

/* ============ ADD EXPORT BUTTON ============ */
function addExportButton(){
  if(document.getElementById('mznExport')) return;
  /* Only on data pages */
  var listId=null;
  if(path.indexOf('mizan-pr')===0) listId='prList';
  else if(path.indexOf('mizan-po')===0) listId='poList';
  else if(path.indexOf('mizan-grn')===0) listId='docList';
  if(!listId) return;
  var list=document.getElementById(listId);
  if(!list) return;

  var b=document.createElement('button');
  b.id='mznExport';
  b.style.cssText='position:fixed;bottom:150px;left:18px;z-index:2147483644;display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:99px;background:rgba(8,9,14,.9);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(201,169,97,.3);color:#E8CE8B;font-family:Inter,"IBM Plex Sans Arabic",sans-serif;font-size:11.5px;font-weight:500;letter-spacing:.05em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.5);transition:all .25s ease;-webkit-tap-highlight-color:rgba(201,169,97,.25)';
  b.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span style="pointer-events:none">تصدير PDF</span>';
  b.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    tone(880,.1);
    exportPDF();
  });
  document.body.appendChild(b);
}

/* ============ EXPORT PDF ============ */
function exportPDF(){
  var listId=null, title='';
  if(path.indexOf('mizan-pr')===0){ listId='prList'; title='طلبات الشراء'; }
  else if(path.indexOf('mizan-po')===0){ listId='poList'; title='أوامر الشراء'; }
  else if(path.indexOf('mizan-grn')===0){ listId='docList'; title='سندات الاستلام'; }
  var list=document.getElementById(listId);
  if(!list) return;

  /* Collect visible rows */
  var rows=[];
  var rowSel=path.indexOf('mizan-pr')===0?'.pr-row':path.indexOf('mizan-po')===0?'.po-row':'.doc-row';
  var idSel=path.indexOf('mizan-pr')===0?'.pr-id':path.indexOf('mizan-po')===0?'.po-id':'.doc-id';
  var titleSel=path.indexOf('mizan-pr')===0?'.pr-title':path.indexOf('mizan-po')===0?'.po-title':'.doc-title';
  var metaSel=path.indexOf('mizan-pr')===0?'.pr-meta':path.indexOf('mizan-po')===0?'.po-meta':'.doc-meta';
  var amtSel=path.indexOf('mizan-pr')===0?'.pr-amount':path.indexOf('mizan-po')===0?'.po-amount':'.doc-amount';

  var allRows=list.querySelectorAll(rowSel);
  for(var i=0;i<allRows.length;i++){
    var r=allRows[i];
    if(r.classList.contains('mzn-hidden')) continue;
    if(r.style.display==='none') continue;
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
  }

  /* Calculate totals */
  var total=0;
  rows.forEach(function(r){
    var txt=r.amount||'';
    var n=parseFloat(txt.replace(/[^0-9.]/g,''))||0;
    if(txt.indexOf('M')!==-1) n*=1000000;
    else if(txt.indexOf('K')!==-1) n*=1000;
    total+=n;
  });

  var today=new Date();
  var dateStr=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  var timeStr=String(today.getHours()).padStart(2,'0')+':'+String(today.getMinutes()).padStart(2,'0');
  var userName='المستخدم';
  try{ userName=localStorage.getItem('mzn_auth')||'المستخدم'; }catch(e){}

  /* Build HTML report */
  var html='<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>MIZAN · '+title+'</title>'+
  '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">'+
  '<style>'+
  '*{margin:0;padding:0;box-sizing:border-box}'+
  'body{font-family:"IBM Plex Sans Arabic",sans-serif;background:#fff;color:#111;padding:40px 32px;line-height:1.6}'+
  '.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #C9A961;padding-bottom:20px;margin-bottom:28px}'+
  '.logo{display:flex;align-items:center;gap:12px}'+
  '.logo-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#E8CE8B,#B87333);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:600}'+
  '.logo-text h1{font-family:"Inter";font-size:20px;letter-spacing:.25em;color:#B87333;font-weight:400}'+
  '.logo-text p{font-size:10px;letter-spacing:.2em;color:#666;text-transform:uppercase;margin-top:2px}'+
  '.meta{text-align:left;font-size:11px;color:#666;line-height:1.8}'+
  '.meta strong{color:#111;font-weight:500}'+
  'h2{font-size:22px;font-weight:500;color:#B87333;margin-bottom:8px}'+
  '.subtitle{font-size:12px;color:#666;margin-bottom:24px}'+
  '.summary{display:flex;gap:20px;margin-bottom:28px;padding:18px;background:#f8f6f1;border-radius:12px;border:1px solid #e8e0d0}'+
  '.sum-item{flex:1;text-align:center;border-left:1px solid #e8e0d0;padding:0 10px}'+
  '.sum-item:last-child{border-left:none}'+
  '.sum-label{font-size:10px;letter-spacing:.15em;color:#666;text-transform:uppercase;margin-bottom:6px}'+
  '.sum-val{font-family:"Inter";font-size:20px;font-weight:400;color:#111}'+
  '.sum-val.gold{color:#B87333}'+
  'table{width:100%;border-collapse:collapse;margin-bottom:24px}'+
  'thead th{text-align:right;padding:12px 10px;background:#f8f6f1;font-size:10px;letter-spacing:.15em;color:#666;text-transform:uppercase;font-weight:500;border-bottom:2px solid #C9A961}'+
  'tbody td{padding:12px 10px;font-size:12px;border-bottom:1px solid #eee;vertical-align:top}'+
  'tbody td.num{text-align:left;font-family:"Inter";font-weight:400}'+
  'tbody tr:nth-child(even){background:#fafafa}'+
  '.status{display:inline-block;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:500}'+
  '.status-pending{background:#fff4e0;color:#a06800}'+
  '.status-approved{background:#e8f5e9;color:#1e6b2e}'+
  '.status-rejected{background:#fce8eb;color:#a01020}'+
  '.status-draft{background:#f0f0f0;color:#666}'+
  '.status-sent{background:#e3f2fd;color:#1565c0}'+
  '.status-progress{background:#fff4e0;color:#a06800}'+
  '.status-received{background:#e8f5e9;color:#1e6b2e}'+
  '.status-closed{background:#e8f5e9;color:#1e6b2e}'+
  '.status-converted{background:#e3f2fd;color:#1565c0}'+
  '.status-accepted{background:#e8f5e9;color:#1e6b2e}'+
  '.status-inspect{background:#f3e5f5;color:#6a1b9a}'+
  '.status-partial{background:#e3f2fd;color:#1565c0}'+
  '.status-variance{background:#fce8eb;color:#a01020}'+
  '.foot{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:10px;color:#999;display:flex;justify-content:space-between;flex-wrap:wrap}'+
  '.foot-brand{color:#B87333;font-family:"Inter";letter-spacing:.2em}'+
  '@media print{body{padding:20px}@page{size:A4;margin:14mm}}'+
  '</style></head><body>'+
  '<div class="head">'+
    '<div class="logo">'+
      '<div class="logo-icon">⚖</div>'+
      '<div class="logo-text"><h1>MIZAN</h1><p>Executive Procurement</p></div>'+
    '</div>'+
    '<div class="meta">'+
      '<div><strong>'+title+'</strong></div>'+
      '<div>'+dateStr+' · '+timeStr+'</div>'+
      '<div>'+esc(userName)+'</div>'+
    '</div>'+
  '</div>'+
  '<h2>'+title+'</h2>'+
  '<p class="subtitle">تقرير تفصيلي — '+rows.length+' عنصر</p>'+
  '<div class="summary">'+
    '<div class="sum-item"><div class="sum-label">إجمالي العناصر</div><div class="sum-val">'+rows.length+'</div></div>'+
    '<div class="sum-item"><div class="sum-label">القيمة الإجمالية</div><div class="sum-val gold">'+fmt(total)+'</div></div>'+
    '<div class="sum-item"><div class="sum-label">متوسط القيمة</div><div class="sum-val">'+fmt(rows.length?total/rows.length:0)+'</div></div>'+
  '</div>'+
  '<table>'+
  '<thead><tr><th style="width:100px">الرقم</th><th>الموضوع</th><th>المرجع</th><th class="num" style="width:110px">المبلغ</th><th style="width:100px">الحالة</th></tr></thead>'+
  '<tbody>';

  rows.forEach(function(r){
    var statusClass='status-draft';
    var s=r.status||'';
    if(s.indexOf('قيد الموافقة')!==-1||s.indexOf('بانتظار')!==-1||s.indexOf('قيد التنفيذ')!==-1) statusClass='status-pending';
    else if(s.indexOf('معتمد')!==-1||s.indexOf('مقبول')!==-1||s.indexOf('مستلم')!==-1||s.indexOf('مغلق')!==-1) statusClass='status-approved';
    else if(s.indexOf('مرفوض')!==-1||s.indexOf('فرق')!==-1) statusClass='status-rejected';
    else if(s.indexOf('مرسل')!==-1) statusClass='status-sent';
    else if(s.indexOf('تحولت')!==-1) statusClass='status-converted';
    else if(s.indexOf('فحص')!==-1) statusClass='status-inspect';
    else if(s.indexOf('جزئي')!==-1) statusClass='status-partial';

    html+='<tr>'+
      '<td style="font-family:Inter;font-size:11px;color:#666">'+esc(r.id)+'</td>'+
      '<td><strong>'+esc(r.title)+'</strong></td>'+
      '<td style="font-size:11px;color:#666">'+esc(r.meta)+'</td>'+
      '<td class="num" style="color:#B87333;font-weight:500">'+esc(r.amount)+'</td>'+
      '<td><span class="status '+statusClass+'">'+esc(s)+'</span></td>'+
    '</tr>';
  });

  html+='</tbody></table>'+
  '<div class="foot">'+
    '<div>MIZAN · Executive Procurement Intelligence</div>'+
    '<div class="foot-brand">mizan-pearl-nine.vercel.app</div>'+
  '</div>'+
  '<script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script>'+
  '</body></html>';

  /* Open in new tab */
  var w=window.open('', '_blank');
  if(!w){
    toast('⚠️ اسمح بالنوافذ المنبثقة','warning');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();

  toast('📄 فتح التقرير — يمكنك حفظه كـ PDF','success');
}

/* ============ INIT ============ */
function init(){
  addExportButton();
  setInterval(addExportButton, 2000);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();

console.log('[MIZAN] PDF export ready');
})();
