import { useTranslation } from "react-i18next";
import RntButton from "@/components/common/rntButton";
import React from "react";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { base, baseSepolia } from "wagmi/chains";
import Image from "next/image";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { logger } from "@/utils/logger";

type NetworkBaseGuardProps = {
  allowedChains?: number[];
  children: React.ReactNode;
};

function NetworkBaseGuard({ allowedChains = [base.id, baseSepolia.id], children }: NetworkBaseGuardProps) {

  const { t } = useTranslation();
  const { showError } = useRntSnackbars();
  const ethereumInfo = useEthereum();
  const chainId = ethereumInfo?.chainId;

  const isAllowed = chainId != null && allowedChains.includes(chainId);

  async function handleChangeClick() {
    try {
      await ethereumInfo?.requestChainIdChange(base.id);
    } catch (err) {
      logger.error("NetworkBaseGuard requestChainIdChange failed:", err);
      showError(t("booked.network_base_guard.change_network_error"));
    }
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="ml-4 mt-6 flex w-fit flex-col font-['Montserrat',Arial,sans-serif]">
        <Image src={"/images/car_loading.png"} width={500} height={250} alt="" className="sm:hidden" />
        <div className="mt-6 flex items-center max-sm:justify-center">
          <Image src={"/images/icons/logo_base_white.png"} width={1200} height={1200} alt="" className="mr-2 w-5" />
          <p className="text-xl">{t("common.network_base_guard.it_works_only_on_base")}</p>
        </div>
        <p className="mt-6 text-xl max-sm:text-center">{t("common.network_base_guard.want_to_change")}</p>
        <div className="mt-6 flex flex-col max-sm:items-center max-sm:justify-center">
          <RntButton className="w-56" onClick={handleChangeClick}>
            {t("common.network_base_guard.change_network")}
          </RntButton>
        </div>
      </div>
      <Image src={"/images/car_loading_desktop.png"} width={500} height={448} alt="" className="mt-6 hidden sm:block" />
    </>
  );
}

export default NetworkBaseGuard;
