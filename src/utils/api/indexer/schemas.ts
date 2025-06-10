export interface QueryDeliveryPrice {
    underTwentyFiveMilesInUsdCents: string;
    aboveTwentyFiveMilesInUsdCents: string;
  }
  
 export interface QueryUserCurrency {
    currency: string;
    name: string;
    initialized: boolean;
  }
  
  export interface QueryUserInfo {
    name: string;
    profilePhoto: string;
    deliveryPrice: QueryDeliveryPrice;
    userCurrency: QueryUserCurrency;
    discountPrice: QueryDiscountPrice
  }
  
  export interface QueryTaxData {
    value: string;
    tType: string;
  }
  
  export interface QueryTaxes {
    taxesData: QueryTaxData[];
  }
  
  export interface QueryDiscountPrice{
    sevenDaysDiscount: number,
    thirtyDaysDiscount: number,
    threeDaysDiscount: number
  }
  
 export interface QueryLocationInfo {
    city: string;
    country: string;
    state: string;
    latitude: string;
    longitude: string;
    timeZoneId: string;
  }
  
  interface QueryTrip {
    id: string;
    __typename?: string;
  }
  
  export interface QueryTrips {
    trips: QueryTrip[];
  }
  
  export interface QueryCarInfo {
    carId: string;
    host: string;
    brand: string;
    model: string;
    yearOfProduction: number;
    pricePerDayInUsdCents: string;
    securityDepositPerTripInUsdCents: string;
    engineType: string;
    milesIncludedPerDay: string;
    tokenURI: string;
    insuranceIncluded: boolean;
    insuranceCarInfo: QueryinsuranceCarInfo,
    user: {
      user: QueryUserInfo;
    };
    taxes: QueryTaxes;
    locationInfo: QueryLocationInfo;
    trips: QueryTrips[];
    dimoTokenId: string;
  }
  
  export interface GetCarInfosResponse {
    carInfos: QueryCarInfo[];
  }

  export interface QueryinsuranceCarInfo {
    required: boolean,
    priceInUsdCents: string,

  }