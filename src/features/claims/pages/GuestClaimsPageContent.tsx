import ClaimHistory from "@/features/claims/components/ClaimHistory";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import CreateClaim from "@/features/claims/components/CreateClaim";
import RntSuspense from "@/components/common/rntSuspense";
import useFetchClaims from "../hooks/useFetchClaims";

function GuestClaimsPageContent() {
  const { isLoading, data: claims, refetch } = useFetchClaims(false);
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("claims.title")} />
      <RntSuspense isLoading={isLoading}>
        <CreateClaim onClaimAdded={refetch} />
        <ClaimHistory
          claims={claims}
          onClaimUpdated={() => {
            refetch();
          }}
        />
      </RntSuspense>
    </>
  );
}

export default GuestClaimsPageContent;
