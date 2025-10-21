import { getEtherContractWithSigner, getEtherContractWithProvider } from "../abis";
import { createContext, useContext, useEffect, useState } from "react";
import { useEthereum } from "./web3/ethereumContext";
import { useRouter } from "next/router";
import {
  IRentalityReferralProgram,
  IRentalityReferralProgramContract,
} from "@/features/blockchain/models/IRentalityReferralProgram";
import {
  IRentalityAdminGateway,
  IRentalityAdminGatewayContract,
} from "@/features/blockchain/models/IRentalityAdminGateway";
import { IRentalityGateway, IRentalityGatewayContract } from "@/features/blockchain/models/IRentalityGateway";
import { getEthersContractProxy } from "@/features/blockchain/models/EthersContractProxy";
import { IRentalityInvestment, IRentalityInvestmentContract } from "@/features/blockchain/models/IRentalityInvestment";
import {
  IRentalityCurrencyConverter,
  IRentalityCurrencyConverterContract,
} from "@/features/blockchain/models/IRentalityCurrencyConverter";
import {
  IRentalityAiDamageAnalyze,
  IRentalityAiDamageAnalyzeContract,
} from "@/features/blockchain/models/IRentalityAiDamageAnalyze";
import { logger } from "@/utils/logger";
import { JsonRpcProvider } from "ethers";
import { IRentalitySenderContract, IRentalitySender } from "@/features/blockchain/models/IRentalitySender";
import getDefaultProvider from "@/utils/api/defaultProviderUrl";

export interface IRentalityContracts {
  gateway:  IRentalityGateway;
  referralProgram: IRentalityReferralProgram;
  investment: IRentalityInvestment;
  currencyConverter: IRentalityCurrencyConverter;
  aiDamageAnalyze: IRentalityAiDamageAnalyze;
}

interface RentalityContextType {
  rentalityContracts: IRentalityContracts | null | undefined;
}

interface RentalityAdminContextType {
  admin: IRentalityAdminGateway | null | undefined;
}

const RentalityContext = createContext<RentalityContextType | null>(null);
const RentalityAdminContext = createContext<RentalityAdminContextType | null>(null);

export const RentalityProvider = ({ children }: { children?: React.ReactNode }) => {
  const router = useRouter();
  const ethereumInfo = useEthereum();
  const [rentalityContracts, setRentalityContracts] = useState<IRentalityContracts | null | undefined>(undefined);
  const [rentalityAdmin, setRentalityAdmin] = useState<IRentalityAdminGateway | null | undefined>(undefined);

  const isAdmin = router.route.startsWith("/admin");

  const isDefaultNetwork = ethereumInfo?.chainId.toString() === process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!.toString();


  useEffect(() => {
    const getRentalityContacts = async () => {
      if (ethereumInfo === undefined) {
        setRentalityContracts(undefined);
        return;
      }
      if (ethereumInfo === null) {
        setRentalityContracts(null);
        return;
      }

      try {


    
 
          const defaultProvider = getDefaultProvider();
          
         let rentalityGatewayRead = (await getEtherContractWithProvider(
            "gateway",
            defaultProvider
          )) as unknown as IRentalityGatewayContract;

         let rentalityReferralProgramRead = (await getEtherContractWithProvider(
            "refferalPogram",
            defaultProvider
          )) as unknown as IRentalityReferralProgramContract;

         let investmentRead = (await getEtherContractWithProvider(
            "investService",
            defaultProvider
          )) as unknown as IRentalityInvestmentContract;

         let currencyConverterRead = (await getEtherContractWithProvider(
            "currencyConverter",
            defaultProvider
          )) as unknown as IRentalityCurrencyConverterContract;

         let rentalityAiDamageAnalyzeRead = (await getEtherContractWithProvider(
            "aiDamageAnalyze",
            defaultProvider
          )) as unknown as IRentalityAiDamageAnalyzeContract;

          let rentalityGatewayWrite;
        let rentalityReferralProgramWrite = rentalityReferralProgramRead;
        let investmentWrite = investmentRead;
        let currencyConverterWrite =currencyConverterRead;
        let rentalityAiDamageAnalyzeWrite = rentalityAiDamageAnalyzeRead;
        
         rentalityGatewayWrite = isDefaultNetwork ? (await getEtherContractWithSigner(
          "gateway",
          ethereumInfo.signer
        )) as unknown as IRentalityGatewayContract :
        (await getEtherContractWithSigner(
          "sender",
          ethereumInfo.signer
        )) as unknown as IRentalityGatewayContract;

        const senderAddress = await ethereumInfo.signer.getAddress();
        setRentalityContracts({
          gateway: getEthersContractProxy(rentalityGatewayWrite, rentalityGatewayRead,  senderAddress, isDefaultNetwork),
          referralProgram: getEthersContractProxy(rentalityReferralProgramWrite, rentalityReferralProgramRead, senderAddress, isDefaultNetwork),
          investment: getEthersContractProxy(investmentWrite, investmentRead, senderAddress, isDefaultNetwork),
          currencyConverter: getEthersContractProxy(currencyConverterWrite, currencyConverterRead, senderAddress, isDefaultNetwork),
          aiDamageAnalyze: getEthersContractProxy(rentalityAiDamageAnalyzeWrite, rentalityAiDamageAnalyzeRead, senderAddress, isDefaultNetwork),
        });

      } catch (error) {
        logger.error("getRentalityContact error:", error);
        setRentalityContracts(null);
      }
    };

    getRentalityContacts();
  }, [ethereumInfo, isDefaultNetwork]);

  useEffect(() => {
    const getRentalityAdminContacts = async () => {
      if (ethereumInfo === undefined) {
        setRentalityAdmin(undefined);
        return;
      }
      if (ethereumInfo === null) {
        setRentalityAdmin(null);
        return;
      }
      const isDefaultNetwork = ethereumInfo?.chainId.toString() === process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!.toString();

      if(!isDefaultNetwork) {
        setRentalityAdmin(null);
        return
      }
      const rentalityAdmin = (await getEtherContractWithSigner(
        "admin",
        ethereumInfo.signer
      )) as unknown as IRentalityAdminGatewayContract;
      if (!rentalityAdmin) {
        logger.error("getRentalityContact error: rentalityAdmin is null");
        setRentalityAdmin(null);
        return;
      }

      setRentalityAdmin(getEthersContractProxy(rentalityAdmin, rentalityAdmin,  await ethereumInfo.signer.getAddress(), true));
    };

    getRentalityAdminContacts();
  }, [ethereumInfo]);

  return (
    <RentalityContext.Provider value={{ rentalityContracts }}>
      {isAdmin ? (
        <RentalityAdminContext.Provider value={{ admin: rentalityAdmin }}>{children}</RentalityAdminContext.Provider>
      ) : (
        <>{children}</>
      )}
    </RentalityContext.Provider>
  );
};

export function useRentality() {
  const context = useContext(RentalityContext);
  if (!context) {
    throw new Error("useRentality must be used within a RentalityProvider");
  }
  return context;
}

export function useRentalityAdmin() {
  const context = useContext(RentalityAdminContext);
  if (!context) {
    throw new Error("useRentalityAdmin must be used within a RentalityAdminProvider");
  }
  return context;
}

