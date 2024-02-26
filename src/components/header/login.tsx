import RntButton from "../common/rntButton";
import { useUserInfo } from "@/contexts/userInfoContext";
import { formatAddress } from "@/utils/addressFormatters";
import { Avatar } from "@mui/material";
import { isEmpty } from "@/utils/string";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ElementRef, memo, useEffect, useRef, useState } from "react";
import { assertIsNode } from "@/utils/react";

function Login() {
  const { connectWallet, login, ready, authenticated, logout } = usePrivy();
  const userInfo = useUserInfo();
  const { wallets } = useWallets();
  const [isShowMenu, setIsShowMenu] = useState(false);
  const loginWrapperRef = useRef<ElementRef<"div">>(null);

  const userFullName = `${userInfo?.firstName ?? ""} ${userInfo?.lastName ?? ""}`;
  const userInitials =
    !isEmpty(userInfo?.firstName) || !isEmpty(userInfo?.lastName)
      ? `${userInfo?.firstName?.slice(0, 1)?.toUpperCase() ?? ""}${
          userInfo?.lastName?.slice(0, 1)?.toUpperCase() ?? ""
        }`
      : null;

  useEffect(() => {
    window.addEventListener("scroll", handleOnScroll, true);
    window.addEventListener("click", handleOnOutsideClick);

    return () => {
      window.removeEventListener("scroll", handleOnScroll, true);
      window.removeEventListener("click", handleOnOutsideClick);
    };
  }, []);

  const handleOnScroll = (event: Event) => {
    if (event.target === document || event.target === document.documentElement || event.target === document.body) {
      setIsShowMenu(false);
    }
  };

  const handleOnOutsideClick = (event: MouseEvent) => {
    assertIsNode(event.target);
    if (loginWrapperRef.current?.contains(event.target)) return;
    setIsShowMenu(false);
  };

  if (!ready) return <></>;

  if (!authenticated)
    return (
      <RntButton className="w-28 sm:w-48 h-10 text-sm sm:text-base" onClick={login}>
        Login
      </RntButton>
    );

  if (wallets.length === 0)
    return (
      <RntButton className="w-28 sm:w-48 h-10 text-sm sm:text-base" onClick={connectWallet}>
        Connect
      </RntButton>
    );

  return (
    <div
      className="flex flex-row gap-4 ml-2 xl:ml-16 items-center cursor-pointer relative"
      ref={loginWrapperRef}
      onClick={async () => {
        setIsShowMenu((prev) => {
          return !prev;
        });
      }}
    >
      <div className=" flex-col hidden xl:flex">
        <div>{userFullName}</div>
        <div className="text-sm">{formatAddress(userInfo?.address ?? "")}</div>
      </div>
      <Avatar className="w-20 h-20" alt={userFullName} src={userInfo?.profilePhotoUrl}>
        {userInitials}
      </Avatar>
      {isShowMenu && (
        <div className="absolute p-4 top-[5.25rem] left-auto right-0 z-50 bg-[#1E1E30] rounded-xl border-2 border-[#373737]">
          <RntButton className="w-28 sm:w-48 h-10 text-sm sm:text-base" onClick={logout}>
            Logout
          </RntButton>
        </div>
      )}
    </div>
  );
}

export default memo(Login);
