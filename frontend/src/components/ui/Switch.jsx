// src/components/ui/Switch.jsx
import { useState } from 'react';

export function Switch({ checked, onChange, disabled = false }) {
  const [internalChecked, setInternalChecked] = useState(checked || false);

  const handleToggle = () => {
    if (disabled) return;
    const newChecked = !internalChecked;
    setInternalChecked(newChecked);
    onChange?.(newChecked);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition ${
        internalChecked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition ${
          internalChecked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
