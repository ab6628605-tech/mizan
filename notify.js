(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

var POLL_MS=30000;          /* 30 seconds */
var SEEN_KEY='mzn_seen_ids'; /* localStorage: latest seen ids */
var PERM_KEY='mzn_notify_perm'; /* granted | denied | dismissed */
var ENABLED_KEY='mzn_notify_on';

function tone(f,d,v){ if(window.MZN&&MZN.tone) MZN.tone(f,d,'sine',v||0.05); }
function toast(m,t){ if(window.MZN&&MZN.toast) MZN.toast(m,t||'info'); }
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ============ PERMISSION STATE ============ */
function getPermState(){
  try{ return localStorage.getItem(PERM_KEY)||''; }catch(e){ return ''; }
}
function setPermState(s){ try{ localStorage.setItem(PERM_KEY,s); }catch(e){} }
function isEnabled(){
  try{ return localStorage.getItem(ENABLED_KEY)==='1'; }catch(e){ return false; }
}
function setEnabled(v){ try{ localStorage.setItem(ENABLED_KEY, v?'1':'0'); }catch(e){} }

/* ============ ASK PERMISSION ============ */
function askPermission(){
  if(!('Notification' in window)){
    toast('⚠️ متصفحك لا يدعم الإشعارات','warning');
    return;
  }
  if(Notification.permission==='granted'){
    setPermState('granted');
    setEnabled(true);
    toast('✅ الإشعارات مفعّلة','success');
    sendTestNotification();
    return;
  }
  if(Notification.permission==='denied'){
    showDeniedHelp();
    return;
  }
  Notification.requestPermission().then(function(p){
    if(p==='granted'){
      setPermState('granted');
      setEnabled(true);
      tone(880,.12); setTimeout(function(){tone(1174,.15)},80);
      toast('✅ الإشعارات مفعّلة','success');
      sendTestNotification();
    } else {
      setPermState('denied');
      setEnabled(false);
      toast('⚠️ تم رفض الإذن','warning');
    }
  });
}

/* ============ SHOW DENIED HELP ============ */
function showDeniedHelp(){
  var w=document.createElement('div');
  w.id='mznPermHelp';
  w.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.9);backdrop-filter:blur(8px);font-family:"IBM Plex Sans Arabic",sans-serif';
  w.innerHTML=
    '<div style="background:linear-gradient(180deg,#0E1018,#08090E);border:1px solid rgba(201,169,97,.3);border-radius:20px;padding:28px 24px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.8)">'+
      '<div style="width:56px;height:56px;margin:0 auto 16px;border-radius:50%;background:rgba(240,196,116,.12);border:1px solid rgba(240,196,116,.3);display:flex;align-items:center;justify-content:center;color:#F0C474"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>'+
      '<h3 style="color:#E8CE8B;font-size:17px;font-weight:400;margin:0 0 10px">الإشعارات محظورة</h3>'+
      '<p style="color:#7A8090;font-size:12.5px;line-height:1.8;margin:0 0 18px">لتفعيل الإشعارات، افتح إعدادات Chrome:<br><br>⋮ القائمة ← الإعدادات ← إعدادات الموقع ← الإشعارات ← اسمح بـ mizan-pearl-nine.vercel.app</p>'+
      '<button id="mznCloseHelp" style="padding:12px 32px;border-radius:99px;background:linear-gradient(135deg,#E8CE8B,#C9A961);color:#08090E;font-weight:600;font-size:13px;border:none;cursor:pointer;font-family:inherit">فهمت</button>'+
    '</div>';
  document.body.appendChild(w);
  var btn=w.querySelector('#mznCloseHelp');
  btn.addEventListener('click', function(){ w.remove(); });
  w.addEventListener('click', function(e){ if(e.target===w) w.remove(); });
}

