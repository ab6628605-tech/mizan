(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];

/* Only on compare page */
if(path.indexOf('mizan-compare')===-1) return;

console.log('[MIZAN Approve] loaded');

function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function tone(f,d,v){ if(window.MZN&&MZN.tone) MZN.tone(f,d,'sine',v||0.05); }
function toast(m,t){ if(window.MZN&&MZN.toast) MZN.toast(m,t||'info'); }

/* ============ GET SUPPLIER DATA FROM PAGE ============ */
function getWinner(){
  /* Try to find the winner name from the hero */
  var hero=document.querySelector('.hero-win .accent, .hero-win, .display');
  if(hero){
    var t=hero.textContent.trim();
    if(t) return t;
  }
  return 'غير محدد';
}

function getScore(){
  /* Try to find score from cards */
  var scoreEl=document.querySelector('.sup-score');
  if(scoreEl) return scoreEl.textContent.trim();
  return '—';
}

function getAmount(){
  /* Try to find amount */
  var amt=document.querySelector('.big-price, .hero-number');
  if(amt){
    var t=amt.textContent.trim();
    if(t) return t;
  }
  return '—';
}

/* ============ BUILD DECISION RECORD ============ */
function buildRecord(){
  var user='المستخدم';
  try{ user=localStorage.getItem('mzn_auth')||'المستخدم'; }catch(e){}

  var winner=getWinner();
  var score=getScore();
  var amount=getAmount();

  /* Get weights if available */
  var weights={};
  ['wPrice','wDelivery','wQuality','wRisk'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) weights[id]=el.value;
  });

  return {
    code:'DEC-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-6),
    winner:winner,
    score:score,
    amount:amount,
    weights:weights,
    user:user,
    date:new Date().toISOString(),
    status:'approved'
  };
}

/* ============ SAVE TO LOCALSTORAGE ============ */
function saveLocal(record){
  try{
    var key='mzn_decisions';
    var list=JSON.parse(localStorage.getItem(key))||[];
    list.unshift(record);
    /* Keep last 50 */
    if(list.length>50) list=list.slice(0,50);
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  }catch(e){
    console.warn('[MIZAN] Save failed', e);
    return false;
  }
}

/* ============ SAVE TO SUPABASE ============ */
function saveCloud(record){
  if(!window.MZN_DB){ return Promise.reject('No DB'); }
  /* Try to save to prs table as a record */
  var body={
    code:record.code,
    title:'اعتماد: '+record.winner,
    dept:'المشتريات',
    priority:'عالية',
    amount:parseAmount(record.amount),
    status:'approved',
    reason:'تم الاعتماد بواسطة '+record.user+' · النتيجة '+record.score,
    items:1
  };
  return window.MZN_DB.create('prs', body);
}

function parseAmount(txt){
  var n=parseFloat((txt||'').replace(/[^0-9.]/g,''))||0;
  if(txt && txt.indexOf('M')!==-1) n*=1000000;
  else if(txt && txt.indexOf('K')!==-1) n*=1000;
  return n;
}

/* ============ NOTIFICATION ============ */
function pushNotify(title, body){
  if(!('Notification' in window)) return;
  if(Notification.permission!=='granted') return;
  try{
    var n=new Notification(title, {
      body:body,
      icon:'icon.svg',
      badge:'icon.svg',
      tag:'mzn-approve-'+Date.now(),
      renotify:true
    });
    n.onclick=function(){ try{ window.focus(); n.close(); }catch(e){} };
    setTimeout(function(){ try{ n.close(); }catch(e){} }, 12000);
    if(navigator.vibrate) navigator.vibrate([60,40,60]);
  }catch(e){}
}

