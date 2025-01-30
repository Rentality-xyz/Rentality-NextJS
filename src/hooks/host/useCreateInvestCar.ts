import { useState } from "react";
import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE, verifyCar } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractCreateCarRequest,
  ContractSignedLocationInfo,
  ContractUpdateCarInfoRequest,
} from "@/model/blockchain/schemas";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import { mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { getNftJSONFromCarInfo } from "@/utils/ipfsUtils";
import { ContractTransactionResponse } from "ethers";
import { saveCarImages } from "./useSaveCar";
import { Err, Ok, Result, TransactionErrorCode } from "@/model/utils/result";

const useCreateInvestCar = () => {
  const {rentalityContracts} = useRentality();
  const ethereumInfo = useEthereum();
  const [dataSaved, setDataSaved] = useState<Boolean>(true);

  const uploadMetadataToIPFS = async (hostCarInfo: HostCarInfo) => {
    if (!verifyCar(hostCarInfo)) {
      return;
    }

    const nftJSON = getNftJSONFromCarInfo(hostCarInfo);

    try {
      const response = await uploadJSONToIPFS(nftJSON, "RentalityNFTMetadata", {
        createdAt: new Date().toISOString(),
        createdBy: ethereumInfo?.walletAddress ?? "",
        version: SMARTCONTRACT_VERSION,
        chainId: ethereumInfo?.chainId ?? 0,
      });
      if (response.success === true) {
        return response.pinataURL;
      }
    } catch (e) {
      console.error("error uploading JSON metadata:", e);
    }
  };

  async function createInvest(
    hostCarInfo: HostCarInfo,
    carPrice: number,
    hostPercents: number,
    nftName: string,
    nftSym: string
  ): Promise<Result<boolean, TransactionErrorCode>> {
    if (!ethereumInfo) {
      console.error("saveCar error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContracts) {
      console.error("saveCar error: rentalityContract is null");
      return Err("ERROR");
    };
  

    try {
      setDataSaved(false);

    
        const savedImages = await saveCarImages(hostCarInfo.images, ethereumInfo);
  
        const dataToSave = {
          ...hostCarInfo,
          images: savedImages,
        };
      

      const metadataURL = await uploadMetadataToIPFS(dataToSave);

      if (!metadataURL) {
        console.error("Upload JSON to Pinata error");
        return Err("ERROR");
      }

      const engineParams: bigint[] = [];
      if (dataToSave.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
        engineParams.push(BigInt(dataToSave.tankVolumeInGal));
        engineParams.push(BigInt(dataToSave.fuelPricePerGal * 100));
      } else if (dataToSave.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
        engineParams.push(BigInt(dataToSave.fullBatteryChargePrice * 100));
      }

      const location: ContractSignedLocationInfo = {
        locationInfo: mapLocationInfoToContractLocationInfo(dataToSave.locationInfo),
        signature: "",
      };
      console.log(`location: ${JSON.stringify(location)}`);

      const request: ContractCreateCarRequest = {
        tokenUri: metadataURL,
        carVinNumber: dataToSave.vinNumber,
        brand: dataToSave.brand,
        model: dataToSave.model,
        yearOfProduction: BigInt(dataToSave.releaseYear),
        pricePerDayInUsdCents: BigInt(dataToSave.pricePerDay * 100),
        securityDepositPerTripInUsdCents: BigInt(dataToSave.securityDeposit * 100),
        milesIncludedPerDay: BigInt(
          isUnlimitedMiles(dataToSave.milesIncludedPerDay) ? UNLIMITED_MILES_VALUE : dataToSave.milesIncludedPerDay
        ),
        geoApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? " ",
        engineType: getEngineTypeCode(dataToSave.engineTypeText),
        engineParams: engineParams,
        timeBufferBetweenTripsInSec: BigInt(dataToSave.timeBufferBetweenTripsInMin * 60),
        insuranceRequired: dataToSave.isGuestInsuranceRequired,
        insurancePriceInUsdCents: BigInt(dataToSave.insurancePerDayPriceInUsd),
        locationInfo: {...location,signature: "0x"},
        currentlyListed: dataToSave.currentlyListed,
        dimoTokenId: BigInt(0),
      };
      
      const createInvestRequest = {
        car: request,
        priceInUsd: BigInt(carPrice * 100),
        creatorPercents: BigInt(hostPercents),
        inProgress: true,
      };

      await rentalityContracts.investment.createCarInvestment(createInvestRequest, nftName);
      return Ok(true);
    } catch (e) {
      console.error("Upload error" + e);
      return Err("ERROR");
    } finally {
      setDataSaved(true);
    }
  }

 

  return { dataSaved, createInvest } as const;
};

export default useCreateInvestCar;
