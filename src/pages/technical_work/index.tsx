import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import carLoadingDesktop from "@/images/car_404.png";
import React from "react";

function TechnicalWork() {

  const { t } = useTranslation();

  return (
      <div className="flex w-screen h-screen flex-col font-['Montserrat',Arial,sans-serif] content-center justify-center items-center gap-6" >
        <p className="text-2xl">{t("common.info.temporarily_unavailable")}</p>
        <p className="text-rentality-secondary text-center">{t("common.info.new_functionality_deploy")}</p>
        <Image src={carLoadingDesktop} alt="" className="w-[600px] hidden sm:block" />
      </div>
  );
}

export default TechnicalWork;