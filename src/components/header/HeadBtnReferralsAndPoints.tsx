import Image from "next/image";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import React from "react";

export default function HeadBtnReferralsAndPoints() {
  return (
    <>
      <button
        className="hidden items-center rounded-md border border-gray-500 px-4 py-2 hover:border-gray-400 xl:flex"
        onClick={() => {
          // setIsOpened(true);
        }}
      >
        <Image src={icStarPointsYellow} alt="" className="mr-2 h-7 w-7" />
        <div className="ml-0.5 flex">
          Claim <span className="px-1 font-semibold text-rentality-secondary">+ 540</span> points
        </div>
      </button>
    </>
  );
}
