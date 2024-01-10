import ClaimHistory from "@/components/claims/claimHistory";
import CreateClaim from "@/components/claims/createClaim";
import RntDialogs from "@/components/common/rntDialogs";
import HostLayout from "@/components/host/layout/hostLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useHostClaims from "@/hooks/host/useHostClaims";
import useRntDialogs from "@/hooks/useRntDialogs";

export default function Claims() {
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();
  const [dataFetched, claims, createClaim, cancelClaim] = useHostClaims();

  return (
    <HostLayout>
      <div className="flex flex-col">
        <PageTitle title="Claims" />
        <CreateClaim createClaim={createClaim} />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <ClaimHistory claims={claims} cancelClaim={cancelClaim} isHost={true} />
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </HostLayout>
  );
}
