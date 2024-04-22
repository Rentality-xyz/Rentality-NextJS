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
  country: string;
  state: string;
  city: string;
  timeZoneId: string;
  locationLatitude: string;
  locationLongitude: string;
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
                    country: carInfoDetails.country,
                    state: carInfoDetails.state,
                    city: carInfoDetails.city,
                    timeZoneId: carInfoDetails.timeZoneId,
                    locationLatitude: carInfoDetails.locationLatitude,
                    locationLongitude: carInfoDetails.locationLongitude,
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
                <th className={`${headerSpanClassName}`}>CarId</th>
                <th className={`${headerSpanClassName}`}>CarImage</th>
                <th className={`${headerSpanClassName}`}>Country</th>
                <th className={`${headerSpanClassName}`}>State</th>
                <th className={`${headerSpanClassName}`}>City</th>
                <th className={`${headerSpanClassName}`}>TimeZoneId</th>
                <th className={`${headerSpanClassName}`}>Latitude</th>
                <th className={`${headerSpanClassName}`}>locatioLongitude</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {carLocations.map((carLocation) => {
                return (
                  <tr key={carLocation.carId} className="border-b-[1px] border-b-gray-500">
                    <td className={rowSpanClassName}>{carLocation.carId}</td>
                    <td className={rowSpanClassName}>
                      <Image
                        src={carLocation.carPhotoUrl}
                        alt=""
                        width={150}
                        height={100}
                        className="py-2 object-cover"
                      />
                    </td>
                    <td className={rowSpanClassName}>{carLocation.country}</td>
                    <td className={rowSpanClassName}>{carLocation.state}</td>
                    <td className={rowSpanClassName}>{carLocation.city}</td>
                    <td className={rowSpanClassName}>{carLocation.timeZoneId}</td>
                    <td className={rowSpanClassName}>{carLocation.locationLatitude}</td>
                    <td className={rowSpanClassName}>{carLocation.locationLongitude}</td>
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
