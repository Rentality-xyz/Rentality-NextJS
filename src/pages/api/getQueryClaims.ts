import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { logger } from '@/utils/logger';
import { isEmpty } from '@/utils/string';
import { env } from 'process';

function createClaimInfosQuery(
  isHost: boolean,
  userId: string
) {
  const filterField = isHost ? 'host_' : 'guest_';

  const query = gql`
    query GetClaimInfos(
      $userId: ID!
    ) {
      claimInfos(
        where: { id: "2", ${filterField}: { id: $userId } }
      ) {
        id
        trip {
          id
          paymentInfo {
            currencyType {
              name
              currency
              initialized
            }
          }
        }
        deadlineDateInSec
        claimTypeV2 {
          claimType
          creator
          claimName
        }
        car {
          car {
            id
            model
            brand
            yearOfProduction
            tokenURI
            locationInfo {
              timeZoneId
            }
          }
        }
        status
        description
        amountInUsdCents
        payDateInSec
        rejectedBy { id }
        rejectedDateInSec
        photosUrl
        isHostClaims
        host {
          name
          profilePhoto
          mobilePhoneNumber
        }
        guest {
          name
          profilePhoto
          mobilePhoneNumber
        }
        amountInEth
      }
    }
  `;

  return {
    query,
    variables: {
      userId: userId.toLowerCase(),
    },
  };
}

export async function queryClaimInfos(
  isHost: boolean,
  user: string,
): Promise<GetClaimInfosResponse | null> {
  const baseUrl = env.INDEXER_API_URL;
  if (isEmpty(baseUrl)) {
    logger.error('Create graph url: Failed to get indexer URL');
    return null;
  }

  const { query, variables } = createClaimInfosQuery(isHost, user);
  const client = new ApolloClient({
    uri: baseUrl,
    cache: new InMemoryCache(),
  });

  try {
    const { data } = await client.query<{ claimInfos: GetClaimInfosResponse }>({
      query,
      variables,
    });
    return data.claimInfos;
  } catch (error) {
    logger.error('Error fetching claimInfos', error);
    return null;
  }
}


interface CurrencyType {
    name: string;
    currency: string;
    initialized: boolean;
  }
  
interface PaymentInfo {
    currencyType: CurrencyType;
  }
  
interface Trip {
    id: string;
    paymentInfo: PaymentInfo;
  }
  
interface ClaimTypeV2 {
    claimType: string;
    creator: string;
    claimName: string;
  }
  
interface CarDetail {
    id: string;
    model: string;
    brand: string;
    yearOfProduction: number;
    tokenURI: string;
    locationInfo: {
      timeZoneId: string;
    };
  }
  
interface CarWrapper {
    car: CarDetail;
  }
  
interface PersonSummary {
    id :string;
    name: string;
    profilePhoto: string;
    mobilePhoneNumber: string;
  }
  
 
export interface QueryClaimInfo {
    id: string;
    trip: Trip;
    deadlineDateInSec: number;
    claimTypeV2: ClaimTypeV2;
    car: CarWrapper;
    status: string;
    description: string;
    amountInUsdCents: number;
    payDateInSec :number;
    rejectedBy :{ id: string };
    rejectedDateInSec :number;
    photosUrl: string;
    isHostClaims: boolean;
    host :PersonSummary;
    guest :PersonSummary;
    amountInEth :string;
    isInsuranceClaim :boolean;
  }
  
   export interface GetClaimInfosResponse {
    claimInfos: QueryClaimInfo[];
  }
  