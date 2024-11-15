import { useTranslation } from "react-i18next";
import RntButtonTransparent from "../common/rntButtonTransparent";

export default function AddHostInsurance() {
  const { t } = useTranslation();

  return <RntButtonTransparent>{t("insurance.add_insurance")}</RntButtonTransparent>;
}
