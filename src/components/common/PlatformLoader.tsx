import Image from "next/image";
import React from "react";
import { useTranslation } from "react-i18next";

function PlatformLoader() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex max-w-md flex-col px-16">
        <Image className="w-max-[400px]" src="/platform_loader.gif" alt="Loading" width={1080} height={1080} />
        <p className="text-center text-2xl">
          <strong>{t("common.platform_loading")}</strong>
        </p>
      </div>
    </div>
  );
}

export default PlatformLoader;
