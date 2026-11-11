import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Clock,
  Coffee,
  CreditCard,
  FlowerLotus,
  List,
  MagnifyingGlass,
  Play,
  ShieldCheck,
  ShoppingBagOpen,
  User,
  type Icon,
} from '@phosphor-icons/react'
import { cop, type Business, type BusinessId, type StudioState } from '../lib/config'
import type { LogoMark } from './Logos'

/**
 * One full page skeleton per business, each composed after a different reference:
 * split stage for the restaurant, poster and spec
 * cards for the coffee shop, editorial collage for the barber, and so on.
 * Everything still reads the visitor's choices: name, tagline, colour, type, radius, photo.
 */

export interface TemplateCtx {
  b: Business
  state: StudioState
  name: string
  tagline: string
  centered: boolean
  Logo: LogoMark
  /** average glyph width of the chosen display font, in em */
  charW: number
}

export interface Template {
  /** header floats over the hero photograph instead of sitting above it */
  overlay: boolean
  header: ReactNode
  hero: ReactNode
  catalog: ReactNode
}

const pad = 'px-[5.5cqw] @md:px-[4.5cqw]'
const sect = `py-[8cqw] @md:py-[5cqw] ${pad}`
const btn = 'rounded-(--s-rb) bg-(--s-brand) font-semibold text-(--s-on-brand)'
const outlineBrand = 'text-transparent [-webkit-text-stroke:1px_var(--s-accent)]'

const COPY: Record<BusinessId, { statement: string; body: string }> = {
  restaurante: {
    statement: 'Donde la leña se encuentra con la sazón de casa',
    body: 'Cortes madurados, brasa de encino y recetas de familia. Cada plato sale del fuego a tu mesa sin escalas.',
  },
  cafeteria: {
    statement: 'Nos acusan de pensar solo en café. A eso decimos: gracias. Tostamos en lotes pequeños, conocemos a quien lo cultiva y lo servimos como se debe.',
    body: 'Son los lotes más escasos de las fincas con las que ya trabajamos. Poca cantidad, mucho carácter.',
  },
  tienda: {
    statement: 'Ropa que se repara, no que se bota.',
    body: 'Cada prenda trae arreglos gratis de por vida. Tráela, la cosemos y sigue contigo.',
  },
  barberia: {
    statement: 'Quiero recibir noticias de la barbería, sus sedes y sus eventos.',
    body: 'Ver el video',
  },
  gimnasio: { statement: '', body: '' },
  pasteleria: { statement: '', body: '' },
  consultorio: {
    statement: 'Así es tu primera visita',
    body: 'Sin sorpresas: sabes qué te vamos a hacer, cuánto dura y cuánto cuesta antes de sentarte.',
  },
}

function Img({ src, className = '' }: { src: string; className?: string }) {
  return <img key={src} src={src} alt="" className={`h-full w-full object-cover [animation:fade_0.7s_ease] ${className}`} />
}

/** Round seal with its legend running around the rim, turning slowly. */
function Stamp({ text, className = '' }: { text: string; className?: string }) {
  const id = useId()
  const legend = `${text} ✶ ${text} ✶ `
  return (
    <svg viewBox="0 0 100 100" className={`[animation:spin_16s_linear_infinite] ${className}`} aria-hidden="true">
      <defs>
        <path id={id} d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
      </defs>
      <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fill="currentColor" fontSize="9.2" fontWeight="700" letterSpacing="1.2" style={{ textTransform: 'uppercase' }}>
        <textPath href={`#${id}`} textLength="236" lengthAdjust="spacing">
          {legend}
        </textPath>
      </text>
      <path d="M50 36l3.6 10.4L64 50l-10.4 3.6L50 64l-3.6-10.4L36 50l10.4-3.6z" fill="currentColor" />
    </svg>
  )
}

function Mark({ ctx, className = '' }: { ctx: TemplateCtx; className?: string }) {
  const { state, Logo } = ctx
  return state.logo ? (
    <img src={state.logo} alt="" className={`t-logo h-8 w-8 shrink-0 rounded-(--s-r) object-contain ${className}`} />
  ) : (
    <span className={`t-logo grid h-8 w-8 shrink-0 place-items-center rounded-(--s-r) bg-(--s-brand) text-(--s-on-brand) ${className}`}>
      <Logo size={24} letter={ctx.name.trim().charAt(0) || 'H'} />
    </span>
  )
}

// Set per render by buildTemplate: glyph width of the chosen font and the visitor's size multiplier.
let CW = 0.56
let SCALE = 1

/**
 * Size a stacked poster headline so it always fits its box: wrap the words into lines of
 * about `chars` characters, then take the largest size that fits both the height and the width.
 * Returns CSS custom properties for the phone (--hm) and browser (--hd) layouts, in cqw.
 */
function fit(text: string, chars: number, phone: [max: number, tall: number, wide: number], desk: [max: number, tall: number, wide: number], lh = 0.86) {
  const lines: string[] = []
  for (const word of text.trim().split(/\s+/)) {
    const last = lines[lines.length - 1]
    if (last !== undefined && (last + ' ' + word).length <= chars) lines[lines.length - 1] = last + ' ' + word
    else lines.push(word)
  }
  const longest = Math.max(1, ...lines.map((l) => l.length))
  const size = ([max, tall, wide]: [number, number, number]) => (Math.min(max, tall / (lines.length * lh), wide / (longest * CW)) * SCALE).toFixed(2)
  return { '--hm': `${size(phone)}cqw`, '--hd': `${size(desk)}cqw` } as CSSProperties
}
const fitted = 'text-[length:var(--hm)] @md:text-[length:var(--hd)]'

const split = (name: string, fallback: string) => {
  const w = name.split(' ')
  if (w.length < 2) return [name, fallback]
  const cut = Math.ceil(w.length / 2)
  return [w.slice(0, cut).join(' '), w.slice(cut).join(' ')]
}

/* =============================================================== Restaurante */

function restaurante(ctx: TemplateCtx): Template {
  const { b, state, name, tagline, centered } = ctx
  const photo = b.photos[state.photo]
  const [p2, p3] = b.photos.filter((_, i) => i !== state.photo)
  const [a, z] = split(name, b.label)
  const copy = COPY.restaurante

  return {
    overlay: true,
    header: (
      <div className={`flex h-14 items-center justify-between text-white ${pad}`}>
        <div className="flex items-center gap-2.5">
          <Mark ctx={ctx} />
          <span className="site-head text-[15px] italic">{name}</span>
        </div>
        <span className="flex items-center gap-2.5 text-[10px] tracking-[0.22em] text-(--s-accent-d) uppercase">
          Menú
          <span className="flex flex-col items-end gap-1">
            <i className="block h-px w-6 bg-current" />
            <i className="block h-px w-4 bg-current" />
            <i className="block h-px w-6 bg-current" />
          </span>
        </span>
      </div>
    ),
    hero: (
      <>
        {/* Split stage: the name steps over the seam, its second half only an outline.
            Always dark, whatever the page background, so the type holds over the photograph. */}
        <div className="relative grid bg-[#14110e] text-[#f6f1e6] [--s-accent:var(--s-accent-d)] [--s-ink:#f6f1e6] @md:grid-cols-[1.5fr_1fr]">
          <div className="relative h-[78cqw] overflow-hidden @md:h-[56cqw]">
            <Img src={photo} className="kb" />
            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/10 to-black/30 @md:bg-linear-to-r @md:from-black/35 @md:via-black/10 @md:to-black/70" />
            <Stamp text="Reserva tu mesa" className="absolute bottom-[5cqw] left-[5cqw] w-[24cqw] text-[#f6f1e6] @md:bottom-[3cqw] @md:left-[3cqw] @md:w-[11cqw]" />
          </div>
          <div className={`relative z-[1] flex flex-col justify-center gap-[3.5cqw] px-[5.5cqw] py-[9cqw] @md:gap-[1.7cqw] @md:py-0 @md:pr-[4.5cqw] @md:pl-0 ${centered ? 'items-center text-center' : 'items-start'}`}>
            <p style={fit(a, 40, [15, 99, 86], [8.6, 99, 47])} className={`site-head leading-[0.9] whitespace-nowrap @md:-ml-[13cqw] @md:[text-shadow:0_2px_30px_rgb(0_0_0/0.5)] ${fitted}`}>
              {a}
            </p>
            <p style={fit(z, 40, [15, 99, 86], [8.6, 99, 33])} className={`site-head -mt-[2cqw] leading-[0.9] whitespace-nowrap @md:-mt-[0.8cqw] @md:pl-[3cqw] ${fitted} ${outlineBrand}`}>
              {z}
            </p>
            <p className="max-w-[30ch] text-[13px] leading-relaxed opacity-80 @md:pl-[3cqw]">{tagline} Te recibimos de martes a domingo, a fuego lento.</p>
            <span className="flex gap-2 text-(--s-ink) @md:pl-[3cqw]">
              <FlowerLotus size={26} />
              <FlowerLotus size={26} />
            </span>
          </div>
          <span className="absolute right-[4cqw] bottom-[4cqw] z-[2] flex items-center gap-3 rounded-(--s-rb) bg-(--s-brand) py-1.5 pr-4 pl-1.5 text-[12px] font-semibold text-(--s-on-brand) shadow-[0_10px_30px_rgb(0_0_0/0.35)] @md:right-[2.5cqw] @md:bottom-[2.5cqw]">
            <span className="grid h-7 w-7 place-items-center rounded-(--s-rb) bg-(--s-on-brand)/15">
              <CalendarCheck size={15} weight="fill" />
            </span>
            {b.cta}
          </span>
        </div>

        <div className="overflow-hidden py-[3cqw] @md:py-[1.6cqw]">
          <div className={`site-head flex w-max gap-[4cqw] text-[12cqw] whitespace-nowrap opacity-50 [animation:marquee_26s_linear_infinite] @md:text-[7cqw] ${outlineBrand}`}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i}>
                {name} · Cocina de autor ·
              </span>
            ))}
          </div>
        </div>

        {/* Statement between floating photographs */}
        <div className="relative px-[5.5cqw] py-[10cqw] text-center @md:px-[20cqw] @md:py-[7cqw]">
          <div className="absolute top-[14%] left-[3cqw] hidden aspect-[4/5] w-[13cqw] overflow-hidden rounded-[10px] @md:block">
            <Img src={p2} />
          </div>
          <div className="absolute top-[8%] right-[5cqw] hidden aspect-[4/5] w-[13cqw] overflow-hidden rounded-[10px] @md:block">
            <Img src={p3} />
          </div>
          <div className="absolute top-[42%] right-[2.5cqw] hidden aspect-square w-[12cqw] overflow-hidden rounded-[10px] opacity-45 @md:block">
            <Img src={b.items[2].img} />
          </div>
          <p className="site-head text-[8.4cqw] leading-[1.06] @md:text-[5cqw]">{copy.statement}</p>
          <p className="mx-auto mt-[4cqw] max-w-[46ch] text-[13px] leading-relaxed opacity-75 @md:mt-[2cqw]">{copy.body}</p>
        </div>

        {/* Full-bleed plate with the way into the menu */}
        <div className="relative h-[62cqw] overflow-hidden @md:h-[30cqw]">
          <Img src={b.items[1].img} />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/35 to-transparent" />
          <div className={`absolute inset-y-0 left-0 flex max-w-[78%] flex-col justify-center gap-4 text-white @md:max-w-[38%] ${pad}`}>
            <p className="text-[13px] leading-relaxed">Menú de seis tiempos que cambia con la temporada, con maridaje pensado plato por plato.</p>
            <span className="w-fit rounded-(--s-rb) bg-(--s-brand) px-4 py-2.5 text-[10px] font-semibold tracking-[0.18em] text-(--s-on-brand) uppercase">Ver la carta</span>
          </div>
        </div>
      </>
    ),
    catalog: (
      <div className={`grid gap-[7cqw] @md:grid-cols-[1fr_1fr] @md:items-end @md:gap-[4cqw] ${sect}`}>
        <div>
          <p className="text-[10px] tracking-[0.24em] text-(--s-accent) uppercase">De la brasa</p>
          <h3 className="site-head mt-2 text-[9cqw] leading-none @md:text-[4.6cqw]">{b.listTitle}</h3>
          <div className="mt-[4cqw] @md:mt-[2.4cqw]">
            {b.items.map((it) => (
              <div key={it.name} className="flex items-baseline gap-3 border-b border-(--s-brand)/30 py-[3.6cqw] @md:py-[1.8cqw]">
                <span className="site-head text-[5.6cqw] @md:text-[2.6cqw]">{it.name}</span>
                <span className="flex-1 -translate-y-1 border-b border-dotted border-(--s-ink)/35" />
                <span className="text-[13px] text-(--s-accent) tabular-nums">{cop(it.price)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 @md:gap-3">
          {b.items.slice(0, 2).map((it) => (
            <div key={it.name} className="relative aspect-[3/4] overflow-hidden">
              <Img src={it.img} />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 text-white">
                <p className="site-head text-[5cqw] leading-tight @md:text-[2.2cqw]">{it.name}</p>
                <span className="mt-2 inline-block border border-white/80 px-2.5 py-1 text-[9px] tracking-[0.18em] uppercase">Ver más</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }
}

/* ================================================================= Cafetería */

function Quiz() {
  const [pick, setPick] = useState(0)
  return (
    <div className="mx-auto flex max-w-[420px] flex-col gap-1.5">
      {['Con cafeína', 'Descafeinado'].map((o, i) => (
        <button key={o} type="button" onClick={() => setPick(i)} className="flex items-center gap-3 rounded-(--s-r) bg-(--s-soft) px-3 py-2.5 text-left text-[12px]">
          <span className={`grid h-3.5 w-3.5 place-items-center rounded-full border border-(--s-ink)/50 ${pick === i ? 'bg-(--s-ink)' : ''}`} />
          {o}
        </button>
      ))}
    </div>
  )
}

function cafeteria(ctx: TemplateCtx): Template {
  const { b, state, name, tagline, centered } = ctx
  const photo = b.photos[state.photo]
  const [p2, p3] = b.photos.filter((_, i) => i !== state.photo)
  const copy = COPY.cafeteria
  const tag = 'bg-white px-1.5 py-0.5 text-black site-head leading-none'

  return {
    overlay: true,
    header: (
      <div className={`flex h-14 items-center text-white ${pad}`}>
        <div className="flex items-center gap-2.5">
          <Mark ctx={ctx} />
          <span className="site-head text-[17px]">{name}</span>
        </div>
      </div>
    ),
    hero: (
      <>
        {/* Poster: photograph to the edges, stacked headline, white service rail */}
        <div className="relative h-[128cqw] overflow-hidden @md:h-[58cqw]">
          <Img src={photo} className="kb" />
          <Stamp text="Recién tostado" className="absolute top-[20cqw] right-[14cqw] w-[24cqw] text-white @md:top-[7cqw] @md:right-[10cqw] @md:w-[11cqw]" />
          <div className="absolute inset-0 bg-linear-to-tr from-black/65 via-black/15 to-black/25" />
          <p
            style={fit(tagline, 9, [21, 84, 78], [13, 42, 62], 0.86)}
            className={`site-head absolute bottom-[7cqw] max-w-[80%] leading-[0.86] text-white @md:bottom-[3cqw] @md:max-w-[68%] ${fitted} ${centered ? 'inset-x-0 mx-auto text-center' : 'left-[5.5cqw] @md:left-[4.5cqw]'}`}
          >
            {tagline}
          </p>
          <span className={`absolute right-[14cqw] bottom-[9cqw] text-[5cqw] @md:right-[12cqw] @md:bottom-[5cqw] @md:text-[2.2cqw] ${tag}`}>{b.cta}</span>
          <div className="absolute inset-y-0 right-0 flex w-9 flex-col items-center justify-between bg-(--s-bg) py-4 text-(--s-ink) @md:w-11">
            <List size={18} />
            <span className="text-[9px] tracking-[0.14em] whitespace-nowrap [writing-mode:vertical-rl]">Envío gratis · {b.hours}</span>
            <span className="flex flex-col items-center gap-3">
              <ShoppingBagOpen size={16} />
              <User size={16} />
              <span className="text-[9px] font-semibold">ES</span>
            </span>
          </div>
        </div>

        <div className={`text-center ${sect}`}>
          <p className="mb-[4cqw] text-[5.6cqw] @md:mb-[2cqw] @md:text-[2.6cqw]">¿Cómo prefieres tu café…</p>
          <Quiz />
        </div>

        {/* Mission set large on the brand colour */}
        <div className={`bg-(--s-brand) text-(--s-on-brand) ${sect}`}>
          <p className="text-[5.4cqw] leading-[1.18] @md:text-[2.9cqw]">
            <span className="site-head mr-[3cqw] inline-block align-top text-[2.6cqw] leading-[1.05] @md:text-[1.1cqw]">
              Nuestra
              <br />
              misión
            </span>
            {copy.statement} <span className={`text-[3.4cqw] @md:text-[1.4cqw] ${tag}`}>Saber más</span>
          </p>
          <div className="mx-auto mt-[6cqw] aspect-[16/9] w-[70%] overflow-hidden @md:mt-[3.5cqw] @md:w-[42%]">
            <Img src={p3} />
          </div>
        </div>
      </>
    ),
    catalog: (
      <>
        {/* Spec cards in outline over a second photograph, the way a roaster labels bags */}
        <div className="relative overflow-hidden text-white">
          <div className="absolute inset-0">
            <Img src={p2} />
            <div className="absolute inset-0 bg-black/55" />
          </div>
          <div className={`relative grid gap-2 @md:grid-cols-[1.1fr_1fr_1fr_1fr] ${sect}`}>
            <div className="flex flex-col items-center justify-center gap-3 rounded-[12px] border border-white/80 p-[5cqw] text-center @md:p-[2cqw]">
              <p className="site-head text-[8cqw] leading-[0.95] @md:text-[3cqw]">
                Café de
                <br />
                especialidad
              </p>
              <Coffee size={30} />
            </div>
            {b.items.map((it, i) => (
              <div key={it.name} className="flex flex-col justify-between gap-6 rounded-[12px] border border-white/80 p-[4cqw] @md:p-[1.7cqw]">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="site-head text-[6.4cqw] leading-none @md:text-[2.5cqw]">{it.name}</span>
                  <span className="text-[11px] tabular-nums">{cop(it.price)}</span>
                </div>
                <dl className="site-head grid grid-cols-[auto_1fr] gap-x-5 gap-y-0.5 text-[3.4cqw] leading-tight @md:text-[1.25cqw]">
                  <dt className="opacity-70">Tipo</dt>
                  <dd>{['Mezcla', 'Origen único', 'De la casa'][i]}</dd>
                  <dt className="opacity-70">Origen</dt>
                  <dd>{['Huila', 'Nariño', 'Cauca'][i]}</dd>
                  <dt className="opacity-70">Proceso</dt>
                  <dd>{['Lavado', 'Natural', 'Honey'][i]}</dd>
                </dl>
              </div>
            ))}
            <div className="overflow-hidden rounded-[12px] border border-white/80 py-2 @md:col-span-3 @md:col-start-2">
              <div className="site-head flex w-max gap-6 text-[4cqw] whitespace-nowrap [animation:marquee_16s_linear_infinite] @md:text-[1.6cqw]">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span key={i}>↑ ↑ ↑ ↑ Nuevo ✶ Recién tostado ✶ Nuevo</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Collection: label boxed on the photograph, product panel alongside */}
        <div className={sect}>
          <div className="mb-[4cqw] flex items-center justify-between @md:mb-[2cqw]">
            <span className="text-[5cqw] @md:text-[2cqw]">Colecciones</span>
            <span className="flex items-center gap-3 text-[11px]">
              <u>Ver todo</u>
              <span className="grid h-8 w-8 place-items-center rounded-full border border-(--s-ink)/30 opacity-40">
                <ArrowLeft size={14} />
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full border border-(--s-ink)">
                <ArrowRight size={14} />
              </span>
            </span>
          </div>
          <div className="grid gap-3 @md:grid-cols-[1.9fr_1fr]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-(--s-r) @md:aspect-auto @md:h-[38cqw]">
              <Img src={photo} />
              <span className="site-head absolute bottom-[10%] left-1/2 -translate-x-1/2 border-[3px] border-white bg-white/10 px-3 py-2 text-center text-[8cqw] leading-[0.9] text-white backdrop-blur-[2px] @md:text-[4.2cqw]">
                Edición
                <br />
                limitada
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="aspect-[4/3] overflow-hidden rounded-(--s-r) bg-(--s-soft)">
                <Img src={b.items[0].img} />
              </div>
              <p className="site-head text-[7cqw] leading-none @md:text-[2.8cqw]">Edición limitada</p>
              <p className="text-[12px] leading-relaxed opacity-75">{copy.body}</p>
            </div>
          </div>
        </div>
      </>
    ),
  }
}

/* ==================================================================== Tienda */

function tienda(ctx: TemplateCtx): Template {
  const { b, state, name, tagline } = ctx
  const photo = b.photos[state.photo]
  const [p2, p3] = b.photos.filter((_, i) => i !== state.photo)
  const copy = COPY.tienda
  const pill = 'rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md'

  return {
    overlay: true,
    header: (
      <div className={`flex h-14 items-center justify-between ${pad}`}>
        <div className="flex items-center gap-1.5">
          <Mark ctx={ctx} className="!rounded-full" />
          <span className={`${pill} site-head`}>{name}</span>
          <span className={`${pill} hidden @md:inline`}>Tienda</span>
          <span className={`${pill} hidden @md:inline`}>Historia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`${pill} hidden items-center gap-1.5 @md:flex`}>
            <MagnifyingGlass size={12} /> Buscar
          </span>
          <span className={pill}>Bolsa (2)</span>
        </div>
      </div>
    ),
    hero: (
      <>
        {/* Campaign frame: lettering thrown across the photograph at an angle */}
        <div className="relative h-[130cqw] overflow-hidden @md:h-[58cqw]">
          <Img src={photo} className="kb" />
          <div className="absolute inset-0 bg-black/30" />
          <Stamp text="Arreglos gratis" className="absolute top-[20cqw] right-[6cqw] w-[24cqw] rotate-12 text-white @md:top-[9cqw] @md:right-[5cqw] @md:w-[11cqw]" />
          <p style={fit(tagline, 10, [19, 78, 84], [11.5, 34, 74], 0.88)} className={`site-head absolute inset-0 m-auto h-fit max-w-[86%] -rotate-[4deg] text-center leading-[0.88] text-white ${fitted}`}>
            {tagline}
          </p>
          <span className="absolute bottom-[6cqw] left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-[12px] font-semibold text-black @md:bottom-[3cqw]">{b.cta}</span>
          <span className="absolute bottom-[6cqw] left-[5.5cqw] hidden text-[10px] tracking-[0.2em] text-white uppercase @md:left-[4.5cqw] @md:block">Temporada 02</span>
          <span className="absolute right-[4.5cqw] bottom-[3cqw] hidden text-[10px] tracking-[0.2em] text-white uppercase @md:block">Hecho en Colombia</span>
        </div>

        {/* Category tiles */}
        <div className="grid grid-cols-2 gap-px @md:grid-cols-4">
          {[
            ['Recién llegado', b.items[0].img],
            ['Básicos', p2],
            ['Accesorios', b.items[1].img],
            ['Taller', p3],
          ].map(([label, src]) => (
            <div key={label} className="relative aspect-[3/4] overflow-hidden">
              <Img src={src} />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <span className="site-head absolute bottom-3 left-3 text-[6cqw] leading-none text-white @md:text-[2.6cqw]">{label}</span>
              <span className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-white text-black">
                <ArrowRight size={13} weight="bold" />
              </span>
            </div>
          ))}
        </div>

        {/* Brand promise, set as large as the campaign */}
        <div className={`grid items-center gap-[6cqw] @md:grid-cols-[1.3fr_1fr] @md:gap-[5cqw] ${sect}`}>
          <p className="site-head text-[13cqw] leading-[0.9] @md:text-[7cqw]">{copy.statement}</p>
          <div>
            <p className="max-w-[36ch] text-[13px] leading-relaxed opacity-75">{copy.body}</p>
            <span className="mt-4 inline-block border-b-2 border-(--s-brand) pb-0.5 text-[13px] font-semibold">Conoce el taller</span>
          </div>
        </div>
      </>
    ),
    catalog: (
      <div className={sect}>
        <div className="flex items-end justify-between">
          <h3 className="site-head text-[11cqw] leading-none @md:text-[5.4cqw]">{b.listTitle}</h3>
          <div className="flex gap-1.5 text-[11px]">
            {['Todo', 'Hombre', 'Mujer'].map((c, i) => (
              <span key={c} className={`rounded-full border px-3 py-1.5 ${i === 0 ? 'border-(--s-ink) bg-(--s-ink) text-(--s-bg)' : 'border-(--s-ink)/25'}`}>
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-[5cqw] grid grid-cols-2 gap-x-2 gap-y-5 @md:mt-[2.6cqw] @md:grid-cols-4 @md:gap-x-3">
          {b.items.map((it, i) => (
            <div key={it.name}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-(--s-r) bg-(--s-soft)">
                <Img src={it.img} />
                {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-(--s-brand) px-2 py-1 text-[9px] font-semibold tracking-wider text-(--s-on-brand) uppercase">Nuevo</span>}
                <span className="absolute right-2 bottom-2 grid h-8 w-8 place-items-center rounded-full bg-white text-[18px] leading-none font-light text-black shadow-[0_4px_14px_rgb(0_0_0/0.2)]">+</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <p className="truncate text-[13px] font-medium">{it.name}</p>
                <p className="text-[12px] tabular-nums opacity-65">{cop(it.price)}</p>
              </div>
              <div className="mt-1.5 flex gap-1">
                {['#1a1611', state.brand, '#b9ab92'].map((c) => (
                  <i key={c} className="block h-2.5 w-2.5 rounded-full border border-(--s-ink)/20" style={{ background: c }} />
                ))}
              </div>
            </div>
          ))}
          <div className="flex aspect-[3/4] flex-col justify-between rounded-(--s-r) bg-(--s-brand) p-3 text-(--s-on-brand)">
            <span className="text-[10px] tracking-[0.18em] uppercase">Arreglos gratis</span>
            <p className="site-head text-[8cqw] leading-[0.9] @md:text-[3.4cqw]">
              De por
              <br />
              vida
            </p>
          </div>
        </div>
      </div>
    ),
  }
}

/* ================================================================== Barbería */

function barberia(ctx: TemplateCtx): Template {
  const { b, state, name, tagline } = ctx
  const photo = b.photos[state.photo]
  const [p2, p3] = b.photos.filter((_, i) => i !== state.photo)
  const copy = COPY.barberia
  const caps = 'text-[9px] tracking-[0.16em] uppercase'
  const left = state.align === 'izquierda'

  return {
    overlay: false,
    header: (
      <div className={`flex h-14 items-center justify-between ${pad}`}>
        <div className="flex items-center gap-2">
          <Mark ctx={ctx} className="!h-7 !w-7" />
          <span className="text-[22px] leading-none [font-family:'Caveat_Variable',cursive]">{name.split(' ').slice(-2).join(' ')}</span>
        </div>
        <div className={`hidden gap-5 @md:flex ${caps}`}>
          {['Tienda', 'Nosotros', 'Sedes', 'Servicios', 'Barberos'].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <span className={caps}>
          <span className="opacity-50">Reservar:</span> Centro · Norte
        </span>
      </div>
    ),
    hero: (
      <>
        {/* Bare paper, one statement, one black button */}
        <div className={`flex flex-col gap-[6cqw] py-[18cqw] @md:gap-[3cqw] @md:py-[10cqw] ${pad} ${left ? 'items-start' : 'items-center text-center'}`}>
          <p style={fit(tagline, 13, [13.5, 99, 86], [7.4, 99, 78], 1.02)} className={`site-head max-w-[13ch] leading-[1.02] ${fitted}`}>
            {tagline}
          </p>
          <span className={`rounded-(--s-rb) bg-(--s-ink) px-6 py-3 text-(--s-bg) ${caps}`}>{b.cta}</span>
        </div>

        {/* Photographs pinned loose over a dark band */}
        <div className="relative h-[112cqw] overflow-hidden bg-(--s-ink) @md:h-[52cqw]">
          <div className="absolute top-[-6%] left-[30%] aspect-[4/3] w-[50%] overflow-hidden @md:w-[36%]">
            <Img src={p2} />
          </div>
          <div className="absolute top-[20%] left-[7%] aspect-[4/5] w-[42%] overflow-hidden @md:w-[29%]">
            <Img src={photo} />
          </div>
          <div className="absolute right-[6%] bottom-[-8%] aspect-[5/4] w-[46%] overflow-hidden @md:top-[30%] @md:bottom-auto @md:w-[33%]">
            <Img src={p3} />
          </div>
          <Stamp text="Sin fila, con cita" className="absolute bottom-[6%] left-[8%] w-[24cqw] text-(--s-bg) @md:bottom-[8%] @md:left-[42%] @md:w-[11cqw]" />
        </div>

        {/* Film frame */}
        <div className="relative h-[70cqw] overflow-hidden @md:h-[40cqw]">
          <Img src={b.items[0].img} />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
            <p className="site-head text-[10cqw] leading-none @md:text-[5.6cqw]">El oficio en {name.split(' ').slice(-1)}</p>
            <span className="flex items-center gap-2 text-[14px] italic [font-family:'Cormorant_Garamond',serif]">
              <Play size={12} weight="fill" /> {copy.body}
            </span>
          </div>
        </div>
      </>
    ),
    catalog: (
      <>
        <div className="border-b border-(--s-ink)/20 pt-[8cqw] text-center @md:pt-[4cqw]">
          <span className="text-[16px] italic [font-family:'Cormorant_Garamond',serif]">Siguiente</span>
          <p className="site-head -mb-[1.5cqw] text-[21cqw] leading-[0.9] @md:text-[15cqw]">{b.listTitle}</p>
        </div>
        <div className={sect}>
          {b.items.map((it, i) => (
            <div key={it.name} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-(--s-ink)/15 py-[4.5cqw] @md:py-[2.2cqw]">
              <span className={`opacity-50 ${caps}`}>0{i + 1}</span>
              <span className="site-head text-[8cqw] leading-none @md:text-[4.4cqw]">{it.name}</span>
              <span className="text-right">
                <span className="site-head block text-[5.6cqw] tabular-nums @md:text-[2.6cqw]">{cop(it.price)}</span>
                <span className={`opacity-55 ${caps}`}>{[30, 20, 50][i]} min</span>
              </span>
            </div>
          ))}
        </div>
        <div className={`grid gap-[6cqw] border-t border-(--s-ink)/20 @md:grid-cols-[1.2fr_1fr] @md:gap-[5cqw] ${sect}`}>
          <div>
            <p className="site-head max-w-[20ch] text-[6cqw] leading-[1.12] @md:text-[2.8cqw]">{copy.statement}</p>
            <div className="mt-4 flex w-fit border border-(--s-ink)/40">
              <span className={`px-3 py-2.5 opacity-50 ${caps}`}>Correo electrónico</span>
              <span className={`border-l border-(--s-ink)/40 px-3 py-2.5 ${caps}`}>OK</span>
            </div>
          </div>
          <div className={`grid grid-cols-2 gap-y-1.5 ${caps}`}>
            {['Tienda', 'Instagram', 'Nosotros', 'YouTube', 'Sedes', 'Aviso legal', 'Servicios', 'Barberos'].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </>
    ),
  }
}

/* =============================================================== Consultorio */

function consultorio(ctx: TemplateCtx): Template {
  const { b, state, name, tagline, centered } = ctx
  const photo = b.photos[state.photo]
  const [p2] = b.photos.filter((_, i) => i !== state.photo)
  const copy = COPY.consultorio
  const tw = tagline.trim().split(/\s+/)
  const cut = Math.max(1, tw.length - 2)
  const lead = tw.slice(0, cut).join(' ')
  const accent = tw.slice(cut).join(' ')
  const short = name.split(' ').slice(-1)[0]
  const facts: [Icon, string, string][] = [
    [Clock, 'Cita el mismo día', 'Abrimos cupos cada mañana'],
    [ShieldCheck, 'Sin dolor', 'Sedación consciente si la pides'],
    [CreditCard, 'Pago por cuotas', 'Sin intereses hasta seis meses'],
  ]

  return {
    overlay: false,
    header: (
      <div className="px-[3cqw] pt-2.5 @md:px-[2.5cqw]">
        <div className="flex h-12 items-center justify-between rounded-(--s-r) bg-(--s-soft) pr-1.5 pl-3 shadow-[0_6px_24px_rgb(0_0_0/0.06)] backdrop-blur">
          <div className="flex items-center gap-2.5">
            <Mark ctx={ctx} className="!h-7 !w-7 !rounded-full" />
            <span className="site-head text-[15px]">{name}</span>
          </div>
          <div className="hidden gap-6 text-[12px] opacity-70 @md:flex">
            <span>Tratamientos</span>
            <span>Equipo</span>
            <span>Precios</span>
            <span>Contacto</span>
          </div>
          <span className={`${btn} px-4 py-2 text-[11px] whitespace-nowrap`}>{b.cta}</span>
        </div>
      </div>
    ),
    hero: (
      <>
        {/* Air first: a quiet headline, an arched portrait, a soft disc behind it */}
        <div className={`relative grid items-center gap-[8cqw] overflow-hidden py-[9cqw] @md:grid-cols-[1.05fr_1fr] @md:gap-[4cqw] @md:py-[5cqw] ${pad}`}>
          <div className="absolute -top-[12cqw] -right-[14cqw] aspect-square w-[70cqw] rounded-full bg-(--s-brand)/10 @md:w-[52cqw]" />
          <div className={`relative flex flex-col gap-[4.5cqw] @md:gap-[2.2cqw] ${centered ? 'items-center text-center' : 'items-start'}`}>
            <span className="flex items-center gap-2 rounded-full bg-(--s-soft) px-3 py-1.5 text-[11px] font-medium">
              <i className="block h-1.5 w-1.5 rounded-full bg-(--s-brand)" /> Agenda abierta esta semana
            </span>
            <p className="site-head text-[11cqw] leading-[1.03] @md:text-[5.8cqw]">
              {lead}{' '}
              <em className="font-normal text-(--s-accent) [font-family:'Playfair_Display_Variable',serif]">{accent}</em>
            </p>
            <p className="max-w-[36ch] text-[13px] leading-relaxed opacity-70">Un consultorio donde te explican antes de tocar. {b.hours}.</p>
            <div className="flex items-center gap-4">
              <span className={`${btn} px-5 py-3 text-[13px] whitespace-nowrap`}>{b.cta}</span>
              <span className="border-b border-current pb-0.5 text-[13px] font-medium">Ver tratamientos</span>
            </div>
          </div>
          <div className="relative mx-auto w-[76%] @md:w-[88%]">
            <div className="aspect-[4/5] overflow-hidden rounded-t-full rounded-b-(--s-r)">
              <Img src={photo} className="kb" />
            </div>
            <Stamp text="Cita el mismo día" className="absolute -top-[4%] -right-[4%] w-[24cqw] rounded-full bg-(--s-bg) text-(--s-accent) @md:w-[10cqw]" />
            <div className="absolute bottom-[10%] -left-[10%] flex items-center gap-2.5 rounded-(--s-r) bg-(--s-bg) px-3 py-2.5 shadow-[0_14px_36px_rgb(0_0_0/0.16)]">
              <span className="h-9 w-9 overflow-hidden rounded-full">
                <Img src={p2} />
              </span>
              <span className="text-[11px] leading-tight">
                <b className="block">Dra. Mariana Ríos</b>
                <span className="opacity-60">Odontóloga general</span>
              </span>
            </div>
          </div>
        </div>

        {/* Three reassurances on one line */}
        <div className={`grid border-y border-(--s-ink)/12 @md:grid-cols-3 ${pad}`}>
          {facts.map(([I, t, d], i) => (
            <div key={t} className={`flex items-center gap-3 py-4 @md:px-[2cqw] ${i ? 'border-t border-(--s-ink)/12 @md:border-t-0 @md:border-l' : '@md:pl-0'}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-(--s-brand)/12 text-(--s-accent)">
                <I size={19} weight="fill" />
              </span>
              <span className="text-[12px] leading-tight">
                <b className="block text-[13px]">{t}</b>
                <span className="opacity-65">{d}</span>
              </span>
            </div>
          ))}
        </div>

        {/* First visit, step by step */}
        <div className={`grid gap-[6cqw] @md:grid-cols-[0.8fr_1.2fr] @md:gap-[5cqw] ${sect}`}>
          <div>
            <p className="site-head text-[8.4cqw] leading-[1.04] @md:text-[4cqw]">{copy.statement}</p>
            <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed opacity-70">{copy.body}</p>
          </div>
          <div className="grid gap-3 @md:grid-cols-3">
            {[
              ['Valoración', 'Revisión completa y radiografía, 30 minutos.'],
              ['Tu plan', 'Tratamiento, tiempos y precio por escrito.'],
              ['Manos a la obra', 'Empezamos el mismo día si quieres.'],
            ].map(([t, d], i) => (
              <div key={t} className="rounded-(--s-r) bg-(--s-soft) p-4">
                <span className="site-head block text-[13cqw] leading-none text-(--s-accent)/35 @md:text-[6cqw]">{i + 1}</span>
                <b className="mt-3 block text-[14px]">{t}</b>
                <span className="mt-1 block text-[12px] leading-snug opacity-70">{d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-[3cqw] pb-[6cqw] @md:px-[2.5cqw] @md:pb-[4cqw]">
          <div className="relative flex h-[58cqw] items-center justify-center overflow-hidden rounded-[22px] bg-(--s-brand) text-(--s-on-brand) @md:h-[32cqw]">
            <div className="absolute -top-[30%] -left-[8%] aspect-square w-[46%] rounded-full bg-(--s-on-brand)/10" />
            <div className="absolute -right-[6%] -bottom-[40%] aspect-square w-[52%] rounded-full border border-(--s-on-brand)/25" />
            <p className="site-head relative flex items-center gap-[3cqw] text-[15cqw] leading-none uppercase @md:text-[10cqw]">
              {short.slice(0, Math.ceil(short.length / 2))}
              <span className="aspect-square w-[16cqw] overflow-hidden rounded-full border-[3px] border-(--s-on-brand) @md:w-[10cqw]">
                <Img src={p2} />
              </span>
              {short.slice(Math.ceil(short.length / 2))}
            </p>
            <span className="absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.2em] uppercase opacity-80">Citas uno a uno</span>
            <span className="absolute right-4 bottom-3 font-mono text-[9px] tracking-[0.2em] uppercase opacity-80">{name} ©</span>
          </div>
        </div>
      </>
    ),
    catalog: (
      <div className={`bg-(--s-brand)/8 ${sect}`}>
        <div className="flex items-end justify-between">
          <h3 className="site-head text-[8.4cqw] leading-none @md:text-[4cqw]">{b.listTitle}</h3>
          <span className="border-b border-current pb-0.5 text-[12px] font-medium">Ver precios</span>
        </div>
        <div className="mt-[5cqw] grid gap-3 @md:mt-[2.6cqw] @md:grid-cols-3">
          {b.items.map((it) => (
            <div key={it.name} className="overflow-hidden rounded-(--s-r) bg-(--s-bg) shadow-[0_8px_26px_rgb(0_0_0/0.06)]">
              <div className="aspect-[5/3] overflow-hidden">
                <Img src={it.img} />
              </div>
              <div className="flex items-end justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="site-head truncate text-[5.2cqw] @md:text-[2.2cqw]">{it.name}</p>
                  <p className="text-[12px] opacity-65">Desde {cop(it.price)}</p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-(--s-brand) text-(--s-on-brand)">
                  <ArrowRight size={15} weight="bold" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }
}

/* ================================================================== Gimnasio */

function gimnasio(ctx: TemplateCtx): Template {
  const { b, state, name, tagline } = ctx
  const photo = b.photos[state.photo]
  const [p2, p3] = b.photos.filter((_, i) => i !== state.photo)
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const classes = ['Fuerza', 'Cardio', 'Movilidad', 'Box']
  const slots = ['5:30', '7:00', '12:15', '6:30']

  return {
    overlay: true,
    header: (
      <div className={`flex h-14 items-center justify-between text-white ${pad}`}>
        <div className="flex items-center gap-2.5">
          <Mark ctx={ctx} />
          <span className="site-head -skew-x-6 text-[17px]">{name}</span>
        </div>
        <span className="-skew-x-6 bg-(--s-brand) px-3 py-1.5 text-[11px] font-bold text-(--s-on-brand) uppercase">{b.cta}</span>
      </div>
    ),
    hero: (
      <div className="bg-[#0c0c0c] text-[#f4f4f1] [--s-accent:var(--s-accent-d)] [--s-ink:#f4f4f1]">
        {/* Everything leans forward: type, tags and the photograph's cut */}
        <div className="relative h-[130cqw] overflow-hidden @md:h-[58cqw]">
          <div className="absolute inset-0 [clip-path:polygon(0_0,100%_0,100%_86%,0_100%)]">
            <Img src={photo} className="kb" />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/40" />
          </div>
          <p style={fit(tagline, 10, [20, 70, 84], [12.5, 36, 84], 0.84)} className={`site-head absolute bottom-[18cqw] left-[5.5cqw] -skew-x-6 leading-[0.84] @md:bottom-[9cqw] @md:left-[4.5cqw] ${fitted}`}>
            {tagline}
          </p>
          <Stamp text="Primera clase gratis" className="absolute top-[18cqw] right-[5cqw] w-[26cqw] text-(--s-accent) @md:top-[8cqw] @md:right-[5cqw] @md:w-[13cqw]" />
          <div className="absolute inset-x-0 bottom-0 flex justify-between gap-4 px-[5.5cqw] pb-[3cqw] @md:px-[4.5cqw] @md:pb-[1.6cqw]">
            {[
              ['5 am', 'abrimos'],
              ['40', 'clases a la semana'],
              ['0', 'contratos amarrados'],
            ].map(([n, l]) => (
              <span key={l} className="-skew-x-6">
                <b className="site-head block text-[9cqw] leading-none text-(--s-accent) @md:text-[4.6cqw]">{n}</b>
                <span className="text-[10px] tracking-[0.14em] uppercase opacity-70">{l}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden bg-(--s-brand) py-[2.4cqw] text-(--s-on-brand) @md:py-[1.2cqw]">
          <div className="site-head flex w-max -skew-x-6 gap-[5cqw] text-[8cqw] whitespace-nowrap [animation:marquee_14s_linear_infinite] @md:text-[3.6cqw]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i}>Fuerza ✕ Cardio ✕ Movilidad ✕ Box ✕</span>
            ))}
          </div>
        </div>

        {/* Timetable as a board */}
        <div className={sect}>
          <div className="flex items-end justify-between gap-4">
            <p className="site-head -skew-x-6 text-[11cqw] leading-[0.88] @md:text-[5.4cqw]">
              Horario
              <br />
              <span className="text-transparent [-webkit-text-stroke:1px_var(--s-accent)]">de la semana</span>
            </p>
            <div className="hidden aspect-[4/3] w-[24cqw] -rotate-3 overflow-hidden border-2 border-(--s-accent) @md:block">
              <Img src={p2} />
            </div>
          </div>
          <div className="mt-[5cqw] grid grid-cols-[auto_repeat(3,1fr)] gap-1 text-[10px] @md:mt-[2.6cqw] @md:grid-cols-[auto_repeat(6,1fr)]">
            <span />
            {days.map((d, i) => (
              <span key={d} className={`py-1 text-center font-bold tracking-[0.14em] uppercase ${i > 2 ? 'hidden @md:block' : ''} ${i === 1 ? 'bg-(--s-brand) text-(--s-on-brand)' : 'opacity-60'}`}>
                {d}
              </span>
            ))}
            {slots.map((t, r) => (
              <div key={t} className="contents">
                <span className="pr-3 text-[11px] tabular-nums opacity-60">{t}</span>
                {days.map((d, c) => (
                  <span key={d} className={`border border-white/15 px-2 py-2 font-semibold uppercase ${c > 2 ? 'hidden @md:block' : ''} ${c === 1 ? 'border-(--s-accent) text-(--s-accent)' : ''}`}>
                    {classes[(r + c) % classes.length]}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[52cqw] overflow-hidden @md:h-[26cqw]">
          <Img src={p3} />
          <div className="absolute inset-0 bg-black/55" />
          <p className="site-head absolute inset-0 m-auto h-fit -skew-x-6 text-center text-[12cqw] leading-[0.9] @md:text-[6.4cqw]">
            Sin excusas,
            <br />
            <span className="text-(--s-accent)">con plan.</span>
          </p>
        </div>
      </div>
    ),
    catalog: (
      <div className={`bg-[#0c0c0c] text-[#f4f4f1] [--s-accent:var(--s-accent-d)] ${sect}`}>
        <h3 className="site-head -skew-x-6 text-[11cqw] leading-none @md:text-[5.4cqw]">{b.listTitle}</h3>
        <div className="mt-[6cqw] grid gap-3 @md:mt-[3cqw] @md:grid-cols-3 @md:items-center">
          {b.items.map((it, i) => (
            <div
              key={it.name}
              className={`flex flex-col gap-4 p-5 ${i === 1 ? 'bg-(--s-brand) text-(--s-on-brand) @md:-rotate-2 @md:scale-105 @md:py-8' : 'border border-white/20'}`}
            >
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-70">{['Para probar', 'El más elegido', 'Sin compromiso'][i]}</span>
              <p className="site-head -skew-x-6 text-[8cqw] leading-none @md:text-[3.4cqw]">{it.name}</p>
              <p className="site-head text-[10cqw] leading-none tabular-nums @md:text-[4.4cqw]">{cop(it.price)}</p>
              <ul className="flex flex-col gap-1 text-[12px] opacity-85">
                {['Todas las clases', 'Plan de entrenamiento', 'Duchas y casillero'].slice(0, 3 - (i === 2 ? 1 : 0)).map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  }
}

/* ================================================================ Pastelería */

function pasteleria(ctx: TemplateCtx): Template {
  const { b, state, name, tagline } = ctx
  const photo = b.photos[state.photo]
  const [p2, p3] = b.photos.filter((_, i) => i !== state.photo)
  const scallop = '[mask-image:radial-gradient(circle_at_50%_0,#000_70%,transparent_72%)] [mask-size:6cqw_100%] [mask-repeat:repeat-x] @md:[mask-size:2.6cqw_100%]'
  const hard = 'border-2 border-(--s-ink) shadow-[4px_4px_0_var(--s-ink)]'

  return {
    overlay: false,
    header: (
      <div className="bg-(--s-brand) text-(--s-on-brand)">
        <div className={`flex h-14 items-center justify-between ${pad}`}>
          <span className="hidden text-[11px] font-semibold tracking-wider uppercase @md:block">Vitrina · Encargos</span>
          <div className="flex items-center gap-2.5 @md:absolute @md:left-1/2 @md:-translate-x-1/2">
            <Mark ctx={ctx} className="!rounded-full !bg-(--s-on-brand) !text-(--s-brand)" />
            <span className="site-head text-[19px]">{name}</span>
          </div>
          <span className={`rounded-full bg-(--s-bg) px-3.5 py-1.5 text-[11px] font-bold text-(--s-ink) ${hard}`}>{b.cta}</span>
        </div>
        <div className={`h-[3cqw] rotate-180 bg-(--s-bg) @md:h-[1.3cqw] ${scallop}`} />
      </div>
    ),
    hero: (
      <>
        {/* Counter display: wobbly shapes, stickers and a hard little shadow on everything */}
        <div className={`relative overflow-hidden pt-[9cqw] pb-[12cqw] text-center @md:pt-[5cqw] @md:pb-[6cqw] ${pad}`}>
          <span className={`inline-block -rotate-3 rounded-full bg-(--s-brand) px-3 py-1 text-[11px] font-bold text-(--s-on-brand) ${hard}`}>Horneado hoy</span>
          <p style={fit(tagline, 14, [15, 99, 86], [8.6, 99, 70], 0.95)} className={`site-head mx-auto mt-[4cqw] max-w-[13ch] leading-[0.95] @md:mt-[2cqw] ${fitted}`}>
            {tagline}
          </p>
          <div className="relative mx-auto mt-[9cqw] h-[62cqw] max-w-[92%] @md:mt-[4cqw] @md:h-[30cqw] @md:max-w-[76%]">
            <div className={`absolute top-[6%] left-0 aspect-square w-[42%] -rotate-6 overflow-hidden rounded-[42%_58%_55%_45%/48%_42%_58%_52%] @md:w-[30%] ${hard}`}>
              <Img src={p2} className="kb" />
            </div>
            <div className={`absolute top-0 left-1/2 aspect-[4/5] w-[46%] -translate-x-1/2 overflow-hidden rounded-t-full @md:w-[32%] ${hard}`}>
              <Img src={photo} className="kb" />
            </div>
            <div className={`absolute right-0 bottom-0 aspect-square w-[40%] rotate-6 overflow-hidden rounded-[58%_42%_45%_55%/52%_58%_42%_48%] @md:w-[29%] ${hard}`}>
              <Img src={p3} className="kb" />
            </div>
            <Stamp text="Hecho a mano" className="absolute -top-[6%] right-[8%] w-[24cqw] text-(--s-accent) @md:right-[20%] @md:w-[11cqw]" />
            <span className={`absolute bottom-[4%] left-[6%] rotate-[-8deg] rounded-full bg-(--s-bg) px-3 py-1.5 text-[12px] font-bold @md:left-[22%] ${hard}`}>Sin conservantes</span>
          </div>
        </div>

        {/* What leaves the oven and when */}
        <div className="bg-(--s-brand) text-(--s-on-brand)">
          <div className={`h-[3cqw] bg-(--s-bg) @md:h-[1.3cqw] ${scallop}`} />
          <div className={`grid gap-[5cqw] @md:grid-cols-[0.8fr_1.2fr] @md:items-center @md:gap-[4cqw] ${sect}`}>
            <p className="site-head text-[11cqw] leading-[0.95] @md:text-[5.4cqw]">Hoy sale del horno</p>
            <div className="grid gap-2">
              {b.items.map((it, i) => (
                <div key={it.name} className={`flex items-center justify-between gap-3 rounded-full bg-(--s-bg) py-2 pr-4 pl-2 text-(--s-ink) ${hard} ${i === 1 ? '@md:ml-[6%]' : i === 2 ? '@md:ml-[12%]' : ''}`}>
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                      <Img src={it.img} />
                    </span>
                    <b className="truncate text-[13px]">{it.name}</b>
                  </span>
                  <span className="shrink-0 text-[12px] font-bold tabular-nums">{['7:00 am', '9:30 am', '3:00 pm'][i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`h-[3cqw] rotate-180 bg-(--s-bg) @md:h-[1.3cqw] ${scallop}`} />
        </div>
      </>
    ),
    catalog: (
      <div className={sect}>
        <div className="flex items-end justify-between">
          <h3 className="site-head text-[11cqw] leading-none @md:text-[5.4cqw]">{b.listTitle}</h3>
          <span className={`rotate-2 rounded-full bg-(--s-brand) px-3 py-1 text-[11px] font-bold text-(--s-on-brand) ${hard}`}>Encarga con 2 días</span>
        </div>
        <div className="mt-[7cqw] grid gap-6 @md:mt-[3.6cqw] @md:grid-cols-3 @md:gap-5">
          {b.items.map((it, i) => (
            <div key={it.name} className={`relative bg-(--s-bg) p-3 pb-4 ${hard} ${['-rotate-2', 'rotate-[1.5deg] @md:mt-6', '-rotate-1'][i]}`}>
              <div className="aspect-[4/3] overflow-hidden">
                <Img src={it.img} />
              </div>
              <p className="site-head mt-3 text-[6.4cqw] leading-none @md:text-[2.6cqw]">{it.name}</p>
              <span className={`absolute -top-3 -right-3 grid h-14 w-14 rotate-12 place-items-center rounded-full bg-(--s-brand) text-center text-[10px] leading-tight font-bold text-(--s-on-brand) ${hard}`}>{cop(it.price)}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  }
}

export function buildTemplate(ctx: TemplateCtx): Template {
  CW = ctx.charW
  SCALE = ctx.state.scale
  return { restaurante, cafeteria, tienda, barberia, consultorio, gimnasio, pasteleria }[ctx.b.id](ctx)
}
