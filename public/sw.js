// Service Worker for offline capabilities
const CACHE_NAME = 'bizflow-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Sync data when back online
async function syncData() {
  // Get offline data from IndexedDB or localStorage
  const offlineData = await getOfflineData();
  
  // Sync with server
  for (const item of offlineData) {
    try {
      await syncItem(item);
    } catch (error) {
      console.error('Sync failed for item:', item, error);
    }
  }
}

async function getOfflineData() {
  // Implementation to get offline data
  return [];
}

async function syncItem(item) {
  // Implementation to sync individual item
  return fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify(item),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}