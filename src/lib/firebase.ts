
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "panisul-gemini.firebaseapp.com",
  projectId: "panisul-gemini",
  storageBucket: "panisul-gemini.appspot.com",
  messagingSenderId: "609465293628",
  appId: "1:609465293628:web:d21e64344917f415c9a78c"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
