import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 引入翻译文件
import enJSON from './locales/en/translation.json';
import zhJSON from './locales/zh/translation.json';

// 定义资源结构
const resources = {
  en: { translation: enJSON },
  zh: { translation: zhJSON },
};

i18n
  .use(LanguageDetector) // 自动检测浏览器语言
  .use(initReactI18next) // 绑定 React
  .init({
    resources,
    fallbackLng: 'en', // 默认语言
    interpolation: {
      escapeValue: false, // React 默认已经防止 XSS，不需要转义
    },
  });

export default i18n;