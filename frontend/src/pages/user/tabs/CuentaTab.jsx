import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getPhonePrefixes } from '../../../utils/phonePrefixes'; // o donde la definas
import { Dialog, Transition } from '@headlessui/react';
import Cropper from 'react-easy-crop';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { toast } from 'sonner';
import {
  User as UserIcon,
  PencilLine,
  X,
  Save,
  Globe,
  HomeIcon,
  MapPin,
  Phone,
  Calendar,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', error => reject(error));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = Math.max(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/jpeg');
  });
}

export default function CuentaTab() {
  const { perfil, setPerfil, onSaveProfile } = useOutletContext();
  const [editando, setEditando] = useState(false);
  const [data, setData] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const fileInputRef = useRef();

  // Modal crop
  const [isCropOpen, setCropOpen] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    setData({
      primerNombre: perfil.primerNombre || '',
      segundoNombre: perfil.segundoNombre || '',
      primerApellido: perfil.primerApellido || '',
      segundoApellido: perfil.segundoApellido || '',
      apodo: perfil.apodo || '',
      genero: perfil.genero || 'otro',
      bio: perfil.bio || '',
      redes: { ...perfil.redes },
      website: perfil.redes?.website || '',
      phonePrefix: perfil.prefijoTelefono || '+1',
      phoneNumber: perfil.telefono?.split(' ')[1] || '',
      fechaNacimiento: perfil.fechaNacimiento
        ? new Date(perfil.fechaNacimiento).toISOString().slice(0, 10)
        : '',
      country: perfil.direccion?.pais || '',
      city: perfil.direccion?.ciudad || '',
      street: perfil.direccion?.calle || '',
      numero: perfil.direccion?.numero || '',
      postalCode: perfil.direccion?.codigoPostal || '',
      fotoPerfilFile: null,
    });
    setPreviewPhoto(null);
  }, [perfil]);

  const change = (key, value) => setData(d => ({ ...d, [key]: value }));

  const onSelectPhoto = e => {
    const file = e.target.files[0];
    if (file) {
      setRawImageUrl(URL.createObjectURL(file));
      setCropOpen(true);
    }
  };

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const applyCrop = async () => {
    try {
      const blob = await getCroppedImg(rawImageUrl, croppedAreaPixels);
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      setData(d => ({ ...d, fotoPerfilFile: file }));
      setPreviewPhoto(URL.createObjectURL(blob));
      setCropOpen(false);
    } catch {
      toast.error('❌ No se pudo recortar la imagen');
    }
  };

  const guardarPerfil = async () => {
    const form = new FormData();

    [
      'primerNombre',
      'segundoNombre',
      'primerApellido',
      'segundoApellido',
      'apodo',
      'genero',
      'bio',
      'website',
      'fechaNacimiento',
      'country',
      'city',
      'street',
      'numero',
      'postalCode',
    ].forEach(key => {
      if (data[key] != null) form.append(key, data[key]);
    });

    // 💥 Corrección aquí:
    if (data.phonePrefix && data.phoneNumber) {
      form.append('telefono', `${data.phonePrefix} ${data.phoneNumber}`);
    }

    form.append('redes', JSON.stringify(data.redes || {}));
    if (data.fotoPerfilFile) form.append('fotoPerfil', data.fotoPerfilFile);

    try {
      const updated = await onSaveProfile(form);
      setEditando(false);
      setPerfil(updated);
    } catch {
      toast.error('❌ No se pudo guardar el perfil');
    }
  };

  if (!perfil)
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando perfil…</div>;

  return (
    <>
      {/* Crop Modal */}
      <Transition show={isCropOpen} as={Fragment}>
        <Dialog
          onClose={() => setCropOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden w-full max-w-lg">
            <div className="h-96 bg-gray-200 dark:bg-gray-700">
              <Cropper
                image={rawImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-4 flex justify-end bg-white dark:bg-gray-800">
              <Button variant="secondary" onClick={() => setCropOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={applyCrop}>Aplicar</Button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
      <div className="px-4 md:px-0 grid grid-cols-1 gap-8 lg:grid-cols-[280px_420px_1fr] lg:grid-rows-[auto_auto] min-h-0">
        {/* Foto de Perfil */}
        <section className="lg:row-span-2 relative flex flex-col items-center gap-6">
          <div className="relative">
            <img
              src={previewPhoto || perfil.fotoPerfil}
              alt="Avatar"
              className="w-56 h-56 rounded-full object-cover border-4 border-primary shadow-lg"
            />
            {editando && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-[-6px] right-[-6px] p-1 bg-white dark:bg-gray-700 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-600 animate-fadeIn h-8 w-8 flex items-center justify-center"
              >
                <PencilLine size={16} />
              </button>
            )}
          </div>
          {editando ? (
            <Input
              value={data.apodo}
              onChange={e => change('apodo', e.target.value)}
              placeholder="Apodo o Nickname"
              className="w-full max-w-xs h-10 animate-fadeIn mt-2"
            />
          ) : (
            <p className="text-center text-gray-700 dark:text-gray-300 mt-2">
              {perfil.apodo || '—'}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="h-10 hidden"
            onChange={onSelectPhoto}
          />

          <Button
            variant={editando ? 'secondary' : 'default'}
            onClick={() => setEditando(e => !e)}
            className="w-full max-w-xs"
          >
            {editando ? <X className="mr-2" /> : <PencilLine className="mr-2" />}
            {editando ? 'Cancelar' : 'Editar perfil'}
          </Button>

          {editando && (
            <Button onClick={guardarPerfil} className="w-full max-w-xs animate-fadeIn">
              <Save className="mr-2" />
              Guardar cambios
            </Button>
          )}
        </section>

        <section className="lg:col-start-2 lg:row-start-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 h-96 min-h-0 transition-all">
          <div className="h-full overflow-y-auto scrollbar-hide flex flex-col">
            <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Biografía
            </h2>

            {editando ? (
              <textarea
                value={data.bio}
                onChange={e => change('bio', e.target.value)}
                className="flex-1 w-full bg-light-surface dark:bg-dark-surface text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-0 resize-none overflow-y-auto scrollbar-hide p-3 rounded-xl transition-all"
                placeholder="Escribe tu biografía…"
              />
            ) : (
              <p className="flex-1 whitespace-pre-line text-gray-800 dark:text-gray-200">
                {perfil.bio || 'Aún no has escrito tu biografía.'}
              </p>
            )}
          </div>
        </section>

        {/* Redes Sociales */}
        <section className="lg:col-start-2 lg:row-start-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 h-56 min-h-0 transition-all">
          <div className="h-full overflow-y-auto scrollbar-hide flex flex-col">
            <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Redes Sociales
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              {['github', 'twitter', 'linkedin', 'website'].map((net, i) => {
                const redes = data.redes || {};
                const isWeb = net === 'website';
                const val = isWeb ? data.website : redes[net] || '';
                const Icon =
                  net === 'github'
                    ? Github
                    : net === 'twitter'
                    ? Twitter
                    : net === 'linkedin'
                    ? Linkedin
                    : Globe;
                return editando ? (
                  <Input
                    key={i}
                    value={val}
                    onChange={e => {
                      if (isWeb) change('website', e.target.value);
                      else change('redes', { ...redes, [net]: e.target.value });
                    }}
                    placeholder={`${net.charAt(0).toUpperCase() + net.slice(1)} URL`}
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Icon size={18} />
                    <span>
                      {val ? (
                        <a
                          href={val}
                          target="_blank"
                          rel="noopener"
                          className="text-primary hover:underline"
                        >
                          {net.charAt(0).toUpperCase() + net.slice(1)}
                        </a>
                      ) : (
                        net.charAt(0).toUpperCase() + net.slice(1)
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* INFO PERSONAL */}
        {/* Información Personal */}
        <section className="lg:col-start-3 lg:row-start-1 lg:row-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 max-h-[calc(100vh-200px)] min-h-0 transition-all">
          <div className="h-full overflow-y-auto scrollbar-hide flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Información Personal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 max-h-full overflow-y-auto scrollbar-hide">
              {/* Primer Nombre */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Primer Nombre
                </label>
                {editando ? (
                  <Input
                    value={data.primerNombre}
                    onChange={e => change('primerNombre', e.target.value)}
                    placeholder="Primer Nombre"
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{perfil.primerNombre || '—'}</p>
                )}
              </div>

              {/* Segundo Nombre */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Segundo Nombre
                </label>
                {editando ? (
                  <Input
                    value={data.segundoNombre}
                    onChange={e => change('segundoNombre', e.target.value)}
                    placeholder="Segundo Nombre"
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{perfil.segundoNombre || '—'}</p>
                )}
              </div>

              {/* Primer Apellido */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Primer Apellido
                </label>
                {editando ? (
                  <Input
                    value={data.primerApellido}
                    onChange={e => change('primerApellido', e.target.value)}
                    placeholder="Primer Apellido"
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{perfil.primerApellido || '—'}</p>
                )}
              </div>

              {/* Segundo Apellido */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Segundo Apellido
                </label>
                {editando ? (
                  <Input
                    value={data.segundoApellido}
                    onChange={e => change('segundoApellido', e.target.value)}
                    placeholder="Segundo Apellido"
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">
                    {perfil.segundoApellido || '—'}
                  </p>
                )}
              </div>

              {/* Género */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Género
                </label>
                {editando ? (
                  <select
                    value={data.genero}
                    onChange={e => change('genero', e.target.value)}
                    className="h-10 animate-fadeIn rounded border px-2 bg-white dark:bg-gray-900 dark:text-white"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                ) : (
                  <p className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <UserIcon size={16} /> {perfil.genero}
                  </p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Fecha de Nacimiento
                </label>
                {editando ? (
                  <Input
                    type="date"
                    value={data.fechaNacimiento}
                    onChange={e => change('fechaNacimiento', e.target.value)}
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Calendar size={16} /> {perfil.fechaNacimiento?.slice(0, 10) || '—'}
                  </p>
                )}
              </div>

              {/* Prefijo + Teléfono */}
              <div className="flex flex-col md:col-span-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Teléfono
                </label>
                {editando ? (
                  <div className="flex gap-2">
                    <select
                      value={data.phonePrefix}
                      onChange={e => {
                        const selectedPrefix = e.target.value;
                        const selectedCountry =
                          getPhonePrefixes().find(p => p.dial_code === selectedPrefix)?.country ||
                          '';
                        change('phonePrefix', selectedPrefix);
                        change('country', selectedCountry); // 🎯 Autorrellenamos país al mismo tiempo
                      }}
                      className="h-10 animate-fadeIn bg-white dark:bg-gray-900 dark:text-white rounded"
                    >
                      {getPhonePrefixes().map(({ dial_code, country, emoji }) => (
                        <option key={dial_code + country} value={dial_code}>
                          {emoji} {country} ({dial_code})
                        </option>
                      ))}
                    </select>
                    <Input
                      value={data.phoneNumber}
                      onChange={e => change('phoneNumber', e.target.value)}
                      placeholder="Número"
                      className="h-10 animate-fadeIn"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Phone size={16} /> {perfil.prefijoTelefono} {perfil.telefono || '—'}
                  </p>
                )}
              </div>

              {/* País (relleno automático) */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  País
                </label>
                {editando ? (
                  <Input
                    value={data.country}
                    onChange={e => change('country', e.target.value)}
                    placeholder="País"
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Globe size={16} /> {perfil.direccion?.pais || '—'}
                  </p>
                )}
              </div>

              {/* Ciudad */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Ciudad
                </label>
                {editando ? (
                  <Input
                    value={data.city}
                    onChange={e => change('city', e.target.value)}
                    placeholder="Ciudad"
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <HomeIcon size={16} /> {perfil.direccion?.ciudad || '—'}
                  </p>
                )}
              </div>

              {/* Calle */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Calle
                </label>
                {editando ? (
                  <Input
                    value={data.street}
                    onChange={e => change('street', e.target.value)}
                    placeholder="Calle"
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <MapPin size={16} /> {perfil.direccion?.calle || '—'}
                  </p>
                )}
              </div>

              {/* Número */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Número
                </label>
                {editando ? (
                  <Input
                    value={data.numero}
                    onChange={e => change('numero', e.target.value)}
                    placeholder="Número"
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">
                    {perfil.direccion?.numero || '—'}
                  </p>
                )}
              </div>

              {/* Código Postal */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Código Postal
                </label>
                {editando ? (
                  <Input
                    value={data.postalCode}
                    onChange={e => change('postalCode', e.target.value)}
                    placeholder="Código Postal"
                    className="h-10 animate-fadeIn"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">
                    {perfil.direccion?.codigoPostal || '—'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
