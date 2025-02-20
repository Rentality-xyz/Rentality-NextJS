import Image from "next/image";
import carLoading from "@/images/car_loading.png";
import logoBaseWhite from "@/images/logo_base_white.png";
import RntButton from "@/components/common/rntButton";
import Link from "next/link";
import carLoadingDesktop from "@/images/car_loading_desktop.png";
import carLoadingDesktopLong from "@/images/car_404.png";
import React from "react";
import { useTranslation } from "react-i18next";

function Rentality404() {

  const { t } = useTranslation();

  return (
      <div className="flex w-full h-full flex-col font-['Montserrat',Arial,sans-serif] gap-6 items-center justify-center" >
        <p className="text-xl">{`404 | ${t("common.info.page_not_found")}`}</p>
        <Link className="text-rentality-secondary" href="/guest/search" target="_self">
          <span>{t("common.info.back_to_car_search")}</span>
        </Link>
        <Image src={carLoadingDesktopLong} alt="" className="w-[600px] hidden sm:block" />
      </div>
  );
}

export default Rentality404;