/* ============ SHOW SUCCESS MODAL ============ */
function showSuccessModal(record, cloudSaved){
  var w=document.createElement('div');
  w.id='mznApproveModal';
  w.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);font-family:"IBM Plex Sans Arabic",sans-serif;animation:mznFadeIn .3s';
  w.innerHTML=
    '<style>@keyframes mznFadeIn{from{opacity:0}to{opacity:1}}@keyframes mznPop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}</style>'+
    '<div style="background:linear-gradient(180deg,#0E1018,#08090E);border:1px solid rgba(110,231,160,.3);border-radius:24px;padding:32px 24px;max-width:460px;width:100%;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.8);animation:mznPop .35s cubic-bezier(.16,1,.3,1);max-height:90vh;overflow-y:auto">'+
      '<div style="width:80px;height:80px;margin:0 auto 20px;border-radius:50%;background:linear-gradient(135deg,rgba(110,231,160,.2),rgba(110,231,160,.05));border:2px solid rgba(110,231,160,.4);display:flex;align-items:center;justify-content:center;color:#6EE7A0;box-shadow:0 0 40px rgba(110,231,160,.4);animation:mznPop .5s cubic-bezier(.16,1.5,.3,1)">'+
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'+
      '</div>'+
      '<h2 style="color:#6EE7A0;font-size:22px;font-weight:500;margin:0 0 10px">تم اعتماد القرار</h2>'+
      '<p style="color:#7A8090;font-size:13.5px;line-height:1.8;margin:0 0 24px">تم تسجيل القرار بنجاح'+(cloudSaved?' وحفظه في السحابة ☁️':' محلياً')+'</p>'+
      '<div style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:18px;margin-bottom:20px;text-align:right">'+
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">'+
          '<span style="font-size:11px;letter-spacing:.15em;color:#4A5060;text-transform:uppercase">الرقم</span>'+
          '<span style="font-family:Inter;font-size:12px;color:#E8CE8B">'+esc(record.code)+'</span>'+
        '</div>'+
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">'+
          '<span style="font-size:11px;letter-spacing:.15em;color:#4A5060;text-transform:uppercase">المورد الفائز</span>'+
          '<span style="font-size:12.5px;color:#EDEDED;font-weight:500">'+esc(record.winner)+'</span>'+
        '</div>'+
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">'+
          '<span style="font-size:11px;letter-spacing:.15em;color:#4A5060;text-transform:uppercase">النتيجة</span>'+
          '<span style="font-family:Inter;font-size:12.5px;color:#6EE7A0">'+esc(record.score)+'</span>'+
        '</div>'+
        '<div style="display:flex;justify-content:space-between;padding:8px 0">'+
          '<span style="font-size:11px;letter-spacing:.15em;color:#4A5060;text-transform:uppercase">المعتمِد</span>'+
          '<span style="font-size:12.5px;color:#EDEDED">'+esc(record.user)+'</span>'+
        '</div>'+
      '</div>'+
      '<div style="display:flex;flex-direction:column;gap:10px">'+
        '<a href="mizan-po.html" style="padding:14px 24px;border-radius:99px;background:linear-gradient(135deg,#E8CE8B,#C9A961);color:#08090E;font-weight:600;font-size:14px;text-decoration:none;box-shadow:0 10px 30px -8px rgba(201,169,97,.5);display:flex;align-items:center;justify-content:center;gap:8px">'+
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'+
          'إنشاء أمر شراء'+
        '</a>'+
        '<button id="mznApproveClose" style="padding:14px 24px;border-radius:99px;background:transparent;color:#7A8090;font-size:13.5px;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-family:inherit">إغلاق</button>'+
      '</div>'+
      '<p style="font-size:10.5px;color:#4A5060;margin-top:16px;line-height:1.6">🔒 القرار محفوظ في السجل ومتاح للرجوع إليه لاحقاً</p>'+
    '</div>';
  document.body.appendChild(w);
  document.getElementById('mznApproveClose').addEventListener('click', function(){ w.remove(); });
  w.addEventListener('click', function(e){ if(e.target===w) w.remove(); });
}

/* ============ MAIN: APPROVE ============ */
function approveDecision(){
  console.log('[MIZAN Approve] button clicked');

  /* Check if already approved */
  var existing=document.querySelector('[data-mzn-approved="1"]');
  if(existing){
    toast('⚠️ تم اعتماد هذا القرار مسبقاً','warning');
    tone(330,.15);
    return;
  }

  /* Build record */
  var record=buildRecord();
  console.log('[MIZAN Approve] record:', record);

  /* Save locally */
  var localSaved=saveLocal(record);

  /* Save to cloud */
  var cloudPromise=Promise.resolve(false);
  if(window.MZN_DB){
    cloudPromise=saveCloud(record).then(function(){ return true; }).catch(function(e){
      console.warn('[MIZAN] Cloud save failed', e);
      return false;
    });
  }

  /* Success sounds */
  tone(659,.12);
  setTimeout(function(){ tone(880,.15); }, 90);
  setTimeout(function(){ tone(1174,.22); }, 200);
  if(navigator.vibrate) navigator.vibrate([30,50,30]);

  /* Push notification */
  pushNotify('✅ تم اعتماد القرار', record.winner+' · '+record.score);

  /* Toast immediately */
  toast('✅ تم اعتماد القرار بنجاح','success');

  /* Show modal after cloud save */
  cloudPromise.then(function(cloudSaved){
    showSuccessModal(record, cloudSaved);
  });

  /* Mark button */
  markButtonAsApproved();
}

function markButtonAsApproved(){
  var btns=document.querySelectorAll('button');
  btns.forEach(function(b){
    var txt=(b.textContent||'').trim();
    if(txt.indexOf('اعتماد القرار')!==-1){
      b.dataset.mznApproved='1';
      b.disabled=true;
      b.style.background='linear-gradient(135deg,rgba(110,231,160,.4),rgba(110,231,160,.15))';
      b.style.color='#6EE7A0';
      b.style.borderColor='rgba(110,231,160,.4)';
      b.style.cursor='default';
      b.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="pointer-events:none"><polyline points="20 6 9 17 4 12"/></svg><span style="pointer-events:none">تم الاعتماد</span>';
    }
  });
}

/* ============ HOOK BUTTON ============ */
function hookApproveButton(){
  var btns=document.querySelectorAll('button');
  btns.forEach(function(b){
    if(b.dataset.mznApproveHooked) return;
    var txt=(b.textContent||'').trim();
    if(txt==='اعتماد القرار' || txt.indexOf('اعتماد القرار')!==-1){
      b.dataset.mznApproveHooked='1';
      b.removeAttribute('onclick');
      b.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        approveDecision();
      }, true);
      console.log('[MIZAN Approve] button hooked');
    }
  });
}

/* ============ INIT ============ */
function init(){
  hookApproveButton();
  setInterval(hookApproveButton, 2000);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();

console.log('[MIZAN] Approve handler ready');
})();
