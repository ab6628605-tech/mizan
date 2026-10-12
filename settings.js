(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

var STORE='mzn_settings';

/* ============ DEFAULTS ============ */
var DEFAULTS={
  /* Company */
  company: "Sai'd Nofal & Sons for Import & Exports",
  address: 'Amman - Summaya Str. No. 2008',
  phone: '+962781626866',
  email: 'saidd.nofal@gmail.com',
  vat: '',
  cr: '',
  logo: '',

  /* Alerts */
  alertSmall: 10000,
  alertLarge: 100000,
  alertTeam: 500000,

  /* Sound */
  soundMaster: true,
  soundNewOffer: 'bell',
  soundAnalysis: 'chime',
  soundUrgent: 'alert',
  soundVolume: 60,

  /* WhatsApp */
  waConnected: false,
  waNumber: '',
  waNotifyOffer: true,
  waNotifyAnalysis: true,
  waNotifyAnomaly: true,
  waVoiceSummary: false,
  waDND: 'evening',

  /* Assistant */
  aiLang: 'ar',
  aiStyle: 'balanced',
  aiSensitivity: 65,
  aiAutoSuggest: true,
  aiNegotiation: true,

  /* Appearance */
  theme: 'auto',
  fontSize: 'default',
  animations: true
};

/* ============ STORAGE ============ */
function load(){
  try{
    var raw=localStorage.getItem(STORE);
    if(!raw) return Object.assign({}, DEFAULTS);
    var d=JSON.parse(raw);
    return Object.assign({}, DEFAULTS, d);
  }catch(e){ return Object.assign({}, DEFAULTS); }
}
function save(data){
  try{ localStorage.setItem(STORE, JSON.stringify(data)); }catch(e){}
}
function get(k){
  var d=load();
  return d[k];
}
function set(k, v){
  var d=load();
  d[k]=v;
  save(d);
  applySetting(k, v);
  /* Fire event for other modules */
  try{
    window.dispatchEvent(new CustomEvent('mzn-setting-changed', {detail:{key:k, value:v}}));
  }catch(e){}
}

/* ============ APPLY SETTING ============ */
function applySetting(k, v){
  switch(k){
    case 'soundMaster':
      if(window.MZN && MZN.soundEnabled !== undefined){
        /* Try to update */
      }
      if(!v && window.MZN && MZN.tone){
        /* Disable tones temporarily */
      }
      break;
    case 'theme':
      applyTheme(v);
      break;
    case 'fontSize':
      applyFontSize(v);
      break;
    case 'animations':
      applyAnimations(v);
      break;
  }
}

/* ============ THEME ============ */
function applyTheme(theme){
  /* المحرك المركزي في theme.js (متغيرات CSS) — لا تعديلات !important بعد الآن */
  if(window.MZNTheme){ window.MZNTheme.apply(theme); }
  else { document.documentElement.setAttribute('data-mzn-theme', theme); }
}

/* ============ FONT SIZE ============ */
function applyFontSize(size){
  var html=document.documentElement;
  html.setAttribute('data-mzn-font', size);
  var existing=document.getElementById('mznFontStyle');
  if(!existing){
    existing=document.createElement('style');
    existing.id='mznFontStyle';
    document.head.appendChild(existing);
  }
  var scale = size==='small' ? '0.9' : size==='large' ? '1.1' : '1';
  existing.textContent='html[data-mzn-font="'+size+'"]{font-size:'+(16*parseFloat(scale))+'px}';
}

/* ============ ANIMATIONS ============ */
function applyAnimations(enabled){
  var existing=document.getElementById('mznAnimStyle');
  if(!existing){
    existing=document.createElement('style');
    existing.id='mznAnimStyle';
    document.head.appendChild(existing);
  }
  existing.textContent = enabled ? '' :
    '*{animation-duration:0s !important;transition-duration:0s !important}';
}

/* ============ APPLY ALL ON LOAD ============ */
function applyAll(){
  var d=load();
  applyTheme(d.theme);
  applyFontSize(d.fontSize);
  applyAnimations(d.animations);
}

/* ============ RENDER SETTINGS UI ============ */
function renderCompanySection(){
  var anchor=document.querySelector('section.mb-16');
  if(!anchor) return;
  if(document.getElementById('mznCompanySection')) return;

  var sec=document.createElement('section');
  sec.id='mznCompanySection';
  sec.className='mb-16';
  sec.innerHTML=
    '<p class="section-title">بيانات الشركة</p>'+
    '<p class="section-desc">تظهر هذه البيانات في أعلى كل أمر شراء وتقرير.</p>'+

    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">اسم الشركة</p>'+
        '<p class="setting-hint">الاسم الرسمي الكامل</p>'+
      '</div>'+
      '<input type="text" class="input-min" id="mznSetCompany" style="max-width:260px">'+
    '</div>'+

    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">العنوان</p>'+
        '<p class="setting-hint">عنوان المقر الرئيسي</p>'+
      '</div>'+
      '<input type="text" class="input-min" id="mznSetAddress" style="max-width:260px">'+
    '</div>'+

    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">الهاتف</p>'+
        '<p class="setting-hint">رقم التواصل الرسمي</p>'+
      '</div>'+
      '<input type="tel" class="input-min" id="mznSetPhone" style="max-width:200px;direction:ltr;text-align:left">'+
    '</div>'+

    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">البريد الإلكتروني</p>'+
        '<p class="setting-hint">البريد الرسمي للشركة</p>'+
      '</div>'+
      '<input type="email" class="input-min" id="mznSetEmail" style="max-width:260px;direction:ltr;text-align:left">'+
    '</div>'+

    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">الرقم الضريبي (VAT)</p>'+
        '<p class="setting-hint">رقم التسجيل الضريبي</p>'+
      '</div>'+
      '<input type="text" class="input-min" id="mznSetVat" placeholder="اتركه فارغاً إن لم يوجد" style="max-width:200px;direction:ltr;text-align:left">'+
    '</div>'+

    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">السجل التجاري (CR)</p>'+
        '<p class="setting-hint">رقم السجل التجاري</p>'+
      '</div>'+
      '<input type="text" class="input-min" id="mznSetCr" placeholder="اتركه فارغاً إن لم يوجد" style="max-width:200px;direction:ltr;text-align:left">'+
    '</div>';
  anchor.parentElement.insertBefore(sec, anchor);

  /* Fill values */
  sec.querySelector('#mznSetCompany').value=get('company');
  sec.querySelector('#mznSetAddress').value=get('address');
  sec.querySelector('#mznSetPhone').value=get('phone');
  sec.querySelector('#mznSetEmail').value=get('email');
  sec.querySelector('#mznSetVat').value=get('vat');
  sec.querySelector('#mznSetCr').value=get('cr');

  /* Bind changes */
  ['Company','Address','Phone','Email','Vat','Cr'].forEach(function(id){
    var el=sec.querySelector('#mznSet'+id);
    if(!el) return;
    el.addEventListener('input', function(){
      set(id.toLowerCase(), el.value);
      if(window.MZN && MZN.toast) MZN.toast('✅ حُفظ', 'success');
    });
  });
}

/* ============ MANDATORY APPROVAL SECTION ============ */
function renderMandatorySection(){
  var anchor=document.querySelector('section.mb-16');
  if(!anchor) return;
  if(document.getElementById('mznMandatorySection')) return;

  var sec=document.createElement('section');
  sec.id='mznMandatorySection';
  sec.className='mb-16';
  sec.innerHTML=
    '<p class="section-title" style="color:var(--gb)">🔒 الموافقة الإلزامية</p>'+
    '<p class="section-desc">قاعدة ثابتة في النظام — لا يمكن تعطيلها أو تجاوزها.</p>'+

    '<div class="setting-row" style="background:linear-gradient(135deg,rgba(201,169,97,.06),rgba(201,169,97,.01));border:1px solid rgba(201,169,97,.2);border-radius:16px;padding:20px;flex-direction:column;align-items:stretch;gap:12px">'+
      '<div style="display:flex;align-items:center;gap:12px">'+
        '<div style="width:36px;height:36px;border-radius:50%;background:rgba(110,231,160,.12);border:1px solid rgba(110,231,160,.3);display:flex;align-items:center;justify-content:center;color:var(--em);flex-shrink:0">'+
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'+
        '</div>'+
        '<p style="font-size:14px;color:var(--em);font-weight:500;margin:0">مفعّلة دائماً</p>'+
      '</div>'+
      '<p style="font-size:12.5px;color:var(--td);line-height:1.8;margin:0">'+
        'لا يُصدر MIZAN أي أمر شراء — مهما كان مبلغه — دون موافقتك الصريحة.<br>'+
        'حتى لو كان المبلغ <b style="color:var(--gb)">$1</b>، القرار النهائي لك وحدك.<br>'+
        'لا يوجد حد أدنى للموافقة، ولا مرور تلقائي.'+
      '</p>'+
      '<div style="display:flex;gap:16px;font-size:11px;color:var(--tm);padding-top:8px;border-top:1px solid rgb(var(--w) / calc(.05 * var(--wk)))">'+
        '<span>🔒 غير قابل للتعطيل</span>'+
        '<span>🔒 غير قابل للتجاوز</span>'+
        '<span>🔒 بنية النظام</span>'+
      '</div>'+
    '</div>'+

    '<p class="section-title" style="margin-top:24px">🔔 مستويات التنبيه</p>'+
    '<p class="section-desc">اختيارية — لتخصيص شدة التنبيه حسب المبلغ.</p>'+

    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">تنبيه عادي</p>'+
        '<p class="setting-hint">إشعار خفيف للمبالغ الصغيرة</p>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<span style="font-size:12px;color:var(--td)">$</span>'+
        '<input type="number" class="input-min" id="mznSetAlertSmall" style="max-width:120px;text-align:left;direction:ltr">'+
      '</div>'+
    '</div>'+

    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">تنبيه مكثّف</p>'+
        '<p class="setting-hint">إشعار قوي + اهتزاز للمبالغ الكبيرة</p>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<span style="font-size:12px;color:var(--td)">$</span>'+
        '<input type="number" class="input-min" id="mznSetAlertLarge" style="max-width:120px;text-align:left;direction:ltr">'+
      '</div>'+
    '</div>'+

    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">إشعار الفريق</p>'+
        '<p class="setting-hint">إرسال إشعار لكل الفريق عند هذا المبلغ</p>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<span style="font-size:12px;color:var(--td)">$</span>'+
        '<input type="number" class="input-min" id="mznSetAlertTeam" style="max-width:120px;text-align:left;direction:ltr">'+
      '</div>'+
    '</div>';
  anchor.parentElement.insertBefore(sec, anchor);

  sec.querySelector('#mznSetAlertSmall').value=get('alertSmall');
  sec.querySelector('#mznSetAlertLarge').value=get('alertLarge');
  sec.querySelector('#mznSetAlertTeam').value=get('alertTeam');

  ['Small','Large','Team'].forEach(function(id){
    var el=sec.querySelector('#mznSetAlert'+id);
    if(!el) return;
    el.addEventListener('input', function(){
      set('alert'+id, parseInt(el.value)||0);
      if(window.MZN && MZN.toast) MZN.toast('✅ حُفظ', 'success');
    });
  });
}

/* ============ HOOK EXISTING SETTINGS ============ */
function hookExistingSettings(){
  /* Sound master */
  document.querySelectorAll('.toggle').forEach(function(t){
    if(t.dataset.mznHooked) return;
    t.dataset.mznHooked='1';
    /* Find context */
    var row=t.closest('.setting-row');
    var nameEl=row && row.querySelector('.setting-name');
    var name=nameEl ? nameEl.textContent.trim() : '';
    var key=null;
    if(name.indexOf('الصوت العام')!==-1) key='soundMaster';
    else if(name.indexOf('إشعار وصول')!==-1) key='waNotifyOffer';
    else if(name.indexOf('إشعار اكتمال')!==-1) key='waNotifyAnalysis';
    else if(name.indexOf('العروض الشاذة')!==-1) key='waNotifyAnomaly';
    else if(name.indexOf('ملخص صوتي')!==-1) key='waVoiceSummary';
    else if(name.indexOf('الاقتراح التلقائي')!==-1) key='aiAutoSuggest';
    else if(name.indexOf('تنبيهات التفاوض')!==-1) key='aiNegotiation';
    else if(name.indexOf('الحركات')!==-1) key='animations';
    if(!key) return;
    /* Set initial state */
    var cur=get(key);
    if(cur) t.classList.add('on'); else t.classList.remove('on');
    t.addEventListener('click', function(){
      var on=t.classList.contains('on');
      set(key, on);
    });
  });

  /* Select dropdowns */
  document.querySelectorAll('select.select-min').forEach(function(s){
    if(s.dataset.mznHooked) return;
    s.dataset.mznHooked='1';
    var row=s.closest('.setting-row');
    var nameEl=row && row.querySelector('.setting-name');
    var name=nameEl ? nameEl.textContent.trim() : '';
    var key=null;
    if(name.indexOf('نغمة وصول')!==-1) key='soundNewOffer';
    else if(name.indexOf('نغمة اكتمال')!==-1) key='soundAnalysis';
    else if(name.indexOf('تنبيه عاجل')!==-1) key='soundUrgent';
    if(!key) return;
    s.addEventListener('change', function(){
      set(key, s.options[s.selectedIndex].text);
      if(window.MZN && MZN.toast) MZN.toast('✅ حُفظ', 'success');
    });
  });

  /* Sliders */
  document.querySelectorAll('input[type="range"]').forEach(function(r){
    if(r.dataset.mznHooked) return;
    r.dataset.mznHooked='1';
    var row=r.closest('.setting-row');
    var nameEl=row && row.querySelector('.setting-name');
    var name=nameEl ? nameEl.textContent.trim() : '';
    var key=null;
    if(name.indexOf('مستوى الصوت')!==-1) key='soundVolume';
    else if(name.indexOf('حساسية')!==-1) key='aiSensitivity';
    if(!key) return;
    r.addEventListener('input', function(){
      set(key, parseInt(r.value));
    });
  });

  /* WhatsApp number */
  var waNum=document.getElementById('waNumber');
  if(waNum && !waNum.dataset.mznHooked){
    waNum.dataset.mznHooked='1';
    waNum.value=get('waNumber')||'';
    waNum.addEventListener('input', function(){
      set('waNumber', waNum.value);
    });
  }

  /* Choice groups */
  document.querySelectorAll('.choice-group').forEach(function(g){
    if(g.dataset.mznHooked) return;
    g.dataset.mznHooked='1';
    var row=g.closest('.setting-row');
    var nameEl=row && row.querySelector('.setting-name');
    var name=nameEl ? nameEl.textContent.trim() : '';
    var key=null;
    if(name.indexOf('عدم الإزعاج')!==-1) key='waDND';
    else if(name.indexOf('لغة المساعد')!==-1) key='aiLang';
    else if(name.indexOf('أسلوب الردود')!==-1) key='aiStyle';
    else if(name.indexOf('الوضع')!==-1 || name.indexOf('المظهر')!==-1) key='theme';
    else if(name.indexOf('حجم الخط')!==-1) key='fontSize';
    if(!key) return;
    /* Initial */
    var cur=get(key);
    g.querySelectorAll('.choice').forEach(function(c){
      var t=c.textContent.trim();
      var match = (cur==='light' && t.indexOf('فاتح')!==-1) ||
                  (cur==='dark' && t.indexOf('داكن')!==-1) ||
                  (cur==='auto' && t.indexOf('تلقائي')!==-1) ||
                  (cur==='ar' && t.indexOf('العربية')!==-1) ||
                  (cur==='en' && t.indexOf('English')!==-1) ||
                  (cur==='balanced' && t.indexOf('متوازن')!==-1) ||
                  (cur==='brief' && t.indexOf('موجز')!==-1) ||
                  (cur==='detailed' && t.indexOf('مفصّل')!==-1) ||
                  (cur==='small' && t.indexOf('صغير')!==-1) ||
                  (cur==='default' && t.indexOf('افتراضي')!==-1) ||
                  (cur==='large' && t.indexOf('كبير')!==-1);
      if(match) c.classList.add('active'); else c.classList.remove('active');
    });
    /* Hook clicks */
    g.querySelectorAll('.choice').forEach(function(c){
      c.addEventListener('click', function(){
        g.querySelectorAll('.choice').forEach(function(x){x.classList.remove('active')});
        c.classList.add('active');
        var t=c.textContent.trim();
        var v=null;
        if(t.indexOf('داكن')!==-1) v='dark';
        else if(t.indexOf('فاتح')!==-1) v='light';
        else if(t.indexOf('تلقائي')!==-1) v='auto';
        else if(t.indexOf('العربية')!==-1) v='ar';
        else if(t.indexOf('English')!==-1) v='en';
        else if(t.indexOf('موجز')!==-1) v='brief';
        else if(t.indexOf('متوازن')!==-1) v='balanced';
        else if(t.indexOf('مفصّل')!==-1) v='detailed';
        else if(t.indexOf('صغير')!==-1) v='small';
        else if(t.indexOf('افتراضي')!==-1) v='default';
        else if(t.indexOf('كبير')!==-1) v='large';
        else if(t.indexOf('مساءً')!==-1 || t.indexOf('الليل')!==-1 || t.indexOf('مخصص')!==-1) v=t;
        if(v) set(key, v);
      });
    });
  });

  /* Reset button */
  var resetBtn=document.querySelector('button[onclick*="resetAll"]');
  if(resetBtn && !resetBtn.dataset.mznHooked){
    resetBtn.dataset.mznHooked='1';
    resetBtn.removeAttribute('onclick');
    resetBtn.addEventListener('click', function(e){
      e.preventDefault();
      if(!confirm('إعادة تعيين كل الإعدادات إلى الوضع الافتراضي؟')) return;
      try{ localStorage.removeItem(STORE); }catch(err){}
      location.reload();
    });
  }
}

/* ============ INIT ============ */
function init(){
  applyAll();
  /* Only on settings page */
  if(path.indexOf('mizan-settings')===-1) return;
  renderCompanySection();
  renderMandatorySection();
  setTimeout(hookExistingSettings, 800);
  setInterval(hookExistingSettings, 2500);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();

/* Re-apply after other scripts load */
setTimeout(applyAll, 1000);
setTimeout(applyAll, 2500);

/* ============ PUBLIC API ============ */
window.MZN_SETTINGS={
  get: get,
  set: set,
  all: load,
  defaults: DEFAULTS,
  applyAll: applyAll
};

console.log('[MIZAN] Settings ready');
})();
