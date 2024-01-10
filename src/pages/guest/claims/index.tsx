import ClaimHistory from "@/components/claims/claimHistory";
import RntDialogs from "@/components/common/rntDialogs";
import GuestLayout from "@/components/guest/layout/guestLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useGuestClaims from "@/hooks/guest/useGuestClaims";
import useRntDialogs from "@/hooks/useRntDialogs";

export default function Claims() {
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();
  const [dataFetched, claims, payClaim] = useGuestClaims();

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="Claims" />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <ClaimHistory claims={claims} payClaim={payClaim} isHost={false} />
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </GuestLayout>
  );
}
