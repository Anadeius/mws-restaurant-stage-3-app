const restaurantReviewsCacheName = 'restaurantReviews-static-002';
const imgsCacheName = 'restaurantReviews-images-002'; 

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(restaurantReviewsCacheName).then((cache) => {
            return cache.addAll([
                '/',
                '/restaurant.html',
                '/css/styles.css',
                '/js/main.js',
				'/js/restaurant.js',
				'/manifest.json',				
            ]);
        }).catch((err) => {
            console.log("Cache error while opening: " + err);
        })
    );
});

self.addEventListener('fetch', (event) => {
    let requestURL = new URL(event.request.url);

    if (requestURL.origin === location.origin) {
        if (requestURL.pathname.startsWith('/images/')){
            event.respondWith(cachedImage(event.request));
            return;
        }
        if (requestURL.pathname === '/restaurant.html'){
            event.respondWith(caches.match('/restaurant.html'));
            return;
        }
    }

    event.respondWith(
        caches.match(event.request).then((response) =>{
            return response || fetch(event.request);
        })
    );
});

const cachedImage = (request) => {
    return caches.open(imgsCacheName).then((cache) => {
        return cache.match(request.url).then((response) =>{
            if (response) return response;

            return fetch(request).then((networkResponse) => {
                cache.put(request.url, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}

/* self.addEventListener('sync', (event) => {
	if (event.tag == 'syncOfflineFavorites'){
		event.waitUntil(syncHandler.syncOfflineFavorites().then({}));
	}

	if(event.tag == 'syncOfflineReviews'){
		event.waitUntil(syncHandler.syncOfflineReviews().then({}));
	}
}); */