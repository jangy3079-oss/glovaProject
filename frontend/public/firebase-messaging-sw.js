// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyB93YYPWNzeGwRS0XH2d1oth127kspQ0E4",
  authDomain: "glova-2aa96.firebaseapp.com",
  projectId: "glova-2aa96",
  storageBucket: "glova-2aa96.firebasestorage.app",
  messagingSenderId: "83102862549",
  appId: "1:83102862549:web:83f33a0fd5a26e291aa65c",
  measurementId: "G-46KX2HEMYX"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Globar/glovaLogo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
