import { logger } from "@/utils/logger";
import {
  Firestore,
  QueryDocumentSnapshot,
  SnapshotOptions,
  arrayUnion,
  doc,
  getDoc,
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
    if(!value) return null;
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
  seenAt?: number;
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
        (uc: {
          chatId: string;
          senderId: string;
          lastMessages: string;
          updatedAt: number;
          isSeen: boolean;
          seenAt?: number;
        }) => {
          return { ...uc, chatId: ChatId.parse(uc.chatId) };
        }
      ),
    } as FirebaseUserChats;
  },
};

type ChatDbInfo = { db: Firestore | undefined; collections: { chats: "chats"; userchats: "userchats" } };

export async function saveMessageToFirebase(dbInfo: ChatDbInfo, message: FirebaseChatMessage) {
  if (!dbInfo.db) return;

  await Promise.all([saveChatMessage(dbInfo, message), updateUserChats(dbInfo, message)]);
}

async function saveChatMessage(dbInfo: ChatDbInfo, message: FirebaseChatMessage) {
  if (!dbInfo.db) return;

  const firebaseMessage = { ...message, chatId: message.chatId.toString() };

  const chatsRef = doc(dbInfo.db, dbInfo.collections.chats, firebaseMessage.chatId);
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

async function updateUserChats(dbInfo: ChatDbInfo, message: FirebaseChatMessage) {
  if (!dbInfo.db) return;

  await Promise.all([
    updateUserChatsForUser(dbInfo, message.chatId.hostAddress, message),
    updateUserChatsForUser(dbInfo, message.chatId.guestAddress, message),
  ]);
}

async function updateUserChatsForUser(dbInfo: ChatDbInfo, userAddress: string, message: FirebaseChatMessage) {
  if (!dbInfo.db) return;
  if (userAddress !== message.chatId.hostAddress && userAddress !== message.chatId.guestAddress) {
    logger.error("user does not belong to this chat id");
    return;
  }

  const updatedUserChat = {
    chatId: message.chatId.toString(),
    senderId: message.senderId,
    lastMessages: message.text,
    updatedAt: message.createdAt,
    isSeen: message.senderId === userAddress,
  };

  const userchatsRef = doc(dbInfo.db, dbInfo.collections.userchats, userAddress);
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
          .userChats.map((uc: any) =>
            uc.chatId === updatedUserChat.chatId ? { ...updatedUserChat, seenAt: uc.seenAt ?? "" } : uc
          ),
      });
    } else {
      await updateDoc(userchatsRef, {
        userChats: arrayUnion(updatedUserChat),
      });
    }
  }
}

export async function markUserChatAsSeen(dbInfo: ChatDbInfo, userAddress: string, chatId: ChatId) {
  if (!dbInfo.db) return;
  if (userAddress !== chatId.hostAddress && userAddress !== chatId.guestAddress) {
    logger.error("user does not belong to this chat id");
    return;
  }

  const userchatsRef = doc(dbInfo.db, dbInfo.collections.userchats, userAddress);
  const userchatsQuerySnapshot = await getDoc(userchatsRef);

  if (userchatsQuerySnapshot.exists()) {
    const existChat = userchatsQuerySnapshot.data().userChats.find((uc: any) => uc.chatId === chatId.toString());

    if (existChat !== undefined) {
      await updateDoc(userchatsRef, {
        userChats: userchatsQuerySnapshot
          .data()
          .userChats.map((uc: any) =>
            uc.chatId === chatId.toString() ? { ...uc, isSeen: true, seenAt: moment().unix() } : uc
          ),
      });
    }
  }
}

export async function checkUserChats(dbInfo: ChatDbInfo, hostAddress: string, guestAddress: string) {
  if (!dbInfo.db) return;

  const hostUserchatsRef = doc(dbInfo.db, dbInfo.collections.userchats, hostAddress);
  const hostUserchatsQuerySnapshot = await getDoc(hostUserchatsRef);

  if (!hostUserchatsQuerySnapshot.exists()) {
    await setDoc(hostUserchatsRef, {
      userId: hostAddress,
      userChats: [],
    });
  }

  const guestUserchatsRef = doc(dbInfo.db, dbInfo.collections.userchats, guestAddress);
  const guestUserchatsQuerySnapshot = await getDoc(guestUserchatsRef);

  if (!guestUserchatsQuerySnapshot.exists()) {
    await setDoc(guestUserchatsRef, {
      userId: guestAddress,
      userChats: [],
    });
  }
}

export async function getChatMessages(dbInfo: ChatDbInfo, chatId: ChatId): Promise<FirebaseChatMessage[]> {
  if (!dbInfo.db) return [];

  const chatsRef = doc(dbInfo.db, dbInfo.collections.chats, chatId.toString());
  const chatsQuerySnapshot = await getDoc(chatsRef);

  if (!chatsQuerySnapshot.exists()) return [];

  const chatMessages = chatsQuerySnapshot.data().messages;
  return chatMessages.map((cm: { chatId: string; senderId: string; text: string; tag: string; createdAt: number }) => {
    return {
      chatId: ChatId.parse(cm.chatId),
      senderId: cm.senderId,
      text: cm.text,
      tag: cm.tag,
      createdAt: cm.createdAt,
    } as FirebaseChatMessage;
  });
}
