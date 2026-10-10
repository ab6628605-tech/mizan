(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(n){n=parseFloat(n)||0;if(n>=1e6)return'$'+(n/1e6).toFixed(2)+'M';if(n>=1e3)return'$'+(n/1e3).toFixed(0)+'K';return'$'+Math.round(n)}
function tone(f,d,v){ if(window.MZN&&MZN.tone) MZN.tone(f,d,'sine',v||0.05); }
function toast(m,t){ if(window.MZN&&MZN.toast) MZN.toast(m,t||'info'); }

/* ============ GET BRANDING ============ */
function getBranding(){
  var defaults={
    company:'MIZAN',
    tagline:'EXECUTIVE PROCUREMENT',
    primary:'#C9A961',
    primaryBright:'#E8CE8B',
    copper:'#B87333',
    signer:'Executive Procurement Officer'
  };
  if(window.MZN_BRANDING){
    try{ return Object.assign({}, defaults, window.MZN_BRANDING.get()); }
    catch(e){ return defaults; }
  }
  return defaults;
}

/* ============ ADD EXPORT BUTTON ============ */
function addExportButton(){
  if(document.getElementById('mznExport')) return;
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

/* ============ STATUS COLOR MAP ============ */
function statusClass(s){
  s=s||'';
  if(s.indexOf('قيد الموافقة')!==-1) return 'st-pending';
  if(s.indexOf('بانتظار')!==-1) return 'st-pending';
  if(s.indexOf('قيد التنفيذ')!==-1) return 'st-progress';
  if(s.indexOf('قيد الفحص')!==-1) return 'st-inspect';
  if(s.indexOf('معتمد')!==-1) return 'st-approved';
  if(s.indexOf('مقبول')!==-1) return 'st-approved';
  if(s.indexOf('مستلم')!==-1) return 'st-approved';
  if(s.indexOf('مغلق')!==-1) return 'st-approved';
  if(s.indexOf('مدفوعة')!==-1) return 'st-paid';
  if(s.indexOf('مرفوض')!==-1) return 'st-rejected';
  if(s.indexOf('فرق')!==-1) return 'st-rejected';
  if(s.indexOf('مرسل')!==-1) return 'st-sent';
  if(s.indexOf('تحولت')!==-1) return 'st-converted';
  if(s.indexOf('جزئي')!==-1) return 'st-partial';
  return 'st-draft';
}

/* ============ BUILD CHART SVG ============ */
function buildChartSVG(rows){
  /* Count by status group */
  var groups={
    'مسودة':0,
    'قيد الموافقة':0,
    'معتمدة':0,
    'مرفوضة':0,
    'أخرى':0
  };
  var colors={
    'مسودة':'#9CA3AF',
    'قيد الموافقة':'#F0C474',
    'معتمدة':'#6EE7A0',
    'مرفوضة':'#F0A0B0',
    'أخرى':'#9DC4E8'
  };
  rows.forEach(function(r){
    var s=r.status||'';
    if(s.indexOf('مسودة')!==-1) groups['مسودة']++;
    else if(s.indexOf('قيد الموافقة')!==-1||s.indexOf('بانتظار')!==-1) groups['قيد الموافقة']++;
    else if(s.indexOf('معتمد')!==-1||s.indexOf('مقبول')!==-1) groups['معتمدة']++;
    else if(s.indexOf('مرفوض')!==-1) groups['مرفوضة']++;
    else groups['أخرى']++;
  });

  var items=[];
  Object.keys(groups).forEach(function(k){
    if(groups[k]>0) items.push({label:k, count:groups[k], color:colors[k]});
  });
  if(items.length===0) return '';

  var max=Math.max.apply(null, items.map(function(i){return i.count;}));
  var W=680, H=220, padX=40, padY=30;
  var barW=(W-padX*2)/items.length - 20;
  var maxH=H-padY*2-30;

  var bars='';
  items.forEach(function(item, idx){
    var barH=(item.count/max)*maxH;
    var x=padX + idx*((W-padX*2)/items.length) + 10;
    var y=H-padY-30-barH;
    bars+='<rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+barH+'" fill="'+item.color+'" opacity="0.85" rx="6"/>';
    bars+='<text x="'+(x+barW/2)+'" y="'+(y-8)+'" text-anchor="middle" font-size="16" font-weight="600" fill="#111" font-family="Inter,sans-serif">'+item.count+'</text>';
    bars+='<text x="'+(x+barW/2)+'" y="'+(H-padY-6)+'" text-anchor="middle" font-size="11" fill="#666" font-family="IBM Plex Sans Arabic,sans-serif">'+esc(item.label)+'</text>';
  });

  return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:680px;height:auto;display:block;margin:0 auto 24px">'+
    bars+
    '<line x1="'+padX+'" y1="'+(H-padY-30)+'" x2="'+(W-padX)+'" y2="'+(H-padY-30)+'" stroke="#ddd" stroke-width="1"/>'+
  '</svg>';
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

  /* Branding */
  var b=getBranding();
  var today=new Date();
  var dateStr=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  var timeStr=String(today.getHours()).padStart(2,'0')+':'+String(today.getMinutes()).padStart(2,'0');
  var userName='المستخدم';
  try{ userName=localStorage.getItem('mzn_auth')||'المستخدم'; }catch(e){}

  /* Build chart */
  var chartSVG=buildChartSVG(rows);

  /* Build rows HTML */
  var rowsHTML='';
  rows.forEach(function(r){
    var cls=statusClass(r.status);
    rowsHTML+='<tr>'+
      '<td style="font-family:Inter;font-size:11px;color:#666">'+esc(r.id)+'</td>'+
      '<td><strong>'+esc(r.title)+'</strong></td>'+
      '<td style="font-size:11px;color:#666">'+esc(r.meta)+'</td>'+
      '<td class="num" style="color:'+b.copper+';font-weight:500">'+esc(r.amount)+'</td>'+
      '<td><span class="status '+cls+'">'+esc(r.status)+'</span></td>'+
    '</tr>';
  });

  /* Build HTML report */
  var html='<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>'+esc(b.company)+' · '+title+'</title>'+
  '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">'+
  '<style>'+
  '*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
  'body{font-family:"IBM Plex Sans Arabic",sans-serif;background:#fff;color:#111;padding:40px 32px;line-height:1.6}'+
  '.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid '+b.primary+';padding-bottom:20px;margin-bottom:28px}'+
  '.logo{display:flex;align-items:center;gap:12px}'+
  '.logo-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,'+b.primaryBright+','+b.copper+');display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:600}'+
  '.logo-text h1{font-family:"Inter";font-size:20px;letter-spacing:.25em;color:'+b.copper+';font-weight:400}'+
  '.logo-text p{font-size:10px;letter-spacing:.2em;color:#666;text-transform:uppercase;margin-top:2px}'+
  '.meta{text-align:left;font-size:11px;color:#666;line-height:1.8}'+
  '.meta strong{color:#111;font-weight:500}'+
  'h2{font-size:22px;font-weight:500;color:'+b.copper+';margin-bottom:8px}'+
  '.subtitle{font-size:12px;color:#666;margin-bottom:24px}'+
  '.summary{display:flex;gap:20px;margin-bottom:24px;padding:18px;background:#f8f6f1;border-radius:12px;border:1px solid #e8e0d0}'+
  '.sum-item{flex:1;text-align:center;border-left:1px solid #e8e0d0;padding:0 10px}'+
  '.sum-item:last-child{border-left:none}'+
  '.sum-label{font-size:10px;letter-spacing:.15em;color:#666;text-transform:uppercase;margin-bottom:6px}'+
  '.sum-val{font-family:"Inter";font-size:20px;font-weight:400;color:#111}'+
  '.sum-val.gold{color:'+b.copper+'}'+
  '.chart-wrap{background:#fafafa;border:1px solid #eee;border-radius:12px;padding:20px;margin-bottom:24px}'+
  '.chart-title{font-size:11px;letter-spacing:.15em;color:#666;text-transform:uppercase;font-weight:500;margin-bottom:12px;text-align:center}'+
  'table{width:100%;border-collapse:collapse;margin-bottom:24px}'+
  'thead th{text-align:right;padding:12px 10px;background:#f8f6f1;font-size:10px;letter-spacing:.15em;color:#666;text-transform:uppercase;font-weight:500;border-bottom:2px solid '+b.primary+'}'+
  'tbody td{padding:12px 10px;font-size:12px;border-bottom:1px solid #eee;vertical-align:top}'+
  'tbody td.num{text-align:left;font-family:"Inter";font-weight:400}'+
  'tbody tr:nth-child(even){background:#fafafa}'+
  '.status{display:inline-block;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:500;white-space:nowrap}'+
  '.st-pending{background:#fff4e0;color:#a06800}'+
  '.st-approved{background:#e8f5e9;color:#1e6b2e}'+
  '.st-rejected{background:#fce8eb;color:#a01020}'+
  '.st-draft{background:#f0f0f0;color:#666}'+
  '.st-sent{background:#e3f2fd;color:#1565c0}'+
  '.st-progress{background:#fff4e0;color:#a06800}'+
  '.st-inspect{background:#f3e5f5;color:#6a1b9a}'+
  '.st-converted{background:#e3f2fd;color:#1565c0}'+
  '.st-partial{background:#e3f2fd;color:#1565c0}'+
  '.st-paid{background:#e8f5e9;color:#1e6b2e}'+
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
    '<div class="meta">'+
      '<div><strong>'+esc(title)+'</strong></div>'+
      '<div>'+dateStr+' · '+timeStr+'</div>'+
      '<div>'+esc(userName)+'</div>'+
    '</div>'+
  '</div>'+
  '<h2>'+esc(title)+'</h2>'+
  '<p class="subtitle">تقرير تفصيلي — '+rows.length+' عنصر</p>'+
  '<div class="summary">'+
    '<div class="sum-item"><div class="sum-label">إجمالي العناصر</div><div class="sum-val">'+rows.length+'</div></div>'+
    '<div class="sum-item"><div class="sum-label">القيمة الإجمالية</div><div class="sum-val gold">'+fmt(total)+'</div></div>'+
    '<div class="sum-item"><div class="sum-label">متوسط القيمة</div><div class="sum-val">'+fmt(rows.length?total/rows.length:0)+'</div></div>'+
  '</div>';

  if(chartSVG){
    html+='<div class="chart-wrap"><div class="chart-title">توزيع الحالات</div>'+chartSVG+'</div>';
  }

  html+='<table>'+
  '<thead><tr><th style="width:100px">الرقم</th><th>الموضوع</th><th>المرجع</th><th class="num" style="width:110px">المبلغ</th><th style="width:100px">الحالة</th></tr></thead>'+
  '<tbody>'+rowsHTML+'</tbody></table>'+

  /* Signatures */
  '<div class="signature">'+
    '<div class="sig-box">'+
      '<div class="sig-line"></div>'+
      '<div class="sig-label">مُعتمَد من</div>'+
      '<div class="sig-name">'+esc(b.signer)+'</div>'+
    '</div>'+
    '<div class="sig-box">'+
      '<div class="sig-line"></div>'+
      '<div class="sig-label">التاريخ</div>'+
      '<div class="sig-name">'+dateStr+'</div>'+
    '</div>'+
  '</div>'+

  '<div class="foot">'+
    '<div>'+esc(b.company)+' · '+esc(b.tagline)+'</div>'+
    '<div class="foot-brand">mizan-pearl-nine.vercel.app</div>'+
  '</div>'+
  '<script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script>'+
  '</body></html>';

  var w=window.open('', '_blank');
  if(!w){
    toast('⚠️ اسمح بالنوافذ المنبثقة','warning');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();

  toast('📄 فتح التقرير — احفظه كـ PDF','success');
}

/* ============ INIT ============ */
function init(){
  addExportButton();
  setInterval(addExportButton, 2000);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();

console.log('[MIZAN] PDF export v2 ready — chart, signatures, branding');
})();
