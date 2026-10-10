(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

var AUTH_KEY='mzn_auth';
var KEY_STORE='mzn_gemini_key';
var API_BASE='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getApiKey(){
  try{ return localStorage.getItem(KEY_STORE)||''; }catch(e){ return ''; }
}
function setApiKey(k){
  try{ localStorage.setItem(KEY_STORE,k); }catch(e){}
}
function clearApiKey(){
  try{ localStorage.removeItem(KEY_STORE); }catch(e){}
}
function getUser(){
  try{ return localStorage.getItem(AUTH_KEY)||'المستخدم'; }catch(e){ return 'المستخدم'; }
}
function tone(f,d,v){ if(window.MZN&&MZN.tone) MZN.tone(f,d,'sine',v||0.05); }
function toast(m,t){ if(window.MZN&&MZN.toast) MZN.toast(m,t||'info'); }
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ============ STYLES ============ */
var css=document.createElement('style');
css.textContent=
'.mzn-ai-btn{position:fixed;bottom:86px;right:18px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#E8CE8B,#C9A961,#B87333);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 32px -8px rgba(201,169,97,.6),0 0 24px rgba(201,169,97,.3);z-index:2147483644;transition:all .3s cubic-bezier(.16,1,.3,1);color:#08090E}'+
'.mzn-ai-btn:active{transform:scale(.92)}'+
'.mzn-ai-btn svg{width:24px;height:24px;pointer-events:none}'+
'.mzn-ai-btn::before{content:"";position:absolute;inset:-4px;border-radius:50%;border:1px solid rgba(201,169,97,.4);animation:aiPulse 2.5s infinite;pointer-events:none}'+
'@keyframes aiPulse{0%{transform:scale(.95);opacity:.7}100%{transform:scale(1.25);opacity:0}}'+
'.mzn-ai-modal{position:fixed;inset:0;z-index:2147483647;display:none;font-family:"IBM Plex Sans Arabic","Inter",sans-serif}'+
'.mzn-ai-modal.show{display:block}'+
'.mzn-ai-bd{position:absolute;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;transition:opacity .3s}'+
'.mzn-ai-modal.show .mzn-ai-bd{opacity:1}'+
'.mzn-ai-sh{position:absolute;bottom:0;left:0;right:0;max-height:92vh;background:linear-gradient(180deg,#0E1018,#08090E);border-radius:24px 24px 0 0;border-top:1px solid rgba(201,169,97,.3);transform:translateY(100%);transition:transform .4s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;box-shadow:0 -20px 60px rgba(0,0,0,.8);box-sizing:border-box;overflow:hidden}'+
'.mzn-ai-modal.show .mzn-ai-sh{transform:translateY(0)}'+
'@media(min-width:700px){.mzn-ai-sh{max-width:600px;left:50%;right:auto;transform:translateX(-50%) translateY(100%);border-radius:24px;margin-bottom:40px}.mzn-ai-modal.show .mzn-ai-sh{transform:translateX(-50%) translateY(0)}}'+
'.mzn-ai-head{padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;gap:12px;flex-shrink:0}'+
'.mzn-ai-avatar{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,rgba(201,169,97,.2),rgba(201,169,97,.05));border:1px solid rgba(201,169,97,.3);display:flex;align-items:center;justify-content:center;color:#E8CE8B;flex-shrink:0}'+
'.mzn-ai-avatar svg{width:20px;height:20px}'+
'.mzn-ai-info{flex:1;text-align:right}'+
'.mzn-ai-name{font-size:14px;color:#EDEDED;font-weight:500;margin-bottom:2px}'+
'.mzn-ai-status{font-size:11px;color:#6EE7A0;display:flex;align-items:center;gap:6px;justify-content:flex-end}'+
'.mzn-ai-status span{width:6px;height:6px;border-radius:50%;background:#6EE7A0;box-shadow:0 0 8px #6EE7A0;animation:aiPulse2 2s infinite}'+
'.mzn-ai-status.err{color:#F0A0B0}.mzn-ai-status.err span{background:#F0A0B0;box-shadow:0 0 8px #F0A0B0}'+
'@keyframes aiPulse2{0%,100%{opacity:1}50%{opacity:.4}}'+
'.mzn-ai-close{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.04);border:none;color:#7A8090;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;font-family:inherit}'+
'.mzn-ai-body{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;min-height:300px;max-height:calc(92vh - 200px)}'+
'.mzn-ai-body::-webkit-scrollbar{width:4px}.mzn-ai-body::-webkit-scrollbar-thumb{background:rgba(201,169,97,.2);border-radius:10px}'+
'.mzn-ai-msg{max-width:85%;padding:12px 16px;border-radius:16px;font-size:13.5px;line-height:1.75;animation:aiMsg .4s cubic-bezier(.16,1,.3,1);white-space:pre-wrap;word-break:break-word}'+
'@keyframes aiMsg{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}'+
'.mzn-ai-ai{background:linear-gradient(145deg,rgba(201,169,97,.08),rgba(201,169,97,.02));border:1px solid rgba(201,169,97,.15);border-radius:16px 16px 16px 4px;color:#EDEDED;align-self:flex-start}'+
'.mzn-ai-user{background:linear-gradient(145deg,rgba(157,196,232,.12),rgba(157,196,232,.04));border:1px solid rgba(157,196,232,.2);border-radius:16px 16px 4px 16px;color:#EDEDED;align-self:flex-end;text-align:right}'+
'.mzn-ai-ai b{color:#E8CE8B;font-weight:500}'+
'.mzn-ai-ai code{background:rgba(201,169,97,.1);padding:2px 6px;border-radius:4px;font-family:"Inter";font-size:12px;color:#E8CE8B}'+
'.mzn-ai-typing{display:inline-flex;gap:4px;align-items:center;padding:14px 18px}'+
'.mzn-ai-dot{width:6px;height:6px;border-radius:50%;background:#C9A961;animation:aiDot 1.4s infinite}'+
'.mzn-ai-dot:nth-child(2){animation-delay:.15s}'+
'.mzn-ai-dot:nth-child(3){animation-delay:.3s}'+
'@keyframes aiDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}'+
'.mzn-ai-sugg{display:flex;flex-wrap:wrap;gap:8px;padding:0 20px 16px;flex-shrink:0}'+
'.mzn-ai-chip{padding:8px 14px;border-radius:99px;background:rgba(201,169,97,.06);border:1px solid rgba(201,169,97,.2);color:#E8CE8B;font-family:inherit;font-size:11.5px;cursor:pointer;transition:all .2s;white-space:nowrap}'+
'.mzn-ai-chip:active{background:rgba(201,169,97,.15);transform:scale(.96)}'+
'.mzn-ai-input-area{padding:14px 18px 18px;border-top:1px solid rgba(255,255,255,.05);display:flex;align-items:flex-end;gap:10px;flex-shrink:0;background:rgba(8,9,14,.6)}'+
'.mzn-ai-input{flex:1;min-height:44px;max-height:120px;padding:12px 16px;border-radius:22px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);color:#EDEDED;font-size:13.5px;font-family:inherit;outline:none;resize:none;line-height:1.5;overflow-y:auto;box-sizing:border-box}'+
'.mzn-ai-input:focus{border-color:rgba(201,169,97,.4);background:rgba(201,169,97,.03)}'+
'.mzn-ai-input::placeholder{color:#4A5060}'+
'.mzn-ai-send{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#E8CE8B,#C9A961);border:none;color:#08090E;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 8px 20px -4px rgba(201,169,97,.5);transition:all .2s}'+
'.mzn-ai-send:active{transform:scale(.92)}'+
'.mzn-ai-send:disabled{opacity:.4;cursor:not-allowed}'+
'.mzn-ai-send svg{width:18px;height:18px;pointer-events:none}'+
'.mzn-ai-send svg{transform:scaleX(-1)}'+
/* Setup screen */
'.mzn-ai-setup{padding:28px 22px;text-align:center}'+
'.mzn-ai-setup h3{font-size:18px;color:#E8CE8B;font-weight:400;margin:0 0 8px}'+
'.mzn-ai-setup p{font-size:12.5px;color:#7A8090;line-height:1.8;margin:0 0 20px}'+
'.mzn-ai-setup input{width:100%;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:#EDEDED;font-size:13px;font-family:Inter,inherit;outline:none;box-sizing:border-box;direction:ltr;text-align:left}'+
'.mzn-ai-setup input:focus{border-color:rgba(201,169,97,.5);background:rgba(201,169,97,.04)}'+
'.mzn-ai-setup .hint{font-size:11px;color:#4A5060;margin-top:12px;line-height:1.7}'+
'.mzn-ai-setup .hint a{color:#E8CE8B;text-decoration:none}'+
'.mzn-ai-setup .save-btn{width:100%;margin-top:18px;padding:14px;border-radius:99px;background:linear-gradient(135deg,#E8CE8B,#C9A961);border:none;color:#08090E;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit}'+
'.mzn-ai-setup .save-btn:active{transform:scale(.98)}'+
'.mzn-ai-setup .info-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:99px;background:rgba(110,231,160,.08);border:1px solid rgba(110,231,160,.2);color:#6EE7A0;font-size:11.5px;margin-bottom:20px}'+
'.mzn-ai-setup .info-badge svg{width:14px;height:14px}'+
'.mzn-ai-setup .footer-note{font-size:10.5px;color:#4A5060;margin-top:20px;line-height:1.7}';
document.head.appendChild(css);

