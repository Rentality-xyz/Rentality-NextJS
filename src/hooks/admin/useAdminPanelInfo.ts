import { formatEther, parseEther } from "ethers";
import { useEffect, useRef, useState } from "react";
import { IRentalityAdminGateway } from "@/model/blockchain/IRentalityContract";
import { getEtherContractWithSigner } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";

export type AdminContractInfo = {
  platformFee: number;
  claimWaitingTime: number;
  kycCommission: number;

  ownerAddress: string;
  userServiceAddress: string;
  currencyConverterAddress: string;
  carServiceAddress: string;
  claimServiceAddress: string;
  paymentServiceAddress: string;
  tripServiceAddress: string;
  platformContractAddress: string;
  platformBalance: number;
  paymentBalance: number;
};

const emptyAdminContractInfo = {
  platformFee: 0,
  claimWaitingTime: 0,
  kycCommission: 0,

  ownerAddress: "",
  userServiceAddress: "",
  currencyConverterAddress: "",
  carServiceAddress: "",
  claimServiceAddress: "",
  paymentServiceAddress: "",
  tripServiceAddress: "",
  platformContractAddress: "",
  platformBalance: 0,
  paymentBalance: 0,
};

const useAdminPanelInfo = () => {
  const ethereumInfo = useEthereum();
  const [adminContractInfo, setAdminContractInfo] = useState<AdminContractInfo>(emptyAdminContractInfo);
  const [rentalityAdminGateway, setRentalityAdminGateway] = useState<IRentalityAdminGateway | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const withdrawFromPlatform = async (value: number) => {
    if (!rentalityAdminGateway) {
      console.error("saveKycCommission error: rentalityAdminGateway is null");
      return false;
    }

    try {
      setIsLoading(true);
      const valueToWithdrawInWei = parseEther(value.toString());
      let transaction = await rentalityAdminGateway.withdrawFromPlatform(valueToWithdrawInWei, ETH_DEFAULT_ADDRESS);
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("withdrawFromPlatform error" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setPlatformFeeInPPM = async (value: number) => {
    if (!rentalityAdminGateway) {
      console.error("saveKycCommission error: rentalityAdminGateway is null");
      return false;
    }

    try {
      setIsLoading(true);

      let transaction = await rentalityAdminGateway.setPlatformFeeInPPM(BigInt(Math.round(value * 10_000)));
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("setPlatformFeeInPPM error" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveKycCommission = async (value: number) => {
    if (!rentalityAdminGateway) {
      console.error("saveKycCommission error: rentalityAdminGateway is null");
      return false;
    }

    try {
      setIsLoading(true);

      let transaction = await rentalityAdminGateway.setKycCommission(BigInt(Math.round(value * 100)));
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("saveKycCommission error" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveClaimWaitingTime = async (value: number) => {
    if (!rentalityAdminGateway) {
      console.error("saveClaimWaitingTime error: rentalityAdminGateway is null");
      return false;
    }

    try {
      setIsLoading(true);

      let transaction = await rentalityAdminGateway.setClaimsWaitingTime(BigInt(value));
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("saveClaimWaitingTime error" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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

        const platformFee = Number(await rentalityAdminGateway.getPlatformFeeInPPM()) / 10_000.0 ?? 0;
        const claimWaitingTime = Number(await rentalityAdminGateway.getClaimWaitingTime());
        const kycCommission = Number(await rentalityAdminGateway.getKycCommission()) / 100 ?? 0;

        const ownerAddress = await rentalityAdminGateway.owner();
        const userServiceAddress = await rentalityAdminGateway.getUserServiceAddress();
        const currencyConverterAddress = await rentalityAdminGateway.getCurrencyConverterServiceAddress();
        const carServiceAddress = await rentalityAdminGateway.getCarServiceAddress();
        const claimServiceAddress = await rentalityAdminGateway.getClaimServiceAddress();
        const paymentServiceAddress = await rentalityAdminGateway.getPaymentService();
        const tripServiceAddress = await rentalityAdminGateway.getTripServiceAddress();
        const platformContractAddress = await rentalityAdminGateway.getRentalityPlatformAddress();
        const platformBalance = (await ethereumInfo.provider.getBalance(platformContractAddress)) ?? 0;
        const paymentBalance = (await ethereumInfo.provider.getBalance(paymentServiceAddress)) ?? 0;

        const result: AdminContractInfo = {
          platformFee: platformFee,
          claimWaitingTime: claimWaitingTime,
          kycCommission: kycCommission,

          ownerAddress: ownerAddress,
          userServiceAddress: userServiceAddress,
          currencyConverterAddress: currencyConverterAddress,
          carServiceAddress: carServiceAddress,
          claimServiceAddress: claimServiceAddress,
          paymentServiceAddress: paymentServiceAddress,
          tripServiceAddress: tripServiceAddress,
          platformContractAddress: platformContractAddress,
          platformBalance: Number(formatEther(platformBalance)),
          paymentBalance: Number(formatEther(paymentBalance)),
        };
        setAdminContractInfo(result);
        setIsLoading(false);
      } catch (e) {
        console.error("initialize error" + e);
        isIniialized.current = false;
        return null;
      }
    };

    initialize();
  }, [ethereumInfo]);

  return {
    isLoading,
    adminContractInfo,
    withdrawFromPlatform,
    setPlatformFeeInPPM,
    saveKycCommission,
    saveClaimWaitingTime,
  } as const;
};

export default useAdminPanelInfo;
