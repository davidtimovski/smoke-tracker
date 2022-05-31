import { build, files, version } from '$service-worker';

self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(version).then((cache) => {
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
					if (key !== version) {
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
