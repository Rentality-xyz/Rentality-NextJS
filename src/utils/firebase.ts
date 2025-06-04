import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { Auth, getAuth, signInWithCustomToken, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import {
  doc,
  collection,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { isEmpty } from "./string";
import { env } from "./env";
import { logger } from "./logger";
import { Err, Ok, Result } from "@/model/utils/result";

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

async function readDocFromFirebaseDb<T>(
  db: Firestore | undefined,
  collection: string,
  params: string[]
): Promise<Result<T | null>> {
  if (!db) return Err(new Error("db is null"));

  const documentRef = doc(db, collection, ...params);
  const documentSnapshot = await getDoc(documentRef);

  if (documentSnapshot.exists()) {
    return Ok(documentSnapshot.data() as T);
  }

  return Ok(null);
}

async function readDocsFromFirebaseDb(
  db: Firestore | undefined,
  collectionPath: string
): Promise<Result<QueryDocumentSnapshot<DocumentData, DocumentData>[] | null>> {
  if (!db) return Err(new Error("db is null"));

  const collectionRef = collection(db, collectionPath);
  const collectionSnapshot = await getDocs(collectionRef);

  if (!collectionSnapshot.empty) {
    return Ok(collectionSnapshot.docs);
  }

  return Ok(null);
}

async function saveDocToFirebaseDb<T extends { [x: string]: any }>(
  db: Firestore | undefined,
  collection: string,
  params: string[],
  value: T
): Promise<Result<boolean>> {
  if (!db) return Err(new Error("db is null"));

  const documentRef = doc(db, collection, ...params);
  const documentSnapshot = await getDoc(documentRef);

  if (!documentSnapshot.exists()) {
    await setDoc(documentRef, value);
  } else {
    await updateDoc(documentRef, value);
  }

  return Ok(true);
}

export {
  app,
  analyticsPromise,
  chatDbInfo,
  cacheDbInfo,
  kycDbInfo,
  readDocFromFirebaseDb,
  readDocsFromFirebaseDb,
  saveDocToFirebaseDb,
  storage,
  auth,
  login as loginWithCustomToken,
  loginWithPassword,
  logout,
};
