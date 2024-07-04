import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { Firestore, getFirestore } from "firebase/firestore";
import { isEmpty } from "./string";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string,
};

let app: FirebaseApp;
let analyticsPromise: Promise<Analytics | null>;
let db: Firestore;

if (typeof window != undefined && !isEmpty(firebaseConfig.projectId)) {
  app = initializeApp(firebaseConfig);
  analyticsPromise = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
  db = getFirestore(app, "rentality-chat-db");
}

export { app, analyticsPromise, db };
