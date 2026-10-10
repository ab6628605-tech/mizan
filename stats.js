(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];

/* ============ CONNECTION INDICATOR ============ */
var indicator=null;
function ensureIndicator(){
  if(indicator) return indicator;
  indicator=document.createElement('div');
  indicator.id='mznStatus';
  indicator.style.cssText='position:fixed;top:18px;right:18px;z-index:2147483645;display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;background:rgba(8,9,14,.92);backdrop-filter:blur(18px);border:1px solid rgba(110,231,160,.3);font-family:Inter,"IBM Plex Sans Arabic",sans-serif;font-size:10px;letter-spacing:.1em;color:#6EE7A0;transition:all .3s ease;pointer-events:none';
  indicator.innerHTML='<span style="width:6px;height:6px;border-radius:50%;background:#6EE7A0;box-shadow:0 0 8px #6EE7A0;animation:pulseDot 2s infinite"></span><span id="mznStatusText">LIVE</span>';
  document.body.appendChild(indicator);
  var st=document.createElement('style');
  st.textContent='@keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.4}}';
  document.head.appendChild(st);
  return indicator;
}

function setStatus(state){
  var el=ensureIndicator();
  var text=document.getElementById('mznStatusText');
  if(state==='live'){
    el.style.borderColor='rgba(110,231,160,.3)';
    el.style.color='#6EE7A0';
    el.querySelector('span').style.background='#6EE7A0';
    el.querySelector('span').style.boxShadow='0 0 8px #6EE7A0';
    if(text) text.textContent='LIVE';
  } else if(state==='offline'){
    el.style.borderColor='rgba(240,160,176,.3)';
    el.style.color='#F0A0B0';
    el.querySelector('span').style.background='#F0A0B0';
    el.querySelector('span').style.boxShadow='0 0 8px #F0A0B0';
    if(text) text.textContent='OFFLINE';
  } else if(state==='syncing'){
    el.style.borderColor='rgba(201,169,97,.3)';
    el.style.color='#E8CE8B';
    el.querySelector('span').style.background='#E8CE8B';
    el.querySelector('span').style.boxShadow='0 0 8px #E8CE8B';
    if(text) text.textContent='SYNC';
  }
}

/* ============ HERO STATS ANIMATION ============ */
function animateNumber(el, from, to, dur){
  if(!el) return;
  var start=performance.now();
  function step(now){
    var p=Math.min((now-start)/dur,1);
    var eased=1-Math.pow(1-p,3);
    var val=Math.floor(from+(to-from)*eased);
    el.textContent=val.toLocaleString('en-US');
    if(p<1) requestAnimationFrame(step);
    else el.textContent=to.toLocaleString('en-US');
  }
  requestAnimationFrame(step);
}

/* ============ LIVE STATS PER PAGE ============ */
function updatePRStats(){
  var rows=document.querySelectorAll('.pr-row');
  var counts={total:rows.length,pending:0,draft:0,approved:0,rejected:0,converted:0};
  var totalAmount=0;
  rows.forEach(function(r){
    var st=r.dataset.mznStatus||'pending';
    if(counts[st]!==undefined) counts[st]++;
    var amt=r.querySelector('.pr-amount');
    if(amt){
      var txt=amt.textContent.trim();
      var n=parseFloat(txt.replace(/[^0-9.]/g,''))||0;
      if(txt.indexOf('M')!==-1) n*=1000000;
      else if(txt.indexOf('K')!==-1) n*=1000;
      totalAmount+=n;
    }
  });
  /* Update hero */
  var heroEl=document.querySelector('.hero-number');
  if(heroEl){
    var target=counts.pending+counts.draft;
    animateNumber(heroEl,parseInt(heroEl.textContent)||0,target,800);
  }
  /* Update KPI cards */
  updateKPI(document.querySelectorAll('[data-count]'),counts);
  /* Update filter counts */
  var chips=document.querySelectorAll('.mzn-fchip');
  chips.forEach(function(c){
    var k=c.dataset.mznK;
    var cnt=c.querySelector('.mzn-fcount');
    if(cnt) cnt.textContent=counts[k]||0;
  });
}

function updatePOStats(){
  var rows=document.querySelectorAll('.po-row');
  var counts={total:rows.length,draft:0,sent:0,confirmed:0,progress:0,received:0,closed:0};
  var totalAmount=0;
  rows.forEach(function(r){
    var st=r.dataset.mznStatus||'sent';
    if(counts[st]!==undefined) counts[st]++;
    var amt=r.querySelector('.po-amount');
    if(amt){
      var txt=amt.textContent.trim();
      var n=parseFloat(txt.replace(/[^0-9.]/g,''))||0;
      if(txt.indexOf('M')!==-1) n*=1000000;
      else if(txt.indexOf('K')!==-1) n*=1000;
      totalAmount+=n;
    }
  });
  var hero=document.querySelector('.hero-number');
  if(hero){
    var active=counts.progress+counts.sent+counts.confirmed;
    animateNumber(hero,parseInt(hero.textContent)||0,active,800);
  }
  updateKPI(document.querySelectorAll('[data-count]'),counts);
  var chips=document.querySelectorAll('.mzn-fchip');
  chips.forEach(function(c){
    var k=c.dataset.mznK;
    var cnt=c.querySelector('.mzn-fcount');
    if(cnt) cnt.textContent=counts[k]||0;
  });
}

