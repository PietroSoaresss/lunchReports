import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "almocosagross";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const missing = ["apiKey", "messagingSenderId", "appId"].filter((key) => !firebaseConfig[key]);
if (missing.length > 0) {
  throw new Error(
    `Firebase Web SDK nao configurado. Preencha: ${missing.join(", ")} no arquivo .env do frontend.`
  );
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
