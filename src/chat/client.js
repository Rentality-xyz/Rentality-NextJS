import {
  Waku,
  getUserKeysContentTopic,
  ChatPublicKeyMessage,
  getTripChatContentTopic,
  ForwardedMessage,
  ChatPublicKeysMessage,
} from "./waku.js";
import { generateEncryptionKeyPair } from "./crypto.ts";
import { createDecoder as eciesDecoder } from "@waku/message-encryption/ecies";
import { isEmpty } from "@/utils/string";
import { bytesToHex, hexToBytes } from "@waku/utils/bytes";
import { PageDirection } from "@waku/sdk";

export class Client {
  constructor() {
    this.roomKeys = new Map();
    this.init = this.init.bind(this);
    this.listenForChatEncryptionKeys =
      this.listenForChatEncryptionKeys.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.onChatEncryptionKey = this.onChatEncryptionKey.bind(this);
    this.onChatEncryptionKeys = this.onChatEncryptionKeys.bind(this);
    this.onChatMessage = this.onChatMessage.bind(this);
  }

  async init(signer, onMessageReceived) {
    //this.encryptionKeyPair = generateEncryptionKeyPair()
    const localEncryptionPuKey =
      localStorage.getItem("userChatEncryptionPuKey" + signer.address) ?? "";
    const localEncryptionPrKey =
      localStorage.getItem("userChatEncryptionPrKey" + signer.address) ?? "";
    if (isEmpty(localEncryptionPuKey)) {
      this.encryptionKeyPair = generateEncryptionKeyPair();
      localStorage.setItem(
        "userChatEncryptionPuKey" + signer.address,
        bytesToHex(this.encryptionKeyPair.publicKey)
      );
      localStorage.setItem(
        "userChatEncryptionPrKey" + signer.address,
        bytesToHex(this.encryptionKeyPair.privateKey)
      );
    } else {
      this.encryptionKeyPair = {
        publicKey: hexToBytes(localEncryptionPuKey),
        privateKey: hexToBytes(localEncryptionPrKey),
      };
    }
    this.signer = signer;
    this.onMessageReceived = onMessageReceived;

    this.node = await Waku.initializeNode();
  }

  async listenForChatEncryptionKeys(walletAddress) {
    await this.node.filter.subscribe(
      eciesDecoder(
        getUserKeysContentTopic(walletAddress),
        this.encryptionKeyPair.privateKey
      ),
      this.onChatEncryptionKey
    );
    await this.node.filter.subscribe(
      eciesDecoder(
        getUserKeysContentTopic(walletAddress),
        this.encryptionKeyPair.privateKey
      ),
      this.onChatEncryptionKeys
    );
    console.log(
      `Listening for chat encryption keys at ${getUserKeysContentTopic(
        walletAddress
      )}`
    );
  }

  async listenForChatMessages(tripId) {
    await this.node.filter.subscribe(
      eciesDecoder(
        getTripChatContentTopic(tripId),
        this.encryptionKeyPair.privateKey
      ),
      this.onChatMessage
    );

    console.log(`Listening for messages at ${getTripChatContentTopic(tripId)}`);
  }

  async sendRoomKeyRequest(tripId) {
    await Waku.sendPublicKeyMessage(
      tripId,
      this.encryptionKeyPair.publicKey,
      this.signer,
      this.node
    );
  }

  async sendRoomKeysRequest(tripIds) {
    await Waku.sendPublicKeysMessage(
      JSON.stringify(tripIds),
      this.encryptionKeyPair.publicKey,
      this.signer,
      this.node
    );
  }

  async getChatMessages(tripId) {
    const startTime = new Date();
    // 7 days/week, 24 hours/day, 60min/hour, 60secs/min, 100ms/sec
    startTime.setTime(startTime.getTime() - 7 * 24 * 60 * 60 * 1000);

    // TODO: Remove this timeout once https://github.com/status-im/js-waku/issues/913 is done
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      for await (const messagesPromises of this.node.store.queryGenerator(
        [
          eciesDecoder(
            getTripChatContentTopic(tripId),
            this.encryptionKeyPair.privateKey
          ),
        ],
        {
          timeFilter: { startTime, endTime: new Date() },
          pageDirection: PageDirection.BACKWARD,
          pageSize: 25,
        }
      )) {
        const messages = await Promise.all(
          messagesPromises
            .map(async (p) => {
              const msg = await p;
              return this.decodeStoreChatMessage(msg);
            })
            .filter(Boolean)
        );
        console.log(
          `For trip ${tripId} restored ${messages?.length ?? 0} message(s)`
        );
        return messages;
      }
    } catch (e) {
      console.log("Failed to retrieve messages", e);
    }
  }

  decodeStoreChatMessage(msg) {
    if (!msg || !msg.payload) return;
    const chatMessage = ForwardedMessage.decode(msg.payload);
    if (!chatMessage) return;
    return {
      tripId: chatMessage.tripId,
      message: chatMessage.message,
      sender: chatMessage.sender,
    };
  }

  async onChatEncryptionKey(msg) {
    if (!msg.payload) return;
    const publicKeyMsg = ChatPublicKeyMessage.decode(msg.payload);
    if (!publicKeyMsg) return;

    const tripId = Number(publicKeyMsg.tripId);

    this.roomKeys.set(tripId, publicKeyMsg.chatPublicKey);
    console.log(`Set chat encryption key for trip ${tripId}\n`);
    await this.listenForChatMessages(tripId);
  }

  async onChatEncryptionKeys(msg) {
    if (!msg.payload) return;
    const publicKeysMsg = ChatPublicKeysMessage.decode(msg.payload);
    if (!publicKeysMsg) return;

    const tripKeys = JSON.parse(publicKeysMsg.tripChatKeyDictionary);

    await Promise.all(
      tripKeys.map(async (tripKey) => {
        console.log(`Set chat encryption key for trip ${tripKey.tripId}\n`);
        this.roomKeys.set(tripKey.tripId, hexToBytes(tripKey.chatKey));
        await this.listenForChatMessages(tripKey.tripId);
      })
    );
  }

  async sendMessage(tripId, message) {
    const roomKey = this.roomKeys.get(tripId);
    if (!roomKey) {
      console.log(`No room key for trip ${tripId}`);
      return;
    }

    await Waku.sendChatMessage(
      tripId,
      message,
      this.signer,
      roomKey,
      this.node
    );
  }

  onChatMessage(msg) {
    if (!msg.payload) return;
    const chatMessage = ForwardedMessage.decode(msg.payload);
    if (!chatMessage) return;
    console.log(
      `\n\nReceived chat message from ${chatMessage.sender}: Message: ${chatMessage.message}\n`
    );
    this.onMessageReceived(
      chatMessage.tripId,
      chatMessage.message,
      chatMessage.sender
    );
  }

  get walletAddress() {
    return this.signer.address;
  }
}
