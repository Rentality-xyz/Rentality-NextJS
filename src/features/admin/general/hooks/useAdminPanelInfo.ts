import { formatEther, parseEther } from "ethers";
import { useEffect, useRef, useState } from "react";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { EMPTY_PROMOCODE, ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { ContractCivicKYCInfo, ContractCreateTripRequestWithDelivery } from "@/model/blockchain/schemas";
import { kycDbInfo, loginWithPassword, readDocFromFirebaseDb } from "@/utils/firebase";
import { isEmpty } from "@/utils/string";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import moment from "moment";
import { emptyContractLocationInfo } from "@/model/blockchain/schemas_utils";
import { useRentality, useRentalityAdmin } from "@/contexts/rentalityContext";
import { logger } from "@/utils/logger";
import { env } from "@/utils/env";

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
  const { rentalityContracts } = useRentality();
  const { admin } = useRentalityAdmin();
  const [adminContractInfo, setAdminContractInfo] = useState<AdminContractInfo>(emptyAdminContractInfo);
  const [isLoading, setIsLoading] = useState(true);

  const withdrawFromPlatform = async (value: number) => {
    if (!admin) {
      logger.error("saveKycCommission error: rentalityAdminGateway is null");
      return false;
    }

    setIsLoading(true);

    const valueToWithdrawInWei = parseEther(value.toString());
    const result = await admin.withdrawFromPlatform(valueToWithdrawInWei, ETH_DEFAULT_ADDRESS);

    setIsLoading(false);
    return result.ok;
  };

  const setPlatformFeeInPPM = async (value: number) => {
    if (!admin) {
      logger.error("saveKycCommission error: rentalityAdminGateway is null");
      return false;
    }

    setIsLoading(true);

    const result = await admin.setPlatformFeeInPPM(BigInt(Math.round(value * 10_000)));

    setIsLoading(false);
    return result.ok;
  };

  const saveKycCommission = async (value: number) => {
    if (!admin) {
      logger.error("saveKycCommission error: rentalityAdminGateway is null");
      return false;
    }

    setIsLoading(true);

    const result = await admin.setKycCommission(BigInt(Math.round(value * 100)));

    setIsLoading(false);
    return result.ok;
  };

  const saveClaimWaitingTime = async (value: number) => {
    if (!admin) {
      logger.error("saveClaimWaitingTime error: rentalityAdminGateway is null");
      return false;
    }

    setIsLoading(true);

    const result = await admin.setClaimsWaitingTime(BigInt(value));

    setIsLoading(false);
    return result.ok;
  };

  async function updateKycInfoForAddress(address: string) {
    if (!rentalityContracts) {
      logger.error("updateKycInfoForAddress error: rentalityContract is null");
      return false;
    }
    if (!ethereumInfo) {
      logger.error("updateKycInfoForAddress error: ethereumInfo is null");
      return false;
    }
    if (!kycDbInfo.db) {
      logger.error("updateKycInfoForAddress error: db is null");
      return false;
    }

    try {
      setIsLoading(true);

      const publicPlatformEmail = env.NEXT_PUBLIC_USER_EMAIL;
      const publicPlatformPassword = env.NEXT_PUBLIC_USER_PASSWORD;

      if (isEmpty(publicPlatformEmail) || isEmpty(publicPlatformPassword)) {
        logger.debug("updateKycInfoForAddress error: NEXT_PUBLIC_USER_EMAIL or NEXT_PUBLIC_USER_PASSWORD is not set");
        return "";
      }

      await loginWithPassword(publicPlatformEmail, publicPlatformPassword);

      const verifiedInformationResult = await readDocFromFirebaseDb<{
        verifiedInformation: {
          name: string;
          documentNumber: string;
          dateOfExpiry: string;
          issueCountry: string;
          email: string;
        };
      }>(kycDbInfo.db, kycDbInfo.collections.kycInfos, [address]);

      if (!verifiedInformationResult.ok) {
        logger.error(
          `updateKycInfoForAddress error: get verified information result error: ${verifiedInformationResult.error}`
        );
        return;
      }

      if (!verifiedInformationResult.value || !verifiedInformationResult.value.verifiedInformation) {
        logger.error(`updateKycInfoForAddress error: get verified information result is empty`);
        return;
      }

      const contractCivicKYCInfo: ContractCivicKYCInfo = {
        fullName: verifiedInformationResult.value.verifiedInformation.name,
        licenseNumber: verifiedInformationResult.value.verifiedInformation.documentNumber,
        expirationDate: !isEmpty(verifiedInformationResult.value.verifiedInformation.dateOfExpiry)
          ? getBlockchainTimeFromDate(
              moment.utc(verifiedInformationResult.value.verifiedInformation.dateOfExpiry).toDate()
            )
          : BigInt(0),
        issueCountry: verifiedInformationResult.value.verifiedInformation.issueCountry,
        email: verifiedInformationResult.value.verifiedInformation.email,
      };

      const result = await rentalityContracts.gateway.setCivicKYCInfo(address, contractCivicKYCInfo);
      return result.ok;
    } catch (error) {
      logger.error("updateKycInfoForAddress error" + error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function setTestKycInfoForAddress(address: string) {
    if (!ethereumInfo) {
      logger.error("setDrivingLicenceForAddress error: ethereumInfo is null");
      return false;
    }
    if (!rentalityContracts) {
      logger.error("setDrivingLicenceForAddress error: rentalityContract is null");
      return false;
    }

    try {
      setIsLoading(true);

      const contractCivicKYCInfo: ContractCivicKYCInfo = {
        fullName: "Test Fullname",
        licenseNumber: "TEST13579",
        expirationDate: BigInt(0),
        issueCountry: "US",
        email: "testemail@test.com",
      };

      const result = await rentalityContracts.gateway.setCivicKYCInfo(address, contractCivicKYCInfo);
      return result.ok;
    } catch (error) {
      logger.error("setDrivingLicenceForAddress error" + error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function createTestTrip(carId: string) {
    if (!ethereumInfo) {
      logger.error("createTestTrip error: ethereumInfo is null");
      return false;
    }
    if (!rentalityContracts) {
      logger.error("createTestTrip error: rentalityContract is null");
      return false;
    }

    setIsLoading(true);

    const paymentResult = await rentalityContracts.gateway.calculatePaymentsWithDelivery(
      BigInt(carId),
      BigInt(3),
      ETH_DEFAULT_ADDRESS,
      emptyContractLocationInfo,
      emptyContractLocationInfo,
      EMPTY_PROMOCODE
    );

    if (!paymentResult.ok) {
      setIsLoading(false);
      return false;
    }

    const tripRequest: ContractCreateTripRequestWithDelivery = {
      carId: BigInt(carId),
      startDateTime: getBlockchainTimeFromDate(moment().toDate()),
      endDateTime: getBlockchainTimeFromDate(moment().add(3, "days").toDate()),
      currencyType: ETH_DEFAULT_ADDRESS,
      pickUpInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
      returnInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
    };

    const result = await rentalityContracts.gateway.createTripRequestWithDelivery(tripRequest, EMPTY_PROMOCODE, {
      value: BigInt(Math.ceil(Number(paymentResult.value.totalPrice) * 0.991)),
    });

    setIsLoading(false);
    return result.ok;
  }

  const isIniialized = useRef<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      if (!ethereumInfo) return;
      if (!admin) return;
      if (isIniialized.current) return;

      try {
        isIniialized.current = true;

        const platformFeeResult = await admin.getPlatformFeeInPPM();
        const claimWaitingTimeResult = await admin.getClaimWaitingTime();
        const kycCommissionResult = await admin.getKycCommission();
        const ownerResult = await admin.owner();
        const userServiceAddressResult = await admin.getUserServiceAddress();
        const currencyConverterServiceAddressResult = await admin.getCurrencyConverterServiceAddress();
        const carServiceAddressResult = await admin.getCarServiceAddress();
        const claimServiceAddressResult = await admin.getClaimServiceAddress();
        const paymentServiceResult = await admin.getPaymentService();
        const tripServiceAddressResult = await admin.getTripServiceAddress();
        const rentalityPlatformAddressResult = await admin.getRentalityPlatformAddress();

        const platformFee = platformFeeResult.ok ? Number(platformFeeResult.value) / 10_000.0 : 0;
        const claimWaitingTime = claimWaitingTimeResult.ok ? Number(claimWaitingTimeResult.value) : 0;
        const kycCommission = kycCommissionResult.ok ? Number(kycCommissionResult.value) / 100 : 0;

        const ownerAddress = ownerResult.ok ? ownerResult.value : "";
        const userServiceAddress = userServiceAddressResult.ok ? userServiceAddressResult.value : "";
        const currencyConverterAddress = currencyConverterServiceAddressResult.ok
          ? currencyConverterServiceAddressResult.value
          : "";
        const carServiceAddress = carServiceAddressResult.ok ? carServiceAddressResult.value : "";
        const claimServiceAddress = claimServiceAddressResult.ok ? claimServiceAddressResult.value : "";
        const paymentServiceAddress = paymentServiceResult.ok ? paymentServiceResult.value : "";
        const tripServiceAddress = tripServiceAddressResult.ok ? tripServiceAddressResult.value : "";
        const platformContractAddress = rentalityPlatformAddressResult.ok ? rentalityPlatformAddressResult.value : "";
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
      } catch (error) {
        logger.error("initialize error" + error);
        isIniialized.current = false;
        return null;
      }
    };

    initialize();
  }, [ethereumInfo, admin]);

  return {
    isLoading,
    adminContractInfo,
    withdrawFromPlatform,
    setPlatformFeeInPPM,
    saveKycCommission,
    saveClaimWaitingTime,
    updateKycInfoForAddress,
    setTestKycInfoForAddress,
    createTestTrip,
  } as const;
};

export default useAdminPanelInfo;
