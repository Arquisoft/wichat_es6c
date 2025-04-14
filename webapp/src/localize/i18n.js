import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es_translation from "./es.json";
import en_translation from "./en.json";

const resources = {
    es: { translation: es_translation },
    en: { translation: en_translation }
};

i18n
  .use(initReactI18next) // Intregate i18next with React
  .init({
    resources, // Loaded translations
    lng: "en", // Default lenguage
    interpolation: {
      escapeValue: false // React already escapes values to prevent XSS attacks
    },
    fallbackLng: "en" // Fallback lenguage if the current lenguage is not available
  });


export default i18n;