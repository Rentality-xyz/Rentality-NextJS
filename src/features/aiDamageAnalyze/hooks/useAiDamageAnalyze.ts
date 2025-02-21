import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { AiDamageAnalyzePhoto } from "@/model/AiDamageAnalyze";
import { fileToBase64, imageToBase64, photoMap } from "@/pages/api/aiDamageAnalyze/uploadPhoto";
import axios from "@/utils/cachedAxios";
import { useState } from "react";

async function convertFile(file: File) {
return await fileToBase64(file);
}
export default function useAiDamageAnalyze () { 
    const ethereumInfo = useEthereum();
    const rentalityContract = useRentality()
    const [isLoading, setIsLoading] = useState(false)

    const handleCreateCase = async (tripId: number) => {
            const rentality = rentalityContract.rentalityContracts;
            if(!rentality) {
                console.error("Use Ai damage analyze: Rentality contract is not initialized")
                return
            }
            if(!ethereumInfo) {
                console.error("Use Ai damage analyze: Ethereum context is not initialized")
                return
            }
            const caseInfo = await rentality.gateway.getAiDamageAnalyzeCaseData(BigInt(tripId))
     
            try {
                setIsLoading(true);
              const response = await axios.post("/api/aiDamageAnalyze/createCase", 
                {
                  tripId: tripId,
                  caseNum: Number(caseInfo.caseNumber) + 5,
                  email: caseInfo.email,
                  name: caseInfo.name,
                  chainId: ethereumInfo.chainId,
              });
              if(response.status !== 200) {
                  console.log('AiDamageAnalyze: failed to create case with error: ', response.data)
                  return
              }
              else {
                console.log('AiDamageAnalyze: case created!')
                return
            }
            } catch (error) {
              console.error("Error creating aiDamageAnalyze case:", error);
            } finally {
              setIsLoading(false);
            }
          }

        

          const handleUploadPhoto = async (tripId: number, photos: AiDamageAnalyzePhoto ) => {

            const rentality = rentalityContract.rentalityContracts;
            if(!rentality) {
                console.error("Use Ai damage analyze: Rentality contract is not initialized")
                return
            }
            if(!ethereumInfo) {
                console.error("Use Ai damage analyze: Ethereum context is not initialized")
                return
            }
                try {
                    setIsLoading(true);

                    // const token = await rentality.aiDamageAnalyze.getInsuranceCaseByTrip(BigInt(tripId))
                    const token ={value:  'ED2msxanRVCgz6yYdEMgpHTA', ok: true}
                    if(!token.ok) { 
                        console.log("Ai damage analyze: case number is not found")
                        return
                    }
                    const response = await axios.post(
                        `/api/aiDamageAnalyze/uploadPhoto?token=${encodeURIComponent(token.value)}`,
                        photos
                    );
                    if(response.status !== 200) {
                        console.log('AiDamageAnalyze: failed to upload photo with error: ', response.data)
                        return
                    }
                } catch (error) {
                  console.error("Error creating aiDamageAnalyze case:", error);
                } finally {
                  setIsLoading(false);
                }
        }

        const getAiResponseByTripIfExists = async (tripId: number) => { 
            const rentality = rentalityContract.rentalityContracts;
            if(!rentality) {
                console.error("Use Ai damage analyze: Rentality contract is not initialized")
                return
            }
            if(!ethereumInfo) {
                console.error("Use Ai damage analyze: Ethereum context is not initialized")
                return
            }
            try {
                setIsLoading(true);
                const response = await rentality.aiDamageAnalyze.getInsuranceCaseUrlByTrip(BigInt(tripId))
                if (response.ok && response.value !== "") { 
                    return response.value
                }
                else { 
                  console.error("Ai damage analyze: response not found",);
                  return
                }
            } catch (error) {
              console.error("Error geting aiDamageAnalyze ai response:", error);
              return
            } finally {
              setIsLoading(false);
            }
        }
        return [getAiResponseByTripIfExists, handleUploadPhoto, handleCreateCase, isLoading] as const

}