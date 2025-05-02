import React, { ReactElement } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import RntButton from "@/components/common/rntButton";
import { useRouter } from "next/navigation";

function PlatformInitOffline() {
  const { t } = useTranslation();
  const router = useRouter();

  function handleTryAgainClick() {
    router.refresh()
  }

  return (
    <div className="flex h-screen w-full flex-col content-center items-center justify-center gap-6">
      <p className="text-2xl font-bold text-center">{t("common.info.internet_troubles")}</p>
      <p className="text-lg text-center">{t("common.info.check_internet")}</p>
      <RntButton className="w-72" onClick={handleTryAgainClick}>
        {t("common.info.try_again")}
      </RntButton>
      <Image src="/images/car_404.png" alt="" className="w-[600px]" width={1000} height={1000} />
    </div>
  );
}

PlatformInitOffline.allowAnonymousAccess = true;

export default PlatformInitOffline;
