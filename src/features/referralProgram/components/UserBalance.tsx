//TODO translate
import Image from "next/image";
import React, { useEffect } from "react";
import useClaimMyPoints from "../hooks/useClaimMyPoints";
import icStarPointsWhite from "@/images/ic_star_points_white.svg";
import useClaimMyPointsFromReferrals from "../hooks/useClaimMyPointsFromReferrals";
import useUserBalance from "../hooks/useUserBalance";

function UserBalance() {
  const { points, updateData } = useUserBalance();
  const { readyToClaim } = useClaimMyPoints();
  const { readyToClaim: readyToClaimFromReferrals } = useClaimMyPointsFromReferrals();

  useEffect(() => {
    updateData();
  }, [updateData, readyToClaim, readyToClaimFromReferrals]);

  return (
    <div className="flex w-fit items-center rounded-lg border border-rentality-star-point px-3 py-2 font-['Montserrat',Arial,sans-serif]">
      <Image src={icStarPointsWhite} alt="" className="mr-1 h-[22px]" />
      <p>
        Your Balance <span className="text-rentality-secondary">{points}</span> points
      </p>
    </div>
  );
}

export default UserBalance;
