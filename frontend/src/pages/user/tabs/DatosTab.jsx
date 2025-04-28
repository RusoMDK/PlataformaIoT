// src/pages/user/tabs/DatosTab.jsx
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Download, Database } from 'lucide-react';
import { toast } from 'sonner';
import { exportarDatosUsuario } from '../../../api/apiUsuarios'; // 🔥 API real

export default function DatosTab() {
  const handleExport = async () => {
    try {
      const blob = await exportarDatosUsuario();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'mis-datos-usuario.json'; // nombre del archivo
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('✅ Datos descargados correctamente');
    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      toast.error('Error al descargar tus datos');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Tus datos personales
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Puedes descargar una copia completa de tus datos almacenados en la plataforma.
          </p>

          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-1" />
            Descargar datos personales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
