/**
 * Registers a Service Worker for the site.
 */
navigator.serviceWorker.register('sw.js', {scope: '/' }).then((reg) => {
  console.log("Service Worker registered successfully");
}).catch(err => {
  console.log("Service Worker not registered. Error: " + err);
});
  