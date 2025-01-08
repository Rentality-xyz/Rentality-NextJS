// TODO translate
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import ReferralsAndPointsProfileStatus from "@/features/referralProgram/components/ReferralsAndPointsProfileStatus";
import Image from "next/image";
import RntButton from "@/components/common/rntButton";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import { AllOwnPointsInfo, getAllPoints } from "@/features/referralProgram/hooks/useOwnPoints";
import Loading from "@/components/common/Loading";
import RntSuspense from "../../../components/common/rntSuspense";
import useReferralProgram from "@/features/referralProgram/hooks/useReferralProgram";
import useClaimMyPoints from "@/features/referralProgram/hooks/useClaimMyPoints";

export default function ReferralsAndPointsOwnPoints() {
  const {
    getReadyToClaim,
    getReferralPointsInfo,
    getPointsHistory,
    isLoading: isLoadingInviteLink,
  } = useReferralProgram();
  const { isLoading: isLoadingMyPoints, readyToClaim, claimMyPoints } = useClaimMyPoints();
  const [isLoading, setIsLoading] = useState(true);
  const [allPoints, setAllPoints] = useState<AllOwnPointsInfo | null>(null);
  const { t } = useTranslation();

  async function handleClaimPointsClick() {
    await claimMyPoints();
  }

  useEffect(() => {
    const savePoints = async () => {
      const readyToClaim = await getReadyToClaim();
      const pointsInfo = await getReferralPointsInfo();
      const pointsHistory = await getPointsHistory();

      if (readyToClaim && pointsHistory && pointsInfo) {
        const result = getAllPoints(readyToClaim, pointsHistory, pointsInfo, t);
        if (result.ok) {
          setAllPoints(result.value);
          setIsLoading(false);
        }
      }
    };

    if (!isLoadingInviteLink) {
      savePoints();
    }
  }, [isLoadingInviteLink, readyToClaim, getReadyToClaim, getReferralPointsInfo, getPointsHistory, t]);

  return (
    <div id="referrals-and-points-own-points" className="mt-4 rounded-lg bg-rentality-bg-left-sidebar p-3">
      <div id="rp-section-own-points" className="items-center sm:flex">
        <div className="flex items-center">
          <p className="text-rentality-secondary">{t("referrals_and_point.section_own_points")}</p>
        </div>
        <RntButton
          className="flex w-full items-center justify-center text-white max-sm:mt-4 sm:ml-auto sm:w-60 2xl:w-64"
          disabled={readyToClaim === 0}
          onClick={handleClaimPointsClick}
        >
          <Image src={icStarPointsYellow} alt="" className="mr-2 h-7 w-7" />
          <div className="ml-0.5 flex">
            {isLoadingMyPoints ? (
              <>Loading...</>
            ) : (
              <>
                Claim <span className="px-1 font-semibold text-rentality-star-point">{readyToClaim.toString()}</span>{" "}
                points
                <span className="ml-4">●</span>
              </>
            )}
          </div>
        </RntButton>
      </div>

      <RntSuspense
        isLoading={isLoading}
        fallback={
          <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
            <Loading />
          </div>
        }
      >
        <div id="rp-own-points-account-creation" className="mt-4 px-4">
          <p className="text-gray-300">{t("referrals_and_point.account_creation")}</p>
          <hr className="my-2 border-gray-300" />
          <div id="rp-account-points-status-scrolling" className="flex space-x-2 overflow-x-auto">
            {allPoints?.ownAccountCreationPointsInfo.map((info, index) => (
              <div key={index}>
                <ReferralsAndPointsProfileStatus
                  index={index}
                  nameReferral={info.methodDescriptions}
                  countPoints={info.countPoints}
                  status={info.status}
                />
              </div>
            ))}
          </div>
        </div>

        <div id="rp-own-points-regularly" className="mt-2 px-4">
          <p className="text-gray-300">{t("referrals_and_point.regularly")}</p>
          <hr className="my-2 border-gray-300" />
          <div id="rp-regularly-points-status-scrolling" className="flex space-x-2 overflow-x-auto">
            {allPoints?.ownRegularPointsInfo.map((info, index) => (
              <div key={index}>
                <ReferralsAndPointsProfileStatus
                  index={index}
                  nameReferral={info.methodDescriptions}
                  countPoints={info.countPoints}
                  status={info.status}
                />
              </div>
            ))}
          </div>
        </div>
      </RntSuspense>
    </div>
  );
}
