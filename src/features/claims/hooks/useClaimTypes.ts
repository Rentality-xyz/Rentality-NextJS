import { useQuery } from '@tanstack/react-query';
import { bigIntReplacer } from '@/utils/json';
import { logger } from '@/utils/logger';
import { getEtherContractWithProvider, getEtherContractWithSigner } from '@/abis';
import { useEthereum } from '@/contexts/web3/ethereumContext';
import { IRentalityAdminGatewayContract } from '@/features/blockchain/models/IRentalityAdminGateway';
import { ClaimUsers,ClaimType, mapContractClaimTypeToClaimType } from '@/features/admin/claimTypes/models/claims';
import getDefaultProvider from '@/utils/api/defaultProviderUrl';

export interface ClaimTypesFilters {
  claimTypes?: ClaimUsers;
}

const filterUniqueClaims = (claims: ClaimType[]): ClaimType[] =>
  claims.reduce<ClaimType[]>((unique, item) => {
    if (!unique.some(e => e.claimTypeId === item.claimTypeId)) {
      unique.push(item);
    }
    return unique;
  }, []);

async function fetchClaimTypes(
  admin: IRentalityAdminGatewayContract,
  filters?: ClaimTypesFilters
): Promise<ClaimType[]> {
  logger.debug(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

  const [guestResult, hostResult] = await Promise.all([
    admin.getAllClaimTypes(false),
    admin.getAllClaimTypes(true),
  ]);

  const raw = guestResult.concat(hostResult);
  const mapped = raw.map(mapContractClaimTypeToClaimType);
  let unique = filterUniqueClaims(mapped);

  if (filters?.claimTypes != null) {
    unique = unique.filter(c => c.claimUser === filters.claimTypes);
  }

  return unique.sort((a, b) => a.claimTypeId - b.claimTypeId);
}

export function useClaimTypesQuery(filters: ClaimTypesFilters = {}) {
  const ethereumInfo = useEthereum();

  return useQuery<ClaimType[], Error>({
    queryKey: ['adminClaimTypes', filters.claimTypes],
    queryFn: async () => {
      if (!ethereumInfo?.signer) {
        throw new Error('Ethereum signer not available');
      }
      const defaultProvider = await getDefaultProvider();

      const raw = await getEtherContractWithProvider('admin', defaultProvider);
      if (!raw) {
        throw new Error('Failed to instantiate RentalityAdmin contract');
      }

      const contract = raw as unknown as IRentalityAdminGatewayContract;
      return fetchClaimTypes(contract, filters);
    },
    enabled: Boolean(ethereumInfo?.signer),
    staleTime: 5 * 60 * 1000,
  });
}