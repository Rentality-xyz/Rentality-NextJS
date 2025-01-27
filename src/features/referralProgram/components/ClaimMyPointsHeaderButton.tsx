//TODO translate
import Image from "next/image";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import React from "react";
import useOwnReferralPoints from "../hooks/useOwnReferralPoints";

export default function ClaimMyPointsHeaderButton() {
  const { isPending, readyToClaim, claimMyPoints } = useOwnReferralPoints();

  return (
    <button
      className="ml-[116px] hidden items-center rounded-md border border-gray-500 px-4 py-2 hover:border-gray-400 xl:flex"
      disabled={readyToClaim === 0}
      onClick={() => claimMyPoints()}
    >
      <Image src={icStarPointsYellow} alt="" className="mr-2 h-7 w-7" />
      <div className="ml-0.5 flex">
        {isPending ? (
          <>Loading...</>
        ) : (
          <>
            Claim <span className="px-1 font-semibold text-rentality-secondary">{readyToClaim.toString()}</span> points
          </>
        )}
      </div>
    </button>
  );
}
