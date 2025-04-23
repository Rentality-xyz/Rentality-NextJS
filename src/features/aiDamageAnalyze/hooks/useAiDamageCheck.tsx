import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { logger } from "@/utils/logger";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { AnalyzeDamagesParams } from "../api/analyzeDamages";
import { isEmpty } from "@/utils/string";
import { bigIntReplacer } from "@/utils/json";
import { getTripCarPhotos } from "@/features/filestore/pinata/utils";

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
type QueryData = { status: AiCheckStatus; lastUpdated: Date };

function useAiDamageCheck(tripId: number) {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<{ status: AiCheckStatus; lastUpdated: Date }>({
    status: "loading",
    lastUpdated: new Date(),
  });

  const { mutateAsync: startPreTripCheck } = useMutation({
    mutationFn: async () => {
      setStatus({ status: "pre-trip checking", lastUpdated: new Date() });
      return startDamageAnalyzeImpl(tripId, rentalityContracts, ethereumInfo, "pre-trip");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AI_DAMAGE_ANALYZE_QUERY_KEY] });
    },
  });

  const { mutateAsync: startPostTripsAnalyze } = useMutation({
    mutationFn: async () => {
      setStatus({ status: "post-trip analyzing", lastUpdated: new Date() });
      return startDamageAnalyzeImpl(tripId, rentalityContracts, ethereumInfo, "post-trip");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AI_DAMAGE_ANALYZE_QUERY_KEY] });
    },
  });

  const { data } = useQuery<QueryData>({
    queryKey: [AI_DAMAGE_ANALYZE_QUERY_KEY, tripId, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchAiDamageCheck(tripId, rentalityContracts, ethereumInfo),
  });

  useEffect(() => {
    if (!data) return;
    setStatus((prev) => (prev.lastUpdated < data.lastUpdated ? data : prev));
  }, [data]);

  return {
    status: status.status,
    startPreTripCheck,
    startPostTripsAnalyze,
  } as const;
}

async function fetchAiDamageCheck(
  tripId: number,
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
): Promise<{ status: AiCheckStatus; lastUpdated: Date }> {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const tripCasesResult = await rentalityContracts.aiDamageAnalyze.getInsuranceCasesUrlByTrip(BigInt(tripId));
  if (!tripCasesResult.ok) {
    throw tripCasesResult.error;
  }

  logger.debug("tripCasesResult: ", JSON.stringify(tripCasesResult.value, bigIntReplacer, 2));

  const postTripCase = tripCasesResult.value.find((i) => i.iCase.pre === false);
  if (postTripCase) {
    if (!isEmpty(postTripCase.url)) {
      return { status: "post-trip analyzed successful", lastUpdated: new Date() };
    }
    return { status: "post-trip analyzing", lastUpdated: new Date() };
  }

  const tripCarPhotos = await getTripCarPhotos(tripId);
  logger.debug("tripCarPhotos: ", JSON.stringify(tripCarPhotos, bigIntReplacer, 2));

  const preTripCase = tripCasesResult.value.find((i) => i.iCase.pre === true);
  if (preTripCase) {
    if (!isEmpty(preTripCase.url)) {
      if (tripCarPhotos.checkOutByGuest.length > 0 || tripCarPhotos.checkOutByHost.length > 0) {
        return { status: "ready to post-trip analyze", lastUpdated: new Date() };
      }
      return { status: "pre-trip checked", lastUpdated: new Date() };
    }
    return { status: "pre-trip checking", lastUpdated: new Date() };
  }

  if (tripCarPhotos.checkInByGuest.length > 0 || tripCarPhotos.checkInByHost.length > 0) {
    return { status: "ready to pre-trip check", lastUpdated: new Date() };
  }
  return { status: "no pre-trip photos", lastUpdated: new Date() };
}

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

    logger.debug("caseInfoResult:", JSON.stringify(caseInfoResult, bigIntReplacer, 2));
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

export default useAiDamageCheck;
