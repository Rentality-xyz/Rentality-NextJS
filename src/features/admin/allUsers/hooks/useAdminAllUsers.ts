import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { bigIntReplacer } from "@/utils/json";
import { useCallback, useState } from "react";

export enum UserType {
  Any = "Any",
  Guest = "Guest",
  Host = "Host",
}

export interface AdminAllUsersFilters {
  userType?: UserType;
  nickname?: string;
}

export type AdminUserDetails = {};

const MOCK_DATA: AdminUserDetails[] = [];

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

        // const allAdminUsers = await admin.getAllUsers(contractFilters, BigInt(page), BigInt(itemsPerPage));
        // validateContractAllUsersDTO(allAdminUsers);

        // const data: AdminUserDetails[] = await Promise.all(
        //   allAdminUsers.users.map(async (adminUserDto) => {
        //     return mapContractUserToAdminUserDetails(
        //       adminUserDto
        //     );
        //   })
        // );

        const allAdminTrips = { totalPageCount: 5 };
        const data: AdminUserDetails[] = MOCK_DATA;

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