/* ============ FLOATING BUTTON ============ */
var fab=document.createElement('button');
fab.className='mzn-ai-btn';
fab.setAttribute('aria-label','مساعد MIZAN الذكي');
fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 3 6v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3c1-1 3-3 3-6a7 7 0 0 0-7-7z"/><path d="M9 22h6"/></svg>';
fab.addEventListener('click', openChat);
document.body.appendChild(fab);

/* ============ CHAT MODAL ============ */
var modal=null, body=null, input=null, sendBtn=null, sugg=null;
var isSending=false;

function ensureModal(){
  if(modal) return modal;
  modal=document.createElement('div');
  modal.className='mzn-ai-modal';
  modal.innerHTML=
    '<div class="mzn-ai-bd"></div>'+
    '<div class="mzn-ai-sh">'+
      '<div class="mzn-ai-head">'+
        '<button class="mzn-ai-close" data-close>✕</button>'+
        '<div class="mzn-ai-info">'+
          '<div class="mzn-ai-name">مساعد MIZAN</div>'+
          '<div class="mzn-ai-status" id="mznAiStatus"><span></span>متصل · Gemini</div>'+
        '</div>'+
        '<div class="mzn-ai-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 3 6v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3c1-1 3-3 3-6a7 7 0 0 0-7-7z"/><path d="M9 22h6"/></svg></div>'+
      '</div>'+
      '<div class="mzn-ai-body" id="mznAiBody"></div>'+
      '<div class="mzn-ai-sugg" id="mznAiSugg"></div>'+
      '<div class="mzn-ai-input-area" id="mznAiInputArea">'+
        '<textarea class="mzn-ai-input" id="mznAiInput" placeholder="اسأل مساعدك..." rows="1"></textarea>'+
        '<button class="mzn-ai-send" id="mznAiSend" aria-label="إرسال"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);
  modal.querySelector('.mzn-ai-bd').addEventListener('click', closeChat);
  modal.querySelector('[data-close]').addEventListener('click', closeChat);
  body=document.getElementById('mznAiBody');
  input=document.getElementById('mznAiInput');
  sendBtn=document.getElementById('mznAiSend');
  sugg=document.getElementById('mznAiSugg');
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function(e){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
  });
  input.addEventListener('input', function(){
    this.style.height='auto';
    this.style.height=Math.min(this.scrollHeight,120)+'px';
  });
  return modal;
}

