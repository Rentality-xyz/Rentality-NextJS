export enum PointsProfileStatus {
  Done = "Done",
  NextStep = "NextStep",
  ReadyToClaim = "ReadyToClaim",
}

export type OwnAccountCreationPointsInfo = {
  index: number;
  methodDescriptions: string;
  countPoints: number;
  done: boolean;
  status: PointsProfileStatus;
};

export type OwnRegularPointsInfo = {
  methodDescriptions: string;
  countPoints: number;
  done: boolean;
  nextDailyClaim: number;
  status: PointsProfileStatus;
};

export type AllOwnPointsInfo = {
  ownAccountCreationPointsInfo: OwnAccountCreationPointsInfo[];
  ownRegularPointsInfo: OwnRegularPointsInfo[];
};
