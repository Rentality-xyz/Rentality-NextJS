import ClaimHistory from "@/components/claims/claimHistory";
import RntDialogs from "@/components/common/rntDialogs";
import GuestLayout from "@/components/guest/layout/guestLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useGuestClaims from "@/hooks/guest/useGuestClaims";
import useRntDialogs from "@/hooks/useRntDialogs";
import { useRouter } from "next/navigation";

export default function Claims() {
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();
  const [isLoading, claims, payClaim] = useGuestClaims();
  const router = useRouter();

  const handlePayClaim = async (claimId: number) => {
    try {
      showInfo("Please confirm the transaction with your wallet and wait for the transaction to be processed");
      const result = await payClaim(claimId);
      hideSnackbar();
      if (!result) {
        showError("Your pay claim request failed. Please make sure you entered claim details right and try again");
        return;
      }
      router.refresh();
    } catch (e) {
      showError("Your pay claim request failed. Please make sure you entered claim details right and try again");
      console.error("handlePayClaim error:" + e);
    }
  };

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="Claims" />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <ClaimHistory claims={claims} payClaim={handlePayClaim} isHost={false} />
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </GuestLayout>
  );
}
