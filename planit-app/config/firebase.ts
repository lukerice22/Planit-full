// planit-app/src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  // @ts-ignore
  initializeAuth,
  // @ts-ignore
  getAuth,
  // @ts-ignore
  getReactNativePersistence,
} from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Read from Expo env (must be defined in planit-app/.env)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

// Ensure singletons on fast refresh
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// IMPORTANT: only call initializeAuth once
let auth = getApps().length ? getAuth() : initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const firestore = getFirestore(app);

export { app, auth, firestore };