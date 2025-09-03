import { FirebaseApp, initializeApp } from 'firebase/app';
import {
    Auth,
    browserLocalPersistence,
    getAuth,
    GoogleAuthProvider,
    setPersistence,
} from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { BASE_URL } from './api';

let app: FirebaseApp | null = null;
let auth: Auth;
let googleProvider: GoogleAuthProvider;
let firestore: Firestore;

export const initFirebase = async (): Promise<void> => {
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

export { auth, firestore, googleProvider };

