/* ============================================================
   MIZAN — Accounts Module (v2)
   قسم الحسابات والمالية — الفواتير والمدفوعات
   ============================================================ */
(function(){
'use strict';

var state = {
  invoices: [],
  currentTab: 'invoices',
  loading: true,
  error: null
};

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
    return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
  }catch(e){return d;}
}

function statusLabel(s){
  return ({
    'unpaid':'غير مدفوعة',
    'partial':'مدفوعة جزئياً',
    'paid':'مدفوعة',
    'cancelled':'ملغاة'
  })[s] || s || '—';
}

function esc(s){
  if(s===null||s===undefined) return '';
  return String(s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function renderContent(){
  var el = $('acContent');
  if(!el) return;
  if(state.error){
    el.innerHTML = '<div class="ac-empty">⚠️ '+esc(state.error)+'</div>';
    return;
  }
  if(state.loading){
    el.innerHTML = '<div class="ac-loading">جاري التحميل</div>';
    return;
  }
  if(state.currentTab==='invoices'){
    if(!state.invoices.length){
      el.innerHTML = '<div class="ac-empty">لا توجد فواتير بعد<br><small>اضغط + لإضافة فاتورة</small></div>';
      return;
    }
    var html = '';
    state.invoices.forEach(function(inv){
      var statusClass = 'ac-pill-'+(inv.status||'unpaid');
      html += '<div class="ac-inv">';
      html += '<div class="ac-inv-info">';
      html += '<div class="ac-inv-no">'+esc(inv.invoice_no||'بدون رقم')+'</div>';
      html += '<div class="ac-inv-supplier">'+esc(inv.supplier_name||'—')+' · '+esc(fmtDate(inv.invoice_date))+'</div>';
      html += '<div><span class="ac-pill '+statusClass+'">'+esc(statusLabel(inv.status))+'</span></div>';
      html += '</div>';
      html += '<div class="ac-inv-amount">';
      html += '<div class="ac-inv-total">'+esc(fmtAmount(inv.total, inv.currency))+'</div>';
      html += '<div class="ac-inv-currency">'+esc(inv.currency||'')+'</div>';
      html += '</div></div>';
    });
    el.innerHTML = html;
  }else if(state.currentTab==='payments'){
    el.innerHTML = '<div class="ac-empty">💳<br>سجل المدفوعات<br><small>سيُبنى في الجلسة 3</small></div>';
  }else if(state.currentTab==='supplier'){
    el.innerHTML = '<div class="ac-empty">📊<br>كشف حساب الموردين<br><small>سيُبنى في الجلسة 4</small></div>';
  }else if(state.currentTab==='due'){
    el.innerHTML = '<div class="ac-empty">⏰<br>الفواتير المستحقة<br><small>سيُبنى في الجلسة 4</small></div>';
  }
}

function renderKPIs(){
  var sums = {JOD:0, USD:0, EUR:0};
  state.invoices.forEach(function(inv){
    if(inv.status==='paid'||inv.status==='cancelled') return;
    var remaining = Number(inv.total||0) - Number(inv.paid_amount||0);
    if(remaining>0 && sums[inv.currency]!==undefined){
      sums[inv.currency]+=remaining;
    }
  });
  var jodEl = $('kpiJod'), usdEl = $('kpiUsd'), eurEl = $('kpiEur');
  if(jodEl) jodEl.textContent = fmtAmount(sums.JOD,'JOD');
  if(usdEl) usdEl.textContent = fmtAmount(sums.USD,'USD');
  if(eurEl) eurEl.textContent = fmtAmount(sums.EUR,'EUR');
}

async function loadInvoices(){
  console.log('[accounts] waiting for MZN_DB...');
  var tries = 0;
  while((!window.MZN_DB || typeof window.MZN_DB.list !== 'function') && tries < 66){
    await new Promise(function(r){ setTimeout(r, 150); });
    tries++;
  }
  if(!window.MZN_DB || typeof window.MZN_DB.list !== 'function'){
    console.error('[accounts] MZN_DB not available');
    state.loading = false;
    state.error = 'لم يتم تحميل supabase.js — أعد تحميل الصفحة';
    renderContent();
    return;
  }
  console.log('[accounts] MZN_DB found — loading invoices');
  try{
    var data = await window.MZN_DB.list('invoices');
    console.log('[accounts] loaded invoices:', data ? data.length : 0);
    state.invoices = data || [];
  }catch(e){
    console.error('[accounts] error:', e);
    state.invoices = [];
    state.error = 'فشل الاتصال: ' + (e && e.message ? e.message : 'خطأ');
  }
  state.loading = false;
  renderKPIs();
  renderContent();
}

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

function initFab(){
  var fab = $('acFab');
  if(!fab) return;
  fab.addEventListener('click',function(){
    alert('نموذج إضافة فاتورة — سيُبنى في الجلسة 2');
  });
}

function init(){
  console.log('[accounts] init v2');
  initTabs();
  initFab();
  renderContent();
  loadInvoices();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', init);
}else{
  init();
}

window.MZNAccounts = {
  state: state,
  loadInvoices: loadInvoices
};

console.log('[MIZAN] Accounts module v2 ready');
})();
