import { useCallback, useState } from "react";
import { Err, Ok, Result } from "@/model/utils/result";
import { useTranslation } from "react-i18next";
import {
  ContractAllRefferalInfoDTO as ContractAllReferralInfoDTO,
  ContractReadyToClaimDTO,
  ContractRefferalHistory as ContractReferralHistory,
} from "@/model/blockchain/schemas";
import { getOwnAccountCreationPointsInfo, getOwnRegularPointsInfo } from "../utils";
import { AllOwnPointsInfo } from "../models";

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
