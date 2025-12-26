import 'i18next';
import enJSON from '../locales/en/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enJSON; // 以英文文件为模板推断类型
    };
  }
}