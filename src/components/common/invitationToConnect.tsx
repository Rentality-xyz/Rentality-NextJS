import { useTranslation } from "react-i18next";
import React from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth/authContext";
import RntButton from "@/components/common/rntButton";
import Link from "next/link";

export default function InvitationToConnect() {
  const { t } = useTranslation();
  const { login } = useAuth();

  function handleConnectClick() {
    login();
  }

  return (
    <>
      <div className="ml-4 mt-6 flex w-fit flex-col font-['Montserrat',Arial,sans-serif]">
        <p className="hidden text-2xl text-rentality-secondary sm:block">{t("common.info.welcome_to_web3")}</p>
        <Image src={"/images/car_loading.png"} width={500} height={250} alt="" className="sm:hidden" />
        <p className="mt-6 text-xl max-sm:text-center">Connect your crypto wallet for full Rentality functionality</p>
        <div className="mt-6 flex items-center max-sm:justify-center">
          <Image src={"/images/icons/logo_base_white.png"} width={1200} height={1200} alt="" className="mr-2 w-5" />
          <p>{t("common.info.we_on_base_network")}</p>
        </div>
        <div className="mt-6 flex flex-col max-sm:items-center max-sm:justify-center">
          <RntButton className="w-56" onClick={handleConnectClick}>
            {t("common.info.connect_wallet_now")}
          </RntButton>
          <Link className="mt-6 text-rentality-secondary" href="/guest/search" target="_self">
            <span>{t("common.info.back_to_car_search")}</span>
          </Link>
        </div>
      </div>
      <Image src={"/images/car_loading_desktop.png"} width={500} height={448} alt="" className="mt-6 hidden sm:block" />
    </>
  );
}
