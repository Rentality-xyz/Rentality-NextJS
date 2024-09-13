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
import {padRight} from "web3-utils";
import {padding} from "@mui/system";

function LoginBase() {
  const { isLoading, isAuthenticated, login } = useAuth();
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

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const action = (
        <>
          {DialogActions.Button(t("common.info.login"), () => {
            hideDialogs();
            login();
          })}
          {DialogActions.Cancel(hideDialogs)}
        </>
      );
      showDialog(t("common.info.connect_wallet"), action);
    }
  }, [isLoading, isAuthenticated]);

  if (!isLoading && !isAuthenticated)
    return (
      <RntButton className="h-10 w-28 text-sm sm:w-48 sm:text-base" onClick={login}>
        {t("common.info.login")}
      </RntButton>
    );

  if (userInfo === undefined)
    return (
      <div className="flex flex-row-reverse items-center gap-4 lg:space-x-4 bg-transparent lg:px-2 py-1">
        <div className="overflow-hidden">
          <MuiAvatar className="h-10 w-10 lg:h-12 lg:w-12" alt="" src="" />
        </div>
        <div className="w-[12ch]"></div>
      </div>
    );

  return (
    <Identity
      className="bg-transparent lg:flex-row-reverse xl:gap-4"
      address={userInfo.address as `0x${string}`}
      schemaId={env.NEXT_PUBLIC_COINBASE_SCHEMA_ID as `0x${string}`}
    >
      <Name className="hidden text-white xl:flex" />
      <Address className="hidden text-white xl:flex" />
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
