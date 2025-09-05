import { ChatMessage } from "./ChatMessage";
import { TripStatus } from "./blockchain/schemas";

export type ChatInfo = {
  tripId: number;

  guestAddress: string;
  guestName: string;
  guestPhotoUrl: string;

  hostAddress: string;
  hostName: string;
  hostPhotoUrl: string;

  tripTitle: string;
  startDateTime: Date;
  endDateTime: Date;
  timeZoneId: string;
  lastMessage: string;
  updatedAt: Date;
  isSeen: boolean;
  seenAt: Date | null;

  carPhotoUrl: string;
  tripStatus: TripStatus;
  carTitle: string;
  carLicenceNumber: string;

  messages: ChatMessage[];

  isPlatformChat: boolean;
};
