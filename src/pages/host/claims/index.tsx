import ClaimHistory from "@/components/claims/claimHistory";
import CreateClaim from "@/components/claims/createClaim";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useHostClaims from "@/hooks/host/useHostClaims";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { CreateClaimRequest } from "@/model/CreateClaimRequest";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";

export default function Claims() {
  const { showInfo, showError, hideDialogs } = useRntDialogs();
  const [isLoading, claims, tripInfos, createClaim, cancelClaim] = useHostClaims();
  const router = useRouter();
  const { t } = useTranslation();
  const t_h_claims: TFunction = (name, options) => {
    return t("claims.host." + name, options);
  };

  const handleCreateClaim = async (createClaimRequest: CreateClaimRequest) => {
    try {
      if (!createClaimRequest.tripId) {
        showError(t_h_claims("select_trip"));
        return;
      }
      if (!createClaimRequest.claimType && createClaimRequest.claimType !== BigInt(0)) {
        showError(t_h_claims("select_type"));
        return;
      }
      if (!createClaimRequest.description) {
        showError(t_h_claims("enter_description"));
        return;
      }
      if (!createClaimRequest.amountInUsdCents) {
        showError(t_h_claims("Please enter amount"));
        return;
      }

      showInfo(t("common.info.sign"));
      const result = await createClaim(createClaimRequest);
      hideDialogs();
      if (!result) {
        showError(t_h_claims("claim_failed"));
        return;
      }
      router.refresh();
    } catch (e) {
      showError(t_h_claims("claim_failed"));
      console.error("handleCreateClaim error:" + e);
    }
  };

  const handleCancelClaim = async (claimId: number) => {
    try {
      showInfo(t("common.info.sign"));
      const result = await cancelClaim(claimId);
      hideDialogs();
      if (!result) {
        showError(t_h_claims("claim_cancel_failed"));
        return;
      }
      router.refresh();
    } catch (e) {
      showError(t_h_claims("claim_cancel_failed"));
      console.error("handleCancelClaim error:" + e);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("claims.title")} />
        <CreateClaim createClaim={handleCreateClaim} tripInfos={tripInfos} />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
        ) : (
          <ClaimHistory
            claims={claims}
            cancelClaim={handleCancelClaim}
            isHost={true}
            t={(path, options) => {
              return t("claims." + path, options);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
