(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

var AUTH_KEY='mzn_auth';
var KEY_STORE='mzn_gemini_key';
var CHAT_STORE='mzn_chats';

var MODELS=[
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite'
];
var API_PREFIX='https://generativelanguage.googleapis.com/v1beta/models/';

function getApiKey(){ try{ return localStorage.getItem(KEY_STORE)||''; }catch(e){ return ''; } }
function setApiKey(k){ try{ localStorage.setItem(KEY_STORE,k); }catch(e){} }
function clearApiKey(){ try{ localStorage.removeItem(KEY_STORE); }catch(e){} }
function getUser(){ try{ return localStorage.getItem(AUTH_KEY)||'المستخدم'; }catch(e){ return 'المستخدم'; } }
function tone(f,d,v){ if(window.MZN&&MZN.tone) MZN.tone(f,d,'sine',v||0.05); }
function toast(m,t){ if(window.MZN&&MZN.toast) MZN.toast(m,t||'info'); }
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ============ STORAGE ============ */
function loadChats(){
  try{ return JSON.parse(localStorage.getItem(CHAT_STORE))||{messages:[]}; }
  catch(e){ return {messages:[]}; }
}
function saveChats(data){
  try{
    /* Keep last 60 messages */
    if(data.messages && data.messages.length>60){
      data.messages=data.messages.slice(-60);
    }
    localStorage.setItem(CHAT_STORE, JSON.stringify(data));
  }catch(e){}
}
function addToHistory(role, text){
  var data=loadChats();
  data.messages.push({role:role, text:text, t:Date.now()});
  saveChats(data);
}
function clearHistory(){
  try{ localStorage.removeItem(CHAT_STORE); }catch(e){}
}

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
'.mzn-ai-head{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;gap:10px;flex-shrink:0}'+
'.mzn-ai-avatar{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,rgba(201,169,97,.2),rgba(201,169,97,.05));border:1px solid rgba(201,169,97,.3);display:flex;align-items:center;justify-content:center;color:#E8CE8B;flex-shrink:0}'+
'.mzn-ai-avatar svg{width:18px;height:18px}'+
'.mzn-ai-info{flex:1;text-align:right}'+
'.mzn-ai-name{font-size:13.5px;color:#EDEDED;font-weight:500;margin-bottom:2px}'+
'.mzn-ai-status{font-size:10.5px;color:#6EE7A0;display:flex;align-items:center;gap:5px;justify-content:flex-end}'+
'.mzn-ai-status span{width:5px;height:5px;border-radius:50%;background:#6EE7A0;box-shadow:0 0 8px #6EE7A0;animation:aiPulse2 2s infinite}'+
'.mzn-ai-status.err{color:#F0A0B0}.mzn-ai-status.err span{background:#F0A0B0;box-shadow:0 0 8px #F0A0B0}'+
'@keyframes aiPulse2{0%,100%{opacity:1}50%{opacity:.4}}'+
'.mzn-ai-iconbtn{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.04);border:none;color:#7A8090;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;font-family:inherit;transition:all .2s}'+
'.mzn-ai-iconbtn:active{background:rgba(255,255,255,.08);color:#E8CE8B}'+
'.mzn-ai-iconbtn svg{width:15px;height:15px;pointer-events:none}'+
'.mzn-ai-body{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;min-height:280px;max-height:calc(92vh - 200px)}'+
'.mzn-ai-body::-webkit-scrollbar{width:4px}.mzn-ai-body::-webkit-scrollbar-thumb{background:rgba(201,169,97,.2);border-radius:10px}'+
'.mzn-ai-msgwrap{display:flex;flex-direction:column;max-width:88%}'+
'.mzn-ai-msgwrap.user{align-self:flex-end;align-items:flex-end}'+
'.mzn-ai-msgwrap.ai{align-self:flex-start;align-items:flex-start}'+
'.mzn-ai-msg{width:100%;padding:12px 16px;border-radius:16px;font-size:13.5px;line-height:1.75;white-space:pre-wrap;word-break:break-word;animation:aiMsg .4s cubic-bezier(.16,1,.3,1)}'+
'@keyframes aiMsg{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}'+
'.mzn-ai-ai{background:linear-gradient(145deg,rgba(201,169,97,.08),rgba(201,169,97,.02));border:1px solid rgba(201,169,97,.15);border-radius:16px 16px 16px 4px;color:#EDEDED}'+
'.mzn-ai-user{background:linear-gradient(145deg,rgba(157,196,232,.12),rgba(157,196,232,.04));border:1px solid rgba(157,196,232,.2);border-radius:16px 16px 4px 16px;color:#EDEDED;text-align:right}'+
'.mzn-ai-ai b{color:#E8CE8B;font-weight:500}'+
'.mzn-ai-ai code{background:rgba(201,169,97,.1);padding:2px 6px;border-radius:4px;font-family:"Inter";font-size:12px;color:#E8CE8B}'+
'.mzn-ai-meta{display:flex;gap:8px;margin-top:6px;padding:0 4px}'+
'.mzn-ai-metabtn{background:transparent;border:none;color:#4A5060;font-size:10.5px;font-family:inherit;cursor:pointer;padding:4px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;transition:all .2s}'+
'.mzn-ai-metabtn:active{color:#E8CE8B;background:rgba(201,169,97,.08)}'+
'.mzn-ai-metabtn svg{width:11px;height:11px;pointer-events:none}'+
'.mzn-ai-typing{display:inline-flex;gap:4px;align-items:center;padding:14px 18px}'+
'.mzn-ai-dot{width:6px;height:6px;border-radius:50%;background:#C9A961;animation:aiDot 1.4s infinite}'+
'.mzn-ai-dot:nth-child(2){animation-delay:.15s}'+
'.mzn-ai-dot:nth-child(3){animation-delay:.3s}'+
'@keyframes aiDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}'+
'.mzn-ai-sugg{display:flex;flex-wrap:wrap;gap:8px;padding:0 18px 14px;flex-shrink:0}'+
'.mzn-ai-chip{padding:8px 13px;border-radius:99px;background:rgba(201,169,97,.06);border:1px solid rgba(201,169,97,.2);color:#E8CE8B;font-family:inherit;font-size:11.5px;cursor:pointer;transition:all .2s;white-space:nowrap}'+
'.mzn-ai-chip:active{background:rgba(201,169,97,.15);transform:scale(.96)}'+
'.mzn-ai-input-area{padding:12px 16px 16px;border-top:1px solid rgba(255,255,255,.05);display:flex;align-items:flex-end;gap:8px;flex-shrink:0;background:rgba(8,9,14,.6)}'+
'.mzn-ai-input{flex:1;min-height:42px;max-height:120px;padding:11px 15px;border-radius:21px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);color:#EDEDED;font-size:13.5px;font-family:inherit;outline:none;resize:none;line-height:1.5;overflow-y:auto;box-sizing:border-box}'+
'.mzn-ai-input:focus{border-color:rgba(201,169,97,.4);background:rgba(201,169,97,.03)}'+
'.mzn-ai-input::placeholder{color:#4A5060}'+
'.mzn-ai-send{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#E8CE8B,#C9A961);border:none;color:#08090E;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 8px 20px -4px rgba(201,169,97,.5);transition:all .2s}'+
'.mzn-ai-send:active{transform:scale(.92)}'+
'.mzn-ai-send:disabled{opacity:.4;cursor:not-allowed}'+
'.mzn-ai-send svg{width:17px;height:17px;pointer-events:none}'+
'.mzn-ai-send svg{transform:scaleX(-1)}'+
'.mzn-ai-mic{width:42px;height:42px;border-radius:50%;background:rgba(201,169,97,.08);border:1px solid rgba(201,169,97,.25);color:#E8CE8B;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}'+
'.mzn-ai-mic:active{transform:scale(.92);background:rgba(201,169,97,.15)}'+
'.mzn-ai-mic.recording{background:rgba(240,160,176,.15);border-color:rgba(240,160,176,.5);color:#F0A0B0;animation:micPulse 1s infinite}'+
'@keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(240,160,176,.5)}50%{box-shadow:0 0 0 8px rgba(240,160,176,0)}}'+
'.mzn-ai-mic svg{width:17px;height:17px;pointer-events:none}'+
'.mzn-ai-setup{padding:26px 20px;text-align:center}'+
'.mzn-ai-setup h3{font-size:17px;color:#E8CE8B;font-weight:400;margin:0 0 8px}'+
'.mzn-ai-setup p{font-size:12.5px;color:#7A8090;line-height:1.8;margin:0 0 18px}'+
'.mzn-ai-setup input{width:100%;padding:13px 15px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:#EDEDED;font-size:13px;font-family:Inter,inherit;outline:none;box-sizing:border-box;direction:ltr;text-align:left}'+
'.mzn-ai-setup input:focus{border-color:rgba(201,169,97,.5);background:rgba(201,169,97,.04)}'+
'.mzn-ai-setup .hint{font-size:11px;color:#4A5060;margin-top:12px;line-height:1.7}'+
'.mzn-ai-setup .hint a{color:#E8CE8B;text-decoration:none}'+
'.mzn-ai-setup .save-btn{width:100%;margin-top:18px;padding:13px;border-radius:99px;background:linear-gradient(135deg,#E8CE8B,#C9A961);border:none;color:#08090E;font-weight:600;font-size:13.5px;cursor:pointer;font-family:inherit}'+
'.mzn-ai-setup .info-badge{display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:99px;background:rgba(110,231,160,.08);border:1px solid rgba(110,231,160,.2);color:#6EE7A0;font-size:11px;margin-bottom:18px}'+
'.mzn-ai-setup .info-badge svg{width:13px;height:13px}'+
'.mzn-ai-setup .footer-note{font-size:10.5px;color:#4A5060;margin-top:18px;line-height:1.7}'+
'.mzn-copy-feedback{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(110,231,160,.95);color:#08090E;padding:8px 18px;border-radius:99px;font-size:12px;font-weight:600;z-index:2147483647;animation:aiMsg .3s;pointer-events:none}';
document.head.appendChild(css);

/* ============ FLOATING BUTTON ============ */
var fab=document.createElement('button');
fab.className='mzn-ai-btn';
fab.setAttribute('aria-label','مساعد MIZAN الذكي');
fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 3 6v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3c1-1 3-3 3-6a7 7 0 0 0-7-7z"/><path d="M9 22h6"/></svg>';
fab.addEventListener('click', openChat);
document.body.appendChild(fab);

/* ============ CHAT MODAL ============ */
var modal=null, body=null, input=null, sendBtn=null, sugg=null, micBtn=null;
var isSending=false;
var recognition=null;
var isRecording=false;

function ensureModal(){
  if(modal) return modal;
  modal=document.createElement('div');
  modal.className='mzn-ai-modal';
  modal.innerHTML=
    '<div class="mzn-ai-bd"></div>'+
    '<div class="mzn-ai-sh">'+
      '<div class="mzn-ai-head">'+
        '<button class="mzn-ai-iconbtn" data-close aria-label="إغلاق" style="font-size:16px">✕</button>'+
        '<button class="mzn-ai-iconbtn" id="mznAiClear" aria-label="محادثة جديدة" title="محادثة جديدة"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg></button>'+
        '<div class="mzn-ai-info">'+
          '<div class="mzn-ai-name">مساعد MIZAN</div>'+
          '<div class="mzn-ai-status" id="mznAiStatus"><span></span>متصل · Gemini</div>'+
        '</div>'+
        '<div class="mzn-ai-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 3 6v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3c1-1 3-3 3-6a7 7 0 0 0-7-7z"/><path d="M9 22h6"/></svg></div>'+
      '</div>'+
      '<div class="mzn-ai-body" id="mznAiBody"></div>'+
      '<div class="mzn-ai-sugg" id="mznAiSugg"></div>'+
      '<div class="mzn-ai-input-area" id="mznAiInputArea">'+
        '<button class="mzn-ai-send" id="mznAiSend" aria-label="إرسال"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'+
        '<textarea class="mzn-ai-input" id="mznAiInput" placeholder="اسأل مساعدك..." rows="1"></textarea>'+
        '<button class="mzn-ai-mic" id="mznAiMic" aria-label="إدخال صوتي"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);
  modal.querySelector('.mzn-ai-bd').addEventListener('click', closeChat);
  modal.querySelector('[data-close]').addEventListener('click', closeChat);
  modal.querySelector('#mznAiClear').addEventListener('click', newChat);
  body=document.getElementById('mznAiBody');
  input=document.getElementById('mznAiInput');
  sendBtn=document.getElementById('mznAiSend');
  sugg=document.getElementById('mznAiSugg');
  micBtn=document.getElementById('mznAiMic');
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function(e){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
  });
  input.addEventListener('input', function(){
    this.style.height='auto';
    this.style.height=Math.min(this.scrollHeight,120)+'px';
  });
  micBtn.addEventListener('click', toggleVoice);
  setupVoice();
  return modal;
}

