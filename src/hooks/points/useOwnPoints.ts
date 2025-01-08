import { useCallback, useState } from "react";
import { Err, Ok, Result } from "@/model/utils/result";
import { useTranslation } from "react-i18next";
import {
  ContractAllRefferalInfoDTO as ContractAllReferralInfoDTO,
  ContractReadyToClaim,
  ContractReadyToClaimDTO,
  ContractRefferalHistory as ContractReferralHistory,
  RefferalProgram as ReferralProgram,
} from "@/model/blockchain/schemas";
import { ReferralProgramDescription } from "@/components/points/ReferralProgramDescriptions";
import { PointsProfileStatus } from "@/components/points/ReferralsAndPointsProfileStatus";
import { TFunction } from "i18next";

type OwnAccountCreationPointsInfo = {
  index: number;
  methodDescriptions: string;
  countPoints: number;
  done: boolean;
  status: PointsProfileStatus;
};

type OwnRegularPointsInfo = {
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

const useOwnPoints = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AllOwnPointsInfo | null>(null);
  const { t } = useTranslation();

  const fetchData = useCallback(
    async (
      readyToClaim: ContractReadyToClaimDTO,
      pointsHistory: ContractReferralHistory[],
      pointsInfo: ContractAllReferralInfoDTO
    ): Promise<Result<boolean, string>> => {
      if (data !== null) {
        return Ok(true);
      }

      try {
        const ownAccountCreationPointsInfo = getOwnAccountCreationPointsInfo(
          readyToClaim.toClaim,
          pointsInfo,
          pointsHistory,
          t
        );

        const ownRegularPointsInfo = getOwnRegularPointsInfo(readyToClaim.toClaim, pointsInfo, pointsHistory, t);

        const combineData: AllOwnPointsInfo = {
          ownAccountCreationPointsInfo: ownAccountCreationPointsInfo,
          ownRegularPointsInfo: ownRegularPointsInfo,
        };

        // console.log(
        //     "combineData:",
        //     JSON.stringify(combineData, (key, value) => (typeof value === "bigint" ? value.toString() : value), 2)
        // );
        setData(combineData);
        return Ok(true);
      } catch (e) {
        console.error("fetchData error" + e);
        return Err("Get data error. See logs for more details");
      } finally {
        setIsLoading(false);
      }
    },
    [data]
  );

  return {
    data: {
      data: data,
    },
    fetchData,
    isLoading,
  } as const;
};

export default useOwnPoints;

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

function getOwnAccountCreationPointsInfo(
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
      methodDescriptions: ReferralProgramDescription(t, refType),
      countPoints: countPoints,
      done: done,
      status: status,
    };
  });

  result.sort((a, b) => a.index - b.index);
  return result;
}

function getOwnRegularPointsInfo(
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
      methodDescriptions: ReferralProgramDescription(t, refType),
      countPoints: countPoints,
      done: done,
      nextDailyClaim: 0,
      status: status,
    };
  });
}
