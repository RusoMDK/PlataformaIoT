import { Twitter, Github, Linkedin, Mail, HelpCircle, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 py-5 px-6 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm gap-4">
        {/* Texto */}
        <div className="text-center md:text-left">
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold text-blue-600 dark:text-darkAccent">IoT PLATFORM</span> –
          Todos los derechos reservados.
        </div>

        {/* Enlaces útiles */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <a
            href="/ayuda"
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-darkAccent transition"
          >
            <HelpCircle size={16} />
            Ayuda
          </a>
          <a
            href="#"
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-darkAccent transition"
          >
            <FileText size={16} />
            Términos
          </a>
          <a
            href="mailto:soporte@iot.com"
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-darkAccent transition"
          >
            <Mail size={16} />
            Contacto
          </a>
        </div>

        {/* Redes sociales */}
        <div className="flex gap-4 text-gray-500 dark:text-gray-400">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-darkAccent transition"
          >
            <Twitter size={18} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-darkAccent transition"
          >
            <Github size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-darkAccent transition"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
