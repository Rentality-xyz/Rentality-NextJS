import { useCallback, useState } from "react";
import { Err, Ok, Result } from "@/model/utils/result";
import useInviteLink from "@/hooks/useRefferalProgram";
import { useTranslation } from "react-i18next";
import {
  AllRefferalInfoDTO,
  ReadyToClaim,
  ReadyToClaimDTO,
  RefferalHistory,
  RefferalProgram,
} from "@/model/blockchain/schemas";
import { ReferralProgramDescription } from "@/components/points/ReferralProgramDescriptions";
import { PointsProfileStatus } from "@/components/points/ReferralsAndPointsProfileStatus";

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

type AllOwnPointsInfo = {
  ownAccountCreationPointsInfo: OwnAccountCreationPointsInfo[];
  ownRegularPointsInfo: OwnRegularPointsInfo[];
};

const useOwnPoints = () => {
  const { t } = useTranslation();

  const [
    inviteHash,
    points,
    claimPoints,
    getReadyToClaim,
    getReadyToClaimFromRefferalHash,
    claimRefferalPoints,
    getRefferalPointsInfo,
    getPointsHistory,
    manageRefferalDiscount,
    manageTearInfo,
    calculateUniqUsers,
    isLoadingInviteLink,
  ] = useInviteLink();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AllOwnPointsInfo | null>(null);
  const [totalReadyToClaim, setTotalReadyToClaim] = useState<number>(0);

  const fetchData = useCallback(
    async (
      readyToClaim: ReadyToClaimDTO,
      pointsHistory: RefferalHistory[],
      pointsInfo: AllRefferalInfoDTO
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
        setTotalReadyToClaim(readyToClaim.totalPoints);
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

  const claimAllPoints = useCallback(async (): Promise<void> => {
    try {
      await claimPoints();
    } catch (e) {
      console.error("fetchData error" + e);
    }
  }, [claimPoints]);

  return {
    data: {
      data: data,
      totalReadyToClaim: totalReadyToClaim,
    },
    fetchData,
    isLoading,
    claimAllPoints: claimAllPoints,
  } as const;
};

export default useOwnPoints;

const getOwnAccountCreationPointsInfo = (
  readyToClaim: ReadyToClaim[],
  pointsInfo: AllRefferalInfoDTO,
  pointsHistory: RefferalHistory[],
  t: any
): OwnAccountCreationPointsInfo[] => {
  const filteredReadyToClaim = readyToClaim.filter((item) => item.oneTime);
  const allRefTypes = new Set<RefferalProgram>(filteredReadyToClaim.map((item) => item.refType));

  const result = Array.from(allRefTypes).map((refType) => {
    const claimItem = filteredReadyToClaim.find((item) => item.refType === refType);
    const points = claimItem?.points || 0;

    const programPointItem = pointsInfo.programPoints.find((item) => item.method === refType);
    const programPoints = programPointItem?.points || 0;

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

  return result.sort((a, b) => a.index - b.index);
};

const getOwnRegularPointsInfo = (
  readyToClaim: ReadyToClaim[],
  pointsInfo: AllRefferalInfoDTO,
  pointsHistory: RefferalHistory[],
  t: any
): OwnRegularPointsInfo[] => {
  const filteredReadyToClaim = readyToClaim.filter((item) => !item.oneTime);
  const allRefTypes = new Set<RefferalProgram>(filteredReadyToClaim.map((item) => item.refType));

  return Array.from(allRefTypes).map((refType) => {
    const claimItem = filteredReadyToClaim.find((item) => item.refType === refType);
    const points = claimItem?.points || 0;

    const programPointItem = pointsInfo.programPoints.find((item) => item.method === refType);
    const programPoints = programPointItem?.points || 0;

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
};