function updateStatus(){
  var st=document.getElementById('mznAiStatus');
  if(!st) return;
  if(getApiKey()){
    st.className='mzn-ai-status';
    st.innerHTML='<span></span>متصل · Gemini';
  } else {
    st.className='mzn-ai-status err';
    st.innerHTML='<span></span>يتطلب الإعداد';
  }
}

/* ============ SETUP SCREEN ============ */
function showSetup(){
  var inputArea=document.getElementById('mznAiInputArea');
  if(inputArea) inputArea.style.display='none';
  if(sugg) sugg.style.display='none';
  body.innerHTML='';
  var setup=document.createElement('div');
  setup.className='mzn-ai-setup';
  setup.innerHTML=
    '<div class="info-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>يُحفظ محلياً في متصفحك فقط</div>'+
    '<h3>ضبط مساعد MIZAN</h3>'+
    '<p>للحصول على تحليل ذكي وقرارات ذكية، أدخل مفتاح Gemini الخاص بك.<br>المفتاح لن يُرفع إلى الإنترنت — يبقى في جهازك فقط.</p>'+
    '<div id="mznSetupError" style="display:none;padding:10px 14px;border-radius:10px;background:rgba(240,160,176,.1);border:1px solid rgba(240,160,176,.25);color:#F0A0B0;font-size:12px;margin-bottom:14px;text-align:center"></div>'+
    '<input type="password" id="mznApiKeyInput" placeholder="AIzaSy..." autocomplete="off" spellcheck="false">'+
    '<p class="hint">لم تحصل على مفتاح بعد؟<br>اذهب إلى <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> وأنشئ مفتاحاً مجانياً.</p>'+
    '<button class="save-btn" id="mznSaveKey">حفظ المفتاح</button>'+
    '<p class="footer-note">🔒 مفتاحك مخزّن في متصفحك فقط. لا يظهر في GitHub ولا في أي مكان آخر.</p>';
  body.appendChild(setup);
  var keyInput=document.getElementById('mznApiKeyInput');
  var saveBtn=document.getElementById('mznSaveKey');
  var errBox=document.getElementById('mznSetupError');

  function showErr(msg){
    if(errBox){
      errBox.textContent='⚠️ '+msg;
      errBox.style.display='block';
      setTimeout(function(){ errBox.style.display='none'; }, 4000);
    }
  }

  setTimeout(function(){ if(keyInput) keyInput.focus(); }, 300);

  saveBtn.addEventListener('click', function(){
    var k=(keyInput.value||'').trim();
    if(!k){
      showErr('أدخل المفتاح أولاً');
      tone(330,.15);
      return;
    }
    if(k.length<20){
      showErr('المفتاح قصير جداً — تأكد من نسخه كاملاً');
      tone(330,.15);
      return;
    }
    /* Only warn if clearly wrong — don't block */
    if(k.indexOf('AIza')!==0 && k.indexOf('AQ')!==0){
      showErr('المفتاح يبدو غير صحيح (يجب أن يبدأ بـ AIza)');
      tone(330,.15);
      return;
    }
    /* Save */
    setApiKey(k);
    tone(880,.12); setTimeout(function(){tone(1174,.15)},90);
    updateStatus();
    /* Success message inside modal */
    body.innerHTML='';
    if(sugg) sugg.style.display='';
    if(inputArea) inputArea.style.display='';
    renderSuggestions();
    var m=document.createElement('div');
    m.className='mzn-ai-msg mzn-ai-ai';
    m.style.maxWidth='100%';
    m.innerHTML='<div style="text-align:center;padding:8px 0"><div style="width:56px;height:56px;margin:0 auto 14px;border-radius:50%;background:rgba(110,231,160,.15);border:1px solid rgba(110,231,160,.3);display:flex;align-items:center;justify-content:center;color:#6EE7A0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><b style="color:#6EE7A0;font-size:14px">تم حفظ المفتاح بنجاح</b><p style="color:#7A8090;font-size:12.5px;line-height:1.7;margin-top:8px">مرحباً '+esc(getUser())+' 👋<br>أنا مساعد MIZAN جاهز للعمل.<br>اسألني عن أي شيء، أو اختر من الاقتراحات أدناه.</p></div>';
    body.appendChild(m);
    setTimeout(function(){ if(input) input.focus(); }, 400);
  });

  keyInput.addEventListener('keydown', function(e){
    if(e.key==='Enter') saveBtn.click();
  });
}

