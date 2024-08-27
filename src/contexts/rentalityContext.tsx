import { IRentalityContract, IRentalitySender } from "@/model/blockchain/IRentalityContract";
import { getEtherContractWithProvider, getEtherContractWithSigner } from "../abis";
import { createContext, useContext, useEffect, useState } from "react";
import { useEthereum } from "./web3/ethereumContext";
import RentalityViewContract, { IRentalityViewContract } from "@/model/blockchain/IRentalityViewGateway";
import { JsonRpcProvider } from "ethers";
import RentalityL0Contract from "@/model/blockchain/IRentalityViewGateway";

const RentalityContext = createContext<RentalityL0Contract | null>(null);

const RentalityViewContext = createContext<IRentalityViewContract | null>(null);

export function useRentality() {
  return useContext(RentalityContext);
}

export function useVeiwRentality() {
  return useContext(RentalityViewContext);
}

export const RentalityProvider = ({ children }: { children?: React.ReactNode }) => {
  const [rentalityContract, setRentalityContract] = useState<RentalityL0Contract | null>(null);
  const ethereumInfo = useEthereum();

  useEffect(() => {
    const getRentalityContact = async () => {
      if (!ethereumInfo || !ethereumInfo.provider) return;
      let rentality: IRentalityContract;
      const defaultChainId2 = Number.parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID_OPBNB!);
      if (ethereumInfo.chainId == ethereumInfo.defaultChainId || ethereumInfo.chainId === defaultChainId2)
        rentality = (await getEtherContractWithSigner("gateway", ethereumInfo.signer)) as unknown as IRentalityContract;
      else
        rentality = (await getEtherContractWithSigner("sender", ethereumInfo.signer)) as unknown as IRentalityContract;

      if (!rentality) {
        console.error("getRentalityContact error: rentalityContract is null");
        return;
      }

      const viewRentality = (await getEtherContractWithProvider(
        "gateway",
        new JsonRpcProvider(
          ethereumInfo.chainId === defaultChainId2 || ethereumInfo.chainId === 11155111
            ? process.env.NEXT_PUBLIC_DEFAULT_NETWOR_URL2!
            : process.env.NEXT_PUBLIC_DEFAULT_NETWOR_URL!
        ),
        ethereumInfo.chainId === defaultChainId2 || ethereumInfo.chainId === 11155111 ? 5611 : 84532
      ))!;
      const viewRentalityContract = new RentalityViewContract(
        viewRentality,
        await ethereumInfo.signer.getAddress(),
        rentality,
        ethereumInfo.chainId == ethereumInfo.defaultChainId || ethereumInfo.chainId === defaultChainId2,
        await viewRentality.getAddress(),
        ethereumInfo
      );
      setRentalityContract(viewRentalityContract);
    };

    getRentalityContact();
  }, [ethereumInfo]);

  return <RentalityContext.Provider value={rentalityContract}>{children}</RentalityContext.Provider>;
};
