self.addEventListener('install', (event) => {
  console.log('QAPRIL Service Worker: Installed');
});

self.addEventListener('fetch', (event) => {
  // Basic Fetch handler for PWA compliance
});
