import RntButton from "../common/rntButton";
import { useUserInfo } from "@/contexts/userInfoContext";
import { formatAddress } from "@/utils/addressFormatters";
import { Avatar } from "@mui/material";
import { isEmpty } from "@/utils/string";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ElementRef, memo, useEffect, useRef, useState } from "react";
import { assertIsNode } from "@/utils/react";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

function Login() {
  const { connectWallet, login, ready, authenticated, logout } = usePrivy();
  const userInfo = useUserInfo();
  const { wallets } = useWallets();
  const [isShowMenu, setIsShowMenu] = useState(false);
  const loginWrapperRef = useRef<ElementRef<"div">>(null);
  const { showDialog, hideDialogs } = useRntDialogs();
  const router = useRouter();

  const userFullName = `${userInfo?.firstName ?? ""} ${userInfo?.lastName ?? ""}`;
  const userInitials =
    !isEmpty(userInfo?.firstName) || !isEmpty(userInfo?.lastName)
      ? `${userInfo?.firstName?.slice(0, 1)?.toUpperCase() ?? ""}${
          userInfo?.lastName?.slice(0, 1)?.toUpperCase() ?? ""
        }`
      : null;
  const userAddressOrEnsName = !isEmpty(userInfo?.ensName) ? userInfo?.ensName : formatAddress(userInfo?.address ?? "");

  useEffect(() => {
    window.addEventListener("scroll", handleOnScroll, true);
    window.addEventListener("click", handleOnOutsideClick);

    return () => {
      window.removeEventListener("scroll", handleOnScroll, true);
      window.removeEventListener("click", handleOnOutsideClick);
    };
  }, []);

  const { t } = useTranslation();
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

  const handleLogout = async () => {
    await logout();
    router.reload();
  };

  if (!ready) return <></>;

  if (!authenticated)
    return (
      <RntButton className="h-10 w-28 text-sm sm:w-48 sm:text-base" onClick={login}>
        {t("common.info.login")}
      </RntButton>
    );

  if (wallets.length === 0)
    return (
      <RntButton className="h-10 w-28 text-sm sm:w-48 sm:text-base" onClick={connectWallet}>
        {t("common.connect")}
      </RntButton>
    );

  return (
    <div
      className="relative ml-2 flex cursor-pointer flex-row items-center gap-4 xl:ml-16"
      ref={loginWrapperRef}
      onClick={async () => {
        setIsShowMenu((prev) => {
          return !prev;
        });
      }}
    >
      <div className="hidden flex-col xl:flex">
        <div>{userFullName}</div>
        <div className="text-sm">{userAddressOrEnsName}</div>
      </div>
      <Avatar className="h-20 w-20" alt={userFullName} src={userInfo?.profilePhotoUrl}>
        {userInitials}
      </Avatar>
      {isShowMenu && (
        <div className="absolute left-auto right-0 top-[5.25rem] z-50 rounded-xl border-2 border-[#373737] bg-[#1E1E30] p-4">
          <RntButton className="h-10 w-28 text-sm sm:w-48 sm:text-base" onClick={handleLogout}>
            {t("common.logout")}
          </RntButton>
        </div>
      )}
    </div>
  );
}

export default memo(Login);
