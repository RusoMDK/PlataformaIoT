// components/layout/WizardLayout.jsx

export default function WizardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 dark:from-darkBg dark:to-darkSurface px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white dark:bg-darkSurface rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {children}
      </div>
    </div>
  );
}
