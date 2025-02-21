import ClaimHistory from "@/features/claims/components/ClaimHistory";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useTranslation } from "react-i18next";
import CreateClaim from "@/features/claims/components/CreateClaim";
import RntSuspense from "@/components/common/rntSuspense";
import useFetchClaims from "../hooks/useFetchClaims";
import useUpdateClaim from "../hooks/useUpdateClaim";

function GuestClaimsPageContent() {
  const { t } = useTranslation();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { isLoading, data: claims, refetch } = useFetchClaims(false);
  const { payClaim, cancelClaim } = useUpdateClaim();

  async function handleCancelClaim(claimId: number) {
    showInfo(t("common.info.sign"));

    const result = await cancelClaim(claimId);

    hideSnackbars();

    if (result.ok) {
      refetch();
    } else {
      if (result.error === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("claims.host.claim_cancel_failed"));
      }
    }
  }

  async function handlePayClaim(claimId: number) {
    showInfo(t("common.info.sign"));

    const result = await payClaim(claimId);

    hideSnackbars();

    if (result.ok) {
      refetch();
    } else {
      if (result.error === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("claims.errors.pay_claim_failed"));
      }
    }
  }

  return (
    <>
      <PageTitle title={t("claims.title")} />
      <RntSuspense isLoading={isLoading}>
        <CreateClaim onClaimAdded={refetch} />
        <ClaimHistory
          claims={claims}
          payClaim={handlePayClaim}
          cancelClaim={handleCancelClaim}
          isHost={false}
          t={(path, options) => {
            return t("claims." + path, options);
          }}
        />
      </RntSuspense>
    </>
  );
}

export default GuestClaimsPageContent;
