/* MIZAN Service Worker */
const CACHE = 'mizan-v2';
const CORE = [
  './',
  './index.html',
  './mizan-login.html',
  './nav.js',
  './app.js',
  './actions.js',
  './stats.js',
  './ai.js',
  './supabase.js'
];

/* Install: cache core files */
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(CORE).catch(function(){});
    })
  );
});

/* Activate: clean old caches */
self.addEventListener('activate', function(e){
  self.clients.claim();
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
});

/* Fetch: cache-first for static, network for API */
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);

  /* Skip API calls — always go to network */
  if(url.hostname.indexOf('supabase.co') !== -1) return;
  if(url.hostname.indexOf('googleapis.com') !== -1) return;
  if(url.hostname.indexOf('vercel.app') !== -1 && url.pathname.indexOf('.js') === -1 && url.pathname.indexOf('.html') === -1) return;

  /* Network-first for HTML (to get latest) */
  if(e.request.headers.get('accept') && e.request.headers.get('accept').indexOf('text/html') !== -1){
    e.respondWith(
      fetch(e.request).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return res;
      }).catch(function(){
        return caches.match(e.request);
      })
    );
    return;
  }

  /* Cache-first for assets */
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(res){
        if(res && res.status === 200 && res.type === 'basic'){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){
        return cached;
      });
    })
  );
});

/* Notification click: open app */
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(self.clients.openWindow('/index.html'));
});
