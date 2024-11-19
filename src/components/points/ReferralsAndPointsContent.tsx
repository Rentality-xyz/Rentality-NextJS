import Image from "next/image";
import icStarPointsWhite from "@/images/ic_star_points_white.svg";
import React from "react";
import { useTranslation } from "react-i18next";
import ReferralsAndPointsOwnPoints from "@/components/points/ReferralsAndPointsOwnPoints";
import ReferralsAndPointsLink from "@/components/points/ReferralsAndPointsLink";
import ReferralsAndPointsHistory from "@/components/points/ReferralsAndPointsHistory";
import ReferralsAndPointsFromYourReferrals from "@/components/points/ReferralsAndPointsFromYourReferrals";

type ReferralsAndPointsContentProps = {
  isHost: boolean;
};

export default function ReferralsAndPointsContent({ isHost }: ReferralsAndPointsContentProps) {
  const { t } = useTranslation();

  return (
    <div className="">
      <p className="ml-4 mt-2">{t("referrals_and_point.collect_and_claim_points")}</p>
      <div className="mt-3 flex w-fit items-center rounded-lg border border-rentality-star-point px-3 py-2 font-['Montserrat',Arial,sans-serif]">
        <Image src={icStarPointsWhite} alt="" className="mr-1 h-[22px]" />
        <p>
          Your Balance <span className="text-rentality-secondary">5 000</span> points
        </p>
      </div>
      <div className="my-4 flex flex-col gap-4 xl:flex-row">
        <div className="xl:flex xl:w-1/2 xl:flex-col">
          <ReferralsAndPointsLink />
          <ReferralsAndPointsOwnPoints />
        </div>
        <div className="xl:flex xl:w-1/2 xl:flex-col">
          <ReferralsAndPointsFromYourReferrals />
          <ReferralsAndPointsHistory />
        </div>
      </div>
    </div>
  );
}
