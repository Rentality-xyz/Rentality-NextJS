import { Signer, ethers, verifyMessage } from "ethers";
import { generatePrivateKey, getPublicKey } from "@waku/message-encryption";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

export function generateEncryptionKeyPair() {
  const privateKey = generatePrivateKey();
  const publicKey = getPublicKey(privateKey);
  return { privateKey, publicKey };
}

export async function signUserChatMessage(
  fromAddress: string,
  toAddress: string,
  tripId: number,
  datetime: number,
  message: string,
  signer: Signer
) {
  const chatMessage = {
    toAddress: toAddress,
    tripId: tripId,
    datetime: datetime,
    message: message,
    sender: fromAddress,
  };

  const messageBytes = toUtf8Bytes(JSON.stringify(chatMessage));
  const messageHash = keccak256(messageBytes);
  const signature = await signer.signMessage(ethers.getBytes(messageHash));
  return signature;
}

export function verifyUserChatMessageSignature(
  signature: string,
  fromAddress: string,
  toAddress: string,
  tripId: number,
  datetime: number,
  message: string
) {
  const chatMessage = {
    toAddress: toAddress,
    tripId: tripId,
    datetime: datetime,
    message: message,
    sender: fromAddress,
  };

  const messageBytes = toUtf8Bytes(JSON.stringify(chatMessage));
  const messageHash = keccak256(messageBytes);

  const recoveredAddress = verifyMessage(ethers.getBytes(messageHash), signature);

  return recoveredAddress.toLowerCase() === fromAddress.toLowerCase();
}
