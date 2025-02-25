import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

function TechnicalWork() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-screen flex-col content-center items-center justify-center gap-6 font-['Montserrat',Arial,sans-serif]">
      <p className="text-2xl">{t("common.info.temporarily_unavailable")}</p>
      <p className="text-center text-rentality-secondary">{t("common.info.new_functionality_deploy")}</p>
      <Image src="/images/car_404.png" alt="" className="hidden w-[600px] sm:block" width={1000} height={1000} />
    </div>
  );
}

TechnicalWork.allowAnonymousAccess = true;

export default TechnicalWork;
