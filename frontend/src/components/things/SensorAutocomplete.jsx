// SensorAutocomplete.jsx
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { obtenerBibliotecaSensores } from '../../services/sensoresBiblioteca';

export default function SensorAutocomplete({ value = '', onSelect, onInputChange }) {
  const [query, setQuery] = useState(value);
  const [resultados, setResultados] = useState([]);
  const [todo, setTodo] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const fetchSensores = async () => {
      try {
        const lista = await obtenerBibliotecaSensores();
        setTodo(lista);
      } catch (err) {
        console.error('❌ Error cargando sensores:', err);
      }
    };
    fetchSensores();
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    const filtrados = todo.filter(s => s.nombre.toLowerCase().includes(q));
    setResultados(filtrados.slice(0, 10));
    setMostrarResultados(true);
    setHighlightedIndex(-1);
  }, [query, todo]);

  const seleccionar = sensor => {
    setQuery(sensor.nombre);
    onSelect(sensor);
    onInputChange(sensor.nombre);
    setTimeout(() => {
      setResultados([]);
      setMostrarResultados(false);
      setHighlightedIndex(-1);
    }, 0);
  };

  const handleChange = e => {
    const val = e.target.value;
    setQuery(val);
    onInputChange(val);
  };

  const handleKeyDown = e => {
    if (!mostrarResultados || resultados.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % resultados.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev === -1 ? resultados.length - 1 : (prev - 1 + resultados.length) % resultados.length
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      seleccionar(resultados[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setResultados([]);
      setMostrarResultados(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 border rounded px-3 py-2 bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border">
        <Search size={16} className="text-gray-400 dark:text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar sensor…"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-sm text-light-text dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {mostrarResultados && resultados.length > 0 && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded border shadow-sm bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border">
          {resultados.map((sensor, i) => (
            <div
              key={i}
              onMouseDown={() => seleccionar(sensor)}
              className={`px-3 py-2 text-sm cursor-pointer transition ${
                highlightedIndex === i
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <strong className="text-light-text dark:text-white">{sensor.nombre}</strong>{' '}
              <span className="text-muted dark:text-gray-400">
                ({sensor.tipo}, {sensor.unidad})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
