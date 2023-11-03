import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractCarInfo } from "@/model/blockchain/ContractCarInfo";

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

const useContractInfo = () => {
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

  const [adminContractInfo, setAdminContractInfo] = useState<AdminContractInfo>(emptyAdminContractInfo);
  const [dataUpdated, setDataUpdated] = useState(false);

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = await provider.getSigner();
      return {
        contract: new Contract(rentalityJSON.address, rentalityJSON.abi, signer) as unknown as IRentalityContract,
        provider,
      };
    } catch (e) {
      console.error("getRentalityContract error:" + e);
      return { contract: null, provider: null };
    }
  };

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
    try {
      const { contract, provider } = await getRentalityContract();
      const rentalityContract = contract as unknown as IRentalityContract;

      if (!rentalityContract) {
        console.error("setPlatformFeeInPPM error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.withdrawFromPlatform(value);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("withdrawFromPlatform error" + e);
      return false;
    }
  };

  const setPlatformFeeInPPM = async (value: bigint) => {
    try {
      const { contract, provider } = await getRentalityContract();
      const rentalityContract = contract as unknown as IRentalityContract;

      if (!rentalityContract) {
        console.error("setPlatformFeeInPPM error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.setPlatformFeeInPPM(value);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("setPlatformFeeInPPM error" + e);
      return false;
    }
  };

  const updateUserService = async (address: string) => {
    try {
      const { contract, provider } = await getRentalityContract();
      const rentalityContract = contract as unknown as IRentalityContract;

      if (!rentalityContract) {
        console.error("updateUserService error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.updateUserService(address);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("updateUserService error" + e);
      return false;
    }
  };

  const updateCarService = async (address: string) => {
    try {
      const { contract, provider } = await getRentalityContract();
      const rentalityContract = contract as unknown as IRentalityContract;

      if (!rentalityContract) {
        console.error("updateCarService error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.updateCarService(address);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("updateCarService error" + e);
      return false;
    }
  };

  const updateTripService = async (address: string) => {
    try {
      const { contract, provider } = await getRentalityContract();
      const rentalityContract = contract as unknown as IRentalityContract;

      if (!rentalityContract) {
        console.error("updateTripService error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.updateTripService(address);
      const result = await transaction.wait();
      setDataUpdated(false);
      return true;
    } catch (e) {
      console.error("updateTripService error" + e);
      return false;
    }
  };

  const updateCurrencyConverterService = async (address: string) => {
    try {
      const { contract, provider } = await getRentalityContract();
      const rentalityContract = contract as unknown as IRentalityContract;

      if (!rentalityContract) {
        console.error("updateCurrencyConverterService error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.updateCurrencyConverterService(address);
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

    getRentalityContract()
      .then(({ contract, provider }) => {
        if (contract != undefined) {
          return getAdminContractInfo(contract, provider);
        }
      })
      .then((data) => {
        if (data != null) {
          setAdminContractInfo(data);
          setDataUpdated(true);
        }
      });
  }, [dataUpdated]);

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
