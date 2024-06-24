export class ChatId {
  private networkId: string;
  private tripId: string;
  private hostAddress: string;
  private guestAddress: string;

  constructor(networkId: string, tripId: string, hostAddress: string, guestAddress: string) {
    this.networkId = networkId;
    this.tripId = tripId;
    this.hostAddress = hostAddress;
    this.guestAddress = guestAddress;
  }

  static parse(value: string): ChatId | null {
    const data = value.split("_");
    if (data.length !== 4) return null;
    return new ChatId(data[0], data[1], data[2], data[3]);
  }

  public toString = (): string => {
    return `${this.networkId}_${this.tripId}_${this.hostAddress}_${this.guestAddress}`;
  };
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

export const FIREBASE_DB_NAME = { chats: "chats" };
