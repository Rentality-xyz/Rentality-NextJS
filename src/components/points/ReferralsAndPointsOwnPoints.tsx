import { useTranslation } from "react-i18next";
import React from "react";
import ReferralsAndPointsProfileStatus, {
  PointsProfileStatus,
} from "@/components/points/ReferralsAndPointsProfileStatus";
import Image from "next/image";
import RntButton from "@/components/common/rntButton";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";

export default function ReferralsAndPointsOwnPoints() {
  const { t } = useTranslation();

  return (
    <div id="referrals-and-points-own-points" className="mt-4 rounded-lg bg-rentality-bg-left-sidebar p-3">
      <div id="rp-section-own-points" className="items-center sm:flex">
        <div className="flex items-center">
          <p className="text-rentality-secondary">{t("referrals_and_point.section_own_points")}</p>
          <i className="fi fi-rs-info ml-3 cursor-pointer text-rentality-secondary"></i>
        </div>
        <RntButton
          className="flex w-full items-center justify-center text-white max-sm:mt-4 sm:ml-auto sm:w-60 2xl:w-64"
          // onClick={() => copyToClipboard(tripInfo.guest.walletAddress)}
        >
          <Image src={icStarPointsYellow} alt="" className="mr-2 h-7 w-7" />
          <div className="ml-0.5 flex">
            Claim <span className="text-rentality-star-point px-1 font-semibold">540</span> points
            <span className="ml-4">●</span>
          </div>
        </RntButton>
      </div>

      <div id="rp-own-points-account-creation" className="mt-4 px-4">
        <p className="text-gray-300">Account creation</p>
        <hr className="my-2 border-gray-300" />
        <div id="rp-account-points-status-scrolling" className="flex space-x-2 overflow-x-auto">
          {Array.from({
            length: 8,
          })
            // .filter((i) => !isEmpty(i))
            // .slice(0, 5)
            .map((url, index) => (
              <div key={index}>
                <ReferralsAndPointsProfileStatus index={index} isHost={true} status={PointsProfileStatus.Saved} />
              </div>
            ))}
        </div>
      </div>

      <div id="rp-own-points-regularly" className="mt-2 px-4">
        <p className="text-gray-300">Regularly</p>
        <hr className="my-2 border-gray-300" />
        <div id="rp-regularly-points-status-scrolling" className="flex space-x-2 overflow-x-auto">
          {Array.from({
            length: 8,
          })
            // .filter((i) => !isEmpty(i))
            // .slice(0, 5)
            .map((url, index) => (
              <div key={index}>
                <ReferralsAndPointsProfileStatus index={index} isHost={true} status={PointsProfileStatus.NextStep} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}