//TODO translate
import Image from "next/image";
import React from "react";
import useFetchUserBalance from "../hooks/useFetchUserBalance";

function UserBalance() {
  const { data: balance } = useFetchUserBalance();

  return (
    <div className="flex w-fit items-center rounded-lg border border-rentality-star-point px-3 py-2 font-['Montserrat',Arial,sans-serif]">
      <Image src={"/images/icons/ic_star_points_white.svg"} width={27} height={26} alt="" className="mr-1 h-[22px]" />
      <p>
        Your Balance <span className="text-rentality-secondary">{balance}</span> points
      </p>
    </div>
  );
}

export default UserBalance;
