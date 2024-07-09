import { useUserInfo } from "@/contexts/userInfoContext";
import { usePrivy } from "@privy-io/react-auth";
import { memo, useEffect } from "react";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";
import { useTranslation } from "react-i18next";
import { Avatar as MuiAvatar } from "@mui/material";
import { isEmpty } from "@/utils/string";
// @ts-ignore
import { Avatar, Identity, Badge, Name, Address } from "@coinbase/onchainkit/identity";

function LoginBase() {
  const { login, ready, authenticated } = usePrivy();
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
    if (!ready) return;

    if (!authenticated) {
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
  }, [ready, authenticated]);

  if (userInfo === undefined)
    return (
      <div className="flex items-center space-x-4 px-2 py-1 bg-transparent flex-row-reverse gap-4">
        <div className="overflow-hidden">
          <MuiAvatar className="w-20 h-20" alt="" src="" />
        </div>
        <div className="w-[12ch]"></div>
      </div>
    );

  return (
    <Identity
      className="bg-transparent flex-row-reverse gap-4"
      address={userInfo.address}
      schemaId={process.env.NEXT_PUBLIC_COINBASE_SCHEMA_ID ?? ""}
    >
      <Name className="text-white" />
      <Address className="text-white" />
      <Avatar
        className="h-20 w-20"
        loadingComponent={
          <MuiAvatar className="w-20 h-20" alt={userFullName} src={userInfo?.profilePhotoUrl}>
            {userInitials}
          </MuiAvatar>
        }
        defaultComponent={
          <MuiAvatar className="w-20 h-20" alt={userFullName} src={userInfo?.profilePhotoUrl}>
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
