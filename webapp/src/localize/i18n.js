import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es_translation from "./es.json";
import en_translation from "./en.json";

const resources = {
    es: { translation: es_translation },
    en: { translation: en_translation }
};

const savedLanguage = localStorage.getItem('language') || 'en'; // Si no hay idioma guardado, usa 'en'

i18n
  .use(initReactI18next) // Integrate i18next with React
  .init({
    resources, // Loaded translations
    lng: savedLanguage, // Usa el idioma guardado o inglés
    interpolation: {
      escapeValue: false // React ya escapa valores
    },
    fallbackLng: "en" // Lenguaje de respaldo si el actual no existe
  });

// Cada vez que cambies el idioma, también puedes actualizar el localStorage así:
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;