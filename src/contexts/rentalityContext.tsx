import {
  IRentalityAdminGateway,
  IRentalityContract,
  IRentalityCurrencyConverterContract,
  IRentalityInvestment,
  IRentalityReferralProgramContract,
} from "@/model/blockchain/IRentalityContract";
import { getEtherContractWithSigner } from "../abis";
import { createContext, useContext, useEffect, useState } from "react";
import { useEthereum } from "./web3/ethereumContext";
import { useRouter } from "next/router";

interface IRentalityContracts {
  gateway: IRentalityContract;
  referralProgram: IRentalityReferralProgramContract;
  investment: IRentalityInvestment;
  currencyConverter: IRentalityCurrencyConverterContract;
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
      )) as unknown as IRentalityContract;
      if (!rentalityGateway) {
        console.error("getRentalityContact error: rentalityGateway is null");
        setRentalityContracts(null);
        return;
      }

      const rentalityRefferalPogram = (await getEtherContractWithSigner(
        "refferalPogram",
        ethereumInfo.signer
      )) as unknown as IRentalityReferralProgramContract;
      if (!rentalityRefferalPogram) {
        console.error("getRentalityContact error: rentalityRefferalPogram is null");
        setRentalityContracts(null);
        return;
      }

      const rentalityInvestment = (await getEtherContractWithSigner(
        "investService",
        ethereumInfo.signer
      )) as unknown as IRentalityInvestment;
      if (!rentalityRefferalPogram) {
        console.error("getRentalityContact error: rentalityRefferalPogram is null");
        setRentalityContracts(null);
        return;
      }

      let currencyConverter = (await getEtherContractWithSigner(
        "currencyConverter",
        ethereumInfo.signer
      )) as unknown as IRentalityCurrencyConverterContract;

      setRentalityContracts({
        gateway: rentalityGateway,
        referralProgram: rentalityRefferalPogram,
        investment: rentalityInvestment,
        currencyConverter
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
      )) as unknown as IRentalityAdminGateway;
      if (!rentalityAdmin) {
        console.error("getRentalityContact error: rentalityAdmin is null");
        setRentalityAdmin(null);
        return;
      }

      setRentalityAdmin(rentalityAdmin);
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
