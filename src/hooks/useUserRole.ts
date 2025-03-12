import { getEtherContractWithSigner } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { IRentalityUserServiceContract } from "@/features/blockchain/models/IRentalityUserService";
import { logger } from "@/utils/logger";
import { useQuery } from "@tanstack/react-query";

export enum UserRole {
  None = 0,
  Guest = 1 << 0,
  Host = 1 << 1,
  InvestManager = 1 << 2,
}

export const USER_ROLE_QUERY_KEY = "UserRole";

type QueryData = UserRole;

const useUserRole = () => {
  const ethereumInfo = useEthereum();

  const queryResult = useQuery<QueryData>({
    queryKey: [USER_ROLE_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => {
      if (!ethereumInfo) {
        throw new Error("Wallet not initialized");
      }

      const rentalityUserService = (await getEtherContractWithSigner(
        "userService",
        ethereumInfo.signer
      )) as unknown as IRentalityUserServiceContract;
      if (!rentalityUserService) {
        throw new Error("useUserRole error: rentalityUserService is null");
      }

      let userRole = UserRole.Guest;
      const isHost = await rentalityUserService.isHost(ethereumInfo.walletAddress);
      const isInvestManager = await rentalityUserService.isInvestorManager(ethereumInfo.walletAddress);

      if (isHost) {
        userRole |= UserRole.Host;
      }
      if (isInvestManager) {
        userRole |= UserRole.InvestManager;
      }

      logger.debug("Rentality user role: ", userRole);

      return userRole;
    },
  });

  const data = queryResult.data ?? UserRole.Guest;
  return { ...queryResult, data: data, userRole: data, isGuest, isHost, isInvestManager } as const;
};

function isGuest(role: UserRole) {
  return isRole(role, UserRole.Guest);
}

function isHost(role: UserRole) {
  return isRole(role, UserRole.Host);
}

function isInvestManager(role: UserRole) {
  return isRole(role, UserRole.InvestManager);
}

function isRole(role: UserRole, roleToCheck: UserRole) {
  return (role & roleToCheck) === roleToCheck;
}

export default useUserRole;
