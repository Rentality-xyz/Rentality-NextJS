import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";

export default function LegalContent() {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle title={t("legal.title")} />
    </>
  );
}
