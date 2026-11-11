import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import QRCode from 'qrcode'
import { ArchFrame, Ground, InkDefs, Seal, Sunburst, Woodcut, type ObjectName } from './Art'

/**
 * Print sheets for the stand, Letter size. Open the site with `?imprimir` and print,
 * or use the exported PDF in /imprimir. Dark ink on white paper: it reads like a real
 * woodcut print and does not drain the cartridge on a full dark background.
 */

const SITE = 'https://hyvento-feria.vercel.app'
const INK = '#16110b'

/** `level` H tolerates the seal covering the middle of the code. */
function Qr({ className = '', level = 'M' }: { className?: string; level?: 'M' | 'H' }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    QRCode.toString(SITE, { type: 'svg', margin: 0, errorCorrectionLevel: level, color: { dark: INK, light: '#0000' } }).then(setSvg)
  }, [level])
  return <div className={`[&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />
}

/** Ornamental rule: line, star, line. */
function Rule({ className = '' }: { className?: string }) {
  const star = 'M0-9c1 6 3 8 9 9-6 1-8 3-9 9-1-6-3-8-9-9 6-1 8-3 9-9z'
  return (
    <svg viewBox="-200 -12 400 24" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M-196 0H-64M64 0h132" />
        <path d="M-196 6H-110M110 6h86" strokeWidth="1" />
      </g>
      <g fill="currentColor">
        <path d={star} transform="scale(1.25)" />
        <path d={star} transform="translate(-38 0) scale(0.6)" />
        <path d={star} transform="translate(38 0) scale(0.6)" />
      </g>
    </svg>
  )
}

/** Printed border: a heavy rule, a hairline inside it, and stars in the corners. */
function Sheet({ children }: { children: ReactNode }) {
  return (
    <section className="sheet relative overflow-hidden bg-white" style={{ color: INK, '--color-coal': '#ffffff' } as CSSProperties}>
      <div className="absolute inset-[0.42in] border-[5px] border-current" />
      <div className="absolute inset-[0.56in] border border-current" />
      {['top-[0.66in] left-[0.66in]', 'top-[0.66in] right-[0.66in]', 'bottom-[0.66in] left-[0.66in]', 'bottom-[0.66in] right-[0.66in]'].map((pos) => (
        <div key={pos} className={`absolute w-[0.34in] ${pos}`}>
          <Woodcut name="estrella" className="w-full" />
        </div>
      ))}
      <div className="absolute inset-[0.62in] flex flex-col items-center">{children}</div>
    </section>
  )
}

const FLOATERS: [ObjectName, string][] = [
  ['taza', 'top-[1.25in] left-[0.2in] w-[1.15in] -rotate-12'],
  ['tijeras', 'top-[1.1in] right-[0.25in] w-[1.05in] rotate-12'],
  ['bolsa', 'top-[3.75in] left-[0.3in] w-[0.95in] rotate-6'],
  ['campana', 'top-[3.6in] right-[0.2in] w-[1.2in] -rotate-6'],
  ['llave', 'top-[2.55in] left-[0.05in] w-[0.7in] rotate-[24deg]'],
  ['sol', 'top-[2.5in] right-[0.1in] w-[0.75in]'],
]

export function Print() {
  return (
    <main className="print-root">
      <InkDefs />

      {/* ------------------------------------------------ Hoja 1: logo */}
      <Sheet>
        <p className="mt-[0.5in] text-[0.15in] font-semibold tracking-[0.42em] uppercase">Software a la medida · Colombia</p>

        <div className="relative mt-[0.22in] h-[5in] w-[5in]">
          <div className="absolute inset-0 [mask-image:radial-gradient(closest-side,#000_62%,transparent_100%)]">
            <Sunburst className="h-full w-full" />
          </div>
          <div className="absolute inset-0 m-auto h-[3.2in] w-[3.2in] rounded-full bg-white" />
          <div className="absolute inset-0 m-auto h-[3.2in] w-[3.2in] rounded-full border-[6px] border-current" />
          <div className="absolute inset-0 m-auto h-[2.96in] w-[2.96in] rounded-full border border-current" />
          <Seal className="absolute inset-0 m-auto h-[2.45in] w-[2.45in]" />
        </div>

        <h1 className="deco -mt-[0.06in] text-[1.24in] leading-none">Hyvento</h1>
        <Rule className="mt-[0.2in] w-[5in]" />
        <p className="deco mt-[0.22in] text-[0.4in] leading-none normal-case">Míralo antes de pagarlo</p>

        <p className="mt-auto mb-[0.5in] text-[0.17in] font-semibold tracking-[0.42em] uppercase">hyvento.co</p>
      </Sheet>

      {/* ------------------------------------------------ Hoja 2: eslogan */}
      <Sheet>
        {FLOATERS.map(([name, cls]) => (
          <div key={name} className={`absolute ${cls}`}>
            <Woodcut name={name} className="w-full" />
          </div>
        ))}

        {/* Arch with the seal where the 3D instrument sits on the site */}
        <div className="relative mt-[0.42in] h-[4.94in] w-[3.9in]">
          <div className="absolute inset-0 [clip-path:url(#arch-clip)]">
            <div className="absolute top-[39.47%] left-1/2 aspect-square w-[173.3%] -translate-x-1/2 -translate-y-1/2">
              <Sunburst className="h-full w-full" />
            </div>
            <Ground className="absolute inset-0 h-full w-full" />
          </div>
          <ArchFrame className="absolute inset-0 h-full w-full" />
          <Seal className="absolute top-[20.2%] left-[26.5%] w-[47%]" />
        </div>

        <h1 className="deco mt-[0.28in] text-center text-[0.86in] leading-[0.98]">
          Míralo antes
          <br />
          de pagarlo
        </h1>
        <Rule className="mt-[0.2in] w-[4.4in]" />
        <p className="mt-[0.2in] max-w-[5.6in] text-center text-[0.215in] leading-snug">
          Arma en vivo la página de tu negocio, con tu logo y tus colores. <b>Si te gusta lo que ves, hablamos.</b>
        </p>

        <div className="mt-auto mb-[0.4in] flex w-full items-center justify-between px-[0.55in]">
          <div className="flex items-center gap-[0.14in]">
            <Seal className="h-[0.6in] w-[0.6in]" />
            <span className="deco text-[0.29in] leading-none">Hyvento</span>
          </div>
          <p className="text-right text-[0.135in] leading-snug whitespace-nowrap">
            <b>Grupo 18</b>
            <br />
            Décima Cuarta Feria de Emprendimiento
            <br />
            Visión de las Américas, 2026
          </p>
        </div>
      </Sheet>

      {/* ------------------------------------------------ Hoja 3: QR */}
      <Sheet>
        <p className="mt-[0.5in] text-[0.15in] font-semibold tracking-[0.42em] uppercase">Saca el celular</p>
        <h1 className="deco mt-[0.16in] text-center text-[0.8in] leading-[0.98]">
          Arma tu
          <br />
          página aquí
        </h1>
        <Rule className="mt-[0.2in] w-[4.4in]" />

        {/* The code, framed like a plate: heavy rule, hairline, a star on each side */}
        <div className="relative mt-[0.28in]">
          <div className="border-[6px] border-current p-[0.1in]">
            <div className="border border-current p-[0.2in]">
              <Qr level="H" className="h-[3.45in] w-[3.45in]" />
            </div>
          </div>
          <div className="absolute inset-0 m-auto grid h-[1in] w-[1in] place-items-center rounded-full bg-white">
            <Seal className="h-[0.86in] w-[0.86in]" />
          </div>
          <div className="absolute top-1/2 -left-[0.78in] w-[0.5in] -translate-y-1/2">
            <Woodcut name="estrella" className="w-full" />
          </div>
          <div className="absolute top-1/2 -right-[0.78in] w-[0.5in] -translate-y-1/2">
            <Woodcut name="estrella" className="w-full" />
          </div>
        </div>

        <div className="mt-[0.28in] grid w-full grid-cols-3 px-[0.5in] text-center">
          {(
            [
              ['1', 'Escanea', 'con la cámara'],
              ['2', 'Elige tu negocio', 'y ponle tu marca'],
              ['3', 'Mira tu página', 'antes de pagarla'],
            ] as const
          ).map(([n, t, d], i) => (
            <div key={n} className={i ? 'border-l border-current' : ''}>
              <b className="deco block text-[0.44in] leading-none">{n}</b>
              <span className="mt-[0.08in] block text-[0.175in] font-semibold">{t}</span>
              <span className="block text-[0.14in]">{d}</span>
            </div>
          ))}
        </div>

        <p className="mt-auto mb-[0.5in] text-center text-[0.15in] leading-snug">
          ¿Sin cámara? Entra a <b>hyvento-feria.vercel.app</b>
          <br />
          ¿Quieres hablar ya con nosotros? <b>hyvento.co</b>
        </p>
      </Sheet>
    </main>
  )
}
