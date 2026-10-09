/* ============ MIZAN · Supabase Client ============ */
/* يُحمَّل تلقائياً من nav.js */
(function(){
'use strict';

/* ⚠️ استبدل YOUR_ANON_KEY_HERE بمفتاحك من Supabase */
var SUPABASE_URL = 'https://aibtdqkzzfohdvhmkzxw.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpYnRkcWt6emZvaGR2aG1renh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTQxMDUsImV4cCI6MjEwNzEzMDEwNX0.yIZzBaemkbSUglUYkMThP2swkZfpHQ0gV_n0ANW5hIE';

/* ============ API HELPER ============ */
function api(table, method, options){
  options = options || {};
  var url = SUPABASE_URL + '/rest/v1/' + table;
  if(options.id) url += '?id=eq.' + options.id;
  if(options.code) url += '?code=eq.' + encodeURIComponent(options.code);
  if(options.order) url += (url.indexOf('?')===-1?'?':'&') + 'order=created_at.desc';

  var headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  var fetchOpts = { method: method, headers: headers };
  if(options.body) fetchOpts.body = JSON.stringify(options.body);

  return fetch(url, fetchOpts).then(function(r){
    if(!r.ok){
      return r.text().then(function(t){ throw new Error('HTTP '+r.status+': '+t); });
    }
    if(method==='DELETE') return true;
    return r.json();
  });
}

/* ============ PUBLIC API ============ */
window.MZN_DB = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,

  /* List */
  list: function(table){
    return api(table, 'GET', {order:true});
  },

  /* Create */
  create: function(table, data){
    return api(table, 'POST', {body:data});
  },

  /* Update by id */
  update: function(table, id, data){
    var url = SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + id;
    return fetch(url, {
      method:'PATCH',
      headers:{
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    }).then(function(r){
      if(!r.ok) throw new Error('Update failed');
      return r.json();
    });
  },

  /* Delete by id */
  remove: function(table, id){
    var url = SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + id;
    return fetch(url, {
      method:'DELETE',
      headers:{
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    }).then(function(r){
      if(!r.ok) throw new Error('Delete failed');
      return true;
    });
  },

  /* Test connection */
  ping: function(){
    return fetch(SUPABASE_URL + '/rest/v1/prs?limit=1', {
      headers:{
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    }).then(function(r){
      console.log('[MIZAN] Supabase connection:', r.ok ? 'OK' : 'FAILED');
      return r.ok;
    }).catch(function(e){
      console.error('[MIZAN] Supabase error:', e);
      return false;
    });
  }
};

console.log('[MIZAN] Supabase client loaded');

})();
