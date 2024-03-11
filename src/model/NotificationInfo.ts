export type NotificationInfo = {
  type: NotificationType;
  title: string;
  datestamp: Date;
  message: string;
};

export enum NotificationType {
  Booked,
  History,
  Message,
  Claim,
}
