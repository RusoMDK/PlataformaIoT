// src/pages/Home.jsx
import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  CloudLightning,
  Rocket,
  Waves,
  Cpu,
  SignalHigh,
  Gauge,
} from 'lucide-react';

// ---------- helper: <picture> responsive ----------
function ResponsivePicture({ base, alt = 'IoT Illustration', className = '', priority = false }) {
  const p = useMemo(() => {
    const dir = '/src/assets/illustrations/iot';
    const desktopWebp = new URL(`${dir}/${base}-desktop.webp`, import.meta.url).href;
    const mobileWebp  = new URL(`${dir}/${base}-mobile.webp`,  import.meta.url).href;
    let desktopPng, mobilePng;
    try { desktopPng = new URL(`${dir}/${base}-desktop.png`, import.meta.url).href; } catch {}
    try { mobilePng  = new URL(`${dir}/${base}-mobile.png`,  import.meta.url).href; } catch {}
    return { desktopWebp, mobileWebp, desktopPng, mobilePng };
  }, [base]);

  return (
    <picture>
      <source media="(min-width:1024px)" type="image/webp" srcSet={p.desktopWebp} />
      {p.desktopPng && <source media="(min-width:1024px)" type="image/png" srcSet={p.desktopPng} />}
      <source type="image/webp" srcSet={p.mobileWebp} />
      {p.mobilePng && <source type="image/png" srcSet={p.mobilePng} />}
      <img
        src={p.mobileWebp}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        draggable="false"
        className={className}
      />
    </picture>
  );
}

