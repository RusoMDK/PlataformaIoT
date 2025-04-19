// src/components/ui/MultiSelect.jsx
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MultiSelect({ values, onChange, options = [], label, className }) {
  const toggleValue = item => {
    const exists = values.find(v => v.value === item.value);
    if (exists) {
      onChange(values.filter(v => v.value !== item.value));
    } else {
      onChange([...values, item]);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-light-text dark:text-white">
          {label}
        </label>
      )}

      <Listbox as="div" value={values} multiple>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full cursor-default rounded-xl border px-4 py-2 pr-10 text-left shadow-sm sm:text-sm',
              'bg-light-surface border-light-border text-light-text',
              'dark:bg-dark-bg dark:text-white dark:border-dark-border',
              'focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark'
            )}
          >
            <span className="block truncate">
              {values.length > 0 ? values.map(v => v.label).join(', ') : 'Seleccionar...'}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <ChevronUpDown className="h-4 w-4 text-muted dark:text-dark-muted" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={cn(
                'absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
                'dark:bg-dark-surface'
              )}
            >
              {options.map((opt, idx) => {
                const selected = values.find(v => v.value === opt.value);
                return (
                  <Listbox.Option key={idx} as={Fragment} value={opt}>
                    {({ active }) => (
                      <li
                        className={cn(
                          'cursor-pointer select-none relative py-2 px-4',
                          active
                            ? 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-white'
                            : 'text-gray-700 dark:text-white'
                        )}
                        onClick={() => toggleValue(opt)}
                      >
                        <span className={cn('block truncate', selected && 'font-semibold')}>
                          {opt.label}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 right-3 flex items-center">
                            <Check className="h-4 w-4 text-primary dark:text-primary-dark" />
                          </span>
                        )}
                      </li>
                    )}
                  </Listbox.Option>
                );
              })}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