/* ============ SUGGESTIONS ============ */
function renderSuggestions(){
  if(!sugg) return;
  var pathName=window.location.pathname.split('/').pop()||'index.html';
  var suggestions=[];
  if(pathName.indexOf('mizan-pr')===0){
    suggestions=['حلّل طلبات الشراء','ما الذي يحتاج موافقة عاجلة؟','اكتب مسودة رفض'];
  } else if(pathName.indexOf('mizan-po')===0){
    suggestions=['ما أوامر الشراء المتأخرة؟','اقترح نقاط تفاوض','ملخص التنفيذ'];
  } else if(pathName.indexOf('mizan-grn')===0){
    suggestions=['الشحنات المتأخرة','فروقات الفواتير','ملخص الاستلام'];
  } else if(pathName.indexOf('mizan-suppliers')===0){
    suggestions=['الموردون ذوو المخاطر','أعلى إنفاق','توصية مورد'];
  } else if(pathName.indexOf('mizan-reports')===0){
    suggestions=['ملخص الأداء','فرص التوفير','تحليل الاتجاه'];
  } else if(pathName.indexOf('mizan-compare')===0){
    suggestions=['قارن الموردين','من الأفضل؟','نقاط التفاوض'];
  } else {
    suggestions=['ما الذي ينتظرني اليوم؟','ملخص النظام','اقترح أولويات'];
  }
  sugg.innerHTML='';
  suggestions.forEach(function(s){
    var c=document.createElement('button');
    c.className='mzn-ai-chip';
    c.textContent=s;
    c.addEventListener('click', function(){
      if(input){ input.value=s; sendMessage(); }
    });
    sugg.appendChild(c);
  });
}

