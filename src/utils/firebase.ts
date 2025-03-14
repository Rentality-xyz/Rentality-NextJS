import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { Auth, getAuth, signInWithCustomToken, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { isEmpty } from "./string";
import { env } from "./env";
import { logger } from "./logger";

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let analyticsPromise: Promise<Analytics | null>;
let chatDb: Firestore | undefined;
let cacheDb: Firestore | undefined;
let kycDb: Firestore | undefined;
let storage: FirebaseStorage;
let auth: Auth;
let login: (token: string) => Promise<User | undefined>;
let loginWithPassword: (email: string, password: string) => Promise<User | undefined>;
let logout: () => Promise<void>;

if (!isEmpty(firebaseConfig.projectId)) {
  app = initializeApp(firebaseConfig);
  analyticsPromise = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
  chatDb = getFirestore(app, "rentality-chat-db");
  cacheDb = getFirestore(app, "rentality-cache-db");
  kycDb = getFirestore(app, "rentality-kyc-info-db");
  storage = getStorage(app);
  auth = getAuth(app);
  login = async (token: string) => {
    try {
      const userCredential = await signInWithCustomToken(auth, token);
      return userCredential.user;
    } catch (error) {
      logger.error(`firebase login error:`, error);
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
      logger.error(`firebase login error:`, error);
    }
  };
}

const chatDbInfo = { db: chatDb, collections: { chats: "chats", userchats: "userchats" } as const };
const cacheDbInfo = { db: cacheDb, collections: { carApi: "car-api-cache", userErrors: "user-errors" } as const };
const kycDbInfo = { db: kycDb, collections: { kycInfos: "kycInfos" } as const };

export {
  app,
  analyticsPromise,
  chatDbInfo,
  cacheDbInfo,
  kycDbInfo,
  storage,
  auth,
  login as loginWithCustomToken,
  loginWithPassword,
  logout,
};
