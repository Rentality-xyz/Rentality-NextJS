import { useUserInfo } from "@/contexts/userInfoContext";
import { memo, useEffect } from "react";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";
import { useTranslation } from "react-i18next";
import { Avatar as MuiAvatar } from "@mui/material";
import { isEmpty } from "@/utils/string";
import { Avatar, Identity, Badge, Name, Address } from "@coinbase/onchainkit/identity";
import { useAuth } from "@/contexts/auth/authContext";
import RntButton from "../common/rntButton";
import { env } from "@/utils/env";
import { padRight } from "web3-utils";
import { padding } from "@mui/system";

function LoginBase() {
  const { isLoadingAuth, isAuthenticated, login } = useAuth();
  const userInfo = useUserInfo();
  const { showDialog, hideDialogs } = useRntDialogs();
  const { t } = useTranslation();

  const userFullName = `${userInfo?.firstName ?? ""} ${userInfo?.lastName ?? ""}`;
  const userInitials =
    !isEmpty(userInfo?.firstName) || !isEmpty(userInfo?.lastName)
      ? `${userInfo?.firstName?.slice(0, 1)?.toUpperCase() ?? ""}${
          userInfo?.lastName?.slice(0, 1)?.toUpperCase() ?? ""
        }`
      : null;

  if (!isLoadingAuth && !isAuthenticated)
    return (
      <RntButton className="h-10 w-14 text-[10px] max-sm:my-1 max-sm:mr-1 sm:w-48 sm:text-base" onClick={login}>
        {t("common.info.login")}
      </RntButton>
    );

  if (userInfo === undefined)
    return (
      <div className="flex flex-row-reverse items-center gap-4 bg-transparent py-1 lg:space-x-4 lg:px-2">
        <div className="overflow-hidden">
          <MuiAvatar className="h-10 w-10 lg:h-12 lg:w-12" alt="" src="" />
        </div>
        <div className="w-[12ch]"></div>
      </div>
    );

  return (
    <Identity
      className="cursor-pointer bg-transparent lg:flex-row-reverse xl:gap-4"
      address={userInfo.address as `0x${string}`}
      schemaId={env.NEXT_PUBLIC_COINBASE_SCHEMA_ID as `0x${string}`}
    >
      <Name className="hidden text-white xl:flex" />
      {/*<Address className="hidden text-white xl:flex" />*/}
      <Avatar
        className="h-10 w-10 lg:h-12 lg:w-12"
        loadingComponent={
          <MuiAvatar className="h-10 w-10 lg:h-12 lg:w-12" alt={userFullName} src={userInfo?.profilePhotoUrl}>
            {userInitials}
          </MuiAvatar>
        }
        defaultComponent={
          <MuiAvatar className="h-10 w-10 lg:h-12 lg:w-12" alt={userFullName} src={userInfo?.profilePhotoUrl}>
            {userInitials}
          </MuiAvatar>
        }
      >
        <Badge />
      </Avatar>
    </Identity>
  );
}

export default memo(LoginBase);
