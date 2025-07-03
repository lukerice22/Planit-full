import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { BASE_URL } from './api';

let app;
let auth;
let googleProvider;
let firestore;

export const initFirebase = async () => {
  if (!app) {
    const res = await fetch(`${BASE_URL}/api/firebase-config`);
    const config = await res.json();
    app = initializeApp(config);
    auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    googleProvider = new GoogleAuthProvider();
    firestore = getFirestore(app);
  }
};

export { auth, googleProvider, firestore };