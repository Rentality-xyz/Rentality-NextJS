import { Signer } from "ethers";
import { createLightNode, waitForRemotePeer, LightNode } from "@waku/sdk";
import { Protocols } from "@waku/interfaces";
import { createEncoder as eciesEncoder } from "@waku/message-encryption/ecies";
import { hexToBytes } from "@waku/utils/bytes";
import { signUserChatMessage } from "./crypto";
import { ChatMessage } from "./model/chatMessage";

export function getUserChatContentTopic(address: string) {
  return `/rentality/1/pm-user-t-${String(address).toLowerCase()}/proto`;
}

export class Waku {
  static async initializeNode() {
    console.log("Initializing node");
    const node = await createLightNode({ defaultBootstrap: true });
    await node.start();
    await waitForRemotePeer(node, [Protocols.Filter, Protocols.LightPush, Protocols.Store]);
    console.log("Node initialized");
    return node;
  }

  static async sendUserChatMessage(
    toAddress: string,
    tripId: number,
    datetime: number,
    message: string,
    signer: Signer,
    chatPublicKey: Uint8Array,
    myPublicKey: Uint8Array,
    node: LightNode
  ) {
    const fromAddress = (await signer.getAddress()).toLowerCase();
    const signature = await signUserChatMessage(fromAddress, toAddress, tripId, datetime, message, signer);

    const chatMessage = new ChatMessage({
      from: fromAddress,
      to: toAddress,
      tripId: tripId,
      datetime: datetime,
      message: message,
      signature: hexToBytes(signature),
    });

    const payload = chatMessage.encode();
    const encoder = eciesEncoder({
      contentTopic: getUserChatContentTopic(toAddress),
      publicKey: chatPublicKey,
      ephemeral: false,
    });
    const myEncoder = eciesEncoder({
      contentTopic: getUserChatContentTopic(fromAddress),
      publicKey: myPublicKey,
      ephemeral: false,
    });

    await node.lightPush.send(encoder, { payload });
    await node.lightPush.send(myEncoder, { payload });
  }
}
