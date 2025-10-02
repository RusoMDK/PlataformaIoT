// src/components/ui/BackButton.jsx
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Button from './Button';

export default function BackButton({
  fallback = '/',
  label = 'Volver',
  className = '',
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Si hay historial real, volvemos; si no, vamos al fallback
    if (window.history?.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className={className}
      aria-label={label}
      title={label}
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      {label}
    </Button>
  );
}
