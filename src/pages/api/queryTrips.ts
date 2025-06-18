import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { logger } from '@/utils/logger';
import { isEmpty } from '@/utils/string';
import { env } from 'process';

function createQuery(asHost: boolean, userId: string) {
  const filterField = asHost ? 'host_' : 'guest_';
  const query = gql`
    query GetTrips($userId: ID!) {
      tripEntities(where: { ${filterField}: { id: $userId } }) {
        id
        carId
        car {
          car {
            model
            brand
            yearOfProduction
            tokenURI
            dimoTokenId
            locationInfo { timeZoneId }
          }
        }
        status
        startDateTime
        host {
          id
          name
          profilePhoto
          licenseNumber
          expirationDate
          mobilePhoneNumber
        }
        guest {
          id
          name
          profilePhoto
          licenseNumber
          expirationDate
          mobilePhoneNumber
        }
        pricePerDayInUsdCents
        paidForInsuranceInUsdCents
        endDateTime
        engineType
        milesIncludedPerDay
        fuelPrice
        promoDiscount
        paymentInfo {
          from
          to
          totalDayPriceInUsdCents
          salesTax
          governmentTax
          priceWithDiscount
          depositInUsdCents
          resolveAmountInUsdCents
          currencyType
          currencyRate
          currencyDecimals
          resolveFuelAmountInUsdCents
          resolveMilesAmountInUsdCents
          pickUpFee
          dropOfFee
        }
        createdDateTime
        approvedDateTime
        rejectedDateTime
        guestInsuranceCompanyName
        guestInsurancePolicyNumber
        rejectedBy
        checkedInByHostDateTime
        startParamLevels
        checkedInByGuestDateTime
        tripStartedBy
        checkedOutByGuestDateTime
        tripFinishedBy
        endParamLevels
        checkedOutByHostDateTime
        transactionInfo {
          rentalityFee
          depositRefund
          tripEarnings
          dateTime
          statusBeforeCancellation
        }
        finishDateTime
        pickUpHash
        returnHash
        pickUpLocation {
          latitude
          longitude
          city
          state
          country
          timeZoneId
        }
        dropOfLocation {
          latitude
          longitude
          city
          state
          country
          timeZoneId
        }
        insuranceInfo {
          comment
          companyName
          createdBy
          policyNumber
        }
        guestDrivingLicenseIssueCountry
        taxesData {
          id
          tType
          name
          value
        }
      }
    }
  `;
  const variables = { userId };
  return { query, variables };
}

export async function getQueryTrips(asHost: boolean, user: string): Promise<GetTripsResponse | null> {
const baseUrl = env.INDEXER_API_URL;
  if (isEmpty(baseUrl)) {
    logger.error('Create graph url: Failed to get indexer URL');
    return null;
  }

  const { query, variables } = createQuery(asHost, user.toLocaleLowerCase());
  const client = new ApolloClient({
    uri: baseUrl,
    cache: new InMemoryCache(),
  });

  try {
    const response = await client.query<{ tripEntities: TripEntity[] }>({
      query,
      variables,
    });
    return response.data;
  } catch (error) {
    logger.error('Error fetching trips', error);
    return null;
  }
}

export interface GetTripsResponse {
  tripEntities: TripEntity[];
}

export interface TripEntity {
  id: string;
  carId: string;
  car: { car: CarDetail };
  status: string;
  startDateTime: number;
  endDateTime: number;
  host: HostGuest;
  guest: HostGuest;
  pricePerDayInUsdCents: number;
  paidForInsuranceInUsdCents: number;
  engineType: string;
  milesIncludedPerDay: number;
  fuelPrice: number;
  promoDiscount: number;
  paymentInfo: PaymentInfo;
  createdDateTime: number;
  approvedDateTime : number;
  rejectedDateTime : number;
  guestInsuranceCompanyName : string;
  guestInsurancePolicyNumber : string;
  rejectedBy: string;
  checkedInByHostDateTime : number;
  startParamLevels: string[];
  checkedInByGuestDateTime : number;
  tripStartedBy: string;
  checkedOutByGuestDateTime : number;
  tripFinishedBy: string;
  endParamLevels: string[];
  checkedOutByHostDateTime : number;
  transactionInfo: TransactionInfo;
  finishDateTime : number;
  pickUpHash : string;
  returnHash : string;
  pickUpLocation : Location;
  dropOfLocation : Location;
  insuranceInfo : InsuranceInfo;
  guestDrivingLicenseIssueCountry : string;
  taxesData : TaxData[];
}

export interface CarDetail {
  model: string;
  brand: string;
  yearOfProduction: number;
  tokenURI : string;
  dimoTokenId : string;
  locationInfo: { timeZoneId: string };
}

export interface HostGuest {
  id: string;
  name: string;
  profilePhoto : string;
  licenseNumber : string;
  expirationDate : string;
  mobilePhoneNumber : string;
  userCurrency: {
    currency: string,
    name: string,
    initialized: boolean
  }
}

export interface PaymentInfo {
  from: number;
  to: number;
  totalDayPriceInUsdCents: number;
  salesTax: number;
  governmentTax: number;
  priceWithDiscount: number;
  depositInUsdCents: number;
  resolveAmountInUsdCents: number;
  currencyType: {
    currency: string,
    name: string,
    initialized: boolean
  };
  currencyRate: number;
  currencyDecimals: number;
  resolveFuelAmountInUsdCents: number;
  resolveMilesAmountInUsdCents: number;
  pickUpFee: number;
  dropOfFee: number;
}

export interface TransactionInfo {
  rentalityFee: number;
  depositRefund: number;
  tripEarnings: number;
  dateTime: number;
  statusBeforeCancellation: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  timeZoneId: string;
}

export interface InsuranceInfo {
  comment : string;
  companyName : string;
  createdBy : string;
  policyNumber : string;
}

export interface TaxData {
  id: string;
  tType: string;
  name: string;
  value: number;
}
