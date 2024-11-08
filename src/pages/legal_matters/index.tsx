import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  LEGAL_CANCELLATION_NAME,
  LEGAL_PRIVACY_NAME,
  LEGAL_PROHIBITEDUSES_NAME,
  LEGAL_TERMS_NAME,
} from "@/utils/constants";

enum ELegalMatters {
  TERMS = LEGAL_TERMS_NAME,
  CANCELLATION = LEGAL_CANCELLATION_NAME,
  PROHIBITEDUSES = LEGAL_PROHIBITEDUSES_NAME,
  PRIVACY = LEGAL_PRIVACY_NAME,
}

export default function LegalContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ELegalMatters>(ELegalMatters.TERMS);

  // Извлечение значения параметра `tab` из URL
  useEffect(() => {
    if (router.query.tab) {
      const tab = router.query.tab.toString().toUpperCase();
      if (Object.values(ELegalMatters).includes(tab as ELegalMatters)) {
        setActiveTab(tab as ELegalMatters);
      }
    }
  }, [router.query.tab]);

  const classTabs = "m-1 max-md:mt-4 md:m-7";
  const classTabsItems = "flex lg:mb-4";
  const classTabsItem =
    "flex text-sm lg:text-base text-center justify-center items-center font-['Montserrat',Arial,sans-serif] sm:mr-6";
  const classTabsBlock = "pl-1 pr-1 pb-1 pt-5 md:p-5";
  const classSelectedTab = "text-[#5CF4E8]";

  const renderContent = () => {
    switch (activeTab) {
      case ELegalMatters.TERMS:
        return <iframe src="/legal_matters/legal_terms.html" className="mx-auto h-[740px] w-full bg-white py-8" />;
      case ELegalMatters.CANCELLATION:
        return (
          <iframe src="/legal_matters/legal_cancellation.html" className="mx-auto h-[740px] w-full bg-white py-8" />
        );
      case ELegalMatters.PROHIBITEDUSES:
        return <iframe src="/legal_matters/legal_prohibited.html" className="mx-auto h-[740px] w-full bg-white py-8" />;
      case ELegalMatters.PRIVACY:
        return <iframe src="/legal_matters/legal_privacy.html" className="mx-auto h-[740px] w-full bg-white py-8" />;
      default:
        return null;
    }
  };

  return (
    <>
      <PageTitle title={t("legal.title")} />
      <div className={`mx-auto ${classTabs} text-white`} id="main-legal-matters-page">
        <nav className={classTabsItems}>
          <a
            href="#"
            className={`${classTabsItem} ${activeTab === ELegalMatters.TERMS ? classSelectedTab : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(ELegalMatters.TERMS);
            }}
          >
            Terms of service
          </a>
          <a
            href="#"
            className={`${classTabsItem} ${activeTab === ELegalMatters.CANCELLATION ? classSelectedTab : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(ELegalMatters.CANCELLATION);
            }}
          >
            Cancellation policy
          </a>
          <a
            href="#"
            className={`${classTabsItem} ${activeTab === ELegalMatters.PROHIBITEDUSES ? classSelectedTab : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(ELegalMatters.PROHIBITEDUSES);
            }}
          >
            Prohibited uses
          </a>
          <a
            href="#"
            className={`${classTabsItem} ${activeTab === ELegalMatters.PRIVACY ? classSelectedTab : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(ELegalMatters.PRIVACY);
            }}
          >
            Privacy policy
          </a>
        </nav>
        <div className={classTabsBlock}>{renderContent()}</div>
      </div>
    </>
  );
}
