const CACHE='moolah-v3';
const FILES=['./','./index.html','./manifest.json','./style.css','./app.js','./fonts/bricolage-grotesque-latin-600-normal.woff2','./fonts/bricolage-grotesque-latin-700-normal.woff2','./fonts/dm-sans-latin-400-normal.woff2','./fonts/dm-sans-latin-500-normal.woff2','./fonts/dm-sans-latin-600-normal.woff2','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r})
      .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});