/* ============ TEST NOTIFICATION ============ */
function sendTestNotification(){
  setTimeout(function(){
    if(!isEnabled()) return;
    if(Notification.permission!=='granted') return;
    try{
      var n=new Notification('MIZAN · الإشعارات جاهزة', {
        body:'ستصلك تنبيهات عند أي جديد',
        icon:'icon.svg',
        badge:'icon.svg',
        tag:'mzn-test',
        silent:false
      });
      setTimeout(function(){ try{ n.close(); }catch(e){} }, 6000);
      if(navigator.vibrate) navigator.vibrate([30,50,30]);
    }catch(e){ console.warn('[MIZAN] Notify test failed', e); }
  }, 2000);
}

/* ============ SEND REAL NOTIFICATION ============ */
function pushNotify(title, body, tag){
  if(!isEnabled()) return;
  if(!('Notification' in window)) return;
  if(Notification.permission!=='granted') return;
  try{
    var n=new Notification(title, {
      body:body,
      icon:'icon.svg',
      badge:'icon.svg',
      tag:tag||('mzn-'+Date.now()),
      renotify:true,
      requireInteraction:false
    });
    n.onclick=function(){
      try{ window.focus(); n.close(); }catch(e){}
      if(window.location.pathname.indexOf('mizan-pr')===-1){
        window.location.href='mizan-pr.html';
      }
    };
    setTimeout(function(){ try{ n.close(); }catch(e){} }, 12000);
    if(navigator.vibrate) navigator.vibrate([60,40,60]);
    tone(880,.1); setTimeout(function(){tone(1174,.12)},80);
  }catch(e){ console.warn('[MIZAN] Push failed', e); }
}

/* ============ SEEN IDS ============ */
function getSeen(){
  try{ return JSON.parse(localStorage.getItem(SEEN_KEY))||{}; }
  catch(e){ return {}; }
}
function setSeen(data){
  try{ localStorage.setItem(SEEN_KEY, JSON.stringify(data)); }catch(e){}
}

/* ============ POLL SUPABASE ============ */
var polling=false;
function poll(){
  if(polling) return;
  if(!window.MZN_DB) return;
  if(!isEnabled()) return;
  if(Notification.permission!=='granted') return;
  if(document.hidden){
    /* Continue polling even hidden */
  }
  polling=true;

  var tables=[
    {key:'prs', table:'prs', label:'طلب شراء'},
    {key:'pos', table:'pos', label:'أمر شراء'},
    {key:'grns', table:'grns', label:'سند استلام'}
  ];

  var seen=getSeen();
  var toNotify=[];

  var promises=tables.map(function(t){
    return window.MZN_DB.list(t.table).then(function(items){
      if(!items || !Array.isArray(items)) return;
      var lastKey='last_'+t.key;
      var lastTime=seen[lastKey]||0;

      items.forEach(function(item){
        var itemTime=0;
        try{ itemTime=new Date(item.created_at).getTime()||0; }catch(e){}
        if(itemTime>lastTime && lastTime>0){
          /* New item since last poll */
          toNotify.push({
            title:'🔔 جديد: '+t.label,
            body:(item.code||item.id||'')+' · '+((item.title||'').slice(0,60)),
            tag:'mzn-'+t.key+'-'+itemTime
          });
        }
        if(itemTime>lastTime) lastTime=itemTime;
      });

      /* First poll: just record, don't notify */
      if(!seen['init_'+t.key]){
        var maxTime=0;
        items.forEach(function(item){
          try{
            var tt=new Date(item.created_at).getTime()||0;
            if(tt>maxTime) maxTime=tt;
          }catch(e){}
        });
        seen[lastKey]=maxTime;
        seen['init_'+t.key]=true;
      } else {
        seen[lastKey]=lastTime;
      }
    }).catch(function(){});
  });

  Promise.all(promises).then(function(){
    setSeen(seen);
    /* Notify (max 3 at once) */
    toNotify.slice(0,3).forEach(function(n, i){
      setTimeout(function(){
        pushNotify(n.title, n.body, n.tag);
      }, i*800);
    });
    polling=false;
  }).catch(function(){
    polling=false;
  });
}

