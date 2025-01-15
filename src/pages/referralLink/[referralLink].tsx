import { useRouter } from "next/router";
import { useEffect } from "react";
import { isEmpty } from "@/utils/string";
import useReferralLinkLocalStorage from "@/features/referralProgram/hooks/useSaveReferralLinkToLocalStorage";

function ReferralLink() {
  const router = useRouter();
  const { referralLink: referralLinkQuery } = router.query;
  const referralLink = referralLinkQuery && typeof referralLinkQuery === "string" ? referralLinkQuery : "";

  const { saveReferralCode: saveReferralLink } = useReferralLinkLocalStorage();

  useEffect(() => {
    if (!isEmpty(referralLink)) {
      saveReferralLink(referralLink);
      router.replace("/guest/search");
    }
  }, [referralLink, saveReferralLink, router]);

  return <></>;
}

export default ReferralLink;
