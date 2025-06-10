import { JsonRpcProvider, Wallet } from "ethers";
import { Err, Ok, Result, UnknownErr } from "@/model/utils/result";
import { UserInfo } from "../models";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityAdminGatewayContract } from "@/features/blockchain/models/IRentalityAdminGateway";
import { isEmpty } from "@/utils/string";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

type ChainId = number;
type WalletAddress = string;
type CacheUserInfo = UserInfo & { chainId: ChainId };

class UserService {
  private cacheTimestamps: Map<ChainId, number> = new Map();
  private userCache: Map<WalletAddress, CacheUserInfo[]> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes

  constructor() {}

  async getUserEmail(chainId: ChainId, walletAddress: WalletAddress): Promise<Result<string>> {
    try {
      const userInfoResult = await this.getUserInfo(chainId, walletAddress);

      if (!userInfoResult.ok) {
        return userInfoResult;
      }

      if (!userInfoResult.value) {
        return Err(new Error(`User not found for wallet: ${walletAddress}`));
      }

      return Ok(userInfoResult.value.email);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getUserInfo(chainId: ChainId, walletAddress: WalletAddress): Promise<Result<UserInfo | null>> {
    try {
      const validateCacheResult = await this.ensureUsersLoaded(chainId);

      const userInfos = this.userCache.get(walletAddress.toLowerCase());
      const userInfo = userInfos?.find((ui) => ui.chainId === chainId) ?? userInfos?.at(0);

      if (!userInfo && !validateCacheResult.ok) {
        return validateCacheResult;
      }

      return Ok(userInfo || null);
    } catch (error) {
      return Err(error as Error);
    }
  }

  private async ensureUsersLoaded(chainId: ChainId): Promise<Result<boolean>> {
    const now = Date.now();

    if (this.userCache.size > 0 && now - (this.cacheTimestamps.get(chainId) ?? 0) < this.CACHE_TTL) {
      return Ok(true);
    }

    return this.loadUsers(chainId);
  }

  private async loadUsers(chainId: ChainId): Promise<Result<boolean>> {
    try {
      const privateKey = env.MANAGER_PRIVATE_KEY;
      if (isEmpty(privateKey)) {
        return Err(new Error("MANAGER_PRIVATE_KEY was not set"));
      }
      const providerApiUrl = getProviderApiUrlFromEnv(chainId);
      if (isEmpty(providerApiUrl)) {
        return Err(new Error(`API URL for chain id ${chainId} was not set`));
      }

      const provider = new JsonRpcProvider(providerApiUrl);
      const wallet = new Wallet(privateKey, provider);

      const rentalityAdmin = (await getEtherContractWithSigner(
        "admin",
        wallet
      )) as unknown as IRentalityAdminGatewayContract;
      if (!rentalityAdmin) {
        return Err(new Error("loadUsers error: rentalityAdmin is null"));
      }

      let currentPage = 1;
      const itemsPerPage = 1000;
      let totalPage = 1;

      do {
        const adminKYCInfosDTO = await rentalityAdmin.getPlatformUsersInfo(BigInt(currentPage), BigInt(itemsPerPage));
        if (!adminKYCInfosDTO) {
          return Err(new Error("loadUsers error: adminKYCInfosDTO return null"));
        }

        totalPage = Number(adminKYCInfosDTO.totalPageCount);

        for (const userData of adminKYCInfosDTO.kycInfos) {
          const userInfos = this.userCache.get(userData.wallet.toLowerCase());
          const newUserInfo: CacheUserInfo = {
            chainId: chainId,
            wallet: userData.wallet.toLowerCase(),
            email: userData.additionalKYC.email,
            isEmailVerified: userData.isEmailVerified,
          };
          const newUserInfos = userInfos?.map((ui) => (ui.chainId === chainId ? newUserInfo : ui)) ?? [newUserInfo];

          this.userCache.set(userData.wallet.toLowerCase(), newUserInfos);
        }

        this.cacheTimestamps.set(chainId, Date.now());
        logger.info(`Loaded ${this.userCache.size} users into cache`);

        currentPage++;
      } while (currentPage < totalPage);
      return Ok(true);
    } catch (error) {
      return UnknownErr(error);
    }
  }

  async refreshCache(chainId: ChainId): Promise<Result<boolean>> {
    try {
      return await this.loadUsers(chainId);
    } catch (error) {
      return UnknownErr(error);
    }
  }
}

export default UserService;