/* ============ ADD TOGGLE IN SETTINGS ============ */
function hookSettingsToggle(){
  /* Only on settings page */
  if(path.indexOf('mizan-settings')===-1) return;
  if(document.getElementById('mznNotifySection')) return;

  /* Find a place to inject — before branding section or after appearance */
  var branding=document.getElementById('mznBrandingSection');
  var appearance=document.querySelector('section.mb-16:last-of-type');
  var anchor=branding || appearance;
  if(!anchor) return;

  var sec=document.createElement('section');
  sec.id='mznNotifySection';
  sec.className='mb-16';
  sec.innerHTML=
    '<p class="section-title">الإشعارات</p>'+
    '<p class="section-desc">تنبيهات النظام على هاتفك عند أي جديد.</p>'+
    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">إشعارات النظام</p>'+
        '<p class="setting-hint" id="mznNotifyStatus">طلب الإذن من المتصفح</p>'+
      '</div>'+
      '<div style="display:flex;gap:10px;align-items:center">'+
        '<button class="btn-outline" id="mznNotifyRequest" style="padding:8px 16px;font-size:11px;">تفعيل</button>'+
      '</div>'+
    '</div>'+
    '<div class="setting-row">'+
      '<div class="setting-info">'+
        '<p class="setting-name">اختبار الإشعار</p>'+
        '<p class="setting-hint">إرسال إشعار تجريبي الآن</p>'+
      '</div>'+
      '<button class="btn-outline" id="mznNotifyTest" style="padding:8px 16px;font-size:11px;">إرسال</button>'+
    '</div>';

  anchor.parentElement.insertBefore(sec, anchor);

  var status=document.getElementById('mznNotifyStatus');
  var reqBtn=document.getElementById('mznNotifyRequest');
  var testBtn=document.getElementById('mznNotifyTest');

  function refreshStatus(){
    if(!('Notification' in window)){
      status.textContent='غير مدعوم في هذا المتصفح';
      status.style.color='var(--rose)';
      reqBtn.disabled=true;
      return;
    }
    if(Notification.permission==='granted' && isEnabled()){
      status.textContent='✅ مفعّلة — تصل التنبيهات';
      status.style.color='var(--emerald)';
      reqBtn.textContent='مفعّلة';
      reqBtn.disabled=true;
    } else if(Notification.permission==='denied'){
      status.textContent='❌ محظورة — افتح إعدادات Chrome';
      status.style.color='var(--rose)';
      reqBtn.textContent='مساعدة';
    } else {
      status.textContent='لم تُفعّل بعد';
      status.style.color='var(--text-dim)';
      reqBtn.textContent='تفعيل';
      reqBtn.disabled=false;
    }
  }

  reqBtn.addEventListener('click', function(){
    tone(660,.08);
    if(Notification.permission==='denied'){
      showDeniedHelp();
    } else {
      askPermission().then ? null : null;
      askPermission();
    }
    setTimeout(refreshStatus, 1500);
  });

  testBtn.addEventListener('click', function(){
    tone(660,.08);
    if(!isEnabled() || Notification.permission!=='granted'){
      toast('⚠️ فعّل الإشعارات أولاً','warning');
      return;
    }
    sendTestNotification();
    toast('📤 سيصلك إشعار تجريبي','info');
  });

  refreshStatus();
  setTimeout(refreshStatus, 2000);
}

/* ============ INIT ============ */
function init(){
  /* Only on non-login pages */
  if(!window.MZN_DB){ setTimeout(init, 1500); return; }

  /* Register service worker message handler for notifications */
  if('serviceWorker' in navigator && navigator.serviceWorker.controller){
    navigator.serviceWorker.addEventListener('message', function(e){
      if(e.data && e.data.type==='poll'){
        poll();
      }
    });
  }

  /* Hook settings toggle */
  setTimeout(hookSettingsToggle, 1500);
  setInterval(hookSettingsToggle, 3000);

  /* Start polling only if enabled */
  setInterval(function(){
    if(isEnabled()) poll();
  }, POLL_MS);

  /* Immediate poll after 5s (after DB loads) */
  setTimeout(function(){ if(isEnabled()) poll(); }, 5000);

  /* Resume on visibility change */
  document.addEventListener('visibilitychange', function(){
    if(!document.hidden && isEnabled()) poll();
  });

  console.log('[MIZAN] Notify ready — permission:', Notification.permission);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
