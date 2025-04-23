import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { logger } from "@/utils/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { AnalyzeDamagesParams } from "../api/analyzeDamages";

export type AiCheckStatus =
  | "loading"
  | "no pre-trip photos"
  | "ready to pre-trip check"
  | "pre-trip checking"
  | "pre-trip checked"
  | "ready to post-trip analyze"
  | "post-trip analyzing"
  | "post-trip analyzed successful"
  | "post-trip analyzed damage";

export const AI_DAMAGE_ANALYZE_QUERY_KEY = "AiDamageAnalyzeQueryKey";

function useAiDamageCheck(tripId: number) {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AiCheckStatus>("loading");

  const { mutateAsync: startPreTripCheck } = useMutation({
    mutationFn: async () => startDamageAnalyzeImpl(tripId, rentalityContracts, ethereumInfo, "pre-trip"),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [AI_DAMAGE_ANALYZE_QUERY_KEY] });
      }
    },
  });

  const { mutateAsync: startPostTripsAnalyze } = useMutation({
    mutationFn: async () => startDamageAnalyzeImpl(tripId, rentalityContracts, ethereumInfo, "post-trip"),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [AI_DAMAGE_ANALYZE_QUERY_KEY] });
      }
    },
  });

  useEffect(() => {
    const init = async () => {};

    init();
  }, []);

  return {
    status,
    startPreTripCheck,
    startPostTripsAnalyze,
  } as const;
}

export default useAiDamageCheck;

async function startDamageAnalyzeImpl(
  tripId: number,
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined,
  type: "pre-trip" | "post-trip"
): Promise<Result<boolean, Error>> {
  try {
    if (!rentalityContracts || !ethereumInfo) {
      logger.error("startPostTripsAnalyzeImpl error: Missing required Rentality contract or ethereum info");
      return Err(new Error("Missing required Rentality contract or ethereum info"));
    }

    const caseInfoResult = await rentalityContracts.gateway.getAiDamageAnalyzeCaseData(
      BigInt(tripId),
      type === "pre-trip"
    );
    if (!caseInfoResult.ok) {
      logger.error("startPreTripCheck: failed to get AiDamageAnalyzeCaseData with error: ", caseInfoResult.error);
      return Err(new Error("Failed to get AiDamageAnalyzeCaseData"));
    }

    const body: AnalyzeDamagesParams = {
      tripId: tripId,
      chainId: ethereumInfo.chainId,
      caseNumber: Number(caseInfoResult.value.caseNumber) + 1,
      email: caseInfoResult.value.email,
      fullName: caseInfoResult.value.name,
      vinNumber: caseInfoResult.value.vin,
      pre: type === "pre-trip",
    };
    const response = await axios.post("/api/aiDamageAnalyze/analyzeDamages", body);

    if (response.status !== 200) {
      logger.error("startPostTripsAnalyzeImpl: failed to create case with error: ", response.data);
      return Err(new Error("Failed to update case with code: " + response.status));
    }

    logger.info("startPostTripsAnalyzeImpl: AiDamageAnalyze case created!");
    return Ok(true);
  } catch (error) {
    logger.error("startPostTripsAnalyzeImpl error: ", error);
    return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
  }
}
