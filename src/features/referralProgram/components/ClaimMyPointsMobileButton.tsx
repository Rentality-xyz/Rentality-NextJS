import React from "react";
import useFetchOwnReferralPoints from "../hooks/useFetchOwnReferralPoints";
import useClaimOwnReferralPoints from "../hooks/useClaimOwnReferralPoints";
import useOwnReferralPointsSharedStore from "../hooks/useOwnReferralPointsSharedStore";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function ClaimMyPointsMobileButton() {
  const { isLoading, isFetching } = useFetchOwnReferralPoints();
  const { mutateAsync: claimMyPoints } = useClaimOwnReferralPoints();
  const {t} = useTranslation();
  const isClaiming = useOwnReferralPointsSharedStore((state) => state.isClaiming);
  const readyToClaim = useOwnReferralPointsSharedStore((state) => state.readyToClaim);

  return (
    <button
      className={"mb-3 flex cursor-pointer items-center hover:underline xl:hidden"}
      disabled={isLoading || isFetching || isClaiming || readyToClaim === 0}
      onClick={() => claimMyPoints()}
    >
      <Image src={"/images/icons/ic_star_points_white.svg"} width={30} height={30} alt="" className="" />
      <div className="ml-3 flex">
        {isClaiming ? (
          <>{t("referrals_and_point.claiming")}</>
        ) : isLoading || isFetching ? (
          <>{t("referrals_and_point.loading")}</>
        ) : (
          <>
            {`${t("referrals_and_point.claim")} ${readyToClaim} ${t("referrals_and_point.points")}`}
          </>
        )}
      </div>
    </button>
  );
}