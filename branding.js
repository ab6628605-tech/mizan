(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

var STORE='mzn_branding';
var DEFAULTS={
  company: 'MIZAN',
  tagline: 'EXECUTIVE PROCUREMENT',
  logo: 'scale',        /* scale | briefcase | chart | shield | globe */
  primary: '#C9A961',
  primaryBright: '#E8CE8B',
  copper: '#B87333',
  language: 'ar',       /* ar | en */
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
  /* CSS variables */
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

  /* Update MIZAN logo text (top of pages) */
  document.querySelectorAll('.logo-text,.brand-title,.logo-brand').forEach(function(el){
    if(el.textContent.trim()==='MIZAN' || el.textContent.trim()==='MIZAN'.toUpperCase()){
      el.textContent=b.company;
    }
  });

  /* Update tagline */
  document.querySelectorAll('.tag,.logo-sub,.brand-mark').forEach(function(el){
    var txt=(el.textContent||'').trim();
    if(txt.indexOf('EXECUTIVE PROCUREMENT')!==-1 || txt==='EXECUTIVE PROCUREMENT'){
      el.textContent=b.tagline;
    }
  });

  /* Update logo icon (SVG inside .logo-icon, .avatar, etc) */
  document.querySelectorAll('.logo-icon svg, .logo-mark svg, .brand-icon svg').forEach(function(svg){
    if(svg.dataset.mznBranded) return;
    svg.dataset.mznBranded='1';
    svg.innerHTML=LOGO_PATHS[b.logo]||LOGO_PATHS.scale;
  });

  /* Update title */
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

/* ============ INIT ============ */
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', applyBranding);
} else {
  applyBranding();
}
setTimeout(applyBranding, 1000);
setTimeout(applyBranding, 2500);

console.log('[MIZAN] Branding ready:', current.company);
})();
