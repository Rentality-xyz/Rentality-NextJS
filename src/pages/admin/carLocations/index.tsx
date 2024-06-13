import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractCarDetails, ContractCarInfo } from "@/model/blockchain/schemas";
import { validateContractCarInfo } from "@/model/blockchain/schemas_utils";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import Image from "next/image";
import { useEffect, useState } from "react";

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

        const carLocationsData =
          getAllCarsView.length === 0
            ? []
            : await Promise.all(
                getAllCarsView.map(async (i: ContractCarInfo, index) => {
                  if (index === 0) {
                    validateContractCarInfo(i);
                  }
                  const carInfoDetails: ContractCarDetails = await rentalityContract.getCarDetails(i.carId);
                  const metadataURI = await rentalityContract.getCarMetadataURI(i.carId);
                  const meta = await getMetaDataFromIpfs(metadataURI);

                  let item: CarLocations = {
                    carId: Number(i.carId),
                    carPhotoUrl: getIpfsURIfromPinata(meta.image),
                    userAddress: carInfoDetails.locationInfo.userAddress,
                    country: carInfoDetails.locationInfo.country,
                    state: carInfoDetails.locationInfo.state,
                    city: carInfoDetails.locationInfo.city,
                    timeZoneId: carInfoDetails.locationInfo.timeZoneId,
                    locationLatitude: carInfoDetails.locationInfo.latitude,
                    locationLongitude: carInfoDetails.locationInfo.longitude,
                    isListed: carInfoDetails.currentlyListed,
                  };
                  return item;
                })
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
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <table className=" w-full table-auto border-spacing-2 max-lg:hidden">
            <thead className="mb-2">
              <tr className="text-rentality-additional-light">
                <th className={`${headerSpanClassName}`}>#</th>
                <th className={`${headerSpanClassName}`}>CarId</th>
                <th className={`${headerSpanClassName}`}>Status</th>
                <th className={`${headerSpanClassName}`}>CarImage</th>
                <th className={`${headerSpanClassName}`}>
                  <div>Country/State</div>
                  <div>City</div>
                </th>
                <th className={`${headerSpanClassName}`}>TimeZoneId</th>
                <th className={`${headerSpanClassName}`}>
                  <div>Latitude</div>
                  <div>Longitude</div>
                </th>
                <th className={`${headerSpanClassName}`}>Home address </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {carLocations.map((carLocation, index) => {
                return (
                  <tr key={carLocation.carId} className="border-b-[1px] border-b-gray-500">
                    <td className={rowSpanClassName}>{index + 1}</td>
                    <td className={rowSpanClassName}>{carLocation.carId}</td>
                    <td className={rowSpanClassName}>{carLocation.isListed ? "Listed" : "Not listed"}</td>
                    <td className={rowSpanClassName}>
                      <Image
                        src={carLocation.carPhotoUrl}
                        alt=""
                        width={150}
                        height={100}
                        className="py-2 object-cover"
                      />
                    </td>
                    <td className={rowSpanClassName}>
                      <div>{`${carLocation.country} / ${carLocation.state}`}</div>
                      <div>{carLocation.city}</div>
                    </td>
                    <td className={rowSpanClassName}>{carLocation.timeZoneId}</td>
                    <td className={rowSpanClassName}>
                      <div>{carLocation.locationLatitude}</div>
                      <div>{carLocation.locationLongitude}</div>
                    </td>
                    <td className={rowSpanClassName}>{carLocation.userAddress}</td>
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
