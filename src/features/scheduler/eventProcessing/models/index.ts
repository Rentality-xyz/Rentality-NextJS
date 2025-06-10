import { EventType } from "@/model/blockchain/schemas";

export type UserInfo = {
  wallet: string;
  email: string;
};

export interface RentalityEvent {
  eType: EventType;
  id: bigint;
  objectStatus: bigint;
  from: string;
  to: string;
  timestamp: bigint;
  blockNumber: number;
  transactionHash: string;
}
