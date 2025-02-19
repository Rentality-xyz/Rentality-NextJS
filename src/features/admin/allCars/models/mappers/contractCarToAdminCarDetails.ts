import { ContractCarDetails } from "@/model/blockchain/schemas";
import { AdminCarDetails } from "..";
import { getIpfsURI, getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";

export const mapContractCarToAdminCarDetails = async (
  car: ContractCarDetails,
  metadataURI: string
): Promise<AdminCarDetails> => {
  const metaData = parseMetaData(await getMetaDataFromIpfs(metadataURI));
  const isUserAddressFull = car.locationInfo.userAddress.split(",").length > 3;

  return {
    carId: Number(car.carId),
    carPhotoUrl: getIpfsURI(metaData.mainImage),
    userAddress: car.locationInfo.userAddress,
    country: car.locationInfo.country,
    state: car.locationInfo.state,
    city: car.locationInfo.city,
    timeZoneId: car.locationInfo.timeZoneId,
    locationLatitude: car.locationInfo.latitude,
    locationLongitude: car.locationInfo.longitude,
    isListed: car.currentlyListed,
    hostName: car.hostName,
    hostAddress: car.host,
    isUniue: true,
    isUserAddressFull: isUserAddressFull,
    vinNumber: car.carVinNumber,
  };
};
