(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

var STORE='mzn_branding';
var DEFAULTS={
  company: 'MIZAN',
  tagline: 'EXECUTIVE PROCUREMENT',
  logo: 'scale',
  primary: '#C9A961',
  primaryBright: '#E8CE8B',
  copper: '#B87333',
  language: 'ar',
  signer: 'Executive Procurement Officer'
};

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
function reset(){
  try{ localStorage.removeItem(STORE); }catch(e){}
}
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function tone(f,d,v){ if(window.MZN&&MZN.tone) MZN.tone(f,d,'sine',v||0.05); }
function toast(m,t){ if(window.MZN&&MZN.toast) MZN.toast(m,t||'info'); }

var current=load();

/* ============ LOGO PATHS ============ */
var LOGO_PATHS={
  scale: '<path d="M12 3v18M5 8l7-5 7 5M5 8l-2 8h4zM19 8l2 8h-4z"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
};

/* ============ APPLY BRANDING ============ */
function applyBranding(){
  var b=current;
  var style=document.getElementById('mznBrandStyle');
  if(!style){
    style=document.createElement('style');
    style.id='mznBrandStyle';
    document.head.appendChild(style);
  }
  style.textContent=
    ':root{'+
    '--gold:'+b.primary+' !important;'+
    '--gb:'+b.primaryBright+' !important;'+
    '--copper:'+b.copper+' !important;'+
    '}';

  document.querySelectorAll('.logo-text,.brand-title,.logo-brand').forEach(function(el){
    if(el.textContent.trim()==='MIZAN' || el.textContent.trim()==='MIZAN'.toUpperCase()){
      el.textContent=b.company;
    }
  });

  document.querySelectorAll('.tag,.logo-sub,.brand-mark').forEach(function(el){
    var txt=(el.textContent||'').trim();
    if(txt.indexOf('EXECUTIVE PROCUREMENT')!==-1 || txt==='EXECUTIVE PROCUREMENT'){
      el.textContent=b.tagline;
    }
  });

  document.querySelectorAll('.logo-icon svg, .logo-mark svg, .brand-icon svg').forEach(function(svg){
    if(svg.dataset.mznBranded) return;
    svg.dataset.mznBranded='1';
    svg.innerHTML=LOGO_PATHS[b.logo]||LOGO_PATHS.scale;
  });

  if(document.title.indexOf('MIZAN')!==-1){
    document.title=document.title.replace('MIZAN', b.company);
  }
}

/* ============ PUBLIC API ============ */
window.MZN_BRANDING={
  get: function(){ return Object.assign({}, current); },
  set: function(key, val){
    current[key]=val;
    save(current);
    applyBranding();
    return current;
  },
  setAll: function(obj){
    current=Object.assign({}, current, obj);
    save(current);
    applyBranding();
    return current;
  },
  reset: function(){
    reset();
    current=Object.assign({}, DEFAULTS);
    applyBranding();
    return current;
  },
  logoPath: function(key){ return LOGO_PATHS[key]||LOGO_PATHS.scale; },
  defaults: DEFAULTS
};

/* ============ PROFILE EDITOR ============ */
function openProfileEditor(){
  var userName='';
  var userEmail='';
  var userRole='';
  try{
    userName=localStorage.getItem('mzn_user_name')||'';
    userEmail=localStorage.getItem('mzn_user_email')||'procurement@company.com';
    userRole=localStorage.getItem('mzn_user_role')||'المسؤول التنفيذي للمشتريات';
  }catch(e){}

  /* Remove old instance if exists */
  var old=document.getElementById('mznProfileEditor');
  if(old) old.remove();

  var w=document.createElement('div');
  w.id='mznProfileEditor';
  w.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:flex-end;justify-content:center;font-family:"IBM Plex Sans Arabic",sans-serif';
  w.innerHTML=
    '<div class="mzn-prof-bd" style="position:absolute;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)"></div>'+
    '<div style="position:relative;width:100%;max-width:520px;background:linear-gradient(180deg,#0E1018,#08090E);border-radius:24px 24px 0 0;border-top:1px solid rgba(201,169,97,.3);padding:28px 22px 40px;box-shadow:0 -20px 60px rgba(0,0,0,.8);max-height:90vh;overflow-y:auto;animation:mznProfIn .35s cubic-bezier(.16,1,.3,1)">'+
      '<style>@keyframes mznProfIn{from{transform:translateY(100%)}to{transform:translateY(0)}}'+
      '.mzn-prof-h{font-size:19px;color:#E8CE8B;font-weight:400;margin:0 0 6px;font-family:Inter,"IBM Plex Sans Arabic",sans-serif}'+
      '.mzn-prof-sub{font-size:12px;color:#7A8090;margin-bottom:20px;line-height:1.7}'+
      '.mzn-prof-l{display:block;font-size:10.5px;letter-spacing:.15em;color:#4A5060;text-transform:uppercase;font-weight:500;margin:14px 0 6px}'+
      '.mzn-prof-i{width:100%;padding:13px 16px;border-radius:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);color:#EDEDED;font-size:13.5px;font-family:inherit;outline:none;box-sizing:border-box}'+
      '.mzn-prof-i:focus{border-color:rgba(201,169,97,.5);background:rgba(201,169,97,.03)}'+
      '.mzn-prof-x{position:absolute;top:16px;left:16px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.04);border:none;color:#7A8090;cursor:pointer;font-size:14px}'+
      '.mzn-prof-acts{display:flex;gap:12px;margin-top:24px}'+
      '.mzn-prof-save{flex:1;padding:14px 24px;border-radius:99px;background:linear-gradient(135deg,#E8CE8B,#C9A961);color:#08090E;font-weight:600;font-size:13.5px;border:none;cursor:pointer;font-family:inherit;box-shadow:0 10px 30px -8px rgba(201,169,97,.5)}'+
      '.mzn-prof-cancel{padding:14px 22px;border-radius:99px;background:transparent;color:#7A8090;font-size:13px;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-family:inherit}'+
      '.mzn-prof-hint{font-size:10.5px;color:#4A5060;margin-top:16px;line-height:1.7;text-align:center}'+
      '</style>'+
      '<button class="mzn-prof-x" id="mznProfX">✕</button>'+
      '<h3 class="mzn-prof-h">تعديل الملف الشخصي</h3>'+
      '<p class="mzn-prof-sub">ستُحفظ البيانات محلياً في متصفحك.</p>'+
      '<label class="mzn-prof-l">الاسم الكامل</label>'+
      '<input class="mzn-prof-i" id="mznProfName" type="text" value="'+esc(userName)+'" placeholder="مثال: أحمد العمري">'+
      '<label class="mzn-prof-l">البريد الإلكتروني</label>'+
      '<input class="mzn-prof-i" id="mznProfEmail" type="email" value="'+esc(userEmail)+'" placeholder="name@company.com" style="direction:ltr;text-align:left">'+
      '<label class="mzn-prof-l">الدور الوظيفي</label>'+
      '<input class="mzn-prof-i" id="mznProfRole" type="text" value="'+esc(userRole)+'" placeholder="المسؤول التنفيذي للمشتريات">'+
      '<div class="mzn-prof-acts">'+
        '<button class="mzn-prof-save" id="mznProfSave">حفظ التعديلات</button>'+
        '<button class="mzn-prof-cancel" id="mznProfCancel">إلغاء</button>'+
      '</div>'+
      '<p class="mzn-prof-hint">🔒 البيانات تُحفظ في متصفحك فقط. لا تُرفع إلى أي خادم.</p>'+
    '</div>';
  document.body.appendChild(w);

  var close=function(){ w.remove(); };
  w.querySelector('.mzn-prof-bd').addEventListener('click', close);
  document.getElementById('mznProfX').addEventListener('click', close);
  document.getElementById('mznProfCancel').addEventListener('click', close);

  setTimeout(function(){
    var n=document.getElementById('mznProfName');
    if(n) n.focus();
  }, 350);

  document.getElementById('mznProfSave').addEventListener('click', function(){
    var name=(document.getElementById('mznProfName').value||'').trim();
    var email=(document.getElementById('mznProfEmail').value||'').trim();
    var role=(document.getElementById('mznProfRole').value||'').trim();
    if(!name){ toast('⚠️ أدخل الاسم','warning'); tone(330,.15); return; }
    try{
      localStorage.setItem('mzn_user_name', name);
      localStorage.setItem('mzn_user_email', email||'procurement@company.com');
      localStorage.setItem('mzn_user_role', role||'المسؤول التنفيذي للمشتريات');
    }catch(e){}
    tone(880,.12); setTimeout(function(){tone(1174,.15)},90);
    toast('✅ حُفظ الملف الشخصي','success');
    updateProfileUI();
    close();
  });

  ['mznProfName','mznProfEmail','mznProfRole'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.addEventListener('keydown', function(e){
      if(e.key==='Enter') document.getElementById('mznProfSave').click();
    });
  });
}

