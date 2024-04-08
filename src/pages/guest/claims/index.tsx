import ClaimHistory from "@/components/claims/claimHistory";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useGuestClaims from "@/hooks/guest/useGuestClaims";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function Claims() {
  const { t } = useTranslation();
  const { showInfo, showError, hideDialogs } = useRntDialogs();
  const [isLoading, claims, payClaim] = useGuestClaims();
  const router = useRouter();

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

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("claims.title")} />
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