// ---------- marco de imagen con sombras/ring según tema ----------
function ImageFrame({ children, className = '' }) {
  return (
    <div
      className={[
        'relative rounded-3xl border border-light-border dark:border-dark-border',
        'bg-white/90 dark:bg-white/[0.03]',
        'ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
        'shadow-[0_14px_34px_rgba(2,6,23,0.12)] dark:shadow-[0_22px_60px_rgba(2,6,23,0.55)]',
        'drop-shadow-[0_12px_24px_rgba(59,130,246,0.18)] dark:drop-shadow-[0_16px_32px_rgba(59,130,246,0.28)]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

// ---------- decor: divider ----------
function SectionDivider() {
  return (
    <div className="relative my-12">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/70 shadow-[0_0_24px_rgba(37,99,235,0.5)]" />
    </div>
  );
}

// ---------- mini KPI ----------
function Kpi({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-light-border dark:border-dark-border bg-white/70 dark:bg-white/[0.05] p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

// ---------- feature card ----------
function Feature({ icon, title, desc }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-white/[0.05] p-6 shadow-sm hover:shadow-md transition-all">
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full
                      bg-primary/10 dark:bg-primary/20 blur-xl md:blur-2xl
                      opacity-0 group-hover:opacity-100 transition" />
      <div className="flex items-center gap-3 mb-3">
        <div className="text-primary dark:text-darkAccent">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

// ---------- story section (con parallax leve por sección) ----------
function StorySection({ reverse = false, base, eyebrow, title, desc, bullets = [] }) {
  const prefersReduce = useReducedMotion();
  const imgRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset: ['start 80%', 'end 20%'],
  });
  const yImg = prefersReduce ? 0 : useTransform(scrollYProgress, [0, 1], [16, -16]);
  const scaleImg = prefersReduce ? 1 : useTransform(scrollYProgress, [0, 1], [1, 1.015]);

  return (
    <div className={`grid lg:grid-cols-12 gap-8 items-center cv-auto ${reverse ? '' : ''}`}>
      {/* Imagen */}
      <motion.div
        ref={imgRef}
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.45 }}
        className={`lg:col-span-6 ${reverse ? 'lg:order-2' : ''} transform-gpu will-change-[opacity,transform]`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          style={{ y: yImg, scale: scaleImg }}
          whileHover={prefersReduce ? {} : { rotateX: '0.35deg', rotateY: '-0.35deg', scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        >
          <div className="relative" style={{ perspective: 1000 }}>
            <div className="absolute -inset-6 bg-gradient-to-tr
                            from-primary/10 to-accent/10
                            dark:from-primary/25 dark:to-accent/25
                            blur-xl md:blur-2xl rounded-3xl" />
            <ImageFrame>
              <ResponsivePicture base={base} alt={title} className="w-full h-auto select-none" />
            </ImageFrame>
          </div>
        </motion.div>
      </motion.div>

      {/* Texto */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="lg:col-span-6 transform-gpu will-change-[opacity,transform]"
      >
        {eyebrow && (
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary dark:text-darkAccent mb-2">
            {eyebrow}
          </span>
        )}
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">{desc}</p>
        {bullets.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary dark:bg-darkAccent" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}

/** ---------- SectionBlock: foco suave por sección (sin filter) ---------- */
function SectionBlock({ index, activeIndex, setActiveIndex, children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.55 });

  useEffect(() => {
    if (inView) setActiveIndex(index);
  }, [inView, index, setActiveIndex]);

  const isActive = activeIndex === index;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={{
        opacity: isActive ? 1 : 0.88,
        y: 0,
        scale: isActive ? 1 : 0.994,
      }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="cv-auto"
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const prefersReduce = useReducedMotion();

  useEffect(() => {
    document.title = 'IoT Platform | ' + t('home.titulo');
    fetch('http://localhost:4000/api/auth/jwt-token', { credentials: 'include' })
      .then(res => (res?.ok ? res.json() : null))
      .then(data => {
        if (!data?.token) return;
        return fetch('http://localhost:3001/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.token }),
        }).catch(() => {});
      })
      .catch(() => {});
  }, [t]);

  // Parallax del HERO global (desactivado si reduce motion)
  const { scrollY } = useScroll();
  const yHero     = prefersReduce ? 0 : useTransform(scrollY, [0, 400], [0, -40]);
  const scaleHero = prefersReduce ? 1 : useTransform(scrollY, [0, 400], [1, 1.03]);
  const haloAlpha = prefersReduce ? 1 : useTransform(scrollY, [0, 400], [1, 0.7]);

  const heroBase = 'iot-hero-overview';
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative cv-auto">
      {/* fondo sutil */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full
                        bg-primary/15 dark:bg-primary/20
                        blur-xl md:blur-2xl opacity-70 dark:opacity-40" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full
                        bg-accent/15 dark:bg-accent/25
                        blur-xl md:blur-2xl opacity-70 dark:opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 sm:py-20 space-y-16">
        {/* HERO */}
        <SectionBlock index={0} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
          <section className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center cv-auto">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white transform-gpu will-change-[opacity,transform]"
              >
                {t('home.titulo')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl"
              >
                {t('home.descripcion')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                {token ? (
                  <Button onClick={() => navigate('/proyectos')} className="px-6">
                    {t('home.botonPanel')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => navigate('/login')} className="px-6">
                      {t('home.botonComenzar')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/registro')} className="px-6">
                      {t('home.botonRegistro', 'Crear cuenta')}
                    </Button>
                  </>
                )}
              </motion.div>

              {/* KPIs */}
              <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
                <Kpi icon={<Gauge className="w-4 h-4" />} label={t('home.kpi.dispositivos', 'Dispositivos')} value="1.2K+" />
                <Kpi icon={<SignalHigh className="w-4 h-4" />} label={t('home.kpi.eventos', 'Eventos/día')} value="5M+" />
                <Kpi icon={<Cpu className="w-4 h-4" />} label={t('home.kpi.latencia', 'Latencia')} value="< 150ms" />
              </div>
            </div>

            {/* Hero visual con parallax + tilt */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative transform-gpu will-change-[opacity,transform]"
              style={{ y: yHero, scale: scaleHero, transformStyle: 'preserve-3d' }}
              whileHover={prefersReduce ? {} : { scale: 1.01, rotateX: '0.4deg', rotateY: '-0.4deg' }}
            >
              <motion.div
                className="absolute -inset-6 rounded-3xl bg-gradient-to-tr
                           from-primary/10 to-accent/10
                           dark:from-primary/25 dark:to-accent/25
                           blur-xl md:blur-2xl"
                style={{ opacity: haloAlpha }}
              />
              <div className="relative" style={{ perspective: 1000 }}>
                <ImageFrame>
                  <ResponsivePicture
                    base={heroBase}
                    alt="IoT Overview"
                    priority
                    className="w-full h-auto rounded-3xl"
                  />
                </ImageFrame>
              </div>
            </motion.div>
          </section>
        </SectionBlock>

        <SectionDivider />

        {/* STORY STRIPES */}
        <SectionBlock index={1} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
          <section className="space-y-16 cv-auto">
            <StorySection
              base="iot-smartcity-dashboard"
              eyebrow={t('home.story.city.eyebrow', 'Smart City')}
              title={t('home.story.city.title', 'Gestiona tu ciudad en tiempo real')}
              desc={t('home.story.city.desc', 'Monitorea tráfico, calidad del aire y alumbrado con telemetría unificada y alertas predictivas.')}
              bullets={[
                t('home.story.city.b1', 'Paneles 360° con capas por distrito'),
                t('home.story.city.b2', 'Modelos de congestión y rutas óptimas'),
                t('home.story.city.b3', 'Ahorro energético en iluminación pública'),
              ]}
            />

            <StorySection
              reverse
              base="iot-smartgrid-energy"
              eyebrow={t('home.story.energy.eyebrow', 'Smart Grid')}
              title={t('home.story.energy.title', 'Energía inteligente y eficiente')}
              desc={t('home.story.energy.desc', 'Visualiza consumos, picos y pronósticos. Orquesta cargas y genera tareas automáticas ante anomalías.')}
              bullets={[
                t('home.story.energy.b1', 'Balanceo de carga y prioridades'),
                t('home.story.energy.b2', 'Detección de fugas / picos inusuales'),
                t('home.story.energy.b3', 'Reportes listos para auditoría'),
              ]}
            />

            <StorySection
              base="iot-industry-4-robots"
              eyebrow={t('home.story.industry.eyebrow', 'Industria 4.0')}
              title={t('home.story.industry.title', 'Mantenimiento predictivo y OEE')}
              desc={t('home.story.industry.desc', 'Integra PLCs, robots y sensores. Reduce downtime con modelos predictivos y acciones automáticas.')}
              bullets={[
                t('home.story.industry.b1', 'KPIs OEE, MTTR y MTBF'),
                t('home.story.industry.b2', 'Alertas con playbooks de respuesta'),
                t('home.story.industry.b3', 'Trazabilidad por lote / máquina'),
              ]}
            />

            <StorySection
              reverse
              base="iot-farm-ecosystem"
              eyebrow={t('home.story.agri.eyebrow', 'Agrotech')}
              title={t('home.story.agri.title', 'Cultivos optimizados por datos')}
              desc={t('home.story.agri.desc', 'Riego inteligente, clima y suelo. Automatiza válvulas y bombas con desired/commands seguros.')}
              bullets={[
                t('home.story.agri.b1', 'Zonificación por parcela'),
                t('home.story.agri.b2', 'Sugerencias de riego y fertirriego'),
                t('home.story.agri.b3', 'Históricos y predicciones de rendimiento'),
              ]}
            />
          </section>
        </SectionBlock>

        <SectionDivider />

        {/* CAPABILITIES */}
        <SectionBlock index={2} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
          <section className="space-y-6 cv-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('home.capacidades.titulo', 'Capacidades Clave')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Feature icon={<Rocket size={22} />} title={t('home.feature1.titulo')} desc={t('home.feature1.desc')} />
              <Feature icon={<CloudLightning size={22} />} title={t('home.feature2.titulo')} desc={t('home.feature2.desc')} />
              <Feature icon={<ShieldCheck size={22} />} title={t('home.feature3.titulo')} desc={t('home.feature3.desc')} />
              <Feature icon={<Waves size={22} />} title={t('home.feature4.titulo')} desc={t('home.feature4.desc')} />
            </div>
          </section>
        </SectionBlock>

        <SectionDivider />

        {/* CTA FINAL */}
        <SectionBlock index={3} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
          <section className="relative overflow-hidden rounded-3xl border border-light-border dark:border-dark-border bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-8 cv-auto">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 dark:bg-primary/25 blur-xl md:blur-2xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/15 dark:bg-accent/25 blur-xl md:blur-2xl rounded-full" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('home.cta.titulo', 'Lleva tus operaciones al siguiente nivel')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('home.cta.desc', 'Empieza gratis y escala cuando lo necesites.')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate(token ? '/proyectos' : '/login')}>
                  {token ? t('home.botonPanel') : t('home.botonComenzar')}
                </Button>
                {!token && (
                  <Button variant="secondary" onClick={() => navigate('/registro')}>
                    {t('home.botonRegistro', 'Crear cuenta')}
                  </Button>
                )}
              </div>
            </div>
          </section>
        </SectionBlock>
      </div>
    </div>
  );
}
