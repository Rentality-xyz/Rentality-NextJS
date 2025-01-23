import { useRouter } from "next/router";
import { useEffect } from "react";
import { isEmpty } from "@/utils/string";
import useReferralLinkLocalStorage from "@/features/referralProgram/hooks/useSaveReferralLinkToLocalStorage";

function ReferralLink() {
  const router = useRouter();
  const { referralCode: referralCodeQuery } = router.query;
  const referralCode = referralCodeQuery && typeof referralCodeQuery === "string" ? referralCodeQuery : "";

  const { saveReferralCode } = useReferralLinkLocalStorage();

  useEffect(() => {
    if (!isEmpty(referralCode)) {
      saveReferralCode(referralCode);
      router.replace("/guest/search");
    }
  }, [referralCode, saveReferralCode, router]);

  console.log("ReferralLink", JSON.stringify({ referralCodeQuery, referralCode }, null, 2));

  return <></>;
}

export default ReferralLink;
