import ClaimHistory from "@/features/claims/components/ClaimHistory";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useTranslation } from "react-i18next";
import CreateClaim from "@/features/claims/components/CreateClaim";
import { CreateClaimRequest } from "@/features/claims/models/CreateClaimRequest";
import { Err, Result, TransactionErrorCode } from "@/model/utils/result";
import RntSuspense from "@/components/common/rntSuspense";
import useFetchGuestClaims from "../hooks/useFetchGuestClaims";
import useCreateGuestClaim from "../hooks/useCreateGuestClaim";
import useUpdateGuestClaim from "../hooks/useUpdateGuestClaim";

function GuestClaimsPageContent() {
  const { t } = useTranslation();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { isLoading, claims, updateData } = useFetchGuestClaims();
  const { isLoading: isTripsLoading, tripInfos, createClaim } = useCreateGuestClaim();
  const { payClaim, cancelClaim } = useUpdateGuestClaim();

  async function handleCreateClaim(
    createClaimRequest: CreateClaimRequest
  ): Promise<Result<boolean, TransactionErrorCode>> {
    if (!createClaimRequest.tripId) {
      showError(t("claims.host.select_trip"));
      return Err("ERROR");
    }
    if (!createClaimRequest.claimType && createClaimRequest.claimType !== BigInt(0)) {
      showError(t("claims.host.select_type"));
      return Err("ERROR");
    }
    if (!createClaimRequest.description) {
      showError(t("claims.host.enter_description"));
      return Err("ERROR");
    }
    if (!createClaimRequest.amountInUsdCents) {
      showError(t("claims.host.enter_amount"));
      return Err("ERROR");
    }

    showInfo(t("common.info.sign"));

    const result = await createClaim(createClaimRequest);

    hideSnackbars();

    if (result.ok) {
      updateData();
    } else {
      if (result.error === "NOT_ENOUGH_FUNDS") {
        showError(t("common.add_fund_to_wallet"));
      } else {
        showError(t("claims.host.claim_failed"));
      }
    }
    return result;
  }

  async function handleCancelClaim(claimId: number) {
    showInfo(t("common.info.sign"));

    const result = await cancelClaim(claimId);

    hideSnackbars();

    if (result.ok) {
      updateData();
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
      updateData();
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
      <RntSuspense isLoading={isLoading || isTripsLoading}>
        <CreateClaim createClaim={handleCreateClaim} tripInfos={tripInfos} isHost={false} />
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
