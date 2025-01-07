export type Promo = {
  type: PromoType;
  code: string;
  value: number;
  startDate: Date;
  expireDate: Date;
  createdBy: string;
  createdAt: Date;
  status: PromoStatus;
};

export enum PromoType {
  OneTime,
  Wildcard,
}

export enum PromoStatus {
  Active,
  Idle,
  Used,
}
