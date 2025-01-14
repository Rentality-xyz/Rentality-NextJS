import ClaimHistory from "@/components/claims/ClaimHistory";
import CreateClaim from "@/components/claims/CreateClaim";
import PageTitle from "@/components/pageTitle/pageTitle";
import useHostClaims from "@/hooks/host/useHostClaims";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { CreateClaimRequest } from "@/model/CreateClaimRequest";
import { useTranslation } from "react-i18next";
import { Err, Result, TransactionErrorCode } from "@/model/utils/result";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";

function Claims() {
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { isLoading, claims, tripInfos, createClaim, payClaim, cancelClaim, updateData } = useHostClaims();
  const { t } = useTranslation();

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
      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoading}>
          <CreateClaim createClaim={handleCreateClaim} tripInfos={tripInfos} isHost={true} />
          <ClaimHistory
            claims={claims}
            payClaim={handlePayClaim}
            cancelClaim={handleCancelClaim}
            isHost={true}
            t={(path, options) => {
              return t("claims." + path, options);
            }}
          />
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}

export default Claims;
