import RntButton from "@/components/common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import useCookieConsent from "@/hooks/useCookieConsent";
import { useEffect } from "react";
import { analyticsPromise } from "@/utils/firebase";
import { initHotjar } from "@/utils/init";
import { initFacebookPixel } from "@/utils/init";

export default function CookieBanner() {
  const { status, accept, decline } = useCookieConsent();
  const { t } = useTranslation();

  useEffect(() => {
    if (status === true) {
      void analyticsPromise;
      initHotjar();
      initFacebookPixel()
    }
  }, [status]);

  if (status !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-rentality-bg-left-sidebar text-rnt-temp-main-text px-4 py-5 sm:px-8 shadow-md border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-sm leading-relaxed">
        <p className="max-w-3xl">
          {t("cookie_banner.explanation")}
          <Link href="/guest/legal" className="underline hover:text-rnt-temp-main-text transition">{t("cookie_banner.learn_more")}</Link>.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 sm:w-auto w-full">
          <RntButton className="w-full sm:w-[200px]" onClick={accept}>{t("cookie_banner.accept")}</RntButton>
          <RntButtonTransparent className="w-full sm:w-[200px]" onClick={decline}>{t("cookie_banner.decline")}</RntButtonTransparent>
        </div>
      </div>
    </div>
  );

}
