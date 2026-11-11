import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import QRCode from 'qrcode'
import { ArrowUpRight } from '@phosphor-icons/react'
import { ArchFrame, Drape, Ground, InkDefs, Seal, Sunburst, Woodcut, inkStill, type ObjectName } from './Art'
import { Armillary } from './Armillary'
import { Rule } from './Print'
import { WHATSAPP_NUMBER } from '../lib/config'
import { reducedMotion } from '../lib/scroll'

/**
 * Pitch deck for the fair, opened with `?pitch`. Drawn on a fixed 1600 x 900 stage that
 * scales to any screen. Arrows, space, PageUp/PageDown (clickers) or a click move between
 * slides; N shows the speaker notes, F goes full screen.
 */

const W = 1600
const H = 900
const WA = `https://wa.me/${WHATSAPP_NUMBER}`
const DEMO = '/'

/* ------------------------------------------------------------------ helpers */

function Qr({ value, className = '' }: { value: string; className?: string }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    QRCode.toString(value, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#16110b', light: '#0000' } }).then(setSvg)
  }, [value])
  return <div className={`[&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />
}

const fmt = (n: number) => Math.round(n).toLocaleString('es-CO')

/** Each slide plays its own entrance when it mounts: masked lines, drawn strokes, carved rays. */
function Slide({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (reducedMotion()) return
      const q = gsap.utils.selector(ref)
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from(q('.line-mask > span'), { yPercent: 115, duration: 1.1, stagger: 0.09 }, 0.2)
        .from(q('.fade'), { y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.07 }, 0.4)
        .from(q('.pop'), { scale: 0.55, autoAlpha: 0, rotate: -6, duration: 1, ease: 'back.out(1.5)', stagger: 0.09 }, 0.3)
        .fromTo(q('.draw'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.08, ease: 'power2.inOut' }, 0.15)
        .from(q('.wedge'), { scale: 0, svgOrigin: '0 0', duration: 1.2, stagger: { each: 0.008, from: 'random' } }, 0.1)
        .from(q('.gouge'), { scaleX: 0, transformOrigin: 'left center', duration: 0.8, stagger: { each: 0.005, from: 'random' } }, 0.45)
        .from(q('.grow-x'), { scaleX: 0, transformOrigin: 'left center', duration: 1.4, ease: 'power3.inOut' }, 0.3)
      q('.count').forEach((el) => {
        const o = { v: 0 }
        tl.to(o, { v: Number(el.dataset.to), duration: 1.8, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(o.v)) }, 0.6)
      })
      gsap.to(q('.spin'), { rotate: 360, duration: 140, ease: 'none', repeat: -1 })
      gsap.to(q('.bob'), { y: -10, rotate: 4, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4 })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="absolute inset-0">
      {children}
    </div>
  )
}

/** Masked line of display type. */
const L = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={`line-mask ${className}`}>
    <span>{children}</span>
  </span>
)

/* ------------------------------------------------------------------ slides */

function Portada() {
  return (
    <Slide>
      <div className="absolute top-1/2 left-[120px] w-[800px] -translate-y-1/2">
        <p className="fade label text-mute">Feria de Emprendimiento 2026</p>
        <h1 className="deco mt-7 text-[128px] leading-[0.92]">
          <L>Hyvento</L>
        </h1>
        <p className="mt-8 text-[50px] leading-[1.06] font-medium tracking-[-0.025em]">
          <L>Ingeniería de software</L>
          <L className="text-mute">impulsada por IA.</L>
        </p>
        <Rule className="fade mt-10 w-[460px] text-bone/80" />
        <p className="fade mt-8 max-w-[34ch] text-[22px] leading-snug text-mute">Agentes, automatización, datos y software a la medida para que los negocios dejen de operar a mano.</p>
      </div>
      <div className="absolute top-1/2 right-[110px] h-[660px] w-[660px] -translate-y-1/2">
        <div className="spin absolute inset-0 text-bone [mask-image:radial-gradient(closest-side,#000_50%,transparent_100%)]" style={inkStill}>
          <Sunburst className="h-full w-full" />
        </div>
        <div className="pop absolute inset-[140px] rounded-full border-[6px] border-bone bg-coal" />
        <div className="pop absolute inset-[158px] rounded-full border border-bone/70" />
        <div className="absolute inset-[150px]">
          <Armillary className="h-full w-full" />
        </div>
      </div>
    </Slide>
  )
}

const PAINS: [ObjectName, string, string][] = [
  ['campana', 'Todo pasa por WhatsApp', 'Pedidos, citas y cuentas en el chat y en un cuaderno. Lo que no se anota, se pierde.'],
  ['llave', 'La información no conversa', 'Inventario en una hoja, clientes en otra, ventas en el banco. Nadie ve el negocio completo.'],
  ['bolsa', 'Pagan sin ver', 'Contratan tecnología con un PDF y fe. Llega tarde, cuesta más o el equipo no la usa.'],
]

function Problema() {
  return (
    <Slide>
      <div className="absolute inset-x-[120px] top-[150px]">
        <h2 className="deco text-[84px] leading-[0.98]">
          <L>Los negocios crecen.</L>
          <L className="text-mute">Sus herramientas no.</L>
        </h2>
      </div>
      <div className="absolute inset-x-[120px] bottom-[150px] grid grid-cols-3">
        {PAINS.map(([icon, t, d], i) => (
          <div key={t} className={`fade flex flex-col gap-5 px-10 ${i ? 'border-l border-line' : 'pl-0'}`}>
            <Woodcut name={icon} className="bob h-[88px] w-[88px] text-bone" />
            <p className="text-[32px] leading-tight font-semibold tracking-[-0.02em]">{t}</p>
            <p className="max-w-[30ch] text-[20px] leading-snug text-mute">{d}</p>
          </div>
        ))}
      </div>
    </Slide>
  )
}

const SERVICES: [string, string, string, string][] = [
  ['I', 'Agentes de IA', 'Atienden, califican y venden por WhatsApp a cualquier hora, y pasan el caso a una persona cuando importa.', 'WhatsApp, Telegram, web'],
  ['II', 'Automatización', 'Contratos, reportes y aprobaciones que se generan solos mientras tu equipo trabaja.', 'Legal, inmobiliario, obra'],
  ['III', 'Datos', 'Fuentes dispersas convertidas en un solo registro que se puede consultar.', 'Scrapers y pipelines'],
  ['IV', 'Software a la medida', 'Plataformas, tiendas, paneles y sitios que tu equipo sí quiere usar.', 'Web, móvil, interno'],
]

function QueHacemos() {
  return (
    <Slide>
      <h2 className="deco absolute top-[140px] left-[120px] text-[72px] leading-[0.98]">
        <L>Construimos el software</L>
        <L className="text-mute">que mueve tu negocio</L>
      </h2>
      <div className="absolute inset-x-[120px] bottom-[120px] grid grid-cols-4 items-end gap-5">
        {SERVICES.map(([n, t, d, tag], i) => (
          <div key={t} className={`pop relative flex flex-col border-2 border-bone/80 p-7 ${i % 2 ? 'h-[400px]' : 'h-[360px]'} ${i === 3 ? 'bg-bone text-coal' : ''}`}>
            <span className="deco text-[64px] leading-none opacity-90">{n}</span>
            <p className="mt-auto text-[30px] leading-tight font-semibold tracking-[-0.02em]">{t}</p>
            <p className={`mt-3 text-[18px] leading-snug ${i === 3 ? 'opacity-75' : 'text-mute'}`}>{d}</p>
            <p className="label mt-5 opacity-70">{tag}</p>
          </div>
        ))}
      </div>
    </Slide>
  )
}

const SHOTS: [string, string, string, string][] = [
  ['/pitch/lumbre.jpg', 'Lumbre', 'Oficina virtual en pixel art, con audio por cercanía.', '-rotate-2'],
  ['/pitch/noir.jpg', 'Noir', 'Póker en tiempo real entre teléfonos.', 'rotate-[1.5deg]'],
  ['/pitch/marrow.jpg', 'Marrow', 'Música que vive en el navegador.', '-rotate-1'],
]

function Prueba() {
  return (
    <Slide>
      <div className="absolute top-[140px] bottom-[120px] left-[120px] flex w-[620px] flex-col">
        <h2 className="deco text-[64px] leading-[0.98]">
          <L>Esto ya existe</L>
        </h2>
        <div className="fade mt-auto border-2 border-bone/80 p-9">
          <div className="flex items-baseline justify-between">
            <p className="display-narrow text-[96px] leading-none">Zephr</p>
            <p className="label text-mute">Aviación, SaaS</p>
          </div>
          <p className="mt-3 text-[24px] leading-snug">Una aeronave. Todas las autoridades. Lee a diario cada regulador y responde en una sola lista.</p>
          <div className="mt-8 grid grid-cols-[1.35fr_0.75fr_1fr] gap-6 border-t border-line pt-6">
            <div>
              <b className="count display-narrow block text-[76px] leading-none tabular-nums" data-to="44059">
                44.059
              </b>
              <span className="mt-2 block text-[16px] text-mute">directivas indexadas</span>
            </div>
            <div>
              <b className="count display-narrow block text-[76px] leading-none tabular-nums" data-to="7">
                7
              </b>
              <span className="mt-2 block text-[16px] text-mute">autoridades de aviación</span>
            </div>
            <div>
              <b className="display-narrow block text-[76px] leading-none">Diario</b>
              <span className="mt-2 block text-[16px] text-mute">sincronización</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-[130px] right-[120px] grid w-[640px] grid-cols-2 gap-6">
        {SHOTS.map(([src, t, d, rot], i) => (
          <figure key={t} className={`pop ${rot} ${i === 0 ? 'col-span-2' : ''}`}>
            <div className={`overflow-hidden border-[3px] border-bone bg-coal-2 ${i === 0 ? 'h-[300px]' : 'h-[170px]'}`}>
              <img src={src} alt="" className="h-full w-full object-cover object-top" />
            </div>
            <figcaption className="mt-3 flex items-baseline gap-3">
              <b className="text-[22px]">{t}</b>
              <span className="text-[15px] text-mute">{d}</span>
            </figcaption>
          </figure>
        ))}
        <p className="fade col-span-2 mt-2 border-t border-line pt-4 text-[17px] leading-snug text-mute">
          <b className="text-bone">Aliado: The 100x Co.</b> Agentes de IA para concesionarios, viajes e inmobiliarias.
        </p>
      </div>
    </Slide>
  )
}

const STEPS: [string, string][] = [
  ['Descubrir', 'Nos sentamos con tu equipo y ubicamos dónde se pierde tiempo y dinero.'],
  ['Diseñar', 'Un prototipo que puedes tocar en días, antes de escribir código final.'],
  ['Construir', 'Entregas cada semana. La IA nos acelera; los ingenieros responden.'],
  ['Operar', 'Nos quedamos después del lanzamiento: soporte, mejoras y monitoreo.'],
]

function Proceso() {
  return (
    <Slide>
      <h2 className="deco absolute top-[140px] left-[120px] text-[72px] leading-[0.98]">
        <L>Así trabajamos</L>
      </h2>
      <div className="absolute inset-x-[120px] top-[430px]">
        <div className="grow-x absolute top-[22px] right-[60px] left-[22px] h-[3px] bg-bone/80" />
        <div className="relative grid grid-cols-4 gap-10">
          {STEPS.map(([t, d], i) => {
            const key = i === 1
            return (
              <div key={t} className="fade">
                <svg viewBox="0 0 40 40" className={`h-[46px] w-[46px] ${key ? 'text-coal' : 'text-bone'}`}>
                  <path d="M20 3 35 11.5v17L20 37 5 28.5v-17Z" fill={key ? 'var(--color-bone)' : 'var(--color-coal)'} stroke="var(--color-bone)" strokeWidth="3" strokeLinejoin="round" />
                  <text x="20" y="25" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
                    {i + 1}
                  </text>
                </svg>
                <p className="deco mt-7 text-[37px] leading-none">{t}</p>
                <p className="mt-4 max-w-[24ch] text-[20px] leading-snug text-mute">{d}</p>
                {key && (
                  <p className="label mt-6 inline-flex items-center gap-2 border border-bone px-3 py-2 text-bone">
                    <span className="h-2 w-2 bg-bone" /> Aquí está la diferencia
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Slide>
  )
}

function Diferencia() {
  return (
    <Slide>
      <div className="absolute top-[118px] left-[150px] h-[664px] w-[524px] text-bone">
        <div className="absolute inset-0 [clip-path:url(#arch-clip)]">
          <div className="spin absolute top-[39.47%] left-1/2 aspect-square w-[173.3%] -translate-x-1/2 -translate-y-1/2">
            <Sunburst className="h-full w-full" />
          </div>
          <Ground className="absolute inset-0 h-full w-full" />
        </div>
        <ArchFrame className="absolute inset-0 h-full w-full" />
        <Seal className="pop absolute top-[20.2%] left-[26.5%] w-[47%]" />
      </div>
      <div className="absolute top-1/2 right-[110px] w-[760px] -translate-y-1/2">
        <h2 className="deco text-[70px] leading-[1]">
          <L>Míralo antes</L>
          <L>de pagarlo</L>
        </h2>
        <Rule className="fade mt-8 w-[420px] text-bone/80" />
        <p className="fade mt-8 text-[26px] leading-snug">Nadie compra una casa sin ver los planos. Con Hyvento ves tu software funcionando antes de pagar el primer peso.</p>
        <p className="fade mt-4 text-[20px] leading-snug text-mute">Lo pueden probar ahora: armen en vivo la página de un negocio, con su logo y sus colores.</p>
        <a href={DEMO} target="_blank" rel="noreferrer" className="btn btn-solid fade mt-10 !px-7 !py-5 !text-[15px]">
          Abrir la demo
          <ArrowUpRight size={18} weight="bold" />
        </a>
      </div>
    </Slide>
  )
}

const WHO = ['Mipymes y emprendimientos en Colombia', 'Negocios que ya venden por WhatsApp e Instagram', 'Empresas que necesitan automatizar procesos']
const HOW: [string, string][] = [
  ['Proyecto a la medida', 'Se cotiza por alcance, con entregas semanales.'],
  ['Paquetes de precio fijo', 'Página, tienda o agente listo para salir.'],
  ['Mantenimiento mensual', 'Hosting, soporte y mejoras continuas.'],
  ['Agentes de IA por suscripción', 'Ingreso recurrente que crece con el cliente.'],
]

function Modelo() {
  return (
    <Slide>
      <h2 className="deco absolute top-[140px] left-[120px] text-[72px] leading-[0.98]">
        <L>A quién servimos</L>
        <L className="text-mute">y cómo ganamos</L>
      </h2>
      <div className="absolute inset-x-[120px] bottom-[130px] grid grid-cols-[0.85fr_1.15fr] gap-20">
        <div className="fade">
          <p className="label mb-6 text-mute">Clientes</p>
          <ul className="flex flex-col gap-5">
            {WHO.map((w) => (
              <li key={w} className="flex items-start gap-4 text-[26px] leading-snug">
                <svg viewBox="0 0 40 40" className="mt-2 h-5 w-5 shrink-0 text-bone">
                  <path d="M20 3 35 11.5v17L20 37 5 28.5v-17Z" fill="currentColor" />
                </svg>
                {w}
              </li>
            ))}
          </ul>
          <p className="mt-9 text-[18px] leading-snug text-mute">Llegamos por voz a voz, redes, ferias, Cámara de Comercio y Google.</p>
        </div>
        <div className="fade border-t-2 border-bone/80">
          {HOW.map(([t, d], i) => (
            <div key={t} className="grid grid-cols-[60px_1fr] items-baseline border-b border-line py-5">
              <span className="deco text-[30px] text-mute">{i + 1}</span>
              <div>
                <p className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">{t}</p>
                <p className="mt-1 text-[18px] text-mute">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  )
}

function Cierre() {
  return (
    <Slide>
      <div className="absolute top-1/2 left-[120px] w-[800px] -translate-y-1/2">
        <h2 className="deco text-[112px] leading-[0.92]">
          <L>Hablemos</L>
        </h2>
        <p className="mt-6 text-[44px] leading-tight font-medium tracking-[-0.02em]">
          <L>Hyvento. Míralo antes de pagarlo.</L>
        </p>
        <Rule className="fade mt-10 w-[460px] text-bone/80" />
        <div className="fade mt-10 grid grid-cols-2 gap-10 text-[22px] leading-snug">
          <p>
            <span className="label mb-2 block text-mute">Escríbenos</span>
            hyvento.co
            <br />
            WhatsApp 321 387 3880
          </p>
          <p>
            <span className="label mb-2 block text-mute">Grupo 18</span>
            Julián Hinestroza Duarte
            <br />
            Juan José Pantoja
            <br />
            Lizet Mariana Colorado Esguerra
          </p>
        </div>
      </div>
      <div className="absolute top-1/2 right-[120px] h-[600px] w-[600px] -translate-y-1/2">
        <div className="spin absolute inset-0 text-bone [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)]" style={inkStill}>
          <Sunburst className="h-full w-full" />
        </div>
        <div className="pop absolute inset-[120px] grid place-items-center bg-bone p-8">
          <Qr value={WA} className="h-full w-full" />
        </div>
        <p className="label fade absolute inset-x-0 bottom-[60px] text-center text-bone">Escanea y escríbenos por WhatsApp</p>
      </div>
    </Slide>
  )
}

interface SlideDef {
  name: string
  Comp: () => ReactNode
  notes: string
}

/** Speaker notes are the script, kept short enough to glance at. */
const SLIDES: SlideDef[] = [
  {
    name: 'Portada',
    Comp: Portada,
    notes: '“Somos Hyvento, una firma de ingeniería de software impulsada por IA. No vendemos plantillas: construimos el software que un negocio necesita para dejar de operar a mano.”',
  },
  {
    name: 'El problema',
    Comp: Problema,
    notes: '“Piensen en el restaurante o la ferretería de su barrio. Crecen, pero todo pasa por WhatsApp y un cuaderno. La información está regada. Y cuando por fin contratan tecnología, pagan con un PDF y fe.”',
  },
  {
    name: 'Qué hacemos',
    Comp: QueHacemos,
    notes: '“Hacemos cuatro cosas. Agentes de IA que atienden y venden por WhatsApp. Automatizaciones que hacen el papeleo solas. Datos: juntamos fuentes dispersas en un solo lugar. Y software a la medida.”',
  },
  {
    name: 'Esto ya existe',
    Comp: Prueba,
    notes: '“No es una idea en papel. Zephr ya indexa 44.059 directivas de siete autoridades de aviación, cada día. Lumbre, Noir y Marrow están en línea. Y trabajamos con The 100x Co en agentes para concesionarios e inmobiliarias.”',
  },
  {
    name: 'Cómo trabajamos',
    Comp: Proceso,
    notes: '“Descubrimos, diseñamos, construimos y operamos. La clave está en el segundo paso: en días tienes un prototipo que puedes tocar, antes de que escribamos el código final.”',
  },
  {
    name: 'La diferencia',
    Comp: Diferencia,
    notes: '“Nadie compra una casa sin ver los planos. Con Hyvento ves tu software funcionando antes de pagar. No se lo cuento, se lo muestro.” Pasar a la demo: pedir el nombre del negocio del jurado.',
  },
  {
    name: 'Modelo de negocio',
    Comp: Modelo,
    notes: '“Servimos a mipymes que ya venden por WhatsApp y a empresas que necesitan automatizar. Cobramos por proyecto, por paquetes de precio fijo, mantenimiento mensual y agentes por suscripción: ingreso que se repite cada mes.”',
  },
  {
    name: 'Cierre',
    Comp: Cierre,
    notes: '“Hyvento: míralo antes de pagarlo. Escaneen el código y escríbannos.” Silencio y sonreír. Preguntas.',
  },
]

/* ------------------------------------------------------------------ deck */

export function Pitch() {
  const [index, setIndex] = useState(0)
  const [notes, setNotes] = useState(false)
  const [hint, setHint] = useState(true)
  const [k, setK] = useState(1)
  const wipe = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const current = useRef(0)

  useEffect(() => {
    const fit = () => setK(Math.min(window.innerWidth / W, window.innerHeight / H))
    fit()
    window.addEventListener('resize', fit)
    document.documentElement.style.overflow = 'hidden'
    document.title = 'Hyvento | Pitch'
    const id = window.setTimeout(() => setHint(false), 5000)
    return () => {
      window.removeEventListener('resize', fit)
      window.clearTimeout(id)
    }
  }, [])

  /* Between slides a printed curtain sweeps across; the next slide is swapped in behind it. */
  const go = useCallback((next: number) => {
    if (busy.current || next < 0 || next >= SLIDES.length || next === current.current) return
    const dir = next > current.current ? 1 : -1
    current.current = next
    if (reducedMotion() || !wipe.current) {
      setIndex(next)
      return
    }
    busy.current = true
    gsap
      .timeline({ onComplete: () => (busy.current = false) })
      .set(wipe.current, { xPercent: dir > 0 ? 101 : -101, autoAlpha: 1 })
      .to(wipe.current, { xPercent: 0, duration: 0.5, ease: 'power3.in' })
      .call(() => setIndex(next))
      .to(wipe.current, { xPercent: dir > 0 ? -101 : 101, duration: 0.7, ease: 'power3.out' }, '+=0.06')
  }, [])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault()
        go(current.current + 1)
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) {
        e.preventDefault()
        go(current.current - 1)
      } else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(SLIDES.length - 1)
      else if (e.key.toLowerCase() === 'n') setNotes((v) => !v)
      else if (e.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen().catch(() => {})
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [go])

  const onClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    go(current.current + (e.clientX < window.innerWidth * 0.3 ? -1 : 1))
  }

  const { Comp, name } = SLIDES[index]

  return (
    <main className="fixed inset-0 overflow-hidden bg-coal text-bone select-none" onClick={onClick}>
      <InkDefs />
      <div
        className="absolute top-1/2 left-1/2 shrink-0 overflow-hidden"
        style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${k})` }}
      >
        {/* Printed border, like the stand sheets */}
        <div className="pointer-events-none absolute inset-[28px] border-[4px] border-bone/85" />
        <div className="pointer-events-none absolute inset-[40px] border border-bone/40" />
        {['top-[52px] left-[52px]', 'top-[52px] right-[52px]', 'bottom-[52px] left-[52px]', 'bottom-[52px] right-[52px]'].map((pos) => (
          <Woodcut key={pos} name="estrella" className={`pointer-events-none absolute h-[26px] w-[26px] text-bone/80 ${pos}`} />
        ))}
        <header className="pointer-events-none absolute inset-x-[96px] top-[62px] flex items-center justify-between">
          <span className="flex items-center gap-3">
            <Seal className="h-[34px] w-[34px] text-bone" />
            <span className="deco text-[20px]">Hyvento</span>
          </span>
          <span key={name} className="label text-mute [animation:rise_0.6s_var(--ease-out-expo)]">
            {name}
          </span>
        </header>

        <Comp key={index} />

        {/* Progress */}
        <div className="pointer-events-none absolute inset-x-[96px] bottom-[66px] flex items-center gap-5">
          <div className="h-[2px] flex-1 bg-bone/20">
            <div className="h-full origin-left bg-bone transition-transform duration-700 ease-[var(--ease-out-expo)]" style={{ transform: `scaleX(${(index + 1) / SLIDES.length})` }} />
          </div>
          <span className="label text-mute tabular-nums">
            {String(index + 1).padStart(2, '0')} de {String(SLIDES.length).padStart(2, '0')}
          </span>
        </div>

        {/* Curtain between slides */}
        <div ref={wipe} className="pointer-events-none invisible absolute inset-0 z-20 bg-coal-2 text-bone/60">
          <Drape className="absolute inset-0 h-full w-full" seed={11} />
          <Seal className="absolute inset-0 m-auto h-[160px] w-[160px] text-bone" />
        </div>

        {/* Speaker notes */}
        <div
          className={`absolute inset-x-[96px] bottom-[96px] z-30 border-2 border-bone bg-coal/95 p-7 text-[24px] leading-snug transition-[opacity,translate] duration-500 ${notes ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
        >
          <span className="label mb-2 block text-mute">Notas, {name}</span>
          {SLIDES[index].notes}
        </div>

        <p className={`label pointer-events-none absolute bottom-[96px] left-1/2 z-30 -translate-x-1/2 text-mute transition-opacity duration-700 ${hint ? 'opacity-100' : 'opacity-0'}`}>
          Flechas o clic para avanzar. N notas, F pantalla completa
        </p>
      </div>
      <div className="grain" />
    </main>
  )
}
