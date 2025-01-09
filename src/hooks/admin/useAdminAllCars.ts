import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { AdminCarDetails } from "@/model/admin/AdminCarDetails";
import { validateContractAllCarsDTO } from "@/model/blockchain/schemas_utils";
import { mapContractCarToAdminCarDetails } from "@/model/mappers/contractCarToAdminCarDetails";
import { Err, Ok, Result } from "@/model/utils/result";
import { useCallback, useState } from "react";

const useAdminAllCars = () => {
  const { admin } = useRentalityAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdminCarDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);

  const fetchData = useCallback(
    async (page: number = 1, itemsPerPage: number = 10): Promise<Result<boolean, string>> => {
      if (!admin) {
        console.error("fetchData error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      try {
        setIsLoading(true);
        setCurrentPage(page);
        setTotalPageCount(0);

        const allAdminCars = await admin.getAllCars(BigInt(page), BigInt(itemsPerPage));
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
    [admin]
  );

  return {
    isLoading,
    data: { data: data, currentPage: currentPage, totalPageCount: totalPageCount },
    fetchData,
  } as const;
};

export default useAdminAllCars;
