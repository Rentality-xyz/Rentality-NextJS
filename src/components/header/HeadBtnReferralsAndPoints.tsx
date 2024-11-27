import Image from "next/image";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import React, { useEffect, useState } from "react";
import useInviteLink from "@/hooks/useRefferalProgram";

export default function HeadBtnReferralsAndPoints() {
  const [
    inviteHash,
    points,
    claimPoints,
    getReadyToClaim,
    getReadyToClaimFromRefferalHash,
    claimRefferalPoints,
    getRefferalPointsInfo,
    getPointsHistory,
    manageRefferalDiscount,
    manageTearInfo,
    calculateUniqUsers,
    isLoading,
  ] = useInviteLink();

  const [totalReadyToClaim, setTotalReadyToClaim] = useState<number>(0);

  useEffect(() => {
    const fetchReadyToClaim = async () => {
      const readyToClaim = await getReadyToClaim();
      if (readyToClaim) {
        setTotalReadyToClaim(readyToClaim.totalPoints);
      }
    };

    fetchReadyToClaim();
  }, [isLoading]);

  return (
    <>
      <button
        className="ml-[116px] hidden items-center rounded-md border border-gray-500 px-4 py-2 hover:border-gray-400 xl:flex"
        onClick={() => claimPoints()}
      >
        <Image src={icStarPointsYellow} alt="" className="mr-2 h-7 w-7" />
        <div className="ml-0.5 flex">
          Claim <span className="px-1 font-semibold text-rentality-secondary">{totalReadyToClaim.toString()}</span>{" "}
          points
        </div>
      </button>
    </>
  );
}