/* ============ UPDATE PROFILE UI ============ */
function updateProfileUI(){
  var name='';
  var email='procurement@company.com';
  var role='المسؤول التنفيذي للمشتريات';
  try{
    name=localStorage.getItem('mzn_user_name')||'';
    email=localStorage.getItem('mzn_user_email')||email;
    role=localStorage.getItem('mzn_user_role')||role;
  }catch(e){}

  /* Update avatar: show full name or initials */
  document.querySelectorAll('.avatar-lg').forEach(function(el){
    if(!name) return;

    var firstName=name.split(' ')[0] || name;
    var initials=name.split(' ').map(function(s){return s.charAt(0);}).slice(0,2).join('').toUpperCase();

    /* Adapt size to name length */
    var displayText = name;
    var fontSize = '22px';
    var paddingH = '20px';
    var minWidth = '72px';
    var maxWidth = 'calc(100% - 100px)'; /* leave room for notification dot */

    if(name.length <= 2){
      displayText = initials;
      fontSize = '26px';
      paddingH = '0';
      minWidth = '72px';
    } else if(name.length <= 6){
      displayText = name;
      fontSize = '24px';
      paddingH = '16px';
    } else if(name.length <= 10){
      displayText = name;
      fontSize = '20px';
      paddingH = '18px';
    } else if(name.length <= 15){
      displayText = name;
      fontSize = '16px';
      paddingH = '20px';
    } else {
      displayText = name;
      fontSize = '14px';
      paddingH = '22px';
    }

    /* Apply styles */
    el.style.setProperty('width','auto','important');
    el.style.setProperty('height','auto','important');
    el.style.setProperty('min-width', minWidth, 'important');
    el.style.setProperty('min-height','72px','important');
    el.style.setProperty('max-width', maxWidth, 'important');
    el.style.setProperty('padding', '18px ' + paddingH, 'important');
    el.style.setProperty('border-radius','20px','important');
    el.style.setProperty('font-size', fontSize, 'important');
    el.style.setProperty('font-weight','500','important');
    el.style.setProperty('letter-spacing','0.02em','important');
    el.style.setProperty('white-space','nowrap','important');
    el.style.setProperty('overflow','hidden','important');
    el.style.setProperty('text-overflow','ellipsis','important');
    el.style.setProperty('display','flex','important');
    el.style.setProperty('align-items','center','important');
    el.style.setProperty('justify-content','center','important');
    el.style.setProperty('line-height','1.2','important');
    el.textContent = displayText;
    el.setAttribute('title', name);
  });

  /* Update role and email */
  document.querySelectorAll('p').forEach(function(p){
    var txt=p.textContent||'';
    if(txt.indexOf('المسؤول التنفيذي للمشتريات')!==-1){
      p.textContent=role;
      if(name) p.setAttribute('title', name);
    } else if(txt.indexOf('procurement@company.com')!==-1){
      p.textContent=email;
    }
  });

  if(name){
    try{ localStorage.setItem('mzn_auth', name); }catch(e){}
  }
}
/* ============ HOOK EDIT BUTTON ============ */
function hookEditButton(){
  if(window.location.pathname.indexOf('mizan-settings')===-1) return;

  var btns=document.querySelectorAll('button, a');
  btns.forEach(function(b){
    if(b.dataset.mznProfHooked) return;
    if(b.classList.contains('mzn-edit-new')) return;
    var txt=(b.textContent||'').trim();
    if(txt==='تعديل الملف' || txt.indexOf('تعديل الملف')!==-1){
      b.dataset.mznProfHooked='1';
      b.removeAttribute('onclick');
      b.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        tone(660,.08);
        openProfileEditor();
      }, true);
    }
  });
}

