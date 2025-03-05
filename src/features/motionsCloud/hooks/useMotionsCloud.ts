import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { createSecret } from "@/pages/api/motionscloud/createCase";
import axios from "@/utils/cachedAxios";
import { getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { useState } from "react";

export default function useMotionsCloud() {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCase = async (tripId: number) => {
    const rentality = rentalityContract.rentalityContracts;
    if (!rentality) {
      console.error("Use motions cloud: Rentality contract is not initialized");
      return;
    }
    if (!ethereumInfo) {
      console.error("Use motions cloud: Ethereum context is not initialized");
      return;
    }

    try {
      const caseInfo = await rentality.gateway.getMotionsCloudCaseData(BigInt(tripId));
      if (!caseInfo.ok) {
        console.log("Motions cloud: case number is not found");
        return;
      }
      setIsLoading(true);
      const response = await axios.post("/api/motionscloud/createCase", {
        tripId: tripId,
        caseNum: Number(caseInfo.value.caseNumber) + 1,
        email: caseInfo.value.email,
        name: caseInfo.value.name,
        chainId: ethereumInfo.chainId,
      });
      if (response.status !== 200) {
        console.log("MotionsCloud: failed to create case with error: ", response.data);
        return;
      } else {
        console.log("MotionsCloud: case created!");
        return;
      }
    } catch (error) {
      console.error("Error creating motionsCloud case:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPhoto = async (tripId: number, photos: FormData) => {
    const rentality = rentalityContract.rentalityContracts;
    if (!rentality) {
      console.error("Use motions cloud: Rentality contract is not initialized");
      return;
    }
    if (!ethereumInfo) {
      console.error("Use motions cloud: Ethereum context is not initialized");
      return;
    }
    try {
      setIsLoading(true);

      const token = await rentality.motionsCloud.getInsuranceCaseByTrip(BigInt(tripId));
      if (!token.ok) {
        console.log("Motions cloud: case number is not found");
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
        console.log("MotionsCloud: failed to upload photo with error: ", response.data);
        return;
      }
    } catch (error) {
      console.error("Error creating motionsCloud case:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAiResponseByTripIfExists = async (tripId: number) => {
    const rentality = rentalityContract.rentalityContracts;
    if (!rentality) {
      console.error("Use motions cloud: Rentality contract is not initialized");
      return;
    }
    if (!ethereumInfo) {
      console.error("Use motions cloud: Ethereum context is not initialized");
      return;
    }
    try {
      setIsLoading(true);
      const response = await rentality.motionsCloud.getInsuranceCaseUrlByTrip(BigInt(tripId));
      if (response.ok && response.value !== "") {
        return await getMetaDataFromIpfs(response.value);
      } else {
        console.error("Motions cloud: response not found");
        return;
      }
    } catch (error) {
      console.error("Error geting motionsCloud ai response:", error);
      return;
    } finally {
      setIsLoading(false);
    }
  };
  return [getAiResponseByTripIfExists, handleUploadPhoto, handleCreateCase, isLoading] as const;
}
