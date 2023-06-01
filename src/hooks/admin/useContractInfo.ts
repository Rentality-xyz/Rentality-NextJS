import { Contract, BrowserProvider, formatEther } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../../abis";
import { RentalityContract } from "@/model/blockchain/RentalityContract";
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

  const [adminContractInfo, setAdminContractInfo] = useState<AdminContractInfo>(
    emptyAdminContractInfo
  );

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      return {
        contract: new Contract(
          rentalityJSON.address,
          rentalityJSON.abi,
          signer
        ),
        provider,
      };
    } catch (e) {
      console.error("getRentalityContract error:" + e);
      return { contract: null, provider: null };
    }
  };

  const getAdminContractInfo = async (
    contract: Contract,
    provider: BrowserProvider
  ) => {
    const contractAddress = await contract.getAddress();
    const rentalityContract = contract as unknown as RentalityContract;
    const ownerAddress = await rentalityContract.owner();
    const balance = (await provider.getBalance(contractAddress)) ?? 0;
    const rentalityCommission = 30; //(await rentalityContract.getPlatformFeeInPPM())/1000.0 ?? 0;
    const currencyConverterContractAddress = "0x"; //await rentalityContract.getCurrencyConverterServiceAddress();
    const userServiceContractAddress = "0x"; //await rentalityContract.getUserServiceAddress();
    const tripServiceContractAddress = "0x"; //await rentalityContract.getTripServiceAddress();
    const carServiceContractAddress = "0x"; //await rentalityContract.getCarServiceAddress();

    const result: AdminContractInfo = {
      contractAddress: contractAddress,
      contractOwnerAddress: ownerAddress,
      contractBalance: balance,
      contractBalanceString: formatEther(balance),
      rentalityCommission: rentalityCommission,
      currencyConverterContractAddress: currencyConverterContractAddress,
      userServiceContractAddress: userServiceContractAddress,
      tripServiceContractAddress: tripServiceContractAddress,
      carServiceContractAddress: carServiceContractAddress,
    };
    return result;
  };

  const withdrawFromPlatform = async (value: bigint) => {};

  const setPlatformFeeInPPM = async (value: number) => {};

  const updateUserService = async (address: string) => {};

  const updateCarService = async (address: string) => {};

  const updateTripService = async (address: string) => {};

  const updateCurrencyConverterService = async (address: string) => {};

  useEffect(() => {
    getRentalityContract()
      .then(({ contract, provider }) => {
        if (contract != undefined) {
          return getAdminContractInfo(contract, provider);
        }
      })
      .then((data) => {
        if (data != null) setAdminContractInfo(data);
      });
  }, []);

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
