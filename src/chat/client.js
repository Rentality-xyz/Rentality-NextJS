import {
  Waku,
  getUserKeysContentTopic,
  ChatPublicKeyMessage,
  getTripChatContentTopic,
  ForwardedMessage,
} from "./waku.js";
import { generateEncryptionKeyPair } from "./crypto.ts";
import { createDecoder as eciesDecoder } from "@waku/message-encryption/ecies";
import { isEmpty } from "@/utils/string";
import { bytesToHex, hexToBytes } from "@waku/utils/bytes";

export class Client {
  constructor(signer, onMessageReceived) {
    this.roomKeys = new Map();
    //this.encryptionKeyPair = generateEncryptionKeyPair()
    const localEncryptionPuKey = localStorage.getItem(
      "userChatEncryptionPuKey" + signer.address
    ) ?? "";
    const localEncryptionPrKey = localStorage.getItem(
      "userChatEncryptionPrKey" + signer.address
    )?? "";
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
    this.sendMessage = this.sendMessage.bind(this);
    this.onChatEncryptionKey = this.onChatEncryptionKey.bind(this);
    this.onChatMessage = this.onChatMessage.bind(this);
    this.onMessageReceived = onMessageReceived;
  }

  async init() {
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

  async onChatEncryptionKey(msg) {
    if (!msg.payload) return;
    const publicKeyMsg = ChatPublicKeyMessage.decode(msg.payload);
    if (!publicKeyMsg) return;

    const tripId = Number(publicKeyMsg.tripId);

    this.roomKeys.set(tripId, publicKeyMsg.chatPublicKey);
    console.log(`Set chat encryption key for trip ${tripId}\n`);
    await this.listenForChatMessages(tripId);
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
    console.log(`\n\nReceived chat message from ${chatMessage.sender}`);
    console.log(`Message: ${chatMessage.message}\n`);
    this.onMessageReceived(chatMessage.tripId, chatMessage.message, chatMessage.sender);
  }

  get walletAddress() {
    return this.signer.address;
  }
}
