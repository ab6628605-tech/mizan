(function(){
'use strict';

/* ============ AUDIO ENGINE ============ */
var audioCtx;
var soundEnabled = true;

function initAudio(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
  }
}

function playTone(freq, dur, type, vol){
  if(!soundEnabled) return;
  initAudio();
  if(!audioCtx) return;
  try{
    var o = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    dur = dur || 0.08;
    vol = vol || 0.04;
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  }catch(e){}
}

function successChime(){
  playTone(659, 0.12);
  setTimeout(function(){playTone(880, 0.15);}, 90);
  setTimeout(function(){playTone(1174, 0.22);}, 200);
}

/* ============ TOAST SYSTEM ============ */
function showToast(msg, type){
  var c = document.getElementById('mznToastWrap');
  if(!c){
    c = document.createElement('div');
    c.id = 'mznToastWrap';
    c.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:2147483646;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;max-width:88vw';
    document.body.appendChild(c);
  }
  var colors = {info:'#9DC4E8', success:'#6EE7A0', warning:'#F0C474', danger:'#F0A0B0'};
  var color = colors[type] || colors.info;
  var t = document.createElement('div');
  t.style.cssText = 'padding:12px 22px;border-radius:99px;background:rgba(14,16,24,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(201,169,97,0.25);color:#EDEDED;font-family:"IBM Plex Sans Arabic",sans-serif;font-size:13px;display:flex;align-items:center;gap:12px;box-shadow:0 20px 50px rgba(0,0,0,0.6);white-space:nowrap;animation:mznToastIn .5s cubic-bezier(.16,1,.3,1)';
  t.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:'+color+';box-shadow:0 0 8px '+color+';flex-shrink:0"></span><span>'+msg+'</span>';
  c.appendChild(t);
  setTimeout(function(){
    t.style.transition = 'all .4s ease';
    t.style.opacity = '0';
    t.style.transform = 'translateY(-20px)';
    setTimeout(function(){t.remove();}, 400);
  }, 2200);
}

var animStyle = document.createElement('style');
animStyle.textContent = '@keyframes mznToastIn{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(animStyle);

/* ============ HAPTIC ============ */
function haptic(){
  if(navigator.vibrate) navigator.vibrate(8);
}

/* ============ UNIVERSAL SOUND ON CLICK ============ */
document.addEventListener('click', function(e){
  var target = e.target.closest('button, a, .card, .row, .btn, .btn-min, .btn-outline, .btn-primary, .tab, .filter-chip, .nav-item, [role="button"], .kpi, .sample');
  if(!target) return;
  if(target.closest('.mzn-nav')) return;
  playTone(720, 0.05, 'sine', 0.025);
  haptic();
}, true);

/* ============ ENHANCE BUTTONS ============ */
function enhanceButtons(){
  document.querySelectorAll('.btn-primary, .btn, .btn-outline, .btn-min').forEach(function(btn){
    if(btn.dataset.mznB) return;
    btn.dataset.mznB = '1';
    btn.addEventListener('click', function(){
      btn.style.transform = 'scale(0.96)';
      setTimeout(function(){ btn.style.transform = ''; }, 120);
    });
  });
}

/* ============ ENHANCE ROWS / CARDS ============ */
function enhanceRows(){
  document.querySelectorAll('.row, .kpi, .card, .sample').forEach(function(el){
    if(el.dataset.mznR) return;
    el.dataset.mznR = '1';
    el.style.transition = (el.style.transition||'') + ' transform .2s ease';
    el.addEventListener('touchstart', function(){
      el.style.transform = 'scale(0.985)';
    }, {passive:true});
    el.addEventListener('touchend', function(){
      setTimeout(function(){ el.style.transform = ''; }, 100);
    }, {passive:true});
  });
}

/* ============ ENHANCE TABS ============ */
function enhanceTabs(){
  document.querySelectorAll('.tab, .filter-chip').forEach(function(tab){
    if(tab.dataset.mznT) return;
    tab.dataset.mznT = '1';
    tab.addEventListener('click', function(){
      var group = tab.parentElement;
      if(!group) return;
      group.querySelectorAll('.tab, .filter-chip').forEach(function(t){
        t.classList.remove('active');
      });
      tab.classList.add('active');
      playTone(880, 0.08);
    });
  });
}

/* ============ ENHANCE INPUTS ============ */
function enhanceInputs(){
  document.querySelectorAll('input, select, textarea').forEach(function(inp){
    if(inp.dataset.mznI) return;
    inp.dataset.mznI = '1';
    inp.addEventListener('focus', function(){
      playTone(520, 0.04, 'sine', 0.02);
    });
  });
}

/* ============ UPDATE TIME ELEMENTS ============ */
function updateTime(){
  var els = document.querySelectorAll('[data-mzn-time]');
  if(!els.length) return;
  var d = new Date();
  var days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  var months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  var str = days[d.getDay()] + ' · ' + d.getDate() + ' ' + months[d.getMonth()];
  els.forEach(function(el){ el.textContent = str; });
}

/* ============ WELCOME TOAST ============ */
function welcomeToast(){
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var messages = {
    'dashboard.html': ['👋 مرحباً بعودتك', 'info'],
    'upload.html': ['📤 جاهز لاستقبال العروض', 'info'],
    'mizan-compare.html': ['✨ حُللت 3 عروض — التوصية جاهزة', 'success'],
    'mizan-pr.html': ['📋 3 طلبات بانتظار موافقتك', 'warning'],
    'mizan-po.html': ['📦 14 أمر قيد التنفيذ', 'info'],
    'mizan-grn.html': ['📥 8 شحنات بانتظار الاستلام', 'info'],
    'mizan-suppliers.html': ['👥 86 مورداً نشطاً', 'info'],
    'mizan-reports.html': ['📊 التقرير الشهري جاهز', 'info'],
    'mizan-settings.html': ['⚙️ الإعدادات محدّثة', 'info']
  };
  var m = messages[path];
  if(m) setTimeout(function(){ showToast(m[0], m[1]); }, 1200);
}

/* ============ INIT ============ */
function init(){
  document.body.addEventListener('touchstart', function once(){
    initAudio();
    document.body.removeEventListener('touchstart', once);
  }, {once:true, passive:true});
  document.body.addEventListener('click', function once(){
    initAudio();
    document.body.removeEventListener('click', once);
  }, {once:true});
  
  enhanceButtons();
  enhanceRows();
  enhanceTabs();
  enhanceInputs();
  updateTime();
  welcomeToast();
  
  setInterval(function(){
    enhanceButtons();
    enhanceRows();
    enhanceTabs();
    enhanceInputs();
  }, 2000);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.MZN = { toast: showToast, tone: playTone, chime: successChime };

})();
