import Link from "next/link";
import { useRef } from "react";
import useEtherProvider from "@/hooks/useEtherProvider";
import RntButton from "../common/rntButton";
import { useUserInfo } from "@/contexts/userInfoContext";
import { useRentality } from "@/contexts/rentalityContext";
import { formatAddress } from "@/utils/addressFormatters";
import { Avatar } from "@mui/material";
import { isEmpty } from "@/utils/string";
import { IdentityButton, ButtonMode } from "@civic/ethereum-gateway-react";

type Props = {
  accountType: string;
};

export default function Header({ accountType }: Props) {
  // const [userConnected, userWeb3Address, formatAddress, connectMetaMask] =
  //   useEtherProvider();
  const rentalityInfo = useRentality();
  const userInfo = useUserInfo();
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  accountType = accountType ?? "Host";
  const isHost = accountType === "Host";

  function toggleBurgerMenu(): void {
    if (burgerMenuRef.current == null) return;

    burgerMenuRef.current.classList.toggle("change");
  }

  return (
    <header className="bg-rentality-bg-main">
      <div className="flex flex-row w-full px-8 py-2 min-h-[7rem] justify-between">
        <div className="flex flex-row mr-16 items-center">
          <div className="font-bold text-3xl">{accountType} account</div>
        </div>
        <div className="flex flex-row items-center">
          <div className="flex flex-row mr-16">
            {/* <span>Guest (</span>
          <input type="checkbox"></input>
          <span>) Host</span> */}
            {isHost ? (
              <Link href="/guest">
                <RntButton className="w-48 h-10">Switch to Guest</RntButton>
              </Link>
            ) : (
              <Link href="/host">
                <RntButton className="w-48 h-10">Switch to Host</RntButton>
              </Link>
            )}
          </div>
          <IdentityButton mode={ButtonMode.LIGHT} />
          {rentalityInfo?.isWalletConnected ? (
            <div className="flex flex-row gap-4 ml-16 items-center">
              <div className=" flex-col hidden lg:flex">
                <div>
                  {userInfo.firstName} {userInfo.lastName}
                </div>
                <div className="text-sm">
                  {formatAddress(rentalityInfo?.walletAddress)}
                </div>
              </div>
              <Avatar
                alt={`${userInfo.firstName} ${userInfo.lastName}`}
                src={userInfo.profilePhotoUrl}
                sx={{ width: "5rem", height: "5rem" }}
              >
                {!isEmpty(userInfo.firstName) || !isEmpty(userInfo.lastName)
                  ? userInfo.firstName?.slice(0, 1).toUpperCase() +
                    userInfo.lastName?.slice(0, 1).toUpperCase()
                  : null}
              </Avatar>
            </div>
          ) : (
            <RntButton
              className="w-40 h-10 text-md"
              onClick={() => {
                rentalityInfo?.connectWallet();
              }}
            >
              Connect MetaMask
            </RntButton>
          )}
        </div>
      </div>
    </header>
  );
}