function updateGRNStats(){
  var rows=document.querySelectorAll('.doc-row');
  var counts={total:rows.length,pending:0,inspect:0,accepted:0,partial:0,rejected:0};
  rows.forEach(function(r){
    var st=r.dataset.mznStatus||'pending';
    if(counts[st]!==undefined) counts[st]++;
  });
  var hero=document.querySelector('.hero-number');
  if(hero){
    var received=counts.accepted+counts.partial;
    animateNumber(hero,parseInt(hero.textContent)||0,received,800);
  }
  updateKPI(document.querySelectorAll('[data-count]'),counts);
  var chips=document.querySelectorAll('.mzn-fchip');
  chips.forEach(function(c){
    var k=c.dataset.mznK;
    var cnt=c.querySelector('.mzn-fcount');
    if(cnt) cnt.textContent=counts[k]||0;
  });
}

function updateKPI(elements,counts){
  /* Heuristic: match by label */
  elements.forEach(function(el){
    var parent=el.parentElement;
    if(!parent) return;
    var label=parent.querySelector('.label,.kpi-label,.stat-mini-label,p');
    if(!label) return;
    var txt=(label.textContent||'').trim();
    var target=null;
    if(txt.indexOf('مسودات')!==-1 || txt.indexOf('مسودة')!==-1) target=counts.draft;
    else if(txt.indexOf('قيد الموافقة')!==-1 || txt.indexOf('انتظار')!==-1) target=counts.pending;
    else if(txt.indexOf('معتمد')!==-1) target=counts.approved||counts.accepted;
    else if(txt.indexOf('مرفوض')!==-1) target=counts.rejected;
    else if(txt.indexOf('مفتوحة')!==-1 || txt.indexOf('الطلبات')!==-1) target=counts.total;
    else if(txt.indexOf('قيد التنفيذ')!==-1) target=counts.progress;
    else if(txt.indexOf('مستلمة')!==-1 || txt.indexOf('مقبولة')!==-1) target=counts.accepted||counts.received;
    if(target!==null && typeof target==='number'){
      animateNumber(el,parseInt(el.textContent)||0,target,800);
    }
  });
}

/* ============ SYNC BUTTON ============ */
function addSyncButton(){
  if(document.getElementById('mznSync')) return;
  var btn=document.createElement('button');
  btn.id='mznSync';
  btn.style.cssText='position:fixed;bottom:86px;left:18px;z-index:2147483645;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,rgba(201,169,97,.15),rgba(201,169,97,.05));border:1px solid rgba(201,169,97,.3);color:#E8CE8B;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.4);transition:all .3s ease;font-family:inherit';
  btn.innerHTML='<svg id="syncIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>';
  btn.addEventListener('click', function(){
    if(window.MZN&&MZN.tone) MZN.tone(880,.1);
    btn.style.transform='rotate(360deg)';
    btn.style.transition='transform .8s ease';
    setTimeout(function(){btn.style.transform='';btn.style.transition='all .3s ease';},850);
    doSync();
  });
  document.body.appendChild(btn);
}

function doSync(){
  setStatus('syncing');
  var table=null;
  if(path.indexOf('mizan-pr')===0) table='prs';
  else if(path.indexOf('mizan-po')===0) table='pos';
  else if(path.indexOf('mizan-grn')===0) table='grns';

  if(!table || !window.MZN_DB){
    setTimeout(function(){ setStatus('live'); }, 800);
    if(window.MZN&&MZN.toast) MZN.toast('🔄 محدّث','info');
    return;
  }

  window.MZN_DB.list(table).then(function(items){
    setStatus('live');
    if(items) {
      /* Rerender */
      var list=document.getElementById(table==='prs'?'prList':table==='pos'?'poList':'docList');
      if(list && window.MZN_DB){
        /* Just update counts from current DOM */
        if(table==='prs') updatePRStats();
        else if(table==='pos') updatePOStats();
        else updateGRNStats();
      }
    }
    if(window.MZN&&MZN.toast) MZN.toast('✅ تم التحديث','success');
    if(window.MZN&&MZN.chime) MZN.chime();
  }).catch(function(){
    setStatus('offline');
    if(window.MZN&&MZN.toast) MZN.toast('⚠️ تعذّر الاتصال','warning');
  });
}

/* ============ INIT ============ */
function init(){
  setStatus('live');
  addSyncButton();

  /* Initial stats */
  setTimeout(function(){
    if(path.indexOf('mizan-pr')===0) updatePRStats();
    else if(path.indexOf('mizan-po')===0) updatePOStats();
    else if(path.indexOf('mizan-grn')===0) updateGRNStats();
  }, 1500);

  /* Update on changes */
  document.addEventListener('click', function(e){
    if(e.target.closest('.mzn-save') || e.target.closest('.mzn-del')){
      setTimeout(function(){
        if(path.indexOf('mizan-pr')===0) updatePRStats();
        else if(path.indexOf('mizan-po')===0) updatePOStats();
        else if(path.indexOf('mizan-grn')===0) updateGRNStats();
      }, 400);
    }
  });

  /* Periodic refresh */
  setInterval(function(){
    if(path.indexOf('mizan-pr')===0) updatePRStats();
    else if(path.indexOf('mizan-po')===0) updatePOStats();
    else if(path.indexOf('mizan-grn')===0) updateGRNStats();
  }, 5000);

  /* Online/offline */
  window.addEventListener('online', function(){ setStatus('live'); });
  window.addEventListener('offline', function(){ setStatus('offline'); });
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();
})();
