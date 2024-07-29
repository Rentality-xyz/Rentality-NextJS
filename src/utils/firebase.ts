import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { Auth, getAuth, signInWithCustomToken, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
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
let storage: FirebaseStorage;
let auth: Auth;
let login: (token: string) => Promise<User | undefined>;
let loginWithPassword: (email: string, password: string) => Promise<User | undefined>;
let logout: () => Promise<void>;

if (!isEmpty(firebaseConfig.projectId)) {
  app = initializeApp(firebaseConfig);
  analyticsPromise = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
  db = getFirestore(app, "rentality-chat-db");
  storage = getStorage(app);
  auth = getAuth(app);
  login = async (token: string) => {
    try {
      const userCredential = await signInWithCustomToken(auth, token);
      return userCredential.user;
    } catch (error) {
      console.error(`firebase login error:`, error);
    }
  };
  logout = async () => {
    await signOut(auth);
  };
  loginWithPassword = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error(`firebase login error:`, error);
    }
  };
}

export { app, analyticsPromise, db, storage, auth, login as loginWithCustomToken, loginWithPassword, logout };
