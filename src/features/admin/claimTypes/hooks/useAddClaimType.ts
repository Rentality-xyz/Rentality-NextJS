import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRentalityAdmin } from '@/contexts/rentalityContext';
import { ClaimUsers } from '../models/claims';


function useAddClaimType() {
  const { admin } = useRentalityAdmin();
  const queryClient = useQueryClient();

     const mutation = useMutation<boolean, Error, { name: string; users: ClaimUsers }>({
      mutationFn: async ({ name, users }) => {
        if (!admin) {
          throw new Error('Contract is not initialized');
        }
        const result = await admin.addClaimType(name, BigInt(users));
        if (!result.ok) {
          throw result.error;
        }
        return true;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['claimTypes'] });
      },
      onError: (error: Error) => {
        console.error('addClaimType mutation failed:', error.message);
      },
    });
 
  return {
     addClaimType: mutation.mutateAsync
   };
  }

export default useAddClaimType;
