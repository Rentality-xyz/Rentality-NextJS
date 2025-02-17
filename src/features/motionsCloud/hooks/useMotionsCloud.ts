import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { PhotoTypeToMotionsCloudKeys } from "@/model/MotionsCloud";
import { fileToBase64, getMotionsCloudKey, imageToBase64, photoMap } from "@/pages/api/motionscloud/uploadPhoto";
import axios from "@/utils/cachedAxios";
import { useState } from "react";

type MotionsCloudPhotoParam = {
    name: PhotoTypeToMotionsCloudKeys;
    file: File;
}
async function convertFile(file: File) {
return imageToBase64(await fileToBase64(file));
}
const useMotionsCloud = () => { 
    const ethereum = useEthereum();
    const rentalityContract = useRentality()
    const [isLoading, setIsLoading] = useState(false)

    const handleCreateCase = async (tripId: number) => {
            const rentality = rentalityContract.rentalityContracts;
            if(!rentality) {
                console.error("Use motions cloud: Rentality contract is not initialized")
                return
            }
            if(!ethereum) {
                console.error("Use motions cloud: Ethereum context is not initialized")
                return
            }
            const caseInfo = await rentality.gateway.getMotionsCloudCaseData(tripId)
            const params = {
                tripId,
                caseNum: caseInfo.caseNumber + 1,
                email: caseInfo.email,
                name: caseInfo.name,
                chainId: ethereum.chainId,
            }
            try {
                setIsLoading(true);
              const response = await axios.post("api/motionscloud/createCase", {
                params
              });
            } catch (error) {
              console.error("Error creating motionsCloud case:", error);
            } finally {
              setIsLoading(false);
            }
          }

          const getCaseNumberByTripId = async (tripId: number) => {
            const rentality = rentalityContract.rentalityContracts;
            if(!rentality) {
                console.error("Use motions cloud: Rentality contract is not initialized")
                return
            }
            if(!ethereum) {
                console.error("Use motions cloud: Ethereum context is not initialized")
                return
            }
        
          
            try {
                setIsLoading(true);
                const caseNumber = await rentality.motionsCloud.getInsuranceCaseUrlByTrip(BigInt(tripId))
                return Number(caseNumber)
            } catch (error) {
              console.error("Error creating motionsCloud case:", error);
            } finally {
              setIsLoading(false);
            }
          }

          const handleUploadPhoto = async (tripId: number, photos: MotionsCloudPhotoParam[]) => {

            const rentality = rentalityContract.rentalityContracts;
            if(!rentality) {
                console.error("Use motions cloud: Rentality contract is not initialized")
                return
            }
            if(!ethereum) {
                console.error("Use motions cloud: Ethereum context is not initialized")
                return
            }

                const params = await Promise.all(photos.map(async p => {
                    return { [(p.name as unknown) as string]: await convertFile(p.file) };

                }
            ))
                
                try {
                    setIsLoading(true);

                    const token = await getCaseNumberByTripId(tripId)
                    if(!token) { 
                        console.log("Motions cloud: case number is not found")
                        return
                    }
                    const response = await axios.post(
                        `/api/motionscloud/uploadPhoto?token=${encodeURIComponent(token)}`,
                        params
                    );
                    if(response.status !== 200) {
                        console.log('MotionsCloud: failed to upload photo with error: ', response.data)
                        return
                    }
                } catch (error) {
                  console.error("Error creating motionsCloud case:", error);
                } finally {
                  setIsLoading(false);
                }
        }

}