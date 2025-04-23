import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { InsuranceCaseDTO } from "@/model/InsuranceCase";
import { createSecret } from "@/pages/api/aiDamageAnalyze/createCase";
import axios from "@/utils/cachedAxios";
import { getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { logger } from "@/utils/logger";
import { useState } from "react";

export default function useAiDamageAnalyze() {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCase = async (tripId: number, pre: boolean) => {
    const rentality = rentalityContract.rentalityContracts;
    if (!rentality) {
      logger.error("Use Ai damage analyze: Rentality contract is not initialized");
      return;
    }
    if (!ethereumInfo) {
      logger.error("Use Ai damage analyze: Ethereum context is not initialized");
      return;
    }

    try {
      const caseInfoResult = await rentality.gateway.getAiDamageAnalyzeCaseData(BigInt(tripId), pre);
      if (!caseInfoResult.ok) {
        logger.info("Ai damage analyze: case number is not found");
        return;
      }
      setIsLoading(true);
      const response = await axios.post("/api/aiDamageAnalyze/createCase", {
        tripId: tripId,
        caseNum: Number(caseInfoResult.value.caseNumber) + 1,
        email: caseInfoResult.value.email,
        name: caseInfoResult.value.name,
        chainId: ethereumInfo.chainId,
        pre,
      });
      if (response.status !== 200) {
        logger.info("AiDamageAnalyze: failed to create case with error: ", response.data);
        return;
      } else {
        logger.info("AiDamageAnalyze: case created!");
        return;
      }
    } catch (error) {
      logger.error("Error creating aiDamageAnalyze case:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPhoto = async (tripId: number, photos: FormData, pre: boolean) => {
    const rentality = rentalityContract.rentalityContracts;
    if (!rentality) {
      logger.error("Use Ai damage analyze: Rentality contract is not initialized");
      return;
    }
    if (!ethereumInfo) {
      logger.error("Use Ai damage analyze: Ethereum context is not initialized");
      return;
    }
    try {
      setIsLoading(true);

      const token = await rentality.aiDamageAnalyze.getInsuranceCaseByTrip(BigInt(tripId), pre);
      if (!token.ok) {
        logger.info("Ai damage analyze: case number is not found");
        return;
      }
      const { secret, baseUrl } = await createSecret();
      const response = await axios.post(`${baseUrl}/api/v1/case/${token.value}/upload_photos`, photos, {
        headers: {
          Authorization: `Bearer ${secret.access_token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        logger.info("AiDamageAnalyze: failed to upload photo with error: ", response.data);
        return;
      }
    } catch (error) {
      logger.error("Error creating aiDamageAnalyze case:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAiResponseByTripIfExists = async (tripId: number) => {
    const rentality = rentalityContract.rentalityContracts;
    if (!rentality) {
      logger.error("Use Ai damage analyze: Rentality contract is not initialized");
      return;
    }
    if (!ethereumInfo) {
      logger.error("Use Ai damage analyze: Ethereum context is not initialized");
      return;
    }
    try {
      setIsLoading(true);
      const response = await rentality.aiDamageAnalyze.getInsuranceCasesUrlByTrip(BigInt(tripId));
      if (!response.ok) {
        logger.error("Ai damage analyze: response not found");
        return;
      }

      const data: InsuranceCaseDTO[] = await Promise.all(
        response.value.map(async (item) => {
          const iCase: InsuranceCaseDTO = {
            iCase: {
              iCase: item.iCase.iCase,
              pre: item.iCase.pre,
            },
            url: item.url,
          };
          if (item.url !== "") {
            const metaData = await getMetaDataFromIpfs(item.url);

            return {
              ...iCase,
              metaData,
            };
          }
          return iCase;
        })
      );
      return data;
    } catch (error) {
      logger.error("Error geting aiDamageAnalyze ai response:", error);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return [getAiResponseByTripIfExists, handleUploadPhoto, handleCreateCase, isLoading] as const;
}
