import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { getEtherContractWithSigner } from "../abis";
import { createContext, useContext, useEffect, useState } from "react";
import { useEthereum } from "./web3/ethereumContext";

const RentalityContext = createContext<IRentalityContract | null>(null);

export function useRentality() {
  return useContext(RentalityContext);
}

export const RentalityProvider = ({ children }: { children?: React.ReactNode }) => {
  const [rentalityContract, setRentalityContract] = useState<IRentalityContract | null>(null);
  const ethereumInfo = useEthereum();

  useEffect(() => {
    const getRentalityContact = async () => {
      if (!ethereumInfo || !ethereumInfo.provider) return;

      const rentality = (await getEtherContractWithSigner(
        "gateway",
        ethereumInfo.signer
      )) as unknown as IRentalityContract;

      if (!rentality) {
        console.error("getRentalityContact error: rentalityContract is null");
        return;
      }

      setRentalityContract(rentality);
    };

    if (!ethereumInfo || !ethereumInfo.provider) return;

    getRentalityContact();
  }, [ethereumInfo]);

  return <RentalityContext.Provider value={rentalityContract}>{children}</RentalityContext.Provider>;
};
