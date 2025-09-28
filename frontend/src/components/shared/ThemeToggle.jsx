// components/shared/ThemeToggle.jsx
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LABELS = {
  light: { icon: Sun,    title: 'Tema: Claro (clic para Oscuro)' },
  dark:  { icon: Moon,   title: 'Tema: Oscuro (clic para Sistema)' },
  system:{ icon: Monitor,title: 'Tema: Sistema (clic para Claro)' },
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const Icon = LABELS[theme]?.icon ?? Sun;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={LABELS[theme]?.title}
      title={LABELS[theme]?.title}
      className="
        relative inline-flex h-9 w-9 items-center justify-center 
        rounded-xl border border-light-border dark:border-dark-border
        bg-white/70 dark:bg-dark-surface/70
        shadow-sm hover:shadow transition
        hover:bg-white dark:hover:bg-dark-surface
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
      "
    >
      {/* halo animado muy sutil */}
      <span className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 hover:opacity-100 transition-opacity" />
      <Icon size={18} className="text-light-text dark:text-dark-text transition-colors" />
    </button>
  );
}
