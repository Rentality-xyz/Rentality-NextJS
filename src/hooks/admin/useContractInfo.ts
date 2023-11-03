import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractCarInfo } from "@/model/blockchain/ContractCarInfo";
import { useRentality } from "@/contexts/rentalityContext";

export type AdminContractInfo = {
  contractAddress: string;
  contractOwnerAddress: string;
  contractBalance: bigint;
  contractBalanceString: string;
  rentalityCommission: number;
  currencyConverterContractAddress: string;
  userServiceContractAddress: string;
  tripServiceContractAddress: string;
  carServiceContractAddress: string;
};

const emptyAdminContractInfo = {
  contractAddress: "",
  contractOwnerAddress: "",
  contractBalance: BigInt(0),
  contractBalanceString: "0",
  rentalityCommission: 0,
  currencyConverterContractAddress: "",
  userServiceContractAddress: "",
  tripServiceContractAddress: "",
  carServiceContractAddress: "",
};

const useContractInfo = () => {
  const rentalityInfo = useRentality();
  const [adminContractInfo, setAdminContractInfo] = useState<AdminContractInfo>(emptyAdminContractInfo);
  const [dataUpdated, setDataUpdated] = useState(false);

  const getAdminContractInfo = async (contract: IRentalityContract, provider: ethers.providers.Web3Provider) => {
    const contractAddress = await contract.address;
    const ownerAddress = await contract.owner();
    const balance = (await provider.getBalance(contractAddress)) ?? 0;
    const rentalityCommission = Number(await contract.getPlatformFeeInPPM()) / 10_000.0 ?? 0;
    const currencyConverterContractAddress = await contract.getCurrencyConverterServiceAddress();
    const userServiceContractAddress = await contract.getUserServiceAddress();
    const tripServiceContractAddress = await contract.getTripServiceAddress();
    const carServiceContractAddress = await contract.getCarServiceAddress();

    const result: AdminContractInfo = {
      contractAddress: contractAddress,
      contractOwnerAddress: ownerAddress,
      contractBalance: balance.toBigInt(),
      contractBalanceString: ethers.utils.formatEther(balance),
      rentalityCommission: rentalityCommission,
      currencyConverterContractAddress: currencyConverterContractAddress,
      userServiceContractAddress: userServiceContractAddress,
      tripServiceContractAddress: tripServiceContractAddress,
      carServiceContractAddress: carServiceContractAddress,
    };
    return result;
  };

  const withdrawFromPlatform = async (value: bigint) => {
    if (!rentalityInfo) {
      console.error("setPlatformFeeInPPM error: rentalityInfo is null");
      return false;
    }

    try {
      let transaction = await rentalityInfo.rentalityContract.withdrawFromPlatform(value);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("withdrawFromPlatform error" + e);
      return false;
    }
  };

  const setPlatformFeeInPPM = async (value: bigint) => {
    if (!rentalityInfo) {
      console.error("setPlatformFeeInPPM error: rentalityInfo is null");
      return false;
    }

    try {
      let transaction = await rentalityInfo.rentalityContract.setPlatformFeeInPPM(value);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("setPlatformFeeInPPM error" + e);
      return false;
    }
  };

  const updateUserService = async (address: string) => {
    if (!rentalityInfo) {
      console.error("updateUserService error: rentalityInfo is null");
      return false;
    }

    try {
      let transaction = await rentalityInfo.rentalityContract.updateUserService(address);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("updateUserService error" + e);
      return false;
    }
  };

  const updateCarService = async (address: string) => {
    if (!rentalityInfo) {
      console.error("updateCarService error: rentalityInfo is null");
      return false;
    }

    try {
      let transaction = await rentalityInfo.rentalityContract.updateCarService(address);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("updateCarService error" + e);
      return false;
    }
  };

  const updateTripService = async (address: string) => {
    if (!rentalityInfo) {
      console.error("updateTripService error: rentalityInfo is null");
      return false;
    }

    try {
      let transaction = await rentalityInfo.rentalityContract.updateTripService(address);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("updateTripService error" + e);
      return false;
    }
  };

  const updateCurrencyConverterService = async (address: string) => {
    if (!rentalityInfo) {
      console.error("updateCurrencyConverterService error: rentalityInfo is null");
      return false;
    }

    try {
      let transaction = await rentalityInfo.rentalityContract.updateCurrencyConverterService(address);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("updateCurrencyConverterService error" + e);
      return false;
    }
  };

  useEffect(() => {
    if (dataUpdated) return;
    if (!rentalityInfo) return;

    getAdminContractInfo(rentalityInfo.rentalityContract, rentalityInfo.provider).then((data) => {
      if (data != null) {
        setAdminContractInfo(data);
        setDataUpdated(true);
      }
    });
  }, [dataUpdated, rentalityInfo]);

  return [
    adminContractInfo,
    withdrawFromPlatform,
    setPlatformFeeInPPM,
    updateUserService,
    updateCarService,
    updateTripService,
    updateCurrencyConverterService,
  ] as const;
};

export default useContractInfo;
