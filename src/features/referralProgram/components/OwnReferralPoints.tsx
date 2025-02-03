// TODO translate
import { useTranslation } from "react-i18next";
import React from "react";
import Image from "next/image";
import RntButton from "@/components/common/rntButton";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import Loading from "@/components/common/Loading";
import RntSuspense from "../../../components/common/rntSuspense";
import ReferralProgramStatusCard from "@/features/referralProgram/components/ReferralProgramStatusCard";
import useOwnReferralPoints from "../hooks/useOwnReferralPoints";

export default function OwnReferralPoints() {
  const { isLoading, isPending, readyToClaim, allPoints, claimMyPoints } = useOwnReferralPoints();
  const { t } = useTranslation();

  async function handleClaimPointsClick() {
    await claimMyPoints();
  }

  return (
    <div id="referrals-and-points-own-points" className="rounded-lg bg-rentality-bg-left-sidebar p-3">
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
            {isPending ? (
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
                <ReferralProgramStatusCard
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
                <ReferralProgramStatusCard
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
