import { Waku, getUserChatContentTopic } from "./waku";
import { generateEncryptionKeyPair } from "./crypto";
import { createDecoder as eciesDecoder } from "@waku/message-encryption/ecies";
import { isEmpty } from "@/utils/string";
import { hexToBytes } from "@waku/utils/bytes";
import { DecodedMessage, LightNode, PageDirection } from "@waku/sdk";
import { ChatMessage } from "./model/chatMessage";
import { Signer } from "ethers";

export class Client {
  node: LightNode | undefined;
  encryptionKeyPair:
    | { privateKey: Uint8Array; publicKey: Uint8Array }
    | undefined;
  signer: Signer | undefined;
  onUserMessageReceived:
    | ((
        from: string,
        to: string,
        tripId: number,
        datetime: number,
        message: string
      ) => void)
    | undefined;

  constructor() {
    this.init = this.init.bind(this);
    this.listenForUserChatMessages = this.listenForUserChatMessages.bind(this);
    this.getUserChatMessages = this.getUserChatMessages.bind(this);
    this.sendUserMessage = this.sendUserMessage.bind(this);
    this.onUserChatMessage = this.onUserChatMessage.bind(this);
  }

  async init(
    signer: Signer,
    onUserMessageReceived: (
      from: string,
      to: string,
      tripId: number,
      datetime: number,
      message: string
    ) => void,
    myStoredPrivateKey: string,
    myStoredPublicKey: string
  ) {
    const walletAddress = await (await signer.getAddress()).toLowerCase();
    localStorage.removeItem("userChatEncryptionPuKey" + walletAddress);
    localStorage.removeItem("userChatEncryptionPrKey" + walletAddress);

    if (isEmpty(myStoredPrivateKey) || isEmpty(myStoredPublicKey)) {
      console.log("Generating new EncryptionKeyPair...");
      this.encryptionKeyPair = generateEncryptionKeyPair();
    } else {
      this.encryptionKeyPair = {
        privateKey: hexToBytes(myStoredPrivateKey),
        publicKey: hexToBytes(myStoredPublicKey),
      };
    }
    this.signer = signer;
    this.onUserMessageReceived = onUserMessageReceived;

    this.node = await Waku.initializeNode();
  }

  async listenForUserChatMessages() {
    if (!this.node) return;
    if (!this.encryptionKeyPair) return;
    if (!this.signer) return;

    const walletAddress = (await this.signer.getAddress()).toLowerCase();
    const contentTopic = getUserChatContentTopic(walletAddress);

    await this.node.filter.subscribe(
      eciesDecoder(contentTopic, this.encryptionKeyPair.privateKey),
      this.onUserChatMessage
    );

    console.log(`Listening for messages at ${contentTopic}`);
  }

  onUserChatMessage(msg: DecodedMessage) {
    if (!this.onUserMessageReceived) return;
    if (!msg.payload) return;

    const chatMessage = ChatMessage.decode(msg.payload);
    if (!chatMessage) return;

    console.log(
      `\n\nReceived chat message from ${chatMessage.from}: Message: ${chatMessage.message}\n`
    );
    this.onUserMessageReceived(
      chatMessage.from,
      chatMessage.to,
      chatMessage.tripId,
      chatMessage.datetime,
      chatMessage.message
    );
  }

  async getUserChatMessages() {
    if (!this.node) return;
    if (!this.encryptionKeyPair) return;
    if (!this.signer) return;

    const walletAddress = (await this.signer.getAddress()).toLowerCase();
    const contentTopic = getUserChatContentTopic(walletAddress);

    const startTime = new Date();
    // 30 days, 24 hours/day, 60min/hour, 60secs/min, 100ms/sec
    startTime.setTime(startTime.getTime() - 30 * 24 * 60 * 60 * 1000);

    // TODO: Remove this timeout once https://github.com/status-im/js-waku/issues/913 is done
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      for await (const messagesPromises of this.node.store.queryGenerator(
        [eciesDecoder(contentTopic, this.encryptionKeyPair.privateKey)],
        {
          timeFilter: { startTime, endTime: new Date() },
          pageDirection: PageDirection.BACKWARD,
          pageSize: 100,
        }
      )) {
        const messages = await Promise.all(
          messagesPromises
            .map(async (p) => {
              const msg = await p;
              return this.decodeStoreUserChatMessage(msg);
            })
            .filter(Boolean)
        );
        console.log(
          `For user ${walletAddress} restored ${
            messages?.length ?? 0
          } message(s)`
        );
        return messages;
      }
    } catch (e) {
      console.log("Failed to retrieve messages", e);
    }
  }

  decodeStoreUserChatMessage(msg: DecodedMessage | undefined) {
    if (!msg || !msg.payload) return;

    const chatMessage = ChatMessage.decode(msg.payload);
    if (!chatMessage) return;

    return {
      from: chatMessage.from,
      to: chatMessage.to,
      tripId: chatMessage.tripId,
      datetime: chatMessage.datetime,
      message: chatMessage.message,
    };
  }

  async sendUserMessage(
    toAddress: string,
    tripId: number,
    datetime: number,
    message: string,
    chatPublicKey: string
  ) {
    if (!this.node) return;
    if (!this.encryptionKeyPair) return;
    if (!this.signer) return;

    await Waku.sendUserChatMessage(
      toAddress,
      tripId,
      datetime,
      message,
      this.signer,
      hexToBytes(chatPublicKey),
      this.encryptionKeyPair.publicKey,
      this.node
    );
  }
}