/* ============ HIDE OLD BUTTON + REPLACE ============ */
function hideOldEditButton(){
  if(window.location.pathname.indexOf('mizan-settings')===-1) return;

  /* Hide old button */
  document.querySelectorAll('button, a, .btn-outline').forEach(function(b){
    var txt=(b.textContent||'').trim();
    if((txt==='تعديل الملف' || txt.indexOf('تعديل الملف')!==-1) && !b.classList.contains('mzn-edit-new')){
      b.style.setProperty('display','none','important');
    }
  });

  /* Fix profile row layout */
  var profileRow=document.querySelector('.profile-head');
  if(!profileRow) return;

  profileRow.style.setProperty('display','flex','important');
  profileRow.style.setProperty('flex-wrap','wrap','important');
  profileRow.style.setProperty('gap','14px','important');
  profileRow.style.setProperty('align-items','center','important');
  profileRow.style.setProperty('padding','24px 0','important');
  profileRow.style.setProperty('width','100%','important');
  profileRow.style.setProperty('box-sizing','border-box','important');
  profileRow.style.setProperty('overflow','visible','important');

  var avatar=profileRow.querySelector('.avatar-lg');
  if(avatar) avatar.style.setProperty('flex-shrink','0','important');

  var info=profileRow.querySelector('.flex-1');
  if(info){
    info.style.setProperty('min-width','0','important');
    info.style.setProperty('flex','1 1 auto','important');
  }

  /* Add new button if not exists */
  if(!profileRow.querySelector('.mzn-edit-new')){
    var newBtn=document.createElement('button');
    newBtn.className='mzn-edit-new';
    newBtn.style.cssText='background:transparent;border:1px solid rgba(201,169,97,.35);color:#E8CE8B;font-family:inherit;font-size:11.5px;padding:9px 16px;border-radius:99px;cursor:pointer;transition:all .25s ease;letter-spacing:.03em;flex-shrink:0;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;-webkit-tap-highlight-color:rgba(201,169,97,.25);font-weight:500';
    newBtn.innerHTML=
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none">'+
      '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>'+
      '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'+
      '</svg><span style="pointer-events:none">تعديل الملف</span>';

    newBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      tone(660,.08);
      openProfileEditor();
    }, true);
    newBtn.addEventListener('touchstart', function(){
      newBtn.style.background='rgba(201,169,97,.12)';
    }, {passive:true});
    newBtn.addEventListener('touchend', function(){
      setTimeout(function(){ newBtn.style.background='transparent'; }, 200);
    }, {passive:true});

    profileRow.appendChild(newBtn);
  }
}

/* ============ INIT ============ */
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', applyBranding);
} else {
  applyBranding();
}
setTimeout(applyBranding, 1000);
setTimeout(applyBranding, 2500);

setTimeout(updateProfileUI, 1200);
setTimeout(hookEditButton, 1500);
setTimeout(hideOldEditButton, 1600);
setInterval(hookEditButton, 2500);
setInterval(hideOldEditButton, 3000);

console.log('[MIZAN] Branding v2 ready —', current.company);
})();
