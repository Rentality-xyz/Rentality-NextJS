import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import HostInsuranceClaimsTable from "@/features/admin/hostInsuranceClaims/components/HostInsuranceClaimsTable";
import useAdminHostInsuranceClaims from "@/features/admin/hostInsuranceClaims/hooks/useAdminHostInsuranceClaims";
import getNetworkName from "@/model/utils/NetworkName";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import usePayClaim from "@/features/claims/hooks/usePayClaim";


function HostInsuranceClaimsPageContent() {

  const { t } = useTranslation();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { mutateAsync: payClaim } = usePayClaim();
  const ethereumInfo = useEthereum();

  const { isLoading, data} = useAdminHostInsuranceClaims()

  const onPay = async (claimId: number, currency: string) => {
    showInfo(t("common.info.sign"));

    const result = await payClaim({ claimId, currency, isAdmin: true });

    hideSnackbars();

    if (!result.ok) {
      if (result.error.message === "NOT_ENOUGH_FUNDS") {
        showError(
          t("common.add_fund_to_wallet", {
            network: getNetworkName(ethereumInfo),
          })
        );
      } else {
        showError(t("claims.errors.pay_claim_failed"));
      }
    }
  }

  return (
    <>
      <PageTitle title={t("admin_host_insurance_claims.page_title")} />
      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
        <HostInsuranceClaimsTable
          isLoading={isLoading}
          claims={data}
          onPay={onPay}
        ></HostInsuranceClaimsTable>
      </div>
    </>
  );
}

export default HostInsuranceClaimsPageContent;
