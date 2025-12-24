import { getEtherContractWithProvider, getEtherContractWithSigner } from "@/abis";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { IRentalityUserServiceContract } from "@/features/blockchain/models/IRentalityUserService";
import getDefaultProvider from "@/utils/api/defaultProviderUrl";
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


  const { data = UserRole.Guest, ...restQueryResult } = useQuery<QueryData>({
    queryKey: [USER_ROLE_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => {
      const cached = localStorage.getItem(USER_ROLE_QUERY_KEY + ethereumInfo?.walletAddress);
      if (cached) return JSON.parse(cached);
      const result = await fetchUserRole(ethereumInfo);
      localStorage.setItem(USER_ROLE_QUERY_KEY + ethereumInfo?.walletAddress, JSON.stringify(result));
      return result;
    }
  });


  return { ...restQueryResult, data, userRole: data, isGuest, isHost, isInvestManager } as const;
}

async function fetchUserRole(ethereumInfo: EthereumInfo | null | undefined) {
  if (!ethereumInfo) {
    throw new Error("Wallet not initialized");
  }

  const defaultProvider = await getDefaultProvider()
  
  const rentalityUserService = (await getEtherContractWithProvider(
    "userService",
    defaultProvider
  )) as unknown as IRentalityUserServiceContract;

  if (!rentalityUserService) {
    throw new Error("fetchUserRole error: rentalityUserService is null");
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
}

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
