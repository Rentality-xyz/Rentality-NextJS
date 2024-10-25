import { useTranslation } from "react-i18next";
import React from "react";
import Image from "next/image";
import carLoading from "@/images/car_loading.png";
import logoBaseWhite from "@/images/logo_base_white.png";
import { useAuth } from "@/contexts/auth/authContext";
import RntButton from "@/components/common/rntButton";
import { getImageForMenu } from "@/components/sideNavMenu/menuIcons";
import Link from "next/link";

export default function InvitationToConnect() {
  const { t } = useTranslation();
  const { login } = useAuth();

  function handleConnectClick() {
    login();
  }

  return (
    <div className="ml-4 mt-6 flex w-fit flex-col font-['Montserrat',Arial,sans-serif]">
      <p className="hidden text-3xl text-rentality-secondary sm:block">{t("common.info.welcome_to_web3")}</p>
      <Image src={carLoading} alt="" className="sm:hidden" />
      <p className="mt-6 text-2xl max-sm:text-center">
        Connect your crypto wallet for <br />
        full Rentality functionality
      </p>
      <div className="mt-6 flex items-center max-sm:justify-center">
        <Image src={logoBaseWhite} alt="" className="mr-2 w-7" />
        <p className="text-lg">{t("common.info.we_on_base_network")}</p>
      </div>
      <div className="mt-6 flex flex-col max-sm:items-center max-sm:justify-center">
        <RntButton className="md:w-48" onClick={handleConnectClick}>
          {t("common.info.connect_wallet_now")}
        </RntButton>
        <Link className="mt-6 text-lg text-rentality-secondary" href="/guest/search" target="_self">
          <span>{t("common.info.back_to_car_search")}</span>
        </Link>
      </div>
      <Image src={carLoading} alt="" className="mt-6 hidden sm:block" />
    </div>
  );
}
