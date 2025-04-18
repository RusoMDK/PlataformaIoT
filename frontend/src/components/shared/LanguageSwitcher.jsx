// components/shared/LanguageSwitcher.jsx
import i18n from 'i18next';

export default function LanguageSwitcher() {
  const cambiarIdioma = lng => {
    i18n.changeLanguage(lng);
  };

  return (
    <select
      onChange={e => cambiarIdioma(e.target.value)}
      className="text-sm px-2 py-1 border rounded bg-white dark:bg-darkBg dark:border-gray-600 dark:text-white"
      defaultValue={i18n.language}
    >
      <option value="es">ES</option>
      <option value="en">EN</option>
    </select>
  );
}
