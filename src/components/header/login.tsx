import RntButton from "../common/rntButton";
import { useUserInfo } from "@/contexts/userInfoContext";
import { formatAddress } from "@/utils/addressFormatters";
import { Avatar } from "@mui/material";
import { isEmpty } from "@/utils/string";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { memo } from "react";

function Login() {
  const { connectWallet, login, ready, authenticated, logout } = usePrivy();
  const userInfo = useUserInfo();
  const { wallets } = useWallets();

  const userFullName = `${userInfo?.firstName ?? ""} ${userInfo?.lastName ?? ""}`;
  const userInitials =
    !isEmpty(userInfo?.firstName) || !isEmpty(userInfo?.lastName)
      ? `${userInfo?.firstName?.slice(0, 1)?.toUpperCase() ?? ""}${
          userInfo?.lastName?.slice(0, 1)?.toUpperCase() ?? ""
        }`
      : null;

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
    <div className="flex flex-row gap-4 ml-2 xl:ml-16 items-center cursor-pointer relative">
      <div className=" flex-col hidden xl:flex">
        <div>{userFullName}</div>
        <div className="text-sm">{formatAddress(userInfo?.address ?? "")}</div>
      </div>
      <Avatar className="w-20 h-20" alt={userFullName} src={userInfo?.profilePhotoUrl}>
        {userInitials}
      </Avatar>
    </div>
  );
}

export default memo(Login);
