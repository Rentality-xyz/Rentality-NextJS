import protobuf from "protobufjs";
import { bytesToHex } from "@waku/utils/bytes";
import { logger } from "@/utils/logger";

export type ChatMessagePayload = {
  from: string;
  to: string;
  tripId: number;
  datetime: number;
  type: string;
  message: string;
  tags: string;
  signature: Uint8Array;
};

export class ChatMessage {
  private payload: ChatMessagePayload;

  static Type = new protobuf.Type("ChatMessage")
    .add(new protobuf.Field("from", 1, "string"))
    .add(new protobuf.Field("to", 2, "string"))
    .add(new protobuf.Field("tripId", 3, "uint64"))
    .add(new protobuf.Field("datetime", 4, "uint64"))
    .add(new protobuf.Field("type", 5, "string"))
    .add(new protobuf.Field("message", 6, "string"))
    .add(new protobuf.Field("tags", 7, "string"))
    .add(new protobuf.Field("signature", 8, "bytes"));

  constructor(payload: ChatMessagePayload) {
    this.payload = payload;
  }

  encode() {
    const message = ChatMessage.Type.create(this.payload);
    return ChatMessage.Type.encode(message).finish();
  }

  static decode(bytes: Uint8Array) {
    const payload = ChatMessage.Type.decode(bytes) as unknown as ChatMessagePayload;

    if (
      !payload.from ||
      !payload.to ||
      !payload.tripId ||
      !payload.datetime ||
      !payload.type ||
      !payload.message ||
      !payload.tags ||
      !payload.signature
    ) {
      logger.error("Some fields are missed on decoded ChatMessage", payload);
      return;
    }

    return new ChatMessage({
      from: payload.from,
      to: payload.to,
      tripId: Number(payload.tripId),
      datetime: payload.datetime,
      type: payload.type,
      message: payload.message,
      tags: payload.tags,
      signature: payload.signature,
    });
  }

  get from() {
    return this.payload.from;
  }

  get to() {
    return this.payload.to;
  }

  get tripId() {
    return this.payload.tripId;
  }

  get datetime() {
    return this.payload.datetime;
  }

  get type() {
    return this.payload.type;
  }

  get message() {
    return this.payload.message;
  }

  get tags() {
    return this.payload.tags;
  }

  get signature() {
    return this.payload.signature;
  }

  get signatureString() {
    return "0x" + bytesToHex(this.payload.signature);
  }
}
