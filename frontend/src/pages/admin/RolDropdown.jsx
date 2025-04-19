// src/components/admin/RolDropdown.jsx
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

export default function RolDropdown({ fila, onChange, labelAdmin, labelUser }) {
  const [open, setOpen] = useState(false);

  return (
    <Menu as="div" className="relative inline-block text-left w-32">
      <div>
        <Menu.Button
          onClick={() => setOpen(!open)}
          className="inline-flex justify-between items-center w-full rounded border px-3 py-1 text-sm bg-white text-gray-800 border-gray-300 hover:bg-gray-50 dark:bg-dark-surface dark:text-white dark:border-dark-border dark:hover:bg-dark-muted transition"
        >
          {fila.rol === 'admin' ? labelAdmin : labelUser}
          <ChevronDown
            size={14}
            className={`ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        show={open}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-50 mt-1 w-full origin-top-right rounded-md bg-white dark:bg-dark-surface shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {[
            { value: 'usuario', label: labelUser },
            { value: 'admin', label: labelAdmin },
          ].map(opt => (
            <Menu.Item key={opt.value}>
              {({ active }) => (
                <button
                  onClick={() => {
                    onChange(fila._id, opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left ${
                    active
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-white'
                      : 'text-gray-700 dark:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
