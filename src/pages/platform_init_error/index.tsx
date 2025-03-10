import React, { ReactElement } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import RntButton from "@/components/common/rntButton";
import { RntDialogsProvider, useRntDialogs } from "@/contexts/rntDialogsContext";
import { Err, Ok } from "@/model/utils/result";
import axios, { AxiosResponse } from "axios";
import { RequestBody } from "../api/submitUserError";
import { logger } from "@/utils/logger";
import UserErrorDescription from "@/components/dialogs/UserErrorDescription";

function PlatformInitError() {
  const { showCustomDialog, hideDialogs } = useRntDialogs();
  const { t } = useTranslation();

  async function submitErrorForm(userDescription: string) {
    const data: RequestBody = { userDescription, lastLogs: logger.getLastStoredLogs() };

    const response: AxiosResponse = await axios.post("/api/submitUserError", data);
    if (response.status !== 200) {
      logger.error("User error description was not posted: " + response.status + " with data " + response.data);
      return Err(new Error("User error description error"));
    }

    return Ok(true);
  }

  function handleDescribeClick() {
    showCustomDialog(<UserErrorDescription onSubmit={submitErrorForm} onCancel={hideDialogs} />);
  }

  return (
    <div className="flex h-screen w-full flex-col content-center items-center justify-center gap-6">
      <p className="text-2xl font-bold">{t("common.info.something_went_wrong")}</p>
      <p className="whitespace-pre-line text-center text-xl">{t("common.info.platform_init_error")}</p>
      <p className="text-lg">{t("common.info.try_later_or_describe_problem")}</p>
      <RntButton className="w-72" onClick={handleDescribeClick}>
        {t("common.info.describe_what_happens")}
      </RntButton>
      <p className="text-rentality-secondary">{t("common.info.we_appreciate_your_patience")}</p>
      <Image src="/images/car_404.png" alt="" className="hidden w-[600px] sm:block" width={1000} height={1000} />
    </div>
  );
}

PlatformInitError.allowAnonymousAccess = true;
PlatformInitError.getLayout = function getLayout(page: ReactElement) {
  return <RntDialogsProvider>{page}</RntDialogsProvider>;
};

export default PlatformInitError;
