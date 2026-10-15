/* ============================================================
   MIZAN — Accounts Module (v1)
   قسم الحسابات والمالية — الفواتير والمدفوعات
   ============================================================ */
(function(){
'use strict';

/* ===== State ===== */
var state = {
  invoices: [],
  payments: [],
  currentTab: 'invoices',
  loading: false,
};

/* ===== Utilities ===== */
function $(id){return document.getElementById(id);}

function fmtAmount(n, currency){
  if(n===null||n===undefined||isNaN(n)) n=0;
  var v = Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  var symbol = currency==='USD'?'$':currency==='EUR'?'€':'د.أ';
  return v + ' ' + symbol;
}

function fmtDate(d){
  if(!d) return '—';
  try{
    var dt = new Date(d);
    var y = dt.getFullYear();
    var m = String(dt.getMonth()+1).padStart(2,'0');
    var day = String(dt.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }catch(e){return d;}
}

function today(){
  var d = new Date();
  var y = d.getFullYear();
  var m = String(d.getMonth()+1).padStart(2,'0');
  var day = String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}

function statusLabel(s){
  return ({
    'unpaid':'غير مدفوعة',
    'partial':'مدفوعة جزئياً',
    'paid':'مدفوعة',
    'cancelled':'ملغاة',
    'pending':'بانتظار المطابقة',
    'matched':'مطابقة',
    'variance':'فرق',
    'unmatched':'غير مطابقة'
  })[s] || s;
}

function esc(s){
  if(s===null||s===undefined) return '';
  return String(s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

/* ===== Supabase Helper ===== */
function sb(){
  return window.MZN_DB || null;
}

/* ===== Load Invoices ===== */
async function loadInvoices(){
  state.loading = true;
  renderContent();
  var client = sb();
  if(!client || !client.list){
    state.invoices = [];
    state.loading = false;
    renderContent();
    return;
  }
  try{
    var data = await client.list('invoices');
    state.invoices = data || [];
  }catch(e){
    console.error('[accounts] loadInvoices error:', e);
    state.invoices = [];
  }
  state.loading = false;
  renderKPIs();
  renderContent();
}

/* ===== KPIs ===== */
function renderKPIs(){
  var sums = {JOD:0, USD:0, EUR:0};
  state.invoices.forEach(function(inv){
    if(inv.status==='paid' || inv.status==='cancelled') return;
    var remaining = Number(inv.total||0) - Number(inv.paid_amount||0);
    if(remaining>0 && sums[inv.currency]!==undefined){
      sums[inv.currency] += remaining;
    }
  });
  var jodEl = $('kpiJod'), usdEl = $('kpiUsd'), eurEl = $('kpiEur');
  if(jodEl) jodEl.textContent = fmtAmount(sums.JOD,'JOD');
  if(usdEl) usdEl.textContent = fmtAmount(sums.USD,'USD');
  if(eurEl) eurEl.textContent = fmtAmount(sums.EUR,'EUR');
}

/* ===== Render Content by Tab ===== */
function renderContent(){
  var el = $('acContent');
  if(!el) return;
  if(state.loading){
    el.innerHTML = '<div class="ac-loading">جاري التحميل</div>';
    return;
  }
  if(state.currentTab==='invoices'){
    el.innerHTML = renderInvoices();
  }else if(state.currentTab==='payments'){
    el.innerHTML = renderPayments();
  }else if(state.currentTab==='supplier'){
    el.innerHTML = renderSupplier();
  }else if(state.currentTab==='due'){
    el.innerHTML = renderDue();
  }
}

/* ===== Tab: Invoices ===== */
function renderInvoices(){
  if(state.invoices.length===0){
    return '<div class="ac-empty">لا توجد فواتير بعد<br><small>اضغط + لإضافة فاتورة</small></div>';
  }
  var html = '';
  state.invoices.forEach(function(inv){
    var statusClass = 'ac-pill-'+(inv.status||'unpaid');
    html += '<div class="ac-inv" data-id="'+esc(inv.id)+'">';
    html += '  <div class="ac-inv-info">';
    html += '    <div class="ac-inv-no">'+esc(inv.invoice_no||'بدون رقم')+'</div>';
    html += '    <div class="ac-inv-supplier">'+esc(inv.supplier_name||'—')+' · '+esc(fmtDate(inv.invoice_date))+'</div>';
    html += '    <div><span class="ac-pill '+statusClass+'">'+esc(statusLabel(inv.status))+'</span></div>';
    html += '  </div>';
    html += '  <div class="ac-inv-amount">';
    html += '    <div class="ac-inv-total">'+esc(fmtAmount(inv.total, inv.currency))+'</div>';
    html += '    <div class="ac-inv-currency">'+esc(inv.currency||'')+'</div>';
    html += '  </div>';
    html += '</div>';
  });
  return html;
}

/* ===== Tab: Payments ===== */
function renderPayments(){
  return '<div class="ac-empty">💳<br>سجل المدفوعات<br><small>سيُبنى في الجلسة 3</small></div>';
}

/* ===== Tab: Supplier ===== */
function renderSupplier(){
  return '<div class="ac-empty">📊<br>كشف حساب الموردين<br><small>سيُبنى في الجلسة 4</small></div>';
}

/* ===== Tab: Due ===== */
function renderDue(){
  return '<div class="ac-empty">⏰<br>الفواتير المستحقة<br><small>سيُبنى في الجلسة 4</small></div>';
}

/* ===== Tab switching ===== */
function initTabs(){
  var tabs = document.querySelectorAll('.ac-tab');
  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      tabs.forEach(function(x){x.classList.remove('active');});
      t.classList.add('active');
      state.currentTab = t.getAttribute('data-tab');
      renderContent();
    });
  });
}

/* ===== FAB — placeholder ===== */
function initFab(){
  var fab = $('acFab');
  if(!fab) return;
  fab.addEventListener('click',function(){
    alert('نموذج إضافة فاتورة — سيُبنى في الجلسة 2');
  });
}

/* ===== Init ===== */
function init(){
  initTabs();
  initFab();
  /* انتظر تحميل supabase.js (MZN_DB) */
  var tries = 0;
  var t = setInterval(function(){
    tries++;
    if((window.MZN_DB && window.MZN_DB.list) || tries>=40){
      clearInterval(t);
      loadInvoices();
    }
  }, 150);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', init);
}else{
  init();
}

/* ===== Expose for future use ===== */
window.MZNAccounts = {
  state: state,
  loadInvoices: loadInvoices,
  renderKPIs: renderKPIs,
  renderContent: renderContent,
  fmtAmount: fmtAmount,
  fmtDate: fmtDate,
  today: today,
  statusLabel: statusLabel,
  esc: esc,
  sb: sb,
};

console.log('[MIZAN] Accounts module v1 ready');
})();