/* ============ VOICE INPUT ============ */
function setupVoice(){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    if(micBtn) micBtn.style.display='none';
    return;
  }
  try{
    recognition=new SR();
    recognition.lang='ar-SA';
    recognition.continuous=false;
    recognition.interimResults=true;
    recognition.onresult=function(e){
      var txt='';
      for(var i=e.resultIndex;i<e.results.length;i++){
        txt+=e.results[i][0].transcript;
      }
      if(input) input.value=txt;
    };
    recognition.onend=function(){
      isRecording=false;
      if(micBtn) micBtn.classList.remove('recording');
    };
    recognition.onerror=function(e){
      isRecording=false;
      if(micBtn) micBtn.classList.remove('recording');
      if(e.error==='not-allowed'){
        toast('⚠️ امنح الإذن للميكروفون','warning');
      }
    };
  }catch(e){
    if(micBtn) micBtn.style.display='none';
  }
}

function toggleVoice(){
  if(!recognition){
    toast('⚠️ الإدخال الصوتي غير مدعوم','warning');
    return;
  }
  if(isRecording){
    try{ recognition.stop(); }catch(e){}
    isRecording=false;
    micBtn.classList.remove('recording');
    tone(500,.08);
  } else {
    try{
      recognition.start();
      isRecording=true;
      micBtn.classList.add('recording');
      tone(880,.08);
    }catch(e){}
  }
}

