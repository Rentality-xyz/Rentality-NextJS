import ClaimHistory from "@/components/claims/claimHistory";
import CreateClaim from "@/components/claims/createClaim";
import RntDialogs from "@/components/common/rntDialogs";
import HostLayout from "@/components/host/layout/hostLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useHostClaims from "@/hooks/host/useHostClaims";
import useRntDialogs from "@/hooks/useRntDialogs";
import { CreateClaimRequest } from "@/model/blockchain/ContractCreateClaimRequest";
import { useRouter } from "next/navigation";

export default function Claims() {
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();
  const [dataFetched, claims, tripInfos, createClaim, cancelClaim] = useHostClaims();
  const router = useRouter();

  const handleCreateClaim = async (createClaimRequest: CreateClaimRequest) => {
    try {
      if (!createClaimRequest.tripId) {
        showError("Please select trip");
        return;
      }
      if (!createClaimRequest.claimType && createClaimRequest.claimType !== 0) {
        showError("Please select claim type");
        return;
      }
      if (!createClaimRequest.description) {
        showError("Please enter description");
        return;
      }
      if (!createClaimRequest.amountInUsdCents) {
        showError("Please enter amount");
        return;
      }

      showInfo("Please confirm the transaction with your wallet and wait for the transaction to be processed");
      const result = await createClaim(createClaimRequest);
      hideSnackbar();
      if (!result) {
        showError("Your create claim request failed. Please make sure you entered claim details right and try again");
        return;
      }
      router.refresh();
    } catch (e) {
      showError("Your create claim request failed. Please make sure you entered claim details right and try again");
      console.error("handleCreateClaim error:" + e);
    }
  };

  const handleCancelClaim = async (claimId: number) => {
    try {
      showInfo("Please confirm the transaction with your wallet and wait for the transaction to be processed");
      const result = await cancelClaim(claimId);
      hideSnackbar();
      if (!result) {
        showError("Your cancel claim request failed. Please make sure you entered claim details right and try again");
        return;
      }
      router.refresh();
    } catch (e) {
      showError("Your cancel claim request failed. Please make sure you entered claim details right and try again");
      console.error("handleCancelClaim error:" + e);
    }
  };

  return (
    <HostLayout>
      <div className="flex flex-col">
        <PageTitle title="Claims" />
        <CreateClaim createClaim={handleCreateClaim} tripInfos={tripInfos} />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <ClaimHistory claims={claims} cancelClaim={handleCancelClaim} isHost={true} />
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </HostLayout>
  );
}
