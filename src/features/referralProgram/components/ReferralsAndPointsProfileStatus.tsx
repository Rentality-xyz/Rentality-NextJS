import Image from "next/image";
import icStarPointsWhite from "@/images/ic_star_points_white.svg";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import React from "react";
import { cn } from "@/utils";

type ReferralsAndPointsProfileStatusProps = {
  index: number;
  nameReferral: string;
  countPoints: number;
  status: PointsProfileStatus;
};

export enum PointsProfileStatus {
  Done = "Done",
  NextStep = "NextStep",
  ReadyToClaim = "ReadyToClaim",
}

export default function ReferralsAndPointsProfileStatus({
  index,
  nameReferral,
  countPoints,
  status,
}: ReferralsAndPointsProfileStatusProps) {
  return <GetProfileStatus index={index} nameReferral={nameReferral} countPoints={countPoints} status={status} />;
}

type GetProfileStatusProps = {
  index: number;
  nameReferral: string;
  countPoints: number;
  status: PointsProfileStatus;
};

function GetProfileStatus({ index, nameReferral, countPoints, status }: GetProfileStatusProps) {
  let icStarPoints = null;
  let mainDivClassName = "";
  let nameReferralClassName = "";
  let countPointsClassName = "";
  let headerTextClassName = "";
  let _countPoints = "";
  let headerText = "";

  switch (status) {
    case PointsProfileStatus.Done: {
      mainDivClassName = "border border-rentality-button-medium";
      nameReferralClassName = "bg-rentality-additional-dark";
      countPointsClassName = "bg-rentality-secondary-dark";
      _countPoints = "✓ Done";
      break;
    }
    case PointsProfileStatus.NextStep: {
      nameReferralClassName = "bg-neutral-500";
      countPointsClassName = "bg-rentality-secondary-dark";
      headerTextClassName = "text-gray-400";
      _countPoints = countPoints.toString();
      // headerText = "Next step";
      icStarPoints = icStarPointsWhite;
      break;
    }
    case PointsProfileStatus.ReadyToClaim: {
      mainDivClassName = "border-2 border-rentality-star-point";
      nameReferralClassName = "bg-rentality-button-dark font-semibold";
      countPointsClassName = "bg-rentality-secondary-dark text-rentality-star-point";
      headerTextClassName = "text-rentality-star-point";
      _countPoints = countPoints.toString();
      // headerText = "Ready to claim";
      icStarPoints = icStarPointsYellow;
      break;
    }
  }

  return (
    <div className="relative flex items-center">
      {index !== 0 && <div className="absolute bottom-16 left-[-24px] h-px w-6 bg-rentality-secondary-dark"></div>}
      <div className="my-4 mr-4">
        <p className={cn("mb-1 text-center text-sm", headerTextClassName)}>{headerText}</p>
        <div className={cn("h-24 w-24 rounded-lg", mainDivClassName)}>
          <div className={cn("flex h-2/3 w-full items-center rounded-t-lg p-1 text-center", nameReferralClassName)}>
            {nameReferral}
          </div>
          <div
            className={cn(
              "flex h-1/3 w-full items-center justify-center rounded-b-lg font-semibold",
              countPointsClassName
            )}
          >
            {_countPoints}
            {icStarPoints !== null && <Image src={icStarPoints} alt="" className="ml-1 h-[20px] w-[20px]" />}
          </div>
        </div>
      </div>
    </div>
  );
}
