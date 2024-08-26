import ClaimHistory from "@/components/claims/ClaimHistory";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useGuestClaims from "@/hooks/guest/useGuestClaims";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import CreateClaim from "@/components/claims/CreateClaim";
import { CreateClaimRequest } from "@/model/CreateClaimRequest";
import { TFunction } from "@/utils/i18n";

export default function Claims() {
  // const [isLoading, claims, tripInfos, createClaim, cancelClaim, payClaim] = useGuestClaims();
  const { t } = useTranslation();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { isLoading, claims, tripInfos, createClaim, payClaim, cancelClaim, updateData } = useGuestClaims();
  const router = useRouter();
  const t_h_claims: TFunction = (name, options) => {
    return t("claims.host." + name, options);
  };

  const handlePayClaim = async (claimId: number) => {
    try {
      showInfo(t("common.info.sign"));
      const result = await payClaim(claimId);
      hideSnackbars();
      if (!result) {
        showError(t('claims.errors.pay_claim_failed"'));
        return;
      }
      updateData();
    } catch (e) {
      showError(t('claims.errors.pay_claim_failed"'));
      console.error("handlePayClaim error:" + e);
    }
  };

  const handleCancelClaim = async (claimId: number) => {
    try {
      showInfo(t("common.info.sign"));
      const result = await cancelClaim(claimId);
      hideSnackbars();
      if (!result) {
        showError(t_h_claims("claim_cancel_failed"));
        return;
      }
      updateData();
    } catch (e) {
      showError(t_h_claims("claim_cancel_failed"));
      console.error("handleCancelClaim error:" + e);
    }
  };

  const handleCreateClaim = async (createClaimRequest: CreateClaimRequest) => {
    if (!createClaimRequest.tripId) {
      showError(t_h_claims("select_trip"));
      return false;
    }
    if (!createClaimRequest.claimType && createClaimRequest.claimType !== BigInt(0)) {
      showError(t_h_claims("select_type"));
      return false;
    }
    if (!createClaimRequest.description) {
      showError(t_h_claims("enter_description"));
      return false;
    }
    if (!createClaimRequest.amountInUsdCents) {
      showError(t_h_claims("enter_amount"));
      return false;
    }

    try {
      showInfo(t("common.info.sign"));
      const result = await createClaim(createClaimRequest);
      hideSnackbars();
      if (!result) {
        showError(t_h_claims("claim_failed"));
        return false;
      }
      updateData();
      return true;
    } catch (e) {
      showError(t_h_claims("claim_failed"));
      console.error("handleCreateClaim error:" + e);
      return false;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("claims.title")} />
        <CreateClaim createClaim={handleCreateClaim} tripInfos={tripInfos} isHost={false} />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
        ) : (
          <ClaimHistory
            claims={claims}
            payClaim={handlePayClaim}
            cancelClaim={handleCancelClaim}
            isHost={false}
            t={(path, options) => {
              return t("claims." + path, options);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
