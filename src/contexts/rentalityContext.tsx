import { getEtherContractWithSigner, getEtherContractWithProvider } from "../abis";
import { createContext, useContext, useEffect, useState } from "react";
import { useEthereum } from "./web3/ethereumContext";
import { useRouter } from "next/router";
import {
  IRentalityAdminGateway,
  IRentalityAdminGatewayContract,
} from "@/features/blockchain/models/IRentalityAdminGateway";
import { IRentalityGateway, IRentalityGatewayContract } from "@/features/blockchain/models/IRentalityGateway";
import { getEthersContractProxy, getEtherscrossChainProxy } from "@/features/blockchain/models/EthersContractProxy";
import {
  IRentalityCurrencyConverter,
  IRentalityCurrencyConverterContract,
} from "@/features/blockchain/models/IRentalityCurrencyConverter";
import {
  IRentalityAiDamageAnalyze,
  IRentalityAiDamageAnalyzeContract,
} from "@/features/blockchain/models/IRentalityAiDamageAnalyze";
import { logger } from "@/utils/logger";
import getDefaultProvider from "@/utils/api/defaultProviderUrl";

export interface IRentalityContracts {
  gateway: IRentalityGateway;
  currencyConverter: IRentalityCurrencyConverter;
  aiDamageAnalyze: IRentalityAiDamageAnalyze;
}

interface RentalityContextType {
  rentalityContracts: IRentalityContracts | null | undefined;
  isDefaultNetwork: boolean;
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

      if (!ethereumInfo?.chainId || !ethereumInfo?.signer) {
        setRentalityContracts(undefined);
        return;
      }

      try {
        const defaultProvider = await getDefaultProvider();

        // --------------------------
        // READ CONTRACTS (ALWAYS via provider)
        // --------------------------

        const gatewayRead = (await getEtherContractWithProvider(
          "gateway",
          defaultProvider
        )) as unknown as IRentalityGatewayContract;

        const currencyConverterRead = (await getEtherContractWithProvider(
          "currencyConverter",
          defaultProvider
        )) as unknown as IRentalityCurrencyConverterContract;

        const aiDamageAnalyzeRead = (await getEtherContractWithProvider(
          "aiDamageAnalyze",
          defaultProvider
        )) as unknown as IRentalityAiDamageAnalyzeContract;

        // --------------------------
        // WRITE CONTRACT (via signer)
        // --------------------------

        const gatewayWrite = (await getEtherContractWithSigner(
          isDefaultNetwork ? "gateway" : "sender",
          ethereumInfo.signer
        )) as unknown as IRentalityGatewayContract;

        if (!gatewayWrite) {
          logger.error("gatewayWrite is undefined");
          setRentalityContracts(undefined);
          return;
        }

        const senderAddress = await ethereumInfo.signer.getAddress();

        setRentalityContracts({
          gateway: getEtherscrossChainProxy(
            gatewayWrite,
            gatewayRead,
            senderAddress,
            isDefaultNetwork,
            defaultProvider
          ),

          currencyConverter: getEthersContractProxy(currencyConverterRead),

          aiDamageAnalyze: getEthersContractProxy(aiDamageAnalyzeRead),
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
      const isDefaultNetwork =
        ethereumInfo?.chainId.toString() === process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!.toString();

      if (!isDefaultNetwork) {
        setRentalityAdmin(null);
        return;
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

      setRentalityAdmin(getEthersContractProxy(rentalityAdmin));
    };

    getRentalityAdminContacts();
  }, [ethereumInfo]);

  return (
    <RentalityContext.Provider value={{ rentalityContracts, isDefaultNetwork }}>
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
