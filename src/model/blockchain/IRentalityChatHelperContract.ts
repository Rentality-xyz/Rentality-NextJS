import { ContractTransaction } from "ethers";

export interface IRentalityChatHelperContract {
  setMyChatPublicKey(chatPrivateKey: string, chatPublicKey: string): Promise<ContractTransaction>;
  getMyChatKeys(): Promise<string[]>;
  getChatPublicKeys(addresses: string[]): Promise<AddressPublicKey[]>;
}
type ChatKeyInfo = {
  privateKey: string;
  publicKey: string;
};
type AddressPublicKey = {
  userAddress: string;
  publicKey: string;
};
