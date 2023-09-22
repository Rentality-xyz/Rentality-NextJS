import { PublicKeyMessage, ChatMessage, PublicKeysMessage } from "./waku";
import {
  JsonRpcSigner,
  toUtf8Bytes,
  keccak256,
  getBytes,
  verifyMessage,
} from "ethers";
import { hexToBytes } from "@waku/utils/bytes";
import { generatePrivateKey, getPublicKey } from "@waku/message-encryption";
import { isEmpty } from "@/utils/string";

export function generateEncryptionKeyPair() {
  const privateKey = generatePrivateKey();
  const publicKey = getPublicKey(privateKey);
  return { privateKey, publicKey };
}

export async function createPublicKeyMessage(
  tripId: number,
  encryptionPublicKey: Uint8Array,
  signer: JsonRpcSigner
) {
  let signature =
    localStorage.getItem("encryptionKeySignature" + signer.address) ?? "";
  if (isEmpty(signature)) {
    signature = await signEncryptionKey(encryptionPublicKey, signer);
    localStorage.setItem("encryptionKeySignature" + signer.address, signature);
  }

  return new PublicKeyMessage({
    tripId: tripId,
    encryptionPublicKey: encryptionPublicKey,
    ethAddress: hexToBytes(signer.address),
    signature: hexToBytes(signature),
  });
}

export async function createPublicKeysMessage(
  tripIdsJson: string,
  encryptionPublicKey: Uint8Array,
  signer: JsonRpcSigner
) {
  let signature =
    localStorage.getItem("encryptionKeySignature" + signer.address) ?? "";
  if (isEmpty(signature)) {
    signature = await signEncryptionKey(encryptionPublicKey, signer);
    localStorage.setItem("encryptionKeySignature" + signer.address, signature);
  }

  return new PublicKeysMessage({
    tripIdsJson: tripIdsJson,
    encryptionPublicKey: encryptionPublicKey,
    ethAddress: hexToBytes(signer.address),
    signature: hexToBytes(signature),
  });
}

export async function createChatMessage(
  tripId: number,
  message: string,
  sender: JsonRpcSigner
) {
  const signature = await signChatMessage(message, sender);

  return new ChatMessage({
    tripId: tripId,
    message: message,
    sender: hexToBytes(sender.address),
    signature: hexToBytes(signature),
  });
}

export async function signEncryptionKey(
  encryptionPublicKey: Uint8Array,
  signer: JsonRpcSigner
) {
  const message = {
    encryptionPublicKey: encryptionPublicKey,
    ethAddress: signer.address,
  };

  const messageBytes = toUtf8Bytes(message.toString());
  const messageHash = keccak256(messageBytes);
  const signature = await signer.signMessage(getBytes(messageHash));
  return signature;
}

export async function verifyEncryptionKeySignature(
  signature: string,
  encryptionPublicKey: string,
  signerAddress: string
) {
  const message = {
    encryptionPublicKey: encryptionPublicKey,
    ethAddress: signerAddress,
  };

  const messageBytes = toUtf8Bytes(message.toString());
  const messageHash = keccak256(messageBytes);

  const recoveredAddress = verifyMessage(getBytes(messageHash), signature);

  return recoveredAddress.toLowerCase() === signerAddress.toLowerCase();
}

export async function signChatMessage(message: string, signer: JsonRpcSigner) {
  const chatMessage = {
    message: message,
    sender: signer.address,
  };

  const messageBytes = toUtf8Bytes(chatMessage.toString());
  const messageHash = keccak256(messageBytes);
  const signature = await signer.signMessage(getBytes(messageHash));
  return signature;
}

export function verifyChatMessageSignature(
  signature: string,
  message: string,
  sender: string
) {
  const chatMessage = {
    message: message,
    sender: sender,
  };

  const messageBytes = toUtf8Bytes(chatMessage.toString());
  const messageHash = keccak256(messageBytes);

  const recoveredAddress = verifyMessage(getBytes(messageHash), signature);

  return recoveredAddress.toLowerCase() === sender.toLowerCase();
}
