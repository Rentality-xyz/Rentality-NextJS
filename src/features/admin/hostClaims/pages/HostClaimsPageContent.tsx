import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import HostClaimsTable from "@/features/admin/hostClaims/components/HostClaimsTable";
import useAdminHostInsuranceClaims from "@/features/admin/hostClaims/hooks/useAdminHostInsuranceClaims";


function HostClaimsPageContent() {
  const { t } = useTranslation();
  const { isLoading, data} = useAdminHostInsuranceClaims()

  return (
    <>
      <PageTitle title={t("admin_host_claims.page_title")} />
      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
        <HostClaimsTable
          isLoading={isLoading}
          data={data}
          onPay={(claimId) => {

          }}
        ></HostClaimsTable>
      </div>
    </>
  );
}

export default HostClaimsPageContent;
