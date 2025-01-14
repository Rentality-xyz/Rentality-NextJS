import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { validateContractFullKYCInfoDTO } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import { bigIntReplacer } from "@/utils/json";
import { useCallback, useState } from "react";
import { mapContractFullKYCInfoDTOToAdminUserDetails } from "../models/mappers";
import { AdminUserDetails } from "../models";

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
        console.error("fetchData error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      try {
        setIsLoading(true);
        setCurrentPage(page);
        setTotalPageCount(0);
        console.debug(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

        // const contractFilters: ContractUserFilter = {
        // };

        const platformUsersInfos = await admin.getPlatformUsersInfo(); //(contractFilters, BigInt(page), BigInt(itemsPerPage));
        if (platformUsersInfos.length > 0) {
          validateContractFullKYCInfoDTO(platformUsersInfos[0]);
        }

        const data: AdminUserDetails[] = await Promise.all(
          platformUsersInfos.map(async (platformUsersInfo) => {
            return mapContractFullKYCInfoDTOToAdminUserDetails(platformUsersInfo);
          })
        );

        // const data: AdminUserDetails[] = MOCK_DATA;
        const allAdminTrips = { totalPageCount: 1 };

        setData(data);
        setTotalPageCount(Number(allAdminTrips.totalPageCount));

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
}

export default useAdminAllUsers;
