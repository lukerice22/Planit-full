// config/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  // @ts-ignore
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
} from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth with persistent storage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Firestore DB
const firestore = getFirestore(app);

export { auth, firestore };
export const db = getFirestore(app);