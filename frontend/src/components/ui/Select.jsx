// src/components/ui/Select.jsx
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Select({ value, onChange, options = [], label, className }) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-light-text dark:text-white">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full cursor-default rounded-xl border px-4 py-2 pr-10 text-left shadow-sm sm:text-sm',
              'bg-light-surface border-light-border text-light-text placeholder-muted',
              'dark:bg-dark-bg dark:text-white dark:border-dark-border dark:placeholder-dark-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark'
            )}
          >
            <span className="block truncate">{value?.label || 'Seleccionar'}</span>
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
              {options.map((opt, idx) => (
                <Listbox.Option
                  key={idx}
                  value={opt}
                  className={({ active }) =>
                    cn(
                      'relative cursor-pointer select-none py-2 px-4',
                      active
                        ? 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-white'
                        : 'text-gray-700 dark:text-white'
                    )
                  }
                >
                  {({ selected }) => (
                    <span className={cn('block truncate', selected && 'font-semibold')}>
                      {opt.label}
                      {selected && (
                        <span className="absolute inset-y-0 right-3 flex items-center">
                          <Check className="h-4 w-4 text-primary dark:text-primary-dark" />
                        </span>
                      )}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
