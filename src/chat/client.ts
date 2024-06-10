import { createEncoder as eciesEncoder, createDecoder as eciesDecoder } from "@waku/message-encryption/ecies";
import { DecodedMessage } from "@waku/message-encryption";
import { LightNode, PageDirection, Protocols, createLightNode, waitForRemotePeer } from "@waku/sdk";
import { hexToBytes } from "@waku/utils/bytes";
import { Signer } from "ethers";
import moment from "moment";
import { isEmpty } from "@/utils/string";
import { ChatMessage } from "./model/chatMessage";
import { signUserChatMessage } from "./crypto";

export function getUserChatContentTopic(address: string) {
  return `/rentality/1/pm-user-t-${String(address).toLowerCase()}/proto`;
}

async function initializeNode() {
  console.log("Initializing node");
  const node = await createLightNode({ defaultBootstrap: true });
  console.log("Starting Waku node.");
  await node.start();
  console.log("Waiting for a peer");
  await waitForRemotePeer(node, [Protocols.Filter, Protocols.LightPush, Protocols.Store]);
  console.log("Node initialized");
  return node;
}

export class Client {
  node: LightNode | undefined;
  encryptionKeyPair: { privateKey: Uint8Array; publicKey: Uint8Array } | undefined;
  signer: Signer | undefined;
  onUserMessageReceived:
    | ((from: string, to: string, tripId: number, datetime: number, message: string) => void)
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
    onUserMessageReceived: (from: string, to: string, tripId: number, datetime: number, message: string) => void,
    privateKey: string,
    publicKey: string
  ) {
    if (isEmpty(privateKey) || isEmpty(publicKey)) {
      throw new Error("privateKey or publicKey is empty");
    }
    this.encryptionKeyPair = {
      privateKey: hexToBytes(privateKey),
      publicKey: hexToBytes(publicKey),
    };
    this.signer = signer;
    this.onUserMessageReceived = onUserMessageReceived;

    this.node = await initializeNode();
  }

  async listenForUserChatMessages() {
    if (!this.node) return;
    if (!this.encryptionKeyPair) return;
    if (!this.signer) return;

    const walletAddress = (await this.signer.getAddress()).toLowerCase();
    const contentTopic = getUserChatContentTopic(walletAddress);

    const subscription = await this.node.filter.createSubscription();
    await subscription.subscribe(eciesDecoder(contentTopic, this.encryptionKeyPair.privateKey), this.onUserChatMessage);

    // await this.node.filter.subscribe(
    //   eciesDecoder(contentTopic, this.encryptionKeyPair.privateKey),
    //   this.onUserChatMessage
    // );

    console.log(`Listening for messages at ${contentTopic}`);
  }

  onUserChatMessage(msg: DecodedMessage) {
    if (!this.onUserMessageReceived) return;
    if (!msg.payload) return;

    const chatMessage = ChatMessage.decode(msg.payload);
    if (!chatMessage) return;

    console.log(`Received chat message from ${chatMessage.from}`);
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

    const startTime = moment().subtract(30, "days").toDate();
    // // 30 days, 24 hours/day, 60min/hour, 60secs/min, 100ms/sec
    // startTime.setTime(startTime.getTime() - 30 * 24 * 60 * 60 * 1000);

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
        console.log(`For user ${walletAddress} restored ${messages?.length ?? 0} message(s)`);
        return messages;
      }
    } catch (e) {
      console.error("Failed to retrieve messages", e);
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
    type: string,
    message: string,
    tags: Map<string, string>,
    chatPublicKey: string
  ) {
    if (!this.node) return;
    if (!this.encryptionKeyPair) return;
    if (!this.signer) return;

    const myPublicKey = this.encryptionKeyPair.publicKey;
    const fromAddress = (await this.signer.getAddress()).toLowerCase();
    const signature = await signUserChatMessage(fromAddress, toAddress, tripId, datetime, message, this.signer);

    const chatMessage = new ChatMessage({
      from: fromAddress,
      to: toAddress,
      tripId: tripId,
      datetime: datetime,
      type: type,
      message: message,
      tags: JSON.stringify(tags),
      signature: hexToBytes(signature),
    });

    const payload = chatMessage.encode();
    const encoder = eciesEncoder({
      contentTopic: getUserChatContentTopic(toAddress),
      publicKey: hexToBytes(chatPublicKey),
      ephemeral: false,
    });
    const myEncoder = eciesEncoder({
      contentTopic: getUserChatContentTopic(fromAddress),
      publicKey: myPublicKey,
      ephemeral: false,
    });

    await this.node.lightPush.send(encoder, { payload });
    await this.node.lightPush.send(myEncoder, { payload });
  }
}
