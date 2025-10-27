import { ContractInvestmentDTO } from "@/model/blockchain/schemas";
import { InvestmentInfoWithMetadata } from "@/features/invest/models/investmentInfo";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { CarMetadata } from "@/features/filestore/utils";

export const mapContractInvestmentDTOToInvestmentInfoWithMetadata = (
  investmentDto: ContractInvestmentDTO,
  metaData: CarMetadata,
  chainId: number
): InvestmentInfoWithMetadata => {
  const dto = investmentDto;
  return {
    investment: {
      investment: {
        car: {
          tokenUri: dto.investment.car.tokenUri,
          carVinNumber: dto.investment.car.carVinNumber,
          brand: dto.investment.car.brand,
          model: dto.investment.car.model,
          yearOfProduction: Number(dto.investment.car.yearOfProduction),
          pricePerDayInUsdCents: Number(dto.investment.car.pricePerDayInUsdCents) / 100,
          securityDepositPerTripInUsdCents: Number(dto.investment.car.securityDepositPerTripInUsdCents) / 100,
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
          insurancePriceInUsdCents: Number(dto.investment.car.insurancePriceInUsdCents) / 100,
          dimoTokenId: Number(dto.investment.car.dimoTokenId),
        },
        priceInCurrency: Number(dto.investment.priceInCurrency) / 1e18,
        creatorPercents: Number(dto.investment.creatorPercents),
        inProgress: dto.investment.inProgress,
      },
      nftUrl: getExplorerUrlFromChainId(dto.nft, chainId),
      investmentId: Number(dto.investmentId),
      payedInUsd: Number(dto.payedInUsd) / 100,
      creator: dto.creator,
      isCarBought: dto.isCarBought,
      income: Number(dto.income) / 1e18,
      myIncome: Number(dto.myIncome) / 1e18,
      myInvestingSum: Number(dto.myInvestingSum),
      listingDate:
        dto.listingDate !== BigInt(0)
          ? getDateFromBlockchainTimeWithTZ(
              Number(dto.listingDate),
              dto.investment.car.locationInfo.locationInfo.timeZoneId
            )
          : undefined,
      myTokens: Number(dto.myTokens),
      myPart: dto.myPart > 100 ? 100 : Number(dto.myPart),
      hostPart: Number(dto.investment.creatorPercents),
      totalHolders: Number(dto.totalHolders),
      totalTokens: Number(dto.totalTokens),
      listed: dto.listed,
      collectionName: dto.name,
      collectionSymbol: dto.symbol,
      totalEarnings: Number(dto.totalEarnings) / 1e18,
      totalEarningsByUser: Number(dto.userReceivedEarnings) / 1e18,
      payedInCurrency: Number(dto.payedInCurrency) / 1e18,
      priceInUsdCents: Number(dto.priceInUsdCents),
    },
    metadata: metaData,
  };
};

function getExplorerUrlFromChainId(address: string, chainId: number) {
  switch (chainId) {
    case 5611:
      return "https://testnet.opbnbscan.com/address/" + address;
    case 8453:
      return "https://basescan.org/address/" + address;
    default:
      return "https://sepolia.basescan.org/address/" + address;
  }
}
