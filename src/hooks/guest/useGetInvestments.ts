import {useRentality} from "@/contexts/rentalityContext";
import {useState, useEffect} from "react";
import {TripInfo} from "@/model/TripInfo";
import {InvestmentInfo} from "@/model/Investment";
import {CarInvestment, InvestmentDTO, InvestmentWithMetadata} from "@/model/blockchain/schemas";
import {useEthereum} from "@/contexts/web3/ethereumContext";
import rentalityContracts, {getEtherContractWithSigner} from "@/abis";
import {IRentalityInvestment} from "@/model/blockchain/IRentalityContract";
import {getMetaDataFromIpfs, parseMetaData} from "@/utils/ipfsUtils";

const useGetInvestments = () => {
    const rentalityContract = useRentality();
    const ethereumInfo = useEthereum();
    const [investments, setInvestments] = useState<InvestmentWithMetadata[]>([])
    const [isLoading, setIsLoading] = useState<Boolean>(true);

    const getInvestment = async (contract: IRentalityInvestment) => {

        let investmentInfos: InvestmentDTO[] = await contract.getAllInvestments()
        return investmentInfos
    }


    useEffect(() => {
        let initialize = async () => {
            if (!ethereumInfo) return;
            let contract =
                (await getEtherContractWithSigner(
                    "investService",
                    ethereumInfo.signer)) as unknown as IRentalityInvestment;
            let investmentInfo = await contract.getAllInvestments()
            const result = await Promise.all(
                investmentInfo.map(async (value) => {
                    const metadata = parseMetaData(await getMetaDataFromIpfs(value.investment.car.tokenUri));
                    return {
                        investment: value,
                        metadata
                    };
                }))
            setInvestments(result)
        }
        initialize()
    }, [rentalityContract]);

    return {isLoading, investments} as const;

}
export default useGetInvestments;