const CACHE='flash-power-'+self.registration.scope+'-v2';
const FILES=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(event.request);
      if(response.ok)await cache.put(event.request,response.clone());
      return response;
    }catch(error){
      const saved=await cache.match(event.request);
      if(saved)return saved;
      if(event.request.mode==='navigate'){
        const fallback=await cache.match(new URL('./index.html',self.registration.scope).href);
        if(fallback)return fallback;
      }
      throw error;
    }
  })());
});
