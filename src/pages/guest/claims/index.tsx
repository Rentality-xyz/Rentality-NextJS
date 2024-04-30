import ClaimHistory from "@/components/claims/claimHistory";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useGuestClaims from "@/hooks/guest/useGuestClaims";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import CreateClaim from "@/components/claims/createClaim";
import {CreateClaimRequest} from "@/model/CreateClaimRequest";
import { TFunction } from "@/utils/i18n";

export default function Claims() {
  // const [isLoading, claims, tripInfos, createClaim, cancelClaim, payClaim] = useGuestClaims();
  const { t } = useTranslation();
  const { showInfo, showError, hideDialogs } = useRntDialogs();
  const [isLoading, claims, tripInfos, payClaim, createClaim] = useGuestClaims();
  const router = useRouter();
  const t_h_claims: TFunction = (name, options) => {
    return t("claims.host." + name, options);
  };

  const handlePayClaim = async (claimId: number) => {
    try {
      showInfo(t("common.info.sign"));
      const result = await payClaim(claimId);
      hideDialogs();
      if (!result) {
        showError(t('claims.errors.pay_claim_failed"'));
        return;
      }
      router.refresh();
    } catch (e) {
      showError(t('claims.errors.pay_claim_failed"'));
      console.error("handlePayClaim error:" + e);
    }
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
            payClaim={handlePayClaim}
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