/* ============ STATUS ============ */
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

/* ============ SETUP ============ */
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
    '<p class="hint">لم تحصل على مفتاح بعد؟<br>اذهب إلى <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a></p>'+
    '<button class="save-btn" id="mznSaveKey">حفظ المفتاح</button>'+
    '<p class="footer-note">🔒 مفتاحك مخزّن في متصفحك فقط.</p>';
  body.appendChild(setup);
  var keyInput=document.getElementById('mznApiKeyInput');
  var saveBtn=document.getElementById('mznSaveKey');
  var errBox=document.getElementById('mznSetupError');
  function showErr(m){
    if(errBox){ errBox.textContent='⚠️ '+m; errBox.style.display='block'; setTimeout(function(){errBox.style.display='none';},4000); }
  }
  setTimeout(function(){ if(keyInput) keyInput.focus(); }, 300);
  saveBtn.addEventListener('click', function(){
    var k=(keyInput.value||'').trim();
    if(!k){ showErr('أدخل المفتاح أولاً'); tone(330,.15); return; }
    if(k.length<20){ showErr('المفتاح قصير جداً'); tone(330,.15); return; }
    if(k.indexOf('AIza')!==0){ showErr('يجب أن يبدأ المفتاح بـ AIza'); tone(330,.15); return; }
    setApiKey(k);
    tone(880,.12); setTimeout(function(){tone(1174,.15)},90);
    updateStatus();
    body.innerHTML='';
    if(sugg) sugg.style.display='';
    if(inputArea) inputArea.style.display='';
    renderSuggestions();
    showWelcome();
  });
  keyInput.addEventListener('keydown', function(e){ if(e.key==='Enter') saveBtn.click(); });
}

