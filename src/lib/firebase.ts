
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "panisul-gemini.firebaseapp.com",
  projectId: "panisul-gemini",
  storageBucket: "panisul-gemini.appspot.com",
  messagingSenderId: "609465293628",
  appId: "1:609465293628:web:8e2e7d9f1569c975331c39"
};

// Initialize Firebase
let app: FirebaseApp;
try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
    console.error("Falha ao inicializar o Firebase. Verifique a configuração.", error);
    // Em um cenário real, você poderia lançar o erro novamente ou ter um fallback.
    // Para depuração, o log é o mais importante.
    app = {} as FirebaseApp; // Evita erros de "não inicializado" em outras partes do código.
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
