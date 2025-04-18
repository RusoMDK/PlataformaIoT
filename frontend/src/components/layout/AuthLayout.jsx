// components/layout/AuthLayout.jsx

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-darkBg p-4">
      <div className="w-full max-w-md bg-white dark:bg-darkSurface p-6 rounded-xl shadow-md">
        {children}
      </div>
    </div>
  );
}
