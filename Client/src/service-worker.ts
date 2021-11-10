import { build, files, timestamp } from '$service-worker';

const CACHE_NAME = timestamp.toString();

self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			const preCacheResources = ['/'].concat(build).concat(files);
			cache.addAll(preCacheResources);
		})
	);
});

// Remove old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				})
			);
		})
	);
});

// Cache or fall back to the network
self.addEventListener('fetch', (event: FetchEvent) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});
