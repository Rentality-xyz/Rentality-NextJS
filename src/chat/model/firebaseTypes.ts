import {
  Firestore,
  QueryDocumentSnapshot,
  QuerySnapshot,
  SnapshotMetadata,
  SnapshotOptions,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import moment from "moment";

export class ChatId {
  private _networkId: string;
  private _tripId: string;
  private _hostAddress: string;
  private _guestAddress: string;

  constructor(networkId: string, tripId: string, hostAddress: string, guestAddress: string) {
    this._networkId = networkId;
    this._tripId = tripId;
    this._hostAddress = hostAddress;
    this._guestAddress = guestAddress;
  }

  static parse(value: string): ChatId | null {
    const data = value.split("_");
    if (data.length !== 4) return null;
    return new ChatId(data[0], data[1], data[2], data[3]);
  }

  public toString = (): string => {
    return `${this._networkId}_${this._tripId}_${this._hostAddress}_${this._guestAddress}`;
  };

  get hostAddress() {
    return this._hostAddress;
  }

  get guestAddress() {
    return this._guestAddress;
  }
}

export const FIREBASE_DB_NAME = { chats: "chats", userchats: "userchats" };

export type FirebaseChatMessage = {
  chatId: ChatId;
  senderId: string;
  text: string;
  tag: string;
  createdAt: number;
};

export type FirebaseChat = {
  chatId: ChatId;
  createdAt: number;
  messages: FirebaseChatMessage[];
};

export const chatsConverter = {
  toFirestore: (chat: FirebaseChat) => {
    return {
      ...chat,
      chatId: chat.chatId.toString(),
      messages: chat.messages.map((m) => {
        return { ...m, chatId: m.chatId.toString() };
      }),
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return {
      chatId: ChatId.parse(data.chatId),
      createdAt: data.createdAt,
      messages: data.messages.map(
        (m: { chatId: string; senderId: string; text: string; tag: string; createdAt: number }) => {
          return { ...m, chatId: ChatId.parse(m.chatId) };
        }
      ),
    } as FirebaseChat;
  },
};

export type FirebaseUserChat = {
  chatId: ChatId;
  senderId: string;
  lastMessages: string;
  updatedAt: number;
  isSeen: boolean;
};

export type FirebaseUserChats = {
  userId: string;
  userChats: FirebaseUserChat[];
};

export const userChatsConverter = {
  toFirestore: (userChats: FirebaseUserChats) => {
    return {
      ...userChats,
      userChats: userChats.userChats.map((uc) => {
        return { ...uc, chatId: uc.chatId.toString() };
      }),
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return {
      userId: data.userId,
      userChats: data.userChats.map(
        (uc: { chatId: string; senderId: string; lastMessages: string; updatedAt: number; isSeen: boolean }) => {
          return { ...uc, chatId: ChatId.parse(uc.chatId) };
        }
      ),
    } as FirebaseUserChats;
  },
};

export async function saveMessageToFirebase(db: Firestore, message: FirebaseChatMessage) {
  if (!db) return;

  await Promise.all([saveChatMessage(db, message), updateUserChats(db, message)]);
}

async function saveChatMessage(db: Firestore, message: FirebaseChatMessage) {
  if (!db) return;

  const firebaseMessage = { ...message, chatId: message.chatId.toString() };

  const chatsRef = doc(db, FIREBASE_DB_NAME.chats, firebaseMessage.chatId);
  const chatsQuerySnapshot = await getDoc(chatsRef);
  if (!chatsQuerySnapshot.exists()) {
    await setDoc(chatsRef, {
      chatId: firebaseMessage.chatId,
      createdAt: moment().unix(),
      messages: [firebaseMessage],
    });
  } else {
    await updateDoc(chatsRef, {
      messages: arrayUnion(firebaseMessage),
    });
  }
}

async function updateUserChats(db: Firestore, message: FirebaseChatMessage) {
  if (!db) return;

  await Promise.all([
    updateUserChatsForUser(db, message.chatId.hostAddress, message),
    updateUserChatsForUser(db, message.chatId.guestAddress, message),
  ]);
}

async function updateUserChatsForUser(db: Firestore, userAddress: string, message: FirebaseChatMessage) {
  if (!db) return;
  if (userAddress !== message.chatId.hostAddress && userAddress !== message.chatId.guestAddress) {
    console.error("user does not belong to this chat id");
    return;
  }

  const updatedUserChat = {
    chatId: message.chatId.toString(),
    senderId: message.senderId,
    lastMessages: message.text,
    updatedAt: message.createdAt,
    isSeen: message.senderId === userAddress,
  };

  const userchatsRef = doc(db, FIREBASE_DB_NAME.userchats, userAddress);
  const userchatsQuerySnapshot = await getDoc(userchatsRef);

  if (!userchatsQuerySnapshot.exists()) {
    await setDoc(userchatsRef, {
      userId: userAddress,
      userChats: [updatedUserChat],
    });
  } else {
    const isUserChatExists =
      userchatsQuerySnapshot.data().userChats.find((uc: any) => uc.chatId === updatedUserChat.chatId) !== undefined;

    if (isUserChatExists) {
      await updateDoc(userchatsRef, {
        userChats: userchatsQuerySnapshot
          .data()
          .userChats.map((uc: any) => (uc.chatId === updatedUserChat.chatId ? updatedUserChat : uc)),
      });
    } else {
      await updateDoc(userchatsRef, {
        userChats: arrayUnion(updatedUserChat),
      });
    }
  }
}

export async function checkUserChats(db: Firestore, hostAddress: string, guestAddress: string) {
  if (!db) return;

  const hostUserchatsRef = doc(db, FIREBASE_DB_NAME.userchats, hostAddress);
  const hostUserchatsQuerySnapshot = await getDoc(hostUserchatsRef);

  if (!hostUserchatsQuerySnapshot.exists()) {
    await setDoc(hostUserchatsRef, {
      userId: hostAddress,
      userChats: [],
    });
  }

  const guestUserchatsRef = doc(db, FIREBASE_DB_NAME.userchats, guestAddress);
  const guestUserchatsQuerySnapshot = await getDoc(guestUserchatsRef);

  if (!guestUserchatsQuerySnapshot.exists()) {
    await setDoc(guestUserchatsRef, {
      userId: guestAddress,
      userChats: [],
    });
  }
}

export async function getChatMessages(db: Firestore, chatId: ChatId): Promise<FirebaseChatMessage[]> {
  const chatsRef = doc(db, FIREBASE_DB_NAME.chats, chatId.toString());
  const chatsQuerySnapshot = await getDoc(chatsRef);

  if (!chatsQuerySnapshot.exists()) {
    await setDoc(chatsRef, {
      chatId: chatId.toString(),
      createdAt: moment().unix(),
      messages: [],
    });
    return [];
  } else {
    const chatMessages = chatsQuerySnapshot.data().messages;
    return chatMessages.map(
      (cm: { chatId: string; senderId: string; text: string; tag: string; createdAt: number }) => {
        return {
          chatId: ChatId.parse(cm.chatId),
          senderId: cm.senderId,
          text: cm.text,
          tag: cm.tag,
          createdAt: cm.createdAt,
        } as FirebaseChatMessage;
      }
    );
  }
}
