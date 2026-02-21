import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ Replace these values with your Firebase project config
// Go to: https://console.firebase.google.com → Your Project → Project Settings → Your apps
const firebaseConfig = {
    apiKey: "AIzaSyB8bVi-dOFKJhMC6J9qX_S6dtww_lmxpH4",
    authDomain: "saraswati-medical.firebaseapp.com",
    projectId: "saraswati-medical",
    storageBucket: "saraswati-medical.firebasestorage.app",
    messagingSenderId: "166391875693",
    appId: "1:166391875693:web:0e99eea72ae814eafad764",
    measurementId: "G-E3YW5VK9F6"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
console.log("🔥 Firebase initialized for project:", firebaseConfig.projectId);

// Initialize Auth with persistence correctly
let authInstance;
try {
    // @ts-ignore
    authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (e) {
    console.log("ℹ️ Auth already initialized, getting existing instance");
    authInstance = getAuth(app);
}

export const auth = authInstance;

// Initialize Firestore
let dbInstance;
try {
    // Specifically use 'default' as confirmed by user screenshot
    dbInstance = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
    }, 'default');
    console.log("📦 Firestore initialized with database: 'default'");
} catch (e) {
    console.log("ℹ️ Firestore already initialized, getting existing instance");
    dbInstance = getFirestore(app, 'default');
}

export const db = dbInstance;
export const storage = getStorage(app);
export default app;
