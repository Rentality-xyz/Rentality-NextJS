import Image from "next/image";
import icStarPointsWhite from "@/images/ic_star_points_white.svg";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import React, { ReactNode } from "react";
import { cn } from "@/utils";

type ReferralsAndPointsProfileStatusProps = {
  index: number;
  isHost: boolean;
  status: PointsProfileStatus;
};

export enum PointsProfileStatus {
  Saved = "Saved",
  NextStep = "NextStep",
  DoNow = "DoNow",
  ReadyToClaim = "ReadyToClaim",
}

export default function ReferralsAndPointsProfileStatus({
  index,
  isHost,
  status,
}: ReferralsAndPointsProfileStatusProps) {
  return <GetProfileStatus index={index} status={status} />;
}

type GetProfileStatusProps = {
  index: number;
  status: PointsProfileStatus;
};

function GetProfileStatus({ index, status }: GetProfileStatusProps) {
  let icStarPoints = null;
  let mainDivClassName = "";
  let nameReferralClassName = "";
  let countPointsClassName = "";
  let headerTextClassName = "";
  let nameReferral = "";
  let countPoints = "";
  let headerText = "";

  switch (status) {
    case PointsProfileStatus.Saved: {
      mainDivClassName = "border border-rentality-button-medium";
      nameReferralClassName = "bg-rentality-additional-dark";
      countPointsClassName = "bg-rentality-secondary-dark";
      nameReferral = "Save profile";
      countPoints = "✓ Done";
      break;
    }
    case PointsProfileStatus.NextStep: {
      nameReferralClassName = "bg-neutral-500";
      countPointsClassName = "bg-rentality-secondary-dark";
      headerTextClassName = "text-gray-400";
      nameReferral = "Listing first car";
      countPoints = "+ 100";
      headerText = "Next step";
      icStarPoints = icStarPointsWhite;
      break;
    }
    case PointsProfileStatus.DoNow: {
      nameReferralClassName = "bg-rentality-button-dark font-semibold";
      countPointsClassName = "bg-rentality-secondary-dark";
      headerTextClassName = "text-rentality-secondary";
      nameReferral = "Get KYC Pass";
      countPoints = "+ 500";
      headerText = "Do now";
      icStarPoints = icStarPointsYellow;
      break;
    }
    case PointsProfileStatus.ReadyToClaim: {
      mainDivClassName = "border-2 border-rentality-star-point";
      nameReferralClassName = "bg-rentality-button-dark font-semibold";
      countPointsClassName = "bg-rentality-secondary-dark text-rentality-star-point";
      headerTextClassName = "text-rentality-star-point";
      nameReferral = "Daily chek-in";
      countPoints = "+ 20";
      headerText = "Ready to claim";
      icStarPoints = icStarPointsYellow;
      break;
    }
  }

  return (
    <div className="relative flex items-center">
      {index !== 0 && <div className="bg-rentality-secondary-dark absolute bottom-16 left-[-24px] h-px w-6"></div>}
      <div className="my-4 mr-4">
        <p className={cn("mb-1 text-center text-sm", headerTextClassName)}>{headerText}</p>
        <div className={cn("h-24 w-24 rounded-lg", mainDivClassName)}>
          <div className={cn("flex h-2/3 w-full items-center rounded-t-lg px-2 text-center", nameReferralClassName)}>
            {nameReferral}
          </div>
          <div
            className={cn(
              "flex h-1/3 w-full items-center justify-center rounded-b-lg font-semibold",
              countPointsClassName
            )}
          >
            {countPoints}
            {icStarPoints !== null && <Image src={icStarPoints} alt="" className="ml-1 h-[20px] w-[20px]" />}
          </div>
        </div>
      </div>
    </div>
  );
}
