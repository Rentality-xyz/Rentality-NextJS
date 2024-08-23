import { getEtherContractWithSigner } from "@/abis";
import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { AdminCarDetails } from "@/model/admin/AdminCarDetails";
import { IRentalityAdminGateway } from "@/model/blockchain/IRentalityContract";
import { validateContractAllCarsDTO } from "@/model/blockchain/schemas_utils";
import { mapContractCarToAdminCarDetails } from "@/model/mappers/contractCarToAdminCarDetails";
import { Err, Ok, Result } from "@/model/utils/result";
import { bigIntReplacer } from "@/utils/json";
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

        const allAdminCars = await rentalityAdminGateway.getAllCars(BigInt(page), BigInt(itemsPerPage));
        validateContractAllCarsDTO(allAdminCars);

        let data: AdminCarDetails[] = await Promise.all(
          allAdminCars.cars.map(async (adminCarDto) => {
            return mapContractCarToAdminCarDetails(adminCarDto.car, adminCarDto.carMetadataURI);
          })
        );
        data = data.map((car) =>
          data.filter(
            (i) => i.locationLatitude === car.locationLatitude && i.locationLongitude === car.locationLongitude
          ).length > 1
            ? { ...car, isUniue: false }
            : car
        );

        setData(data);
        setTotalPageCount(Number(allAdminCars.totalPageCount));

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
