import { formatEther, parseEther } from "ethers";
import { useEffect, useRef, useState } from "react";
import { IRentalityAdminGateway, IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { getEtherContractWithSigner } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { ContractCivicKYCInfo, ContractCreateTripRequestWithDelivery, Role } from "@/model/blockchain/schemas";
import { kycDbInfo } from "@/utils/firebase";
import { isEmpty } from "@/utils/string";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import moment from "moment";
import { collection, getDocs, query } from "firebase/firestore";
import { bigIntReplacer } from "@/utils/json";
import { ZERO_HASH } from "@/utils/wallet";
import { emptyContractLocationInfo } from "@/model/blockchain/schemas_utils";

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

  const grantAdminRole = async (address: string) => {
    if (!rentalityAdminGateway) {
      console.error("grantAdminRole error: rentalityAdminGateway is null");
      return false;
    }

    try {
      setIsLoading(true);

      let transaction = await rentalityAdminGateway.manageRole(Role.Admin, address, true);
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("grantAdminRole error" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  async function updateKycInfoForAddress(address: string) {
    if (!ethereumInfo) {
      console.error("updateKycInfoForAddress error: ethereumInfo is null");
      return false;
    }
    if (!kycDbInfo.db) {
      console.error("updateKycInfoForAddress error: db is null");
      return false;
    }

    try {
      setIsLoading(true);

      const kycInfoQuery = query(collection(kycDbInfo.db, kycDbInfo.collections.kycInfos));
      const kycInfoQuerySnapshot = await getDocs(kycInfoQuery);
      const verifiedInformation = kycInfoQuerySnapshot.docs
        .find((i) => i.data().verifiedInformation?.address === address)
        ?.data().verifiedInformation;

      if (verifiedInformation === undefined) {
        console.error(`verifiedInformation for ${address} was not found`);
        return;
      }

      const contractCivicKYCInfo: ContractCivicKYCInfo = {
        fullName: verifiedInformation.name,
        licenseNumber: verifiedInformation.documentNumber,
        expirationDate: !isEmpty(verifiedInformation.dateOfExpiry)
          ? getBlockchainTimeFromDate(moment.utc(verifiedInformation.dateOfExpiry).toDate())
          : BigInt(0),
        issueCountry: verifiedInformation.issueCountry,
        email: verifiedInformation.email,
      };

      console.debug("contractCivicKYCInfo", JSON.stringify(contractCivicKYCInfo, bigIntReplacer, 2));

      const rentality = (await getEtherContractWithSigner(
        "gateway",
        ethereumInfo.signer
      )) as unknown as IRentalityContract;
      const transaction = await rentality.setCivicKYCInfo(address, contractCivicKYCInfo);
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("updateKycInfoForAddress error" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function setTestKycInfoForAddress(address: string) {
    if (!ethereumInfo) {
      console.error("setDrivingLicenceForAddress error: ethereumInfo is null");
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

      const rentality = (await getEtherContractWithSigner(
        "gateway",
        ethereumInfo.signer
      )) as unknown as IRentalityContract;
      const transaction = await rentality.setCivicKYCInfo(address, contractCivicKYCInfo);
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("setDrivingLicenceForAddress error" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function createTestTrip(carId: string) {
    if (!rentalityAdminGateway) {
      console.error("createTestTrip error: rentalityAdminGateway is null");
      return false;
    }
    if (!ethereumInfo) {
      console.error("createTestTrip error: ethereumInfo is null");
      return false;
    }

    try {
      setIsLoading(true);

      const rentalityContract = (await getEtherContractWithSigner(
        "gateway",
        ethereumInfo.signer
      )) as unknown as IRentalityContract;

      const paymentsNeeded = await rentalityContract.calculatePaymentsWithDelivery(
        BigInt(carId),
        BigInt(3),
        ETH_DEFAULT_ADDRESS,
        emptyContractLocationInfo,
        emptyContractLocationInfo
      );

      const tripRequest: ContractCreateTripRequestWithDelivery = {
        carId: BigInt(carId),
        startDateTime: getBlockchainTimeFromDate(moment().toDate()),
        endDateTime: getBlockchainTimeFromDate(moment().add(3, "days").toDate()),
        currencyType: ETH_DEFAULT_ADDRESS,
        pickUpInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
        returnInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
      };

      const transaction = await rentalityContract.createTripRequestWithDelivery(tripRequest, {
        value: BigInt(Math.ceil(Number(paymentsNeeded.totalPrice) * 0.991)),
      });
      await transaction.wait();

      return true;
    } catch (e) {
      console.error("createTestTrip error" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

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

        const platformFee = Number((await rentalityAdminGateway.getPlatformFeeInPPM()) ?? 0) / 10_000.0;
        const claimWaitingTime = Number(await rentalityAdminGateway.getClaimWaitingTime());
        const kycCommission = Number((await rentalityAdminGateway.getKycCommission()) ?? 0) / 100;

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
    grantAdminRole,
    updateKycInfoForAddress,
    setTestKycInfoForAddress,
    createTestTrip,
  } as const;
};

export default useAdminPanelInfo;
