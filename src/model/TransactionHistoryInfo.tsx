import { TripStatus } from "@/model/blockchain/schemas";

export type TransactionHistoryInfo = {
  transHistoryId: number;
  tripId: number;
  car: string;
  status: TripStatus;
  days: number;
  startDateTime: Date;
  endDateTime: Date;
  tripPayment: number;
  refund: number;
  tripEarnings: number;
  cancellationFee: number;
  reimbursements: number;
  rentalityFee: number;
  taxes: number;
};
