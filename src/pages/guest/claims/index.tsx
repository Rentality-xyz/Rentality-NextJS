import ClaimHistory from "@/components/claims/claimHistory";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useGuestClaims from "@/hooks/guest/useGuestClaims";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useRouter } from "next/navigation";

export default function Claims() {
  const { showInfo, showError, hideDialogs } = useRntDialogs();
  const [isLoading, claims, payClaim] = useGuestClaims();
  const router = useRouter();

  const handlePayClaim = async (claimId: number) => {
    try {
      showInfo("Please confirm the transaction with your wallet and wait for the transaction to be processed");
      const result = await payClaim(claimId);
      hideDialogs();
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
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="Claims" />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <ClaimHistory claims={claims} payClaim={handlePayClaim} isHost={false} />
        )}
      </div>
    </Layout>
  );
}
