/* ============================================================
   MIZAN — Service Worker
   الإصدار: v35
   ============================================================ */

const CACHE = 'mizan-v37';
const RUNTIME = 'mizan-runtime-v37';

/* الملفات الأساسية — بدون theme.js */
const PRECACHE = [
  './',
  './index.html',
  './mizan-login.html',
  './dashboard.html',
  './mizan-vault.html',
  './icon.svg',
  './manifest.json'
];

/* ============================================================
   Install
   ============================================================ */
self.addEventListener('install', function(event){
  console.log('[SW] Install v35');
  event.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(PRECACHE).catch(function(err){
        console.warn('[SW] Precache partial fail:', err);
      });
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

/* ============================================================
   Activate
   ============================================================ */
self.addEventListener('activate', function(event){
  console.log('[SW] Activate v35');
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){
          return k !== CACHE && k !== RUNTIME;
        }).map(function(k){
          console.log('[SW] Delete old cache:', k);
          return caches.delete(k);
        })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

/* ============================================================
   Fetch
   ============================================================ */
self.addEventListener('fetch', function(event){
  const req = event.request;
  const url = new URL(req.url);

  if(req.method !== 'GET') return;
  if(url.hostname.indexOf('supabase.co') !== -1) return;
  if(url.hostname.indexOf('googleapis.com') !== -1) return;
  if(url.hostname.indexOf('gstatic.com') !== -1) return;

  /* التنقل — من الشبكة أولاً */
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req).then(function(res){
        const copy = res.clone();
        caches.open(RUNTIME).then(function(cache){
          cache.put(req, copy);
        });
        return res;
      }).catch(function(){
        return caches.match(req).then(function(cached){
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* ملفات JS/CSS/SVG — Network First (لتحديث أسرع) */
  if(/\.(js|css|svg|woff2?|ttf)$/i.test(url.pathname)){
    event.respondWith(
      fetch(req).then(function(res){
        if(res && res.status === 200){
          const copy = res.clone();
          caches.open(CACHE).then(function(cache){
            cache.put(req, copy);
          });
        }
        return res;
      }).catch(function(){
        return caches.match(req);
      })
    );
    return;
  }

  /* الباقي — Network First مع fallback */
  event.respondWith(
    fetch(req).then(function(res){
      if(res && res.status === 200 && res.type === 'basic'){
        const copy = res.clone();
        caches.open(RUNTIME).then(function(cache){
          cache.put(req, copy);
        });
      }
      return res;
    }).catch(function(){
      return caches.match(req);
    })
  );
});

/* ============================================================
   رسائل من الصفحة
   ============================================================ */
self.addEventListener('message', function(event){
  if(event.data && event.data.type === 'SKIP_WAITING'){
    self.skipWaiting();
  }
  if(event.data && event.data.type === 'CLEAR_CACHE'){
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){
      console.log('[SW] All caches cleared');
    });
  }
});

console.log('[SW] MIZAN v35 loaded');
