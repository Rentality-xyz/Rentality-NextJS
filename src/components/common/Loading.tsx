import React from "react";
import { useTranslation } from "react-i18next";

function Loading() {
  const { t } = useTranslation();
  return (
    <div className="mt-5 pl-4 flex max-w-screen-xl flex-wrap justify-between text-center">{t("common.info.loading")}</div>
  );
}

export default Loading;
