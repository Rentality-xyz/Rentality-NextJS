import { isEmpty } from "@/utils/string";
import React from "react";
import { useTranslation } from "react-i18next";

function Loading({ text }: { text?: string }) {
  const { t } = useTranslation();

  return (
    <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between pl-4 text-center">
      {!isEmpty(text) ? text : t("common.info.loading")}
    </div>
  );
}

export default Loading;
