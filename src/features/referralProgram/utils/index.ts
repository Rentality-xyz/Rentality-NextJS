import {
  ContractAllRefferalInfoDTO as ContractAllReferralInfoDTO,
  ContractReadyToClaim,
  ContractReadyToClaimDTO,
  ContractRefferalHistory as ContractReferralHistory,
  RefferalProgram as ReferralProgram,
} from "@/model/blockchain/schemas";
import { Err, Ok, Result } from "@/model/utils/result";
import { TFunction } from "i18next";
import { AllOwnPointsInfo, OwnAccountCreationPointsInfo, OwnRegularPointsInfo, PointsProfileStatus } from "../models";

export function getReferralProgramDescriptionText(t: TFunction, program: ReferralProgram): string {
  switch (program) {
    case ReferralProgram.SetKYC:
      return t("referrals_and_point.referral_program.set_kyc");
    case ReferralProgram.PassCivic:
      return t("referrals_and_point.referral_program.pass_civic");
    case ReferralProgram.AddFirstCar:
      return t("referrals_and_point.referral_program.add_first_car");
    case ReferralProgram.AddCar:
      return t("referrals_and_point.referral_program.add_car");
    case ReferralProgram.CreateTrip:
      return t("referrals_and_point.referral_program.create_trip");
    case ReferralProgram.FinishTripAsHost:
      return t("referrals_and_point.referral_program.finish_trip_as_host");
    case ReferralProgram.FinishTripAsGuest:
      return t("referrals_and_point.referral_program.finish_trip_as_guest");
    case ReferralProgram.UnlistedCar:
      return t("referrals_and_point.referral_program.unlisted_car");
    case ReferralProgram.Daily:
      return t("referrals_and_point.referral_program.daily");
    case ReferralProgram.DailyListing:
      return t("referrals_and_point.referral_program.daily_listing");
    default:
      return "";
  }
}

export function getAllPoints(
  readyToClaim: ContractReadyToClaimDTO,
  pointsHistory: ContractReferralHistory[],
  pointsInfo: ContractAllReferralInfoDTO,
  t: TFunction
): Result<AllOwnPointsInfo, Error> {
  try {
    const ownAccountCreationPointsInfo = getOwnAccountCreationPointsInfo(
      readyToClaim.toClaim,
      pointsInfo,
      pointsHistory,
      t
    );
    const ownRegularPointsInfo = getOwnRegularPointsInfo(readyToClaim.toClaim, pointsInfo, pointsHistory, t);

    return Ok({
      ownAccountCreationPointsInfo: ownAccountCreationPointsInfo,
      ownRegularPointsInfo: ownRegularPointsInfo,
    });
  } catch (e) {
    console.error("fetchData error" + e);
    return Err(new Error("getAllPoints error. See logs for more details"));
  }
}

export function getOwnAccountCreationPointsInfo(
  readyToClaim: ContractReadyToClaim[],
  pointsInfo: ContractAllReferralInfoDTO,
  pointsHistory: ContractReferralHistory[],
  t: TFunction
): OwnAccountCreationPointsInfo[] {
  const filteredReadyToClaim = readyToClaim.filter((item) => item.oneTime);
  const allRefTypes = new Set<ReferralProgram>(filteredReadyToClaim.map((item) => item.refType));

  const result = Array.from(allRefTypes).map((refType) => {
    const claimItem = filteredReadyToClaim.find((item) => item.refType === refType);
    const points = Number(claimItem?.points) || 0;

    const programPointItem = pointsInfo.programPoints.find((item) => item.method === refType);
    const programPoints = Number(programPointItem?.points) || 0;

    const done = pointsHistory.some((entry) => entry.method === refType);

    const status = done
      ? PointsProfileStatus.Done
      : points > 0
        ? PointsProfileStatus.ReadyToClaim
        : PointsProfileStatus.NextStep;

    const countPoints = status === PointsProfileStatus.NextStep ? programPoints : points;

    return {
      index: Number(refType.valueOf()),
      methodDescriptions: getReferralProgramDescriptionText(t, refType),
      countPoints: countPoints,
      done: done,
      status: status,
    };
  });

  result.sort((a, b) => a.index - b.index);
  return result;
}

export function getOwnRegularPointsInfo(
  readyToClaim: ContractReadyToClaim[],
  pointsInfo: ContractAllReferralInfoDTO,
  pointsHistory: ContractReferralHistory[],
  t: TFunction
): OwnRegularPointsInfo[] {
  const filteredReadyToClaim = readyToClaim.filter((item) => !item.oneTime);
  const allRefTypes = new Set<ReferralProgram>(filteredReadyToClaim.map((item) => item.refType));

  return Array.from(allRefTypes).map((refType) => {
    const claimItem = filteredReadyToClaim.find((item) => item.refType === refType);
    const points = Number(claimItem?.points) || 0;

    const programPointItem = pointsInfo.programPoints.find((item) => item.method === refType);
    const programPoints = Number(programPointItem?.points) || 0;

    const done = pointsHistory.some((entry) => entry.method === refType);

    const status = done
      ? PointsProfileStatus.Done
      : points > 0
        ? PointsProfileStatus.ReadyToClaim
        : PointsProfileStatus.NextStep;

    const countPoints = status === PointsProfileStatus.NextStep ? programPoints : points;

    return {
      methodDescriptions: getReferralProgramDescriptionText(t, refType),
      countPoints: countPoints,
      done: done,
      nextDailyClaim: 0,
      status: status,
    };
  });
}
