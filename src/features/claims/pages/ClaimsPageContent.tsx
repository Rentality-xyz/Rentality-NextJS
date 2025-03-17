import ClaimHistory from "@/features/claims/components/ClaimHistory";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import CreateClaim from "@/features/claims/components/CreateClaim";
import RntSuspense from "@/components/common/rntSuspense";
import useFetchClaims from "../hooks/useFetchClaims";
import useUserMode from "@/hooks/useUserMode";

function ClaimsPageContent() {
  const { userMode, isHost } = useUserMode();
  const { isLoading, data: claims } = useFetchClaims(isHost(userMode));
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("claims.title")} />
      <RntSuspense isLoading={isLoading}>
        <CreateClaim />
        <ClaimHistory claims={claims} />
      </RntSuspense>
    </>
  );
}

export default ClaimsPageContent;
