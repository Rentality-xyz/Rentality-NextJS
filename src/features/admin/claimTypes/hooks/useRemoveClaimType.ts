import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRentalityAdmin } from '@/contexts/rentalityContext';


function useRemoveClaimType() {
  const { admin } = useRentalityAdmin();
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, number>({
    mutationFn: async (claimTypeId: number) => {
      if (!admin) {
        throw new Error('Contract is not initialized');
      }
      const result = await admin.removeClaimType(claimTypeId);
      if (!result.ok) {
        throw result.error;
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claimTypes'] });
    },
    onError: (error: Error) => {
      console.error('removeClaimType mutation failed:', error.message);
    },
  });
}

export default useRemoveClaimType;