function showWelcome(){
  var m=document.createElement('div');
  m.className='mzn-ai-msgwrap ai';
  m.innerHTML='<div class="mzn-ai-msg mzn-ai-ai"><div style="text-align:center;padding:6px 0"><div style="width:52px;height:52px;margin:0 auto 12px;border-radius:50%;background:rgba(110,231,160,.15);border:1px solid rgba(110,231,160,.3);display:flex;align-items:center;justify-content:center;color:#6EE7A0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><b style="color:#6EE7A0;font-size:13.5px">تم ضبط المساعد</b><p style="color:#7A8090;font-size:12px;line-height:1.7;margin-top:6px">مرحباً '+esc(getUser())+' 👋<br>أنا مساعد MIZAN جاهز.<br>اسألني أو استخدم الميكروفون 🎤</p></div></div>';
  body.appendChild(m);
  body.scrollTop=body.scrollHeight;
}

/* ============ SUGGESTIONS ============ */
function renderSuggestions(){
  if(!sugg) return;
  var pathName=window.location.pathname.split('/').pop()||'index.html';
  var suggestions=[];
  if(pathName.indexOf('mizan-pr')===0){
    suggestions=['حلّل طلبات الشراء','ما يحتاج موافقة عاجلة؟','اكتب مسودة رفض'];
  } else if(pathName.indexOf('mizan-po')===0){
    suggestions=['ما الأوامر المتأخرة؟','اقترح نقاط تفاوض','ملخص التنفيذ'];
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
    /* Restore history */
    var data=loadChats();
    if(data.messages && data.messages.length){
      data.messages.forEach(function(m){
        if(m.role==='user') addUserMessage(m.text, true);
        else addAIMessage(m.text, true);
      });
    } else {
      addAIMessage('مرحباً '+getUser()+' 👋\n\nأنا مساعد MIZAN الذكي.\n\nيمكنني:\n• تحليل بياناتك\n• اقتراح قرارات\n• كتابة مسودات\n• إجابة أسئلتك\n\n🎤 أو استخدم الميكروفون للتحدث');
    }
  }
  setTimeout(function(){ if(input && input.offsetParent) input.focus(); }, 400);
}

