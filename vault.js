(function(){
'use strict';
var path=(window.location.pathname.split('/').pop()||'').split('?')[0];
if(path==='mizan-login.html') return;

var BUCKET='mizan-vault';
var SUPABASE_URL='https://aibtdqkzzfohdvhmkzxw.supabase.co';
var MAX_SIZE=5*1024*1024;   /* 5 MB */
var MAX_BATCH=20*1024*1024; /* 20 MB in one batch */

function getKey(){
  /* Use the same key as supabase.js */
  try{
    var raw=localStorage.getItem('mzn_gemini_key');
    /* Not the gemini key — supabase key is in supabase.js */
  }catch(e){}
  if(window.MZN_DB && window.MZN_DB.key) return window.MZN_DB.key;
  return '';
}
function getUrl(){ return SUPABASE_URL; }
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmtBytes(b){
  b=parseInt(b)||0;
  if(b<1024) return b+' B';
  if(b<1048576) return (b/1024).toFixed(1)+' KB';
  return (b/1048576).toFixed(2)+' MB';
}
function tone(f,d,v){ if(window.MZN&&MZN.tone) MZN.tone(f,d,'sine',v||0.05); }
function toast(m,t){ if(window.MZN&&MZN.toast) MZN.toast(m,t||'info'); }

/* ============ DOC TYPES ============ */
var DOC_TYPES=[
  {k:'rfq', l:'RFQ · طلب عرض سعر'},
  {k:'offer', l:'عرض مورد'},
  {k:'compare', l:'تقرير مقارنة'},
  {k:'decision', l:'قرار اعتماد'},
  {k:'po', l:'أمر شراء PO'},
  {k:'bol', l:'بوليصة شحن'},
  {k:'insurance', l:'بوليصة تأمين'},
  {k:'invoice', l:'فاتورة'},
  {k:'packing', l:'قائمة تعبئة'},
  {k:'origin', l:'شهادة منشأ'},
  {k:'customs', l:'بيان جمركي'},
  {k:'grn', l:'سند استلام'},
  {k:'photos', l:'صور استلام'},
  {k:'letters', l:'مراسلات'},
  {k:'other', l:'أخرى'}
];
function docLabel(k){
  for(var i=0;i<DOC_TYPES.length;i++) if(DOC_TYPES[i].k===k) return DOC_TYPES[i].l;
  return k;
}

/* ============ COMPRESS IMAGE ============ */
function compressImage(file, maxW, quality){
  maxW=maxW||1600;
  quality=quality||0.75;
  return new Promise(function(resolve,reject){
    if(!file.type || file.type.indexOf('image/')!==0){
      resolve(file);
      return;
    }
    /* Skip GIFs (animation) */
    if(file.type==='image/gif'){ resolve(file); return; }
    /* Skip small files (< 500KB) */
    if(file.size < 500*1024){ resolve(file); return; }

    var reader=new FileReader();
    reader.onload=function(e){
      var img=new Image();
      img.onload=function(){
        var w=img.width, h=img.height;
        if(w>maxW){
          h=Math.round(h*(maxW/w));
          w=maxW;
        }
        var canvas=document.createElement('canvas');
        canvas.width=w; canvas.height=h;
        var ctx=canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(function(blob){
          if(!blob){ resolve(file); return; }
          /* If compressed is larger — keep original */
          if(blob.size >= file.size){ resolve(file); return; }
          var ext=file.name.split('.').pop().toLowerCase();
          var newExt=(ext==='png'?'jpg':ext);
          var newName=file.name.replace(/\.[^.]+$/, '')+'.'+newExt;
          var newFile=new File([blob], newName, {type:'image/jpeg'});
          resolve(newFile);
        }, 'image/jpeg', quality);
      };
      img.onerror=function(){ resolve(file); };
      img.src=e.target.result;
    };
    reader.onerror=function(){ reject(new Error('تعذّر قراءة الملف')); };
    reader.readAsDataURL(file);
  });
}

/* ============ UPLOAD TO STORAGE ============ */
async function uploadToStorage(file, poCode){
  var key=getKey();
  var url=getUrl();
  if(!key) throw new Error('مفتاح Supabase مفقود');

  /* Build unique path: PO/YYYY-MM-DD-timestamp-random.ext */
  var today=new Date().toISOString().slice(0,10);
  var ts=Date.now();
  var rand=Math.random().toString(36).slice(2,8);
  var ext=file.name.split('.').pop().toLowerCase().slice(0,8);
  var safePo=(poCode||'general').replace(/[^a-zA-Z0-9-]/g,'_');
  var safeName=safePo+'/'+today+'-'+ts+'-'+rand+'.'+ext;

  var uploadUrl=url+'/storage/v1/object/'+BUCKET+'/'+safeName;

  var response=await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer '+key,
      'apikey': key,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'false'
    },
    body: file
  });

  if(!response.ok){
    var errText='';
    try{ errText=await response.text(); }catch(e){}
    throw new Error('فشل الرفع: '+response.status+' '+errText);
  }

  /* Public URL */
  var publicUrl=url+'/storage/v1/object/public/'+BUCKET+'/'+safeName;
  return {path:safeName, url:publicUrl};
}

