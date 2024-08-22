import { getEtherContractWithSigner } from "@/abis";
import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { AdminCarDetails } from "@/model/admin/AdminCarDetails";
import { IRentalityAdminGateway } from "@/model/blockchain/IRentalityContract";
import { validateContractCarInfo } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import { getIpfsURIfromPinata, getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { useCallback, useEffect, useRef, useState } from "react";

const useAdminAllCars = () => {
  const ethereumInfo = useEthereum();
  const rentalityGateway = useRentality();
  const [rentalityAdminGateway, setRentalityAdminGateway] = useState<IRentalityAdminGateway | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdminCarDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);

  const fetchData = useCallback(
    async (page: number = 1, itemsPerPage: number = 10): Promise<Result<boolean, string>> => {
      if (!rentalityAdminGateway) {
        console.error("fetchData error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }
      if (!rentalityGateway) {
        console.error("fetchData error: rentalityContract is null");
        return Err("Contract is not initialized");
      }

      try {
        setIsLoading(true);
        setCurrentPage(page);
        setTotalPageCount(0);

        // const allAdminCars = await rentalityAdminGateway.getAllCars(
        //   BigInt(page),
        //   BigInt(itemsPerPage)
        // );
        // validateContractAllCarsDTO(allAdminCars);

        // const data: AdminCarDetails[] = await Promise.all(
        //   allAdminCars.cars.map(async (adminCarDto) => {
        //     return mapContractCarToAdminCarDetails(
        //       adminCarDto.car,
        //       adminCarDto.carMetadataURI
        //     );
        //   })
        // );

        const getAllCarsView = await rentalityGateway.getAllCars();

        let data: AdminCarDetails[] =
          getAllCarsView.length === 0
            ? []
            : await Promise.all(
                getAllCarsView.map(async (car, index) => {
                  if (index === 0) {
                    validateContractCarInfo(car);
                  }
                  await new Promise((res) => setTimeout(res, Math.ceil(Math.random() * 10_000)));
                  const carInfoDetails = await rentalityGateway.getCarDetails(car.carId);
                  const metadataURI = await rentalityGateway.getCarMetadataURI(car.carId);
                  const metaData = parseMetaData(await getMetaDataFromIpfs(metadataURI));
                  const isUserAddressFull =
                    carInfoDetails.locationInfo.userAddress.split(",").length > 3 &&
                    carInfoDetails.locationInfo.userAddress.split(",")[0] !== "1";

                  let item: AdminCarDetails = {
                    carId: Number(carInfoDetails.carId),
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
        data = data.map((cl) =>
          data.filter((i) => i.locationLatitude === cl.locationLatitude && i.locationLongitude === cl.locationLongitude)
            .length > 1
            ? { ...cl, isUniue: false }
            : cl
        );

        setData(data);
        //setTotalPageCount(Number(allAdminCars.totalPageCount));
        setTotalPageCount(Number(0));

        return Ok(true);
      } catch (e) {
        console.error("fetchData error" + e);
        return Err("Get data error. See logs for more details");
      } finally {
        setIsLoading(false);
      }
    },
    [rentalityAdminGateway, rentalityGateway]
  );

  const isIniialized = useRef<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      if (!ethereumInfo) return;
      if (isIniialized.current) return;

      try {
        isIniialized.current = true;

        const rentalityAdminGateway = (await getEtherContractWithSigner(
          "admin",
          ethereumInfo.signer
        )) as unknown as IRentalityAdminGateway;
        setRentalityAdminGateway(rentalityAdminGateway);
      } catch (e) {
        console.error("initialize error" + e);
        isIniialized.current = false;
      }
    };

    initialize();
  }, [ethereumInfo]);

  return {
    isLoading,
    data: { data: data, currentPage: currentPage, totalPageCount: totalPageCount },
    fetchData,
  } as const;
};

export default useAdminAllCars;
