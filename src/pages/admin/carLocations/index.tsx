import Loading from "@/components/common/Loading";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractCarDetails, ContractCarInfo } from "@/model/blockchain/schemas";
import { validateContractCarInfo } from "@/model/blockchain/schemas_utils";
import { cn } from "@/utils";
import { getIpfsURIfromPinata, getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { number } from "zod";

type CarLocations = {
  carId: number;
  carPhotoUrl: string;
  userAddress: string;
  country: string;
  state: string;
  city: string;
  timeZoneId: string;
  locationLatitude: string;
  locationLongitude: string;
  isListed: boolean;
  hostName: string;
  isUniue: boolean;
  isUserAddressFull: boolean;
};

const useCarLocations = () => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [carLocations, setCarLocations] = useState<CarLocations[]>([]);

  useEffect(() => {
    const getCarLocations = async () => {
      if (rentalityContract == null) return;

      try {
        const getAllCarsView = await rentalityContract.getAllCars();

        let carLocationsData =
          getAllCarsView.length === 0
            ? []
            : await Promise.all(
                getAllCarsView.map(async (i: ContractCarInfo, index) => {
                  if (index === 0) {
                    validateContractCarInfo(i);
                  }
                  const carInfoDetails: ContractCarDetails = await rentalityContract.getCarDetails(i.carId);
                  const metadataURI = await rentalityContract.getCarMetadataURI(i.carId);
                  const metaData = parseMetaData(await getMetaDataFromIpfs(metadataURI));
                  const isUserAddressFull =
                    carInfoDetails.locationInfo.userAddress.split(",").length > 3 &&
                    carInfoDetails.locationInfo.userAddress.split(",")[0] !== "1";

                  let item: CarLocations = {
                    carId: Number(i.carId),
                    carPhotoUrl: getIpfsURIfromPinata(metaData.image),
                    userAddress: carInfoDetails.locationInfo.userAddress,
                    country: carInfoDetails.locationInfo.country,
                    state: carInfoDetails.locationInfo.state,
                    city: carInfoDetails.locationInfo.city,
                    timeZoneId: carInfoDetails.locationInfo.timeZoneId,
                    locationLatitude: carInfoDetails.locationInfo.latitude,
                    locationLongitude: carInfoDetails.locationInfo.longitude,
                    isListed: carInfoDetails.currentlyListed,
                    hostName: carInfoDetails.hostName,
                    isUniue: true,
                    isUserAddressFull: isUserAddressFull,
                  };
                  return item;
                })
              );
        carLocationsData = carLocationsData.map((cl) =>
          carLocationsData.filter(
            (i) => i.locationLatitude === cl.locationLatitude && i.locationLongitude === cl.locationLongitude
          ).length > 1
            ? { ...cl, isUniue: false }
            : cl
        );

        setCarLocations(carLocationsData ?? []);
      } catch (e) {
        console.error("getCarLocations error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    getCarLocations();
  }, [rentalityContract]);

  return [isLoading, carLocations] as const;
};

export default function Admin() {
  const [isLoading, carLocations] = useCarLocations();

  const headerSpanClassName = "text-start px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12";

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="Car locations" />
        {isLoading && <Loading />}
        {!isLoading && (
          <table className="w-full table-auto border-spacing-2 max-lg:hidden">
            <thead className="mb-2">
              <tr className="text-rentality-additional-light">
                <th className={`${headerSpanClassName}`}>#</th>
                <th className={`${headerSpanClassName}`}>CarId</th>
                <th className={`${headerSpanClassName}`}>Host</th>
                <th className={`${headerSpanClassName}`}>Status</th>
                <th className={`${headerSpanClassName}`}>CarImage</th>
                <th className={`${headerSpanClassName}`}>
                  <div>Country/State</div>
                  <div>City</div>
                </th>
                <th className={`${headerSpanClassName}`}>
                  <div>Latitude</div>
                  <div>Longitude</div>
                  <div>TimeZoneId</div>
                </th>
                <th className={`${headerSpanClassName}`}>Home address </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {carLocations.map((carLocation, index) => {
                const uniqueRowClassName = cn(rowSpanClassName);
                return (
                  <tr key={carLocation.carId} className="border-b-[1px] border-b-gray-500">
                    <td className={rowSpanClassName}>{index + 1}</td>
                    <td className={rowSpanClassName}>{carLocation.carId}</td>
                    <td className={rowSpanClassName}>{carLocation.hostName}</td>
                    <td className={rowSpanClassName}>{carLocation.isListed ? "Listed" : "Not listed"}</td>
                    <td className={rowSpanClassName}>
                      <Image
                        src={carLocation.carPhotoUrl}
                        alt=""
                        width={150}
                        height={100}
                        className="object-cover py-2"
                      />
                    </td>
                    <td className={rowSpanClassName}>
                      <div>{`${carLocation.country} / ${carLocation.state}`}</div>
                      <div>{carLocation.city}</div>
                    </td>
                    <td className={rowSpanClassName}>
                      <div className={`${carLocation.isUniue ? "" : "text-red-500"}`}>
                        {carLocation.locationLatitude}
                      </div>
                      <div className={`${carLocation.isUniue ? "" : "text-red-500"}`}>
                        {carLocation.locationLongitude}
                      </div>
                      <div>{carLocation.timeZoneId}</div>
                    </td>
                    <td className={rowSpanClassName}>
                      <span className={`${carLocation.isUserAddressFull ? "" : "text-red-500"}`}>
                        {carLocation.userAddress}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
