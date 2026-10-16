/* ============================================================
   MIZAN — Accounts Module (v5)
   الفواتير + المدفوعات + حذف الفواتير
   ============================================================ */
(function(){
'use strict';

var state = {
  invoices: [],
  payments: [],
  currentTab: 'invoices',
  currentInvoice: null,
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

function today(){
  var d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function statusLabel(s){
  return ({'unpaid':'غير مدفوعة','partial':'مدفوعة جزئياً','paid':'مدفوعة','cancelled':'ملغاة'})[s] || s || '—';
}

function methodLabel(m){
  return ({'cash':'نقدي','bank_transfer':'حوالة بنكية','cheque':'شيك','other':'أخرى'})[m] || m || '—';
}

function esc(s){
  if(s===null||s===undefined) return '';
  return String(s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function sb(){ return window.MZN_DB || null; }

/* ===== Global Styles ===== */
function injectGlobalStyles(){
  if($('acGlobalStyle')) return;
  var style = document.createElement('style');
  style.id = 'acGlobalStyle';
  style.textContent = [
    '.acm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:flex-end;justify-content:center;z-index:1000;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
    '.acm-overlay.open{display:flex}',
    '.acm-overlay .acm-body{background:#0E1018;color:#fff;width:100%;max-width:640px;max-height:92vh;overflow-y:auto;border-radius:20px 20px 0 0;padding:20px;padding-bottom:calc(30px + env(safe-area-inset-bottom,0px));animation:acmSlide .25s ease;box-sizing:border-box}',
    '@keyframes acmSlide{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}',
    '.acm-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.08)}',
    '.acm-title{font-size:16px;font-weight:700}',
    '.acm-close{background:transparent;border:none;color:#6A7080;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:8px}',
    '.acm-group{margin-bottom:12px}',
    '.acm-label{display:block;font-size:11px;color:#6A7080;margin-bottom:4px;letter-spacing:.05em}',
    '.acm-input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#fff;font-size:13px;font-family:inherit;box-sizing:border-box}',
    '.acm-input:focus{outline:none;border-color:#C9A961}',
    '.acm-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.acm-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}',
    '.acm-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px;margin-bottom:8px}',
    '.acm-item-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}',
    '.acm-item-num{font-size:10px;color:#6A7080;letter-spacing:.06em}',
    '.acm-item-del{background:transparent;border:none;color:#F0A0B0;font-size:13px;cursor:pointer;padding:2px 6px}',
    '.acm-add{width:100%;padding:10px;border-radius:10px;border:1px dashed rgba(201,169,97,.4);background:transparent;color:#C9A961;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit}',
    '.acm-total{background:rgba(201,169,97,.08);border:1px solid rgba(201,169,97,.25);border-radius:12px;padding:12px;margin-top:12px}',
    '.acm-total-row{display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;color:#6A7080}',
    '.acm-total-row.grand{font-size:15px;font-weight:700;color:#C9A961;margin-top:8px;padding-top:8px;border-top:1px solid rgba(201,169,97,.2)}',
    '.acm-actions{display:flex;gap:10px;margin-top:16px}',
    '.acm-btn{flex:1;padding:12px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;border:none}',
    '.acm-btn-save{background:linear-gradient(135deg,#E8CE8B,#C9A961);color:#08090E}',
    '.acm-btn-cancel{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.1)}',
    '.acm-btn-danger{background:linear-gradient(135deg,#F87171,#DC2626);color:#FFFFFF}',
    '.acm-info{background:rgba(201,169,97,.08);border:1px solid rgba(201,169,97,.2);border-radius:10px;padding:10px;margin-bottom:12px;font-size:12px;color:#C9A961}',
    '.acm-info-row{display:flex;justify-content:space-between;margin-bottom:4px}',
    'body.ac-modal-open .mzn-nav,body.ac-modal-open [class*="bottom-nav"],body.ac-modal-open .ac-fab,body.ac-modal-open #mznThemeBtn{display:none!important}',
    'body.ac-modal-open{overflow:hidden!important}',
    'html[data-theme="light"] .acm-overlay{background:rgba(40,30,10,.5)}',
    'html[data-theme="light"] .acm-overlay .acm-body{background:#FFFFFF;color:#1C1A16}',
    'html[data-theme="light"] .acm-head{border-bottom-color:rgba(60,45,15,.1)}',
    'html[data-theme="light"] .acm-label{color:#5A5446}',
    'html[data-theme="light"] .acm-input{background:#FAF7F0;border-color:rgba(60,45,15,.15);color:#1C1A16}',
    'html[data-theme="light"] .acm-item{background:#FAF7F0;border-color:rgba(60,45,15,.08)}',
    'html[data-theme="light"] .acm-total{background:rgba(201,169,97,.08);border-color:rgba(201,169,97,.3)}',
    'html[data-theme="light"] .acm-total-row{color:#5A5446}',
    'html[data-theme="light"] .acm-total-row.grand{color:#6F520A}',
    'html[data-theme="light"] .acm-btn-cancel{background:#FFFFFF;color:#1C1A16;border-color:rgba(60,45,15,.15)}',
    'html[data-theme="light"] .acm-info{color:#6F520A}'
  ].join('');
  document.head.appendChild(style);
}

/* ===== Invoice Modal ===== */
function injectInvoiceModal(){
  if($('acModal')) return;
  var modal = document.createElement('div');
  modal.id = 'acModal';
  modal.className = 'acm-overlay';
  modal.innerHTML = [
    '<div class="acm-body">',
    '<div class="acm-head">',
    '<div class="acm-title">📄 فاتورة جديدة</div>',
    '<button class="acm-close" type="button">✕</button>',
    '</div>',
    '<div class="acm-group"><label class="acm-label">رقم الفاتورة *</label><input class="acm-input" id="fInvoiceNo" type="text" placeholder="INV-001" lang="en" dir="ltr"></div>',
    '<div class="acm-group"><label class="acm-label">اسم المورد</label><input class="acm-input" id="fSupplier" type="text" placeholder="اسم المورد"></div>',
    '<div class="acm-row">',
    '<div class="acm-group"><label class="acm-label">تاريخ الفاتورة *</label><input class="acm-input" id="fDate" type="date" lang="en-GB" dir="ltr"></div>',
    '<div class="acm-group"><label class="acm-label">تاريخ الاستحقاق</label><input class="acm-input" id="fDue" type="date" lang="en-GB" dir="ltr"></div>',
    '</div>',
    '<div class="acm-group"><label class="acm-label">العملة</label><select class="acm-input" id="fCurrency"><option value="JOD">دينار أردني (JOD)</option><option value="USD">دولار أمريكي (USD)</option><option value="EUR">يورو (EUR)</option></select></div>',
    '<div class="acm-group"><label class="acm-label">البنود</label><div id="fItems"></div><button type="button" class="acm-add" id="fAddItem">+ إضافة بند</button></div>',
    '<div class="acm-total">',
    '<div class="acm-total-row"><span>المجموع الفرعي</span><span id="fSubtotal">0.00</span></div>',
    '<div class="acm-total-row"><span>الضريبة</span><span id="fTax">0.00</span></div>',
    '<div class="acm-total-row grand"><span>الإجمالي</span><span id="fTotal">0.00</span></div>',
    '</div>',
    '<div class="acm-actions">',
    '<button class="acm-btn acm-btn-cancel" type="button" id="fCancel">إلغاء</button>',
    '<button class="acm-btn acm-btn-save" type="button" id="fSave">حفظ الفاتورة</button>',
    '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(modal);
  modal.querySelector('.acm-close').addEventListener('click', closeInvoiceForm);
  $('fCancel').addEventListener('click', closeInvoiceForm);
  $('fSave').addEventListener('click', saveInvoice);
  $('fAddItem').addEventListener('click', function(){ addItem(); });
  modal.addEventListener('click', function(e){ if(e.target === modal) closeInvoiceForm(); });
}

/* ===== Payment Modal ===== */
function injectPaymentModal(){
  if($('acPayModal')) return;
  var modal = document.createElement('div');
  modal.id = 'acPayModal';
  modal.className = 'acm-overlay';
  modal.innerHTML = [
    '<div class="acm-body">',
    '<div class="acm-head">',
    '<div class="acm-title">💳 تسجيل دفعة</div>',
    '<button class="acm-close" type="button">✕</button>',
    '</div>',
    '<div class="acm-info" id="pInfo"></div>',
    '<div class="acm-group"><label class="acm-label">المبلغ *</label><input class="acm-input" id="pAmount" type="number" step="0.01" min="0" placeholder="0.00" lang="en" dir="ltr"></div>',
    '<div class="acm-row">',
    '<div class="acm-group"><label class="acm-label">تاريخ الدفع *</label><input class="acm-input" id="pDate" type="date" lang="en-GB" dir="ltr"></div>',
    '<div class="acm-group"><label class="acm-label">طريقة الدفع</label><select class="acm-input" id="pMethod"><option value="bank_transfer">حوالة بنكية</option><option value="cash">نقدي</option><option value="cheque">شيك</option><option value="other">أخرى</option></select></div>',
    '</div>',
    '<div class="acm-group"><label class="acm-label">المرجع (رقم الحوالة/الشيك)</label><input class="acm-input" id="pRef" type="text" placeholder="T/T-1234" lang="en" dir="ltr"></div>',
    '<div class="acm-actions">',
    '<button class="acm-btn acm-btn-cancel" type="button" id="pCancel">إلغاء</button>',
    '<button class="acm-btn acm-btn-save" type="button" id="pSave">حفظ الدفعة</button>',
    '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(modal);
  modal.querySelector('.acm-close').addEventListener('click', closePaymentForm);
  $('pCancel').addEventListener('click', closePaymentForm);
  $('pSave').addEventListener('click', savePayment);
  modal.addEventListener('click', function(e){ if(e.target === modal) closePaymentForm(); });
}

/* ===== Confirm Delete Modal ===== */
function injectDeleteModal(){
  if($('acDelModal')) return;
  var modal = document.createElement('div');
  modal.id = 'acDelModal';
  modal.className = 'acm-overlay';
  modal.innerHTML = [
    '<div class="acm-body">',
    '<div class="acm-head">',
    '<div class="acm-title">🗑️ حذف الفاتورة</div>',
    '<button class="acm-close" type="button">✕</button>',
    '</div>',
    '<div style="font-size:14px;margin-bottom:8px">هل أنت متأكد من الحذف؟</div>',
    '<div class="acm-info" id="dInfo"></div>',
    '<div style="font-size:11px;color:#F0A0B0;margin-top:8px;line-height:1.6">⚠️ سيتم حذف الفاتورة وكل بنودها ومدفوعاتها نهائياً. لا يمكن التراجع.</div>',
    '<div class="acm-actions">',
    '<button class="acm-btn acm-btn-cancel" type="button" id="dCancel">إلغاء</button>',
    '<button class="acm-btn acm-btn-danger" type="button" id="dConfirm">حذف نهائي</button>',
    '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(modal);
  modal.querySelector('.acm-close').addEventListener('click', closeDeleteForm);
  $('dCancel').addEventListener('click', closeDeleteForm);
  $('dConfirm').addEventListener('click', confirmDelete);
  modal.addEventListener('click', function(e){ if(e.target === modal) closeDeleteForm(); });
}

/* ===== Items ===== */
function addItem(){
  var wrap = $('fItems');
  if(!wrap) return;
  var num = wrap.children.length + 1;
  var div = document.createElement('div');
  div.className = 'acm-item';
  div.innerHTML = [
    '<div class="acm-item-head"><span class="acm-item-num">بند #'+num+'</span><button type="button" class="acm-item-del">حذف</button></div>',
    '<div class="acm-group"><input class="acm-input item-desc" type="text" placeholder="وصف البند"></div>',
    '<div class="acm-row-3">',
    '<input class="acm-input item-qty" type="number" step="0.001" min="0" placeholder="الكمية" value="1" lang="en" dir="ltr">',
    '<input class="acm-input item-price" type="number" step="0.01" min="0" placeholder="السعر" value="0" lang="en" dir="ltr">',
    '<input class="acm-input item-tax" type="number" step="0.01" min="0" max="100" placeholder="ضريبة %" value="0" lang="en" dir="ltr">',
    '</div>'
  ].join('');
  wrap.appendChild(div);
  div.querySelector('.acm-item-del').addEventListener('click', function(){
    div.remove(); renumberItems(); recalcTotals();
  });
  var inputs = div.querySelectorAll('input');
  for(var i=0;i<inputs.length;i++){ inputs[i].addEventListener('input', recalcTotals); }
  recalcTotals();
}

function renumberItems(){
  var wrap = $('fItems');
  if(!wrap) return;
  var items = wrap.querySelectorAll('.acm-item');
  for(var i=0;i<items.length;i++){
    var num = items[i].querySelector('.acm-item-num');
    if(num) num.textContent = 'بند #'+(i+1);
  }
}

function recalcTotals(){
  var wrap = $('fItems');
  if(!wrap) return;
  var subtotal = 0, taxTotal = 0;
  var items = wrap.querySelectorAll('.acm-item');
  for(var i=0;i<items.length;i++){
    var it = items[i];
    var qty = parseFloat(it.querySelector('.item-qty').value) || 0;
    var price = parseFloat(it.querySelector('.item-price').value) || 0;
    var taxRate = parseFloat(it.querySelector('.item-tax').value) || 0;
    var line = qty * price, tax = line * taxRate / 100;
    subtotal += line; taxTotal += tax;
  }
  if($('fSubtotal')) $('fSubtotal').textContent = subtotal.toFixed(2);
  if($('fTax')) $('fTax').textContent = taxTotal.toFixed(2);
  if($('fTotal')) $('fTotal').textContent = (subtotal+taxTotal).toFixed(2);
}

/* ===== Invoice Form ===== */
function openInvoiceForm(){
  var modal = $('acModal');
  if(!modal) return;
  if($('fInvoiceNo')) $('fInvoiceNo').value = '';
  if($('fSupplier')) $('fSupplier').value = '';
  if($('fDate')) $('fDate').value = today();
  if($('fDue')) $('fDue').value = '';
  if($('fCurrency')) $('fCurrency').value = 'JOD';
  if($('fItems')) $('fItems').innerHTML = '';
  addItem();
  modal.classList.add('open');
  document.body.classList.add('ac-modal-open');
}

function closeInvoiceForm(){
  var modal = $('acModal');
  if(modal) modal.classList.remove('open');
  document.body.classList.remove('ac-modal-open');
}

async function saveInvoice(){
  var client = sb();
  if(!client || !client.create){ alert('لا يوجد اتصال بـ Supabase'); return; }
  var invoiceNo = ($('fInvoiceNo').value||'').trim();
  if(!invoiceNo){ alert('رقم الفاتورة مطلوب'); return; }
  var currency = $('fCurrency').value;
  var invDate = $('fDate').value || today();
  var items = [];
  var subtotal = 0, taxTotal = 0;
  var nodes = $('fItems').querySelectorAll('.acm-item');
  for(var i=0;i<nodes.length;i++){
    var it = nodes[i];
    var desc = (it.querySelector('.item-desc').value||'').trim();
    if(!desc) continue;
    var qty = parseFloat(it.querySelector('.item-qty').value) || 0;
    var price = parseFloat(it.querySelector('.item-price').value) || 0;
    var taxRate = parseFloat(it.querySelector('.item-tax').value) || 0;
    var line = qty * price, tax = line * taxRate / 100;
    subtotal += line; taxTotal += tax;
    items.push({ description: desc, qty: qty, unit: 'قطعة', unit_price: price, tax_rate: taxRate, tax_amount: Number(tax.toFixed(2)), line_total: Number(line.toFixed(2)) });
  }
  if(!items.length){ alert('أضف بنداً واحداً على الأقل'); return; }
  var total = subtotal + taxTotal;
  var invoice = {
    invoice_no: invoiceNo,
    supplier_name: ($('fSupplier').value||'').trim() || null,
    invoice_date: invDate,
    due_date: $('fDue').value || null,
    currency: currency,
    subtotal: Number(subtotal.toFixed(2)),
    tax_total: Number(taxTotal.toFixed(2)),
    total: Number(total.toFixed(2)),
    paid_amount: 0,
    status: 'unpaid',
    match_status: 'pending'
  };
  try{
    var result = await client.create('invoices', invoice);
    var invId = (result && result[0] && result[0].id) || null;
    if(!invId){ alert('فشل حفظ الفاتورة'); return; }
    for(var k=0;k<items.length;k++){ items[k].invoice_id = invId; }
    await client.create('invoice_items', items);
    closeInvoiceForm();
    await loadInvoices();
    alert('✅ تم حفظ الفاتورة');
  }catch(e){
    console.error('[accounts] saveInvoice error:', e);
    alert('فشل: ' + (e && e.message ? e.message : 'خطأ'));
  }
}

/* ===== Payment Form ===== */
function openPaymentForm(invoiceId){
  var inv = null;
  for(var i=0;i<state.invoices.length;i++){
    if(String(state.invoices[i].id) === String(invoiceId)){ inv = state.invoices[i]; break; }
  }
  if(!inv){ alert('لم يتم العثور على الفاتورة'); return; }
  if(inv.status === 'paid'){ alert('هذه الفاتورة مدفوعة بالكامل'); return; }
  if(inv.status === 'cancelled'){ alert('هذه الفاتورة ملغاة'); return; }
  state.currentInvoice = inv;
  var remaining = Number(inv.total||0) - Number(inv.paid_amount||0);
  var info = $('pInfo');
  if(info){
    info.innerHTML =
      '<div class="acm-info-row"><span>الفاتورة:</span><span>'+esc(inv.invoice_no||'—')+'</span></div>'+
      '<div class="acm-info-row"><span>الإجمالي:</span><span>'+esc(fmtAmount(inv.total, inv.currency))+'</span></div>'+
      '<div class="acm-info-row"><span>المدفوع:</span><span>'+esc(fmtAmount(inv.paid_amount||0, inv.currency))+'</span></div>'+
      '<div class="acm-info-row" style="font-weight:700"><span>المتبقي:</span><span>'+esc(fmtAmount(remaining, inv.currency))+'</span></div>';
  }
  if($('pAmount')) $('pAmount').value = remaining.toFixed(2);
  if($('pDate')) $('pDate').value = today();
  if($('pMethod')) $('pMethod').value = 'bank_transfer';
  if($('pRef')) $('pRef').value = '';
  $('acPayModal').classList.add('open');
  document.body.classList.add('ac-modal-open');
}

function closePaymentForm(){
  var modal = $('acPayModal');
  if(modal) modal.classList.remove('open');
  document.body.classList.remove('ac-modal-open');
  state.currentInvoice = null;
}

async function savePayment(){
  var client = sb();
  if(!client || !client.create){ alert('لا يوجد اتصال بـ Supabase'); return; }
  var inv = state.currentInvoice;
  if(!inv){ alert('خطأ: لم يتم تحديد الفاتورة'); return; }
  var amount = parseFloat($('pAmount').value) || 0;
  if(amount <= 0){ alert('أدخل مبلغاً صحيحاً'); return; }
  var remaining = Number(inv.total||0) - Number(inv.paid_amount||0);
  if(amount > remaining + 0.01){
    if(!confirm('المبلغ أكبر من المتبقي ('+remaining.toFixed(2)+'). متابعة؟')) return;
  }
  var payment = {
    invoice_id: inv.id,
    amount: Number(amount.toFixed(2)),
    currency: inv.currency,
    payment_date: $('pDate').value || today(),
    method: $('pMethod').value,
    reference: ($('pRef').value||'').trim() || null,
    notes: null
  };
  try{
    await client.create('payments', payment);
    var newPaid = Number(inv.paid_amount||0) + amount;
    var newStatus = 'partial';
    if(newPaid >= Number(inv.total||0) - 0.01) newStatus = 'paid';
    if(newPaid <= 0) newStatus = 'unpaid';
    await client.update('invoices', inv.id, {
      paid_amount: Number(newPaid.toFixed(2)),
      status: newStatus
    });
    closePaymentForm();
    await loadInvoices();
    await loadPayments();
    alert('✅ تم تسجيل الدفعة');
  }catch(e){
    console.error('[accounts] savePayment error:', e);
    alert('فشل: ' + (e && e.message ? e.message : 'خطأ'));
  }
}

/* ===== Delete Invoice ===== */
function openDeleteForm(invoiceId){
  var inv = null;
  for(var i=0;i<state.invoices.length;i++){
    if(String(state.invoices[i].id) === String(invoiceId)){ inv = state.invoices[i]; break; }
  }
  if(!inv){ alert('لم يتم العثور على الفاتورة'); return; }
  state.currentInvoice = inv;
  var info = $('dInfo');
  if(info){
    info.innerHTML =
      '<div class="acm-info-row"><span>الفاتورة:</span><span>'+esc(inv.invoice_no||'—')+'</span></div>'+
      '<div class="acm-info-row"><span>المورد:</span><span>'+esc(inv.supplier_name||'—')+'</span></div>'+
      '<div class="acm-info-row"><span>المبلغ:</span><span>'+esc(fmtAmount(inv.total, inv.currency))+'</span></div>';
  }
  $('acDelModal').classList.add('open');
  document.body.classList.add('ac-modal-open');
}

function closeDeleteForm(){
  var modal = $('acDelModal');
  if(modal) modal.classList.remove('open');
  document.body.classList.remove('ac-modal-open');
  state.currentInvoice = null;
}

async function confirmDelete(){
  var client = sb();
  if(!client || !client.remove){ alert('لا يوجد اتصال بـ Supabase'); return; }
  var inv = state.currentInvoice;
  if(!inv){ alert('خطأ: لم يتم تحديد الفاتورة'); return; }
  try{
    await client.remove('invoices', inv.id);
    var newList = [];
    for(var k=0;k<state.invoices.length;k++){
      if(String(state.invoices[k].id) !== String(inv.id)){
        newList.push(state.invoices[k]);
      }
    }
    state.invoices = newList;
    closeDeleteForm();
    renderKPIs();
    renderContent();
    alert('✅ تم حذف الفاتورة');
  }catch(e){
    console.error('[accounts] deleteInvoice error:', e);
    alert('فشل الحذف: ' + (e && e.message ? e.message : 'خطأ'));
  }
}

/* ===== Render ===== */
function renderContent(){
  var el = $('acContent');
  if(!el) return;
  if(state.error){ el.innerHTML = '<div class="ac-empty">⚠️ '+esc(state.error)+'</div>'; return; }
  if(state.loading){ el.innerHTML = '<div class="ac-loading">جاري التحميل</div>'; return; }
  if(state.currentTab==='invoices'){ el.innerHTML = renderInvoices(); }
  else if(state.currentTab==='payments'){ el.innerHTML = renderPayments(); }
  else if(state.currentTab==='supplier'){ el.innerHTML = '<div class="ac-empty">📊<br>كشف حساب الموردين<br><small>سيُبنى في الجلسة 6</small></div>'; }
  else if(state.currentTab==='due'){ el.innerHTML = '<div class="ac-empty">⏰<br>الفواتير المستحقة<br><small>سيُبنى في الجلسة 6</small></div>'; }
}

function renderInvoices(){
  if(!state.invoices.length){
    return '<div class="ac-empty">لا توجد فواتير بعد<br><small>اضغط + لإضافة فاتورة</small></div>';
  }
  var html = '';
  state.invoices.forEach(function(inv){
    var statusClass = 'ac-pill-'+(inv.status||'unpaid');
    var remaining = Number(inv.total||0) - Number(inv.paid_amount||0);
    html += '<div class="ac-inv" data-id="'+esc(inv.id)+'" style="cursor:pointer;position:relative;padding-left:44px">';
    html += '<button class="ac-del-btn" data-del="'+esc(inv.id)+'" title="حذف" style="position:absolute;top:50%;left:8px;transform:translateY(-50%);background:rgba(240,160,176,.12);border:1px solid rgba(240,160,176,.3);color:#F0A0B0;font-size:14px;cursor:pointer;padding:6px 8px;border-radius:8px;line-height:1">🗑️</button>';
    html += '<div class="ac-inv-info">';
    html += '<div class="ac-inv-no">'+esc(inv.invoice_no||'بدون رقم')+'</div>';
    html += '<div class="ac-inv-supplier">'+esc(inv.supplier_name||'—')+' · '+esc(fmtDate(inv.invoice_date))+'</div>';
    html += '<div><span class="ac-pill '+statusClass+'">'+esc(statusLabel(inv.status))+'</span></div>';
    if(inv.status==='partial'){
      html += '<div style="font-size:10px;color:#6A7080;margin-top:3px">متبقٍ: '+esc(fmtAmount(remaining, inv.currency))+'</div>';
    }
    html += '</div>';
    html += '<div class="ac-inv-amount">';
    html += '<div class="ac-inv-total">'+esc(fmtAmount(inv.total, inv.currency))+'</div>';
    html += '<div class="ac-inv-currency">'+esc(inv.currency||'')+'</div>';
    html += '</div></div>';
  });
  return html;
}

function renderPayments(){
  if(!state.payments.length){
    return '<div class="ac-empty">💳<br>لا توجد مدفوعات بعد<br><small>اضغط على فاتورة لتسجيل دفعة</small></div>';
  }
  var html = '';
  state.payments.forEach(function(p){
    html += '<div class="ac-inv">';
    html += '<div class="ac-inv-info">';
    html += '<div class="ac-inv-no">'+esc(fmtAmount(p.amount, p.currency))+'</div>';
    html += '<div class="ac-inv-supplier">'+esc(methodLabel(p.method))+' · '+esc(fmtDate(p.payment_date))+'</div>';
    if(p.reference){ html += '<div style="font-size:10px;color:#6A7080;margin-top:2px">مرجع: '+esc(p.reference)+'</div>'; }
    html += '</div>';
    html += '<div class="ac-inv-amount" style="text-align:center"><div style="font-size:18px">💳</div></div>';
    html += '</div>';
  });
  return html;
}

function renderKPIs(){
  var sums = {JOD:0, USD:0, EUR:0};
  state.invoices.forEach(function(inv){
    if(inv.status==='paid'||inv.status==='cancelled') return;
    var remaining = Number(inv.total||0) - Number(inv.paid_amount||0);
    if(remaining>0 && sums[inv.currency]!==undefined){ sums[inv.currency]+=remaining; }
  });
  var jodEl = $('kpiJod'), usdEl = $('kpiUsd'), eurEl = $('kpiEur');
  if(jodEl) jodEl.textContent = fmtAmount(sums.JOD,'JOD');
  if(usdEl) usdEl.textContent = fmtAmount(sums.USD,'USD');
  if(eurEl) eurEl.textContent = fmtAmount(sums.EUR,'EUR');
}

async function waitForDB(){
  var tries = 0;
  while((!window.MZN_DB || typeof window.MZN_DB.list !== 'function') && tries < 66){
    await new Promise(function(r){ setTimeout(r, 150); });
    tries++;
  }
  return window.MZN_DB;
}

async function loadInvoices(){
  var db = await waitForDB();
  if(!db || !db.list){
    state.loading = false;
    state.error = 'لم يتم تحميل supabase.js — أعد تحميل الصفحة';
    renderContent();
    return;
  }
  try{
    var data = await db.list('invoices');
    state.invoices = data || [];
  }catch(e){
    console.error('[accounts] loadInvoices error:', e);
    state.invoices = [];
    state.error = 'فشل الاتصال: ' + (e && e.message ? e.message : 'خطأ');
  }
  state.loading = false;
  renderKPIs();
  renderContent();
}

async function loadPayments(){
  var db = await waitForDB();
  if(!db || !db.list) return;
  try{
    var data = await db.list('payments');
    state.payments = data || [];
  }catch(e){
    console.error('[accounts] loadPayments error:', e);
    state.payments = [];
  }
  if(state.currentTab==='payments') renderContent();
}

/* ===== Events ===== */
function initTabs(){
  var tabs = document.querySelectorAll('.ac-tab');
  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      tabs.forEach(function(x){x.classList.remove('active');});
      t.classList.add('active');
      state.currentTab = t.getAttribute('data-tab');
      if(state.currentTab==='payments') loadPayments();
      renderContent();
    });
  });
}

function initFab(){
  var fab = $('acFab');
  if(!fab) return;
  fab.addEventListener('click', openInvoiceForm);
}

function initCardClick(){
  var el = $('acContent');
  if(!el) return;
  el.addEventListener('click', function(e){
    var delBtn = e.target.closest('.ac-del-btn');
    if(delBtn){
      e.stopPropagation();
      e.preventDefault();
      openDeleteForm(delBtn.getAttribute('data-del'));
      return;
    }
    var card = e.target.closest('.ac-inv[data-id]');
    if(card){ openPaymentForm(card.getAttribute('data-id')); }
  });
}

/* ===== Init ===== */
function init(){
  console.log('[accounts] init v5');
  injectGlobalStyles();
  injectInvoiceModal();
  injectPaymentModal();
  injectDeleteModal();
  initTabs();
  initFab();
  initCardClick();
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
  loadInvoices: loadInvoices,
  loadPayments: loadPayments,
  openInvoiceForm: openInvoiceForm,
  openPaymentForm: openPaymentForm,
  openDeleteForm: openDeleteForm
};

console.log('[MIZAN] Accounts module v5 ready');
})();
