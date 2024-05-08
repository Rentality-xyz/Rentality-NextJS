import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import translation from "../../public/locales/en/translation.json";

const resources = {
  en: {
    translation,
  },
};
i18n
  .use(initReactI18next)
  .use(Backend)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });
export type TFunction = (key: string, options?: { [key: string]: any }) => string;

export default i18n;