function closeChat(){
  if(!modal) return;
  if(isRecording && recognition){ try{ recognition.stop(); }catch(e){} isRecording=false; if(micBtn) micBtn.classList.remove('recording'); }
  modal.classList.remove('show');
  document.body.style.overflow='';
  setTimeout(function(){ if(modal) modal.style.display='none'; }, 400);
  tone(500,.08);
}

function newChat(){
  if(!confirm('محادثة جديدة؟ ستُحذف المحادثة الحالية.')) return;
  clearHistory();
  body.innerHTML='';
  addAIMessage('مرحباً '+getUser()+' 👋\n\nمحادثة جديدة بدأت.\nكيف أساعدك؟');
  tone(880,.1);
}

/* ============ MESSAGES ============ */
function addAIMessage(text, silent){
  if(!body) return null;
  var wrap=document.createElement('div');
  wrap.className='mzn-ai-msgwrap ai';
  var msg=document.createElement('div');
  msg.className='mzn-ai-msg mzn-ai-ai';
  msg.innerHTML=formatText(text);
  wrap.appendChild(msg);
  /* Meta actions */
  var meta=document.createElement('div');
  meta.className='mzn-ai-meta';
  var copyBtn=document.createElement('button');
  copyBtn.className='mzn-ai-metabtn';
  copyBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>نسخ';
  copyBtn.addEventListener('click', function(){
    copyText(text);
  });
  meta.appendChild(copyBtn);
  wrap.appendChild(meta);
  body.appendChild(wrap);
  body.scrollTop=body.scrollHeight;
  if(!silent) addToHistory('ai', text);
  return wrap;
}

function addUserMessage(text, silent){
  if(!body) return;
  var wrap=document.createElement('div');
  wrap.className='mzn-ai-msgwrap user';
  var msg=document.createElement('div');
  msg.className='mzn-ai-msg mzn-ai-user';
  msg.textContent=text;
  wrap.appendChild(msg);
  body.appendChild(wrap);
  body.scrollTop=body.scrollHeight;
  if(!silent) addToHistory('user', text);
}

function addTyping(){
  if(!body) return;
  var wrap=document.createElement('div');
  wrap.className='mzn-ai-msgwrap ai';
  wrap.id='mznAiTyping';
  wrap.innerHTML='<div class="mzn-ai-msg mzn-ai-ai mzn-ai-typing"><span class="mzn-ai-dot"></span><span class="mzn-ai-dot"></span><span class="mzn-ai-dot"></span></div>';
  body.appendChild(wrap);
  body.scrollTop=body.scrollHeight;
}
function removeTyping(){
  var t=document.getElementById('mznAiTyping');
  if(t) t.remove();
}

function formatText(text){
  var s=esc(text);
  /* Bold */
  s=s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  /* Inline code */
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
  /* Headers: ### */
  s=s.replace(/###\s*(.+?)(\n|$)/g,'<b style="color:#E8CE8B;display:block;margin-top:6px">$1</b>$2');
  /* Bullets: * or - */
  s=s.replace(/^[\*\-]\s+(.+)$/gm,'• $1');
  return s;
}

function copyText(text){
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){
        showCopyFeedback();
      }).catch(function(){ fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }catch(e){ fallbackCopy(text); }
}
function fallbackCopy(text){
  try{
    var ta=document.createElement('textarea');
    ta.value=text;
    ta.style.position='fixed';
    ta.style.opacity='0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showCopyFeedback();
  }catch(e){}
}
function showCopyFeedback(){
  tone(880,.08);
  var t=document.createElement('div');
  t.className='mzn-copy-feedback';
  t.textContent='✓ تم النسخ';
  document.body.appendChild(t);
  setTimeout(function(){ t.remove(); }, 1200);
}

