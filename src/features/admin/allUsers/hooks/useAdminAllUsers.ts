import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { validateContractAdminKYCInfoDTO } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import { bigIntReplacer } from "@/utils/json";
import { useCallback, useState } from "react";
import { mapContractAdminKYCInfoDTOToAdminUserDetails } from "../models/mappers";
import { AdminUserDetails } from "../models";
import { logger } from "@/utils/logger";

export enum UserType {
  Any = "Any",
  Guest = "Guest",
  Host = "Host",
}

export interface AdminAllUsersFilters {
  userType?: UserType;
  nickname?: string;
}

function useAdminAllUsers() {
  const { admin } = useRentalityAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdminUserDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);

  const fetchData = useCallback(
    async (
      filters?: AdminAllUsersFilters,
      page: number = 1,
      itemsPerPage: number = 10
    ): Promise<Result<boolean, string>> => {
      if (!admin) {
        logger.error("fetchData error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      setIsLoading(true);
      setCurrentPage(page);
      setTotalPageCount(0);
      logger.debug(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

      // const contractFilters: ContractUserFilter = {
      // };

      const result = await admin.getPlatformUsersInfo(); //(contractFilters, BigInt(page), BigInt(itemsPerPage));

      if (result.ok) {
        if (result.value.length > 0) {
          validateContractAdminKYCInfoDTO(result.value[0]);
        }

        const data: AdminUserDetails[] = result.value.map((platformUsersInfo) =>
          mapContractAdminKYCInfoDTOToAdminUserDetails(platformUsersInfo)
        );

        const allAdminTrips = { totalPageCount: 1 };

        setData(data);
        setTotalPageCount(Number(allAdminTrips.totalPageCount));

        setIsLoading(false);
        return Ok(true);
      } else {
        setIsLoading(false);
        return Err("Get data error. See logs for more details");
      }
    },
    [admin]
  );

  return {
    isLoading,
    data: { data: data, currentPage: currentPage, totalPageCount: totalPageCount },
    fetchData,
  } as const;
}

export default useAdminAllUsers;
