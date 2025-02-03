import { CarMetadata } from "@/utils/ipfsUtils";
import { EngineType, InvestmentDTO, InvestmentWithMetadata } from "./blockchain/schemas";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";

export type ContractCreateCarRequest = {
    tokenUri: string;
    carVinNumber: string;
    brand: string;
    model: string;
    yearOfProduction: number;
    pricePerDayInUsdCents: number;
    securityDepositPerTripInUsdCents: number;
    engineParams: number[];
    engineType: EngineType;
    milesIncludedPerDay: number;
    timeBufferBetweenTripsInSec: number;
    geoApiKey: string;
    locationInfo: ContractSignedLocationInfo;
    currentlyListed: boolean;
    insuranceRequired: boolean;
    insurancePriceInUsdCents: number;
    dimoTokenId: number;
  };
  
  export type ContractLocationInfo = {
    userAddress: string;
    country: string;
    state: string;
    city: string;
    latitude: string;
    longitude: string;
    timeZoneId: string;
  };
  
  export type ContractSignedLocationInfo = {
    locationInfo: ContractLocationInfo;
    signature: string;
  };
  
  export type CarInvestment = {
    car: ContractCreateCarRequest;
    priceInUsd: number;
    creatorPercents: number;
    inProgress: boolean;
  };
  
  export type Investment = {
    investment: CarInvestment;
    nftUrl: string;
    investmentId: number;
    payedInUsd: number;
    creator: string;
    isCarBought: boolean;
    income: number;
    myIncome: number;
    myInvestingSum: number;
    listingDate: Date;
    myTokens: number;
    myPart: number;
    totalHolders: number;
    totalTokens: number;
    listed: boolean;
  };
  
  export type MappedInvestmentInfo = {
    investment: Investment;
    metadata: CarMetadata;
  };
  
  export const mapInvestmentDTO = (investmentDto: InvestmentWithMetadata, chainId: number): MappedInvestmentInfo => {
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