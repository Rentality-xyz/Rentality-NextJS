import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { InvestmentDTOWithMetadata } from "../blockchain/schemas";
import { InvestmentInfoWithMetadata } from "../InvestmentInfo";

export const mapContractInvestmentDTOToInvestmentInfoWithMetadata = (investmentDto: InvestmentDTOWithMetadata, chainId: number): InvestmentInfoWithMetadata => {
    const dto = investmentDto.investment;
    return {
      investment: {
        investment: {
          car: {
            tokenUri: dto.investment.car.tokenUri,
            carVinNumber: dto.investment.car.carVinNumber,
            brand: dto.investment.car.brand,
            model: dto.investment.car.model,
            yearOfProduction: Number(dto.investment.car.yearOfProduction),
            pricePerDayInUsdCents: Number(dto.investment.car.pricePerDayInUsdCents),
            securityDepositPerTripInUsdCents: Number(dto.investment.car.securityDepositPerTripInUsdCents),
            engineParams: dto.investment.car.engineParams.map(Number),
            engineType: dto.investment.car.engineType,
            milesIncludedPerDay: Number(dto.investment.car.milesIncludedPerDay),
            timeBufferBetweenTripsInSec: Number(dto.investment.car.timeBufferBetweenTripsInSec),
            geoApiKey: dto.investment.car.geoApiKey,
            locationInfo: {
              locationInfo: {
                userAddress: dto.investment.car.locationInfo.locationInfo.userAddress,
                country: dto.investment.car.locationInfo.locationInfo.country,
                state: dto.investment.car.locationInfo.locationInfo.state,
                city: dto.investment.car.locationInfo.locationInfo.city,
                latitude: dto.investment.car.locationInfo.locationInfo.latitude,
                longitude: dto.investment.car.locationInfo.locationInfo.longitude,
                timeZoneId: dto.investment.car.locationInfo.locationInfo.timeZoneId,
              },
              signature: dto.investment.car.locationInfo.signature,
            },
            currentlyListed: dto.investment.car.currentlyListed,
            insuranceRequired: dto.investment.car.insuranceRequired,
            insurancePriceInUsdCents: Number(dto.investment.car.insurancePriceInUsdCents),
            dimoTokenId: Number(dto.investment.car.dimoTokenId),
          },
          priceInUsd: Number(dto.investment.priceInUsd),
          creatorPercents: Number(dto.investment.creatorPercents),
          inProgress: dto.investment.inProgress,
        },
        nftUrl: getExplorerUrlFromChainId(dto.nft, chainId),
        investmentId: Number(dto.investmentId),
        payedInUsd: Number(dto.payedInUsd),
        creator: dto.creator,
        isCarBought: dto.isCarBought,
        income: Number(dto.income),
        myIncome: Number(dto.myIncome),
        myInvestingSum: Number(dto.myInvestingSum),
        listingDate: getDateFromBlockchainTimeWithTZ(Number(dto.listingDate), dto.investment.car.locationInfo.locationInfo.timeZoneId),
        myTokens: Number(dto.myTokens),
        myPart: Number(dto.myPart),
        totalHolders: Number(dto.totalHolders),
        totalTokens: Number(dto.totalTokens),
        listed: Number(dto.listingDate) !== 0
      },
      metadata: investmentDto.metadata,
    };
  };

  function getExplorerUrlFromChainId(address: string, chainId: number) {
    switch (chainId) {
        case 5611: 
         return 'https://testnet.opbnbscan.com/address/' + address
        case 8453: 
         return 'https://basescan.org/address/' + address
        default: 
        return 'https://sepolia.basescan.org/address/' + address
    }
  }