import { useState, type ReactNode } from 'react'
import { Minus, Plus } from '@phosphor-icons/react'
import type { Block, Business, GenericId } from '../lib/config'

/**
 * Free blocks: pieces any business can drop anywhere on its page. Each has a few text
 * fields the visitor can rewrite, and takes the block-level background from its wrapper.
 */

export interface Field {
  key: string
  label: string
  /** long fields get a textarea */
  long?: boolean
}

export const FIELDS: Record<GenericId, Field[]> = {
  texto: [
    { key: 'title', label: 'Título' },
    { key: 'body', label: 'Párrafo', long: true },
  ],
  cta: [
    { key: 'title', label: 'Frase' },
    { key: 'button', label: 'Texto del botón' },
  ],
  imagen: [{ key: 'caption', label: 'Pie de foto' }],
  cifras: [
    { key: 'n1', label: 'Cifra 1' },
    { key: 'l1', label: 'Qué mide' },
    { key: 'n2', label: 'Cifra 2' },
    { key: 'l2', label: 'Qué mide' },
    { key: 'n3', label: 'Cifra 3' },
    { key: 'l3', label: 'Qué mide' },
  ],
  faq: [
    { key: 'q1', label: 'Pregunta 1' },
    { key: 'a1', label: 'Respuesta 1', long: true },
    { key: 'q2', label: 'Pregunta 2' },
    { key: 'a2', label: 'Respuesta 2', long: true },
    { key: 'q3', label: 'Pregunta 3' },
    { key: 'a3', label: 'Respuesta 3', long: true },
  ],
  cinta: [{ key: 'text', label: 'Texto que corre' }],
  equipo: [
    { key: 'p1', label: 'Persona 1' },
    { key: 'p2', label: 'Persona 2' },
    { key: 'p3', label: 'Persona 3' },
  ],
  boletin: [
    { key: 'title', label: 'Invitación' },
    { key: 'button', label: 'Texto del botón' },
  ],
}

/** Starting copy for a new block, written for the business it lands on. */
export function defaults(type: GenericId, b: Business, name: string): Record<string, string> {
  switch (type) {
    case 'texto':
      return { title: `Por qué ${name}`, body: `Llevamos años haciendo lo mismo, cada vez mejor. ${b.tagline} Ven y compruébalo.` }
    case 'cta':
      return { title: '¿Listo para probar?', button: b.cta }
    case 'imagen':
      return { caption: b.address, photo: '1' }
    case 'cifras':
      return { n1: '12', l1: 'años abiertos', n2: '4.8', l2: 'de 5 en reseñas', n3: '7', l3: 'días a la semana' }
    case 'faq':
      return {
        q1: '¿Necesito reservar?',
        a1: 'No es obligatorio, pero te lo recomendamos los fines de semana.',
        q2: '¿Qué medios de pago reciben?',
        a2: 'Efectivo, Nequi, PSE y tarjeta.',
        q3: '¿Tienen parqueadero?',
        a3: 'Sí, a media cuadra hay uno con convenio.',
      }
    case 'cinta':
      return { text: `${name} ✶ ${b.promo}` }
    case 'equipo':
      return { p1: 'Lucía Marín', p2: 'Tomás Rey', p3: 'Ana Sofía Pulido' }
    case 'boletin':
      return { title: 'Entérate primero de lo nuevo', button: 'Suscribirme' }
  }
}

const pad = 'px-[5.5cqw] @md:px-[4.5cqw]'
const sect = `py-[8cqw] @md:py-[5cqw] ${pad}`
const btn = 'rounded-(--s-rb) bg-(--s-brand) font-semibold text-(--s-on-brand)'

function Faq({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="border-t border-(--s-ink)/20">
      {items.map(([q, a], i) => (
        <div key={i} className="border-b border-(--s-ink)/20">
          <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-[3.6cqw] text-left @md:py-[1.8cqw]">
            <span className="site-head text-[5.4cqw] leading-tight @md:text-[2.4cqw]">{q}</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-(--s-ink)/40">{open === i ? <Minus size={13} /> : <Plus size={13} />}</span>
          </button>
          <div className="fold" data-open={open === i}>
            <div>
              <p className="max-w-[60ch] pb-[4cqw] text-[13px] leading-relaxed opacity-75 @md:pb-[2cqw]">{a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function renderGeneric(block: Block, b: Business): ReactNode {
  const p = block.props ?? {}
  const photos = [...b.photos, ...b.items.map((i) => i.img)]
  switch (block.type as GenericId) {
    case 'texto':
      return (
        <div className={`grid gap-[4cqw] @md:grid-cols-[1fr_1.1fr] @md:gap-[5cqw] ${sect}`}>
          <h3 className="site-head text-[9cqw] leading-[1.02] @md:text-[4.6cqw]">{p.title}</h3>
          <p className="max-w-[58ch] text-[14px] leading-relaxed opacity-80">{p.body}</p>
        </div>
      )
    case 'cta':
      return (
        <div className={`flex flex-col items-center gap-[5cqw] text-center @md:gap-[2.6cqw] ${sect}`}>
          <p className="site-head max-w-[14ch] text-[13cqw] leading-[0.95] @md:text-[7cqw]">{p.title}</p>
          <span className={`${btn} px-6 py-3 text-[13px]`}>{p.button}</span>
        </div>
      )
    case 'imagen':
      return (
        <div className="relative h-[66cqw] overflow-hidden @md:h-[38cqw]">
          <img src={photos[Number(p.photo ?? 1) % photos.length]} alt="" className="kb h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <span className={`absolute bottom-[4cqw] text-[12px] tracking-[0.14em] text-white uppercase @md:bottom-[2.4cqw] ${pad}`}>{p.caption}</span>
        </div>
      )
    case 'cifras':
      return (
        <div className={`grid gap-[6cqw] @md:grid-cols-3 @md:gap-0 ${sect}`}>
          {[
            [p.n1, p.l1],
            [p.n2, p.l2],
            [p.n3, p.l3],
          ].map(([n, l], i) => (
            <div key={i} className={`@md:px-[3cqw] ${i ? '@md:border-l @md:border-(--s-ink)/20' : '@md:pl-0'}`}>
              <b className="site-head block text-[20cqw] leading-[0.9] text-(--s-accent) @md:text-[9cqw]">{n}</b>
              <span className="mt-2 block text-[13px] opacity-75">{l}</span>
            </div>
          ))}
        </div>
      )
    case 'faq':
      return (
        <div className={`grid gap-[5cqw] @md:grid-cols-[0.7fr_1.3fr] @md:gap-[5cqw] ${sect}`}>
          <h3 className="site-head text-[9cqw] leading-[1.02] @md:text-[4.6cqw]">Preguntas frecuentes</h3>
          <Faq
            items={[
              [p.q1, p.a1],
              [p.q2, p.a2],
              [p.q3, p.a3],
            ]}
          />
        </div>
      )
    case 'cinta':
      return (
        <div className="overflow-hidden border-y border-(--s-ink)/15 py-[3cqw] @md:py-[1.5cqw]">
          <div className="site-head flex w-max gap-[5cqw] text-[11cqw] whitespace-nowrap [animation:marquee_20s_linear_infinite] @md:text-[5.6cqw]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i}>{p.text} ✶</span>
            ))}
          </div>
        </div>
      )
    case 'equipo':
      return (
        <div className={sect}>
          <h3 className="site-head text-[9cqw] leading-none @md:text-[4.6cqw]">El equipo</h3>
          <div className="mt-[5cqw] grid grid-cols-3 gap-2 @md:mt-[2.6cqw] @md:gap-4">
            {[p.p1, p.p2, p.p3].map((person, i) => (
              <figure key={i} className={i === 1 ? '@md:mt-[3cqw]' : ''}>
                <div className="aspect-[3/4] overflow-hidden rounded-(--s-r)">
                  <img src={photos[(i + 2) % photos.length]} alt="" className="h-full w-full object-cover" />
                </div>
                <figcaption className="mt-2 text-[13px] leading-tight font-medium">{person}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )
    case 'boletin':
      return (
        <div className={`grid gap-[4cqw] @md:grid-cols-[1.1fr_1fr] @md:items-center @md:gap-[5cqw] ${sect}`}>
          <p className="site-head text-[9cqw] leading-[1.02] @md:text-[4.4cqw]">{p.title}</p>
          <div className="flex overflow-hidden rounded-(--s-rb) border border-(--s-ink)/35">
            <span className="flex-1 px-4 py-3 text-[13px] opacity-55">tucorreo@ejemplo.com</span>
            <span className={`${btn} !rounded-none px-4 py-3 text-[13px] whitespace-nowrap`}>{p.button}</span>
          </div>
        </div>
      )
  }
}