/* ============ CONTEXT (from page + Supabase) ============ */
function collectContext(callback){
  var ctx={page:path, user:getUser(), items:[]};
  var rows=document.querySelectorAll('.pr-row,.po-row,.doc-row');
  rows.forEach(function(r,i){
    if(i>=25) return;
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
  callback(ctx);
}

/* ============ SEND ============ */
function sendMessage(){
  if(isSending) return;
  if(isRecording && recognition){ try{ recognition.stop(); }catch(e){} isRecording=false; if(micBtn) micBtn.classList.remove('recording'); }
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

  collectContext(function(ctx){
    /* Build history summary */
    var hist=loadChats().messages.slice(-10);
    var histStr='';
    if(hist.length>1){
      histStr='\n\nسياق المحادثة السابقة:\n';
      hist.forEach(function(m){
        histStr+=(m.role==='user'?'المستخدم: ':'المساعد: ')+m.text.slice(0,300)+'\n';
      });
    }

    var systemPrompt=
      'أنت MIZAN، مساعد تنفيذي متخصص في المشتريات. '+
      'تتحدث بالعربية الفصحى الراقية بأسلوب موجز ومهني. '+
      'كن دقيقاً، اقترح حلولاً عملية، ولا تختلق أرقاماً. '+
      'صاحب القرار بشري — اقترح ولا تُلزم. '+
      'استخدم التنسيق: عناوين بعلامة ###، نقاط بعلامة -، تأكيدات بـ **نص**. '+
      'المستخدم: "'+ctx.user+'", الصفحة الحالية: "'+ctx.page+'".';

    var contextStr='';
    if(ctx.items && ctx.items.length){
      contextStr='\n\nالبيانات المعروضة على الصفحة ('+ctx.items.length+' عنصر):\n'+JSON.stringify(ctx.items.slice(0,20),null,2);
    }

    var fullPrompt=systemPrompt+histStr+contextStr+'\n\nسؤال المستخدم: '+text;
    var payload={
      contents:[{ parts:[{ text: fullPrompt }] }],
      generationConfig:{ temperature:0.75, maxOutputTokens:1024, topP:0.95 }
    };

    var modelIdx=0;
    function tryFetch(){
      if(modelIdx>=MODELS.length){
        removeTyping();
        isSending=false;
        sendBtn.disabled=false;
        addAIMessage('⚠️ تعذّر الاتصال بجميع النماذج.\n\nجرّب لاحقاً أو أنشئ مفتاحاً جديداً.');
        tone(330,.15);
        return;
      }
      var model=MODELS[modelIdx];
      var url=API_PREFIX+model+':generateContent?key='+encodeURIComponent(key);
      fetch(url,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      })
      .then(function(r){
        if(r.status===404||r.status===400){
          return r.text().then(function(t){ modelIdx++; tryFetch(); return null; });
        }
        if(r.status===429) return r.text().then(function(){ throw new Error('429'); });
        if(r.status===403||r.status===401) return r.text().then(function(){ throw new Error('403'); });
        if(!r.ok) return r.text().then(function(t){ throw new Error('HTTP '+r.status); });
        return r.json();
      })
      .then(function(data){
        if(!data) return;
        removeTyping();
        isSending=false;
        sendBtn.disabled=false;
        var reply='';
        try{ reply=data.candidates[0].content.parts[0].text; }
        catch(e){ reply='⚠️ لم أستطع معالجة الرد.'; }
        addAIMessage(reply);
        tone(880,.1); setTimeout(function(){tone(1174,.12)},80);
      })
      .catch(function(err){
        removeTyping();
        isSending=false;
        sendBtn.disabled=false;
        var msg='⚠️ خطأ في الاتصال.\n\n';
        var em=err.message||'';
        if(em==='429') msg+='تجاوزت الحد اليومي لـ Gemini.';
        else if(em==='403'||em==='401'){
          msg+='المفتاح غير صالح. أعد إدخاله.';
          clearApiKey();
          updateStatus();
        } else msg+='تفاصيل: '+em.slice(0,100);
        addAIMessage(msg);
        tone(330,.15);
      });
    }
    tryFetch();
  });
}

console.log('[MIZAN] AI assistant v2 ready — history, voice, copy');
})();