/* ============ OPEN CHAT ============ */
function openChat(){
  ensureModal();
  modal.style.display='block';
  document.body.style.overflow='hidden';
  requestAnimationFrame(function(){ modal.classList.add('show'); });
  tone(880,.1); setTimeout(function(){tone(1174,.12)},80);
  updateStatus();
  if(!getApiKey()){
    showSetup();
  } else if(!body.children.length){
    addAIMessage('مرحباً '+getUser()+' 👋\n\nأنا مساعد MIZAN الذكي. يمكنني:\n• تحليل بياناتك\n• اقتراح قرارات\n• كتابة مسودات\n• إجابة أسئلتك عن المشتريات\n\nكيف أساعدك اليوم؟');
  }
  setTimeout(function(){ if(input && input.offsetParent) input.focus(); }, 400);
}

function closeChat(){
  if(!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow='';
  setTimeout(function(){ if(modal) modal.style.display='none'; }, 400);
  tone(500,.08);
}

/* ============ MESSAGES ============ */
function addAIMessage(text){
  if(!body) return;
  var m=document.createElement('div');
  m.className='mzn-ai-msg mzn-ai-ai';
  m.innerHTML=formatText(text);
  body.appendChild(m);
  body.scrollTop=body.scrollHeight;
  return m;
}
function addUserMessage(text){
  if(!body) return;
  var m=document.createElement('div');
  m.className='mzn-ai-msg mzn-ai-user';
  m.textContent=text;
  body.appendChild(m);
  body.scrollTop=body.scrollHeight;
}
function addTyping(){
  if(!body) return;
  var m=document.createElement('div');
  m.className='mzn-ai-msg mzn-ai-ai mzn-ai-typing';
  m.id='mznAiTyping';
  m.innerHTML='<span class="mzn-ai-dot"></span><span class="mzn-ai-dot"></span><span class="mzn-ai-dot"></span>';
  body.appendChild(m);
  body.scrollTop=body.scrollHeight;
}
function removeTyping(){
  var t=document.getElementById('mznAiTyping');
  if(t) t.remove();
}
function formatText(text){
  var s=esc(text);
  s=s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
  return s;
}

/* ============ CONTEXT ============ */
function collectContext(){
  var ctx={page:path,user:getUser()};
  var rows=document.querySelectorAll('.pr-row,.po-row,.doc-row');
  if(rows.length){
    ctx.items=[];
    rows.forEach(function(r,i){
      if(i>=20) return;
      var id=r.querySelector('.pr-id,.po-id,.doc-id');
      var title=r.querySelector('.pr-title,.po-title,.doc-title');
      var amt=r.querySelector('.pr-amount,.po-amount,.doc-amount');
      var pill=r.querySelector('.stat-pill');
      ctx.items.push({
        id:id?id.textContent.trim():'',
        title:title?title.textContent.trim():'',
        amount:amt?amt.textContent.trim():'',
        status:pill?pill.textContent.trim():''
      });
    });
  }
  return ctx;
}

/* ============ SEND ============ */
function sendMessage(){
  if(isSending) return;
  var key=getApiKey();
  if(!key){ showSetup(); return; }
  var text=(input.value||'').trim();
  if(!text) return;

  addUserMessage(text);
  input.value='';
  input.style.height='auto';
  isSending=true;
  sendBtn.disabled=true;
  addTyping();
  tone(660,.06);

  var ctx=collectContext();
  var systemPrompt=
    'أنت MIZAN، مساعد تنفيذي متخصص في المشتريات. '+
    'تتحدث بالعربية الفصحى الراقية بأسلوب موجز ومهني. '+
    'كن دقيقاً، اقترح حلولاً عملية، ولا تختلق أرقاماً. '+
    'صاحب القرار بشري — اقترح ولا تُلزم. '+
    'معلومات السياق: المستخدم "'+ctx.user+'"، الصفحة "'+ctx.page+'".';

  var contextStr='';
  if(ctx.items && ctx.items.length){
    contextStr='\n\nالبيانات الحالية على الصفحة:\n'+JSON.stringify(ctx.items.slice(0,15),null,2);
  }

  var fullPrompt=systemPrompt+contextStr+'\n\nسؤال المستخدم: '+text;

  var payload={
    contents:[{ parts:[{ text: fullPrompt }] }],
    generationConfig:{ temperature:0.7, maxOutputTokens:1024, topP:0.95 }
  };

  fetch(API_BASE+'?key='+encodeURIComponent(key),{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  })
  .then(function(r){
    if(!r.ok){
      return r.text().then(function(t){ throw new Error('HTTP '+r.status+': '+t); });
    }
    return r.json();
  })
  .then(function(data){
    removeTyping();
    isSending=false;
    sendBtn.disabled=false;
    var reply='';
    try{
      reply=data.candidates[0].content.parts[0].text;
    }catch(e){
      reply='⚠️ لم أستطع معالجة الرد.';
    }
    addAIMessage(reply);
    tone(880,.1); setTimeout(function(){tone(1174,.12)},80);
  })
  .catch(function(err){
    removeTyping();
    isSending=false;
    sendBtn.disabled=false;
    var msg='⚠️ حدث خطأ في الاتصال.\n\n';
    if(err.message.indexOf('400')!==-1 || err.message.indexOf('403')!==-1){
      msg+='المفتاح غير صحيح. اضغط على أيقونة الإعدادات لإعادة إدخاله.';
      clearApiKey();
      updateStatus();
    } else if(err.message.indexOf('429')!==-1){
      msg+='تجاوزت الحد اليومي. جرّب بعد قليل.';
    } else {
      msg+='تفاصيل: '+err.message.slice(0,150);
    }
    addAIMessage(msg);
    tone(330,.15);
  });
}

console.log('[MIZAN] AI assistant ready (secure mode)');
})();