/* ============ SAVE METADATA ============ */
async function saveMetadata(data){
  if(!window.MZN_DB) throw new Error('Supabase غير متاح');
  return window.MZN_DB.create('vault', data);
}

/* ============ MAIN: UPLOAD FILE ============ */
async function uploadFile(file, meta){
  /* meta: {po_code, supplier, doc_type, notes} */
  if(!meta.po_code){
    throw new Error('يجب ربط الملف بأمر شراء (PO)');
  }
  if(file.size > MAX_SIZE){
    throw new Error('حجم الملف يتجاوز '+fmtBytes(MAX_SIZE));
  }

  /* Compress if image */
  var toUpload=file;
  if(file.type && file.type.indexOf('image/')===0){
    try{ toUpload=await compressImage(file); }catch(e){ toUpload=file; }
  }

  /* Upload */
  var uploaded=await uploadToStorage(toUpload, meta.po_code);

  /* Save metadata */
  var user='المستخدم';
  try{ user=localStorage.getItem('mzn_auth')||'المستخدم'; }catch(e){}

  var record={
    po_code: meta.po_code,
    supplier: meta.supplier||'',
    doc_type: meta.doc_type||'other',
    doc_name: file.name,
    doc_url: uploaded.url,
    doc_size: toUpload.size,
    doc_mime: toUpload.type||file.type||'',
    notes: meta.notes||'',
    uploaded_by: user
  };
  var saved=await saveMetadata(record);

  return {
    file: toUpload,
    original: file,
    uploaded: uploaded,
    record: Array.isArray(saved)?saved[0]:saved,
    savedBytes: file.size - toUpload.size
  };
}

/* ============ LIST FILES ============ */
async function listFiles(filters){
  filters=filters||{};
  if(!window.MZN_DB) return [];
  var items=await window.MZN_DB.list('vault');
  if(!items) return [];
  /* Sort by date desc */
  items.sort(function(a,b){
    return (b.created_at||'').localeCompare(a.created_at||'');
  });
  if(filters.po_code){
    items=items.filter(function(i){ return i.po_code===filters.po_code; });
  }
  if(filters.doc_type && filters.doc_type!=='all'){
    items=items.filter(function(i){ return i.doc_type===filters.doc_type; });
  }
  if(filters.search){
    var q=filters.search.toLowerCase();
    items=items.filter(function(i){
      return (i.doc_name||'').toLowerCase().indexOf(q)!==-1 ||
             (i.po_code||'').toLowerCase().indexOf(q)!==-1 ||
             (i.supplier||'').toLowerCase().indexOf(q)!==-1;
    });
  }
  return items;
}

/* ============ DELETE FILE ============ */
async function deleteFile(item){
  if(!window.MZN_DB) throw new Error('Supabase غير متاح');
  /* Delete from Storage */
  var key=getKey();
  var url=getUrl();
  /* Extract path from URL */
  var parts=(item.doc_url||'').split('/object/public/'+BUCKET+'/');
  if(parts.length===2){
    var storagePath=parts[1];
    try{
      await fetch(url+'/storage/v1/object/'+BUCKET+'/'+storagePath, {
        method:'DELETE',
        headers:{ 'Authorization':'Bearer '+key, 'apikey':key }
      });
    }catch(e){ console.warn('[MIZAN] Storage delete failed', e); }
  }
  /* Delete metadata */
  if(item.id) return window.MZN_DB.remove('vault', item.id);
  return true;
}

/* ============ PUBLIC API ============ */
window.MZN_VAULT={
  BUCKET:BUCKET,
  MAX_SIZE:MAX_SIZE,
  MAX_BATCH:MAX_BATCH,
  DOC_TYPES:DOC_TYPES,
  docLabel:docLabel,
  fmtBytes:fmtBytes,
  uploadFile:uploadFile,
  listFiles:listFiles,
  deleteFile:deleteFile,
  compressImage:compressImage
};

console.log('[MIZAN] Vault module ready');
})();
