import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

function Rentality404() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 font-['Montserrat',Arial,sans-serif]">
      <p className="text-xl">{`404 | ${t("common.info.page_not_found")}`}</p>
      <Link className="text-rentality-secondary" href="/guest/search" target="_self">
        <span>{t("common.info.back_to_car_search")}</span>
      </Link>
      <Image src="/images/car_404.png" alt="" className="hidden w-[600px] sm:block" width={1000} height={1000} />
    </div>
  );
}

Rentality404.allowAnonymousAccess = true;

export default Rentality404;
