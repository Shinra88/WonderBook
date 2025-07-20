import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const languages = [
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'zh', label: '🇨🇳 中文 (Chinese)' },
  { code: 'ja', label: '🇯🇵 日本語 (Japanese)' },
  { code: 'ko', label: '🇰🇷 한국어 (Korean)' },
  { code: 'ru', label: '🇷🇺 Русский (Russian)' },
  { code: 'ar', label: '🇸🇦 العربية (Arabic)' },
];


export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language.split('-')[0];

  return (
    <select
      onChange={handleLanguageChange}
      value={currentLang}
      className={styles.select}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}