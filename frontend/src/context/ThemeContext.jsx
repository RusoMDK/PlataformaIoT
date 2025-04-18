import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoOscuro') === 'true';
    setModoOscuro(modoGuardado);
    document.documentElement.classList.toggle('dark', modoGuardado);
  }, []);

  const toggleModoOscuro = () => {
    const nuevoModo = !modoOscuro;
    setModoOscuro(nuevoModo);
    localStorage.setItem('modoOscuro', nuevoModo);
    document.documentElement.classList.toggle('dark', nuevoModo);
  };

  return (
    <ThemeContext.Provider value={{ modoOscuro, toggleModoOscuro }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
