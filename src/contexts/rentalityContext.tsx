import { getEtherContractWithSigner } from "../abis";
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
import { IRentalityGatewayContract } from "@/features/blockchain/models/IRentalityGatewayContract";
import { getEthersContractProxy } from "@/features/blockchain/models/EthersContractProxy";

export interface IRentalityContracts {
  gateway: IRentalityGatewayContract;
  referralProgram: IRentalityReferralProgram;
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

      const rentalityGateway = (await getEtherContractWithSigner(
        "gateway",
        ethereumInfo.signer
      )) as unknown as IRentalityGatewayContract;
      if (!rentalityGateway) {
        console.error("getRentalityContact error: rentalityGateway is null");
        setRentalityContracts(null);
        return;
      }

      const rentalityReferralPogram = (await getEtherContractWithSigner(
        "referralProgram",
        ethereumInfo.signer
      )) as unknown as IRentalityReferralProgramContract;
      if (!rentalityReferralPogram) {
        console.error("getRentalityContact error: rentalityReferralProgram is null");
        setRentalityContracts(null);
        return;
      }

      setRentalityContracts({
        gateway: rentalityGateway,
        referralProgram: getEthersContractProxy(rentalityReferralPogram),
      });
    };

    getRentalityContacts();
  }, [ethereumInfo]);

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

      const rentalityAdmin = (await getEtherContractWithSigner(
        "admin",
        ethereumInfo.signer
      )) as unknown as IRentalityAdminGatewayContract;
      if (!rentalityAdmin) {
        console.error("getRentalityContact error: rentalityAdmin is null");
        setRentalityAdmin(null);
        return;
      }

      setRentalityAdmin(getEthersContractProxy(rentalityAdmin));
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
