import { useQuery } from '@tanstack/react-query';
import { useRentalityAdmin } from '@/contexts/rentalityContext';
import { ClaimType, ClaimUsers, mapContractClaimTypeToClaimType } from '../models/claims';
import { bigIntReplacer } from '@/utils/json';
import { logger } from '@/utils/logger';
import { ContractClaimTypeV2 } from '@/model/blockchain/schemas';

export interface ClaimTypesFilters {
  claimTypes?: ClaimUsers;
}

const filterUniqueClaims = (claims: ClaimType[]): ClaimType[] =>
  claims.reduce<ClaimType[]>((unique, item) => {
    if (!unique.some(entry => entry.claimTypeId === item.claimTypeId)) {
      unique.push(item);
    }
    return unique;
  }, []);

async function fetchClaimTypes(
  admin: ReturnType<typeof useRentalityAdmin>['admin'],
  filters?: ClaimTypesFilters
): Promise<ClaimType[]> {
  if (!admin) {
    throw new Error('Contract is not initialized');
  }
  logger.debug(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

    const [guestResult, hostResult] = await Promise.all([
      admin.getAllClaimTypes(false),
      admin.getAllClaimTypes(true),
    ]);
    if (!guestResult.ok) throw guestResult.error;
    if (!hostResult.ok) throw hostResult.error;
    let raw = guestResult.value.concat(hostResult.value);

  const mapped = raw.map(mapContractClaimTypeToClaimType);
  let unique = filterUniqueClaims(mapped);

  if (filters) {
    unique = unique.filter(c => c.claimUser === filters.claimTypes);
  }
  return unique.sort((a, b) => a.claimTypeId - b.claimTypeId);
}

export function useAdminClaimTypesQuery(filters: ClaimTypesFilters = {}) {
  const { admin } = useRentalityAdmin();

  return useQuery<ClaimType[], Error>({
    queryKey: ['adminClaimTypes', filters.claimTypes],
    queryFn: () => fetchClaimTypes(admin, filters),
    enabled: !!admin,
    staleTime: 5 * 60 * 1000, 
  });
}
