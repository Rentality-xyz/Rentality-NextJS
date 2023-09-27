import { PublicKeyMessage, ChatMessage, PublicKeysMessage } from "./waku";
import { Signer, ethers } from "ethers";
import { hexToBytes } from "@waku/utils/bytes";
import { generatePrivateKey, getPublicKey } from "@waku/message-encryption";
import { isEmpty } from "@/utils/string";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

export function generateEncryptionKeyPair() {
  const privateKey = generatePrivateKey();
  const publicKey = getPublicKey(privateKey);
  return { privateKey, publicKey };
}

export async function createPublicKeyMessage(
  tripId: number,
  encryptionPublicKey: Uint8Array,
  signer: Signer
) {
  const address = await signer.getAddress();
  let signature =
    localStorage.getItem("encryptionKeySignature" + address) ?? "";
  if (isEmpty(signature)) {
    signature = await signEncryptionKey(encryptionPublicKey, signer);
    localStorage.setItem("encryptionKeySignature" + address, signature);
  }

  return new PublicKeyMessage({
    tripId: tripId,
    encryptionPublicKey: encryptionPublicKey,
    ethAddress: hexToBytes(address),
    signature: hexToBytes(signature),
  });
}

export async function createPublicKeysMessage(
  tripIdsJson: string,
  encryptionPublicKey: Uint8Array,
  signer: Signer
) {
  const address = await signer.getAddress();
  let signature =
    localStorage.getItem("encryptionKeySignature" + address) ?? "";
  if (isEmpty(signature)) {
    signature = await signEncryptionKey(encryptionPublicKey, signer);
    localStorage.setItem("encryptionKeySignature" + address, signature);
  }

  return new PublicKeysMessage({
    tripIdsJson: tripIdsJson,
    encryptionPublicKey: encryptionPublicKey,
    ethAddress: hexToBytes(address),
    signature: hexToBytes(signature),
  });
}

export async function createChatMessage(
  tripId: number,
  message: string,
  sender: Signer
) {
  const address = await sender.getAddress();
  const signature = await signChatMessage(message, sender);

  return new ChatMessage({
    tripId: tripId,
    message: message,
    sender: hexToBytes(address),
    signature: hexToBytes(signature),
  });
}

export async function signEncryptionKey(
  encryptionPublicKey: Uint8Array,
  signer: Signer
) {
  const address = await signer.getAddress();
  const message = {
    encryptionPublicKey: encryptionPublicKey,
    ethAddress: address,
  };

  const messageBytes = toUtf8Bytes(message.toString());
  const messageHash = keccak256(messageBytes);
  const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
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

  const recoveredAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), signature);

  return recoveredAddress.toLowerCase() === signerAddress.toLowerCase();
}

export async function signChatMessage(message: string, signer: Signer) {
  const chatMessage = {
    message: message,
    sender: await signer.getAddress(),
  };

  const messageBytes = toUtf8Bytes(chatMessage.toString());
  const messageHash = keccak256(messageBytes);
  const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
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

  const recoveredAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), signature);

  return recoveredAddress.toLowerCase() === sender.toLowerCase();
}
