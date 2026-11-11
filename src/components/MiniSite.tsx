import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Copy,
  EyeSlash,
  LockSimple,
  MapPin,
  Moped,
  Sparkle,
  Star,
  Tag,
  Trash,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { FILTERS, FONTS, FONT_WIDTH, RADII, blockLabel, getBusiness, onColor, readable, type Block as PageBlock, type ModuleId, type SectionId, type StudioState } from '../lib/config'
import { reducedMotion } from '../lib/scroll'
import { buildTemplate } from './Templates'
import { LOGOS } from './Logos'
import { renderGeneric } from './Blocks'

/** Example marks a visitor can try before they bring their own logo. */

export type BlockAction = 'up' | 'down' | 'duplicate' | 'hide' | 'remove'

interface BlockProps {
  id: string
  label: string
  open?: boolean
  className?: string
  style?: CSSProperties
  /** editable blocks can be picked on the page and show a toolbar when selected */
  selected?: boolean
  onSelect?: () => void
  onAction?: (action: BlockAction) => void
  canDuplicate?: boolean
  children: ReactNode
}

/** One block of the visitor's page. Folds open/closed, has a wireframe ghost for the build
    animation, and, like a block editor, can be picked and acted on right where it sits. */
function Block({ id, label, open = true, className = '', style, selected, onSelect, onAction, canDuplicate, children }: BlockProps) {
  const tools: [BlockAction, typeof ArrowUp, string][] = [
    ['up', ArrowUp, 'Subir'],
    ['down', ArrowDown, 'Bajar'],
    ...(canDuplicate ? ([['duplicate', Copy, 'Duplicar']] as [BlockAction, typeof ArrowUp, string][]) : []),
    ['hide', EyeSlash, 'Ocultar'],
    ['remove', Trash, 'Eliminar'],
  ]
  return (
    <div className={`fold ${className}`} data-open={open} data-block={id} aria-hidden={!open}>
      <div>
        <div className={`block ${onSelect ? 'pickable' : ''}`} data-sel={selected || undefined} style={style} onClick={onSelect}>
          <div className="block-body">{children}</div>
          <div className="block-ghost">{label}</div>
          {selected && onAction && (
            <div className="absolute top-2 right-2 z-[6] flex overflow-hidden rounded-[6px] bg-[#2f7bff] text-white shadow-[0_6px_20px_rgb(0_0_0/0.3)] [animation:rise_0.35s_var(--ease-out-expo)]">
              <span className="border-r border-white/25 px-2 py-1.5 text-[10px] leading-none font-semibold">{label}</span>
              {tools.map(([action, I, title]) => (
                <button
                  key={action}
                  type="button"
                  title={title}
                  aria-label={title}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAction(action)
                  }}
                  className="grid h-7 w-7 place-items-center transition-colors hover:bg-white/20"
                >
                  <I size={13} weight="bold" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DAYS = ['Hoy', 'Mañana', 'Sábado']

/**
 * The visitor's site, rendered for real (not a screenshot). Layout responds to its own
 * width through container queries, so the same component fills the browser and the phone frame.
 */
export interface Focus {
  /** data-block id of the section being edited */
  id: string
  /** label shown on the selection tag */
  label: string
  /** bumps on every edit so the same block can be re-selected */
  n: number
}

interface MiniSiteProps {
  state: StudioState
  buildKey: number
  focus: Focus
  onStep?: (label: string) => void
  /** uid of the block picked in the editor */
  selected?: string | null
  onSelect?: (uid: string) => void
  onAction?: (uid: string, action: BlockAction) => void
}

export function MiniSite({ state, buildKey, focus, onStep, selected, onSelect, onAction }: MiniSiteProps) {
  const root = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const prevUids = useRef<string[]>(state.blocks.map((x) => x.uid))
  const sel = useRef<HTMLDivElement>(null)
  const [day, setDay] = useState(0)
  const [slot, setSlot] = useState(2)

  const b = getBusiness(state.business)
  const name = state.name.trim() || b.defaultName
  const tagline = state.tagline.trim() || b.tagline
  const has = (id: ModuleId) => state.modules.includes(id)
  const dark = state.mode === 'oscuro'
  const Logo = LOGOS[state.logoPreset % LOGOS.length]
  const centered = state.align === 'centro'

  const bg = dark ? '#14110e' : '#fbf8f2'
  const ink = dark ? '#f6f1e6' : '#1a1611'
  const vars = {
    '--s-bg': bg,
    '--s-ink': ink,
    '--s-soft': dark ? 'rgb(255 255 255 / 0.07)' : 'rgb(0 0 0 / 0.055)',
    '--s-brand': state.brand,
    '--s-on-brand': onColor(state.brand),
    // brand used as text: only where it can actually be read, else fall back to the ink
    '--s-accent': readable(state.brand, bg, ink),
    '--s-accent-d': readable(state.brand, '#14110e', '#f6f1e6'),
    '--s-filter': FILTERS[state.filter].css,
    '--s-body': "'Host Grotesk Variable', sans-serif",
    '--s-r': RADII[state.radius].box,
    '--s-rb': RADII[state.radius].btn,
    ...FONTS[state.font].vars,
  } as CSSProperties

  // Full build: wireframes appear, then each block is wiped in from the top.
  useGSAP(
    () => {
      if (reducedMotion()) return
      const bodies = gsap.utils.toArray<HTMLElement>('.block-body')
      if (buildKey === 0) {
        gsap.set(bodies, { clipPath: 'inset(0 0 100% 0)' })
        gsap.set('.block-ghost', { opacity: 0.4 })
        gsap.set('.float', { scale: 0 })
        return
      }
      if (scroller.current) scroller.current.scrollTop = 0
      const tl = gsap.timeline()
      // announce each block as it goes up, for the build log in the stage bar
      gsap.utils.toArray<HTMLElement>('.fold[data-open="true"] .block-ghost').forEach((g, i) => {
        tl.call(() => onStep?.(g.textContent ?? ''), [], 0.3 + i * 0.13)
      })
      tl.call(() => onStep?.(''), [], '+=1.2')
      tl
        .fromTo('.block-ghost', { opacity: 0 }, { opacity: 0.45, duration: 0.3, stagger: 0.08 })
        .fromTo(
          bodies,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut', stagger: 0.13, clearProps: 'clipPath' },
          0.3,
        )
        .to('.block-ghost', { opacity: 0, duration: 0.4, stagger: 0.13 }, 0.85)
        .fromTo('.float', { scale: 0 }, { scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.12, clearProps: 'scale' }, '-=0.5')
    },
    { scope: root, dependencies: [buildKey, state.business], revertOnUpdate: true },
  )

  // A new block: it drops in (outline first, then content), and we scroll to it.
  useEffect(() => {
    const uids = state.blocks.map((x) => x.uid)
    const added = uids.find((u) => !prevUids.current.includes(u))
    prevUids.current = uids
    const box = scroller.current
    if (!added || !box) return
    const el = box.querySelector<HTMLElement>(`[data-block="${added}"]`)
    if (!el) return
    const still = reducedMotion()
    if (!still) {
      const body = el.querySelector('.block-body')
      const ghost = el.querySelector('.block-ghost')
      gsap
        .timeline()
        .fromTo(ghost, { opacity: 0 }, { opacity: 0.6, duration: 0.25 })
        .fromTo(
          body,
          { clipPath: 'inset(0 0 100% 0)', y: -26, rotateX: -50, transformPerspective: 600, transformOrigin: 'top center' },
          { clipPath: 'inset(0 0 0% 0)', y: 0, rotateX: 0, duration: 1, ease: 'expo.out', clearProps: 'all' },
          0.2,
        )
        .to(ghost, { opacity: 0, duration: 0.5 }, 0.7)
    }
    const id = window.setTimeout(() => box.scrollTo({ top: Math.max(0, el.offsetTop - 24), behavior: still ? 'auto' : 'smooth' }), 240)
    return () => window.clearTimeout(id)
  }, [state.blocks])

  // Selection frame: like a design tool, a box with handles and a name tag travels to the
  // block being edited, so the visitor sees where each change lands.
  useEffect(() => {
    const box = scroller.current
    const frame = sel.current
    if (!box || !frame || focus.n === 0) return
    const el = box.querySelector<HTMLElement>(`[data-block="${focus.id}"]`)
    if (!el || el.dataset.open === 'false') return
    const still = reducedMotion()
    const place = () => {
      const top = el.offsetTop
      const h = Math.max(el.offsetHeight, 36)
      if (top < box.scrollTop || top + h > box.scrollTop + box.clientHeight) {
        box.scrollTo({ top: Math.max(0, top - 24), behavior: still ? 'auto' : 'smooth' })
      }
      return { top, h }
    }
    const { top, h } = place()
    if (still) {
      gsap.set(frame, { y: top, height: h, autoAlpha: 1 })
      const id = window.setTimeout(() => gsap.set(frame, { autoAlpha: 0 }), 1200)
      return () => window.clearTimeout(id)
    }
    const tl = gsap
      .timeline()
      .to(frame, { y: top, height: h, autoAlpha: 1, duration: 0.55, ease: 'expo.out' })
      .fromTo(frame.querySelectorAll('.sel-dot'), { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', stagger: 0.04 }, 0.1)
      .to(frame, { autoAlpha: 0, duration: 0.5 }, '+=1.1')
    return () => {
      tl.kill()
    }
  }, [focus])

  const pad = 'px-[5.5cqw] @md:px-[4.5cqw]'
  const sect = `py-[7cqw] @md:py-[4.5cqw] ${pad}`
  const title = 'site-head text-[7.4cqw] @md:text-[3.7cqw]'
  const brandBtn = 'rounded-(--s-rb) bg-(--s-brand) font-semibold text-(--s-on-brand)'
  const gallery = [...b.photos, ...b.items.map((i) => i.img)].slice(0, 5)

  const onBrand = onColor(state.brand)
  const surface = (v: PageBlock['bg']): CSSProperties | undefined => {
    if (v === 'suave') return { background: 'var(--s-soft)' }
    if (v === 'marca')
      return {
        background: state.brand,
        color: onBrand,
        '--s-ink': onBrand,
        '--s-bg': state.brand,
        '--s-accent': onBrand,
        '--s-brand': onBrand,
        '--s-on-brand': state.brand,
        '--s-soft': onBrand === '#16110b' ? 'rgb(0 0 0 / 0.1)' : 'rgb(255 255 255 / 0.14)',
      } as CSSProperties
    if (v === 'oscuro')
      return {
        background: '#14110e',
        color: '#f6f1e6',
        '--s-ink': '#f6f1e6',
        '--s-bg': '#14110e',
        '--s-accent': readable(state.brand, '#14110e', '#f6f1e6'),
        '--s-soft': 'rgb(255 255 255 / 0.07)',
      } as CSSProperties
    return undefined
  }

  const tpl = buildTemplate({ b, state, name, tagline, centered, Logo, charW: FONT_WIDTH[state.font] })

  const sections: Record<SectionId, ReactNode> = {
    catalogo: tpl.catalog,
    reservas: (
      <div className={sect}>
        <div className="rounded-(--s-r) bg-(--s-soft) p-[5cqw] @md:flex @md:items-end @md:justify-between @md:gap-8 @md:p-[3cqw]">
          <div>
            <h3 className={title}>{b.bookingTitle}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(i)}
                  className={`rounded-(--s-rb) border px-3 py-1.5 text-[12px] ${i === day ? 'border-(--s-ink) bg-(--s-ink) text-(--s-bg)' : 'border-(--s-ink)/25'}`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {b.slots.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(i)}
                  className={`rounded-(--s-rb) border px-3 py-1.5 text-[12px] tabular-nums ${i === slot ? 'border-(--s-brand) bg-(--s-brand) text-(--s-on-brand)' : 'border-(--s-ink)/25'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <span className={`${brandBtn} mt-4 block shrink-0 px-5 py-2.5 text-center text-[13px] @md:mt-0`}>{b.bookingCta}</span>
        </div>
      </div>
    ),
    galeria: (
      <div className={sect}>
        <h3 className={title}>Galería</h3>
        <div className="mt-[4cqw] grid grid-cols-3 gap-2 @md:mt-[2.4cqw] @md:grid-cols-5">
          {gallery.map((src, i) => (
            <img key={i} src={src} alt="" className={`aspect-square w-full rounded-(--s-r) object-cover ${i === 0 ? 'col-span-2 row-span-2 @md:col-span-2' : ''}`} />
          ))}
        </div>
      </div>
    ),
    resenas: (
      <div className={`grid gap-4 @md:grid-cols-2 @md:gap-8 ${sect}`}>
        {b.reviews.map((r) => (
          <figure key={r.who}>
            <div className="flex gap-0.5 text-(--s-accent)">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={12} weight="fill" />
              ))}
            </div>
            <blockquote className="site-head mt-2 text-[5.4cqw] leading-[1.15] @md:text-[2.5cqw]">“{r.text}”</blockquote>
            <figcaption className="mt-2 text-[12px] opacity-60">{r.who}</figcaption>
          </figure>
        ))}
      </div>
    ),
    ubicacion: (
      <div className={`grid gap-4 @md:grid-cols-[1fr_1.2fr] @md:items-center @md:gap-8 ${sect}`}>
        <div>
          <h3 className={title}>Encuéntranos</h3>
          <p className="mt-3 flex items-center gap-2 text-[13px]">
            <MapPin size={15} weight="fill" className="text-(--s-accent)" /> {b.address}
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-[13px] opacity-70">
            <Clock size={15} /> {b.hours}
          </p>
        </div>
        <svg viewBox="0 0 300 120" className="w-full rounded-(--s-r) bg-(--s-soft)" aria-hidden="true">
          <g stroke="var(--s-ink)" strokeOpacity="0.22" strokeWidth="6" fill="none" strokeLinecap="round">
            <path d="M-10 34h320M-10 88h320M62 -10v140M150 -10v140M236 -10v140M-10 120 120 -10" />
          </g>
          <circle cx="150" cy="60" r="16" fill="var(--s-brand)" opacity="0.25" />
          <circle cx="150" cy="60" r="7" fill="var(--s-brand)" />
        </svg>
      </div>
    ),
    pagos: (
      <div className={`flex flex-wrap items-center justify-between gap-3 border-y border-(--s-ink)/12 py-4 ${pad}`}>
        <span className="flex items-center gap-2 text-[13px] font-medium">
          <LockSimple size={15} weight="bold" /> Paga como quieras
        </span>
        <div className="flex gap-2 text-[11px] font-semibold">
          {['Nequi', 'PSE', 'Tarjeta'].map((p) => (
            <span key={p} className="rounded-(--s-r) bg-(--s-soft) px-2.5 py-1.5">
              {p}
            </span>
          ))}
        </div>
      </div>
    ),
    puntos: (
      <div className={sect}>
        <div className="rounded-(--s-r) bg-(--s-brand) p-[5cqw] text-(--s-on-brand) @md:flex @md:items-center @md:justify-between @md:p-[3cqw]">
          <div>
            <h3 className={title}>Tarjeta de puntos</h3>
            <p className="mt-1.5 text-[13px] opacity-80">Seis visitas y la séptima va por la casa.</p>
          </div>
          <div className="mt-4 flex gap-2 @md:mt-0">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className={`grid h-7 w-7 place-items-center rounded-full border border-current text-[11px] font-bold ${i < 4 ? 'bg-(--s-on-brand) text-(--s-accent)' : 'opacity-60'}`}
              >
                {i < 4 ? <Star size={12} weight="fill" /> : i === 6 ? '★' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    domicilios: (
      <div className={`flex items-center justify-between gap-4 ${sect}`}>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-(--s-r) bg-(--s-soft)">
            <Moped size={22} weight="fill" className="text-(--s-accent)" />
          </span>
          <div>
            <p className="site-head text-[5cqw] @md:text-[2.4cqw]">Domicilios en 35 minutos</p>
            <p className="text-[12px] opacity-65">Envío desde $4.000 según tu zona</p>
          </div>
        </div>
        <span className={`${brandBtn} hidden shrink-0 px-4 py-2 text-[12px] @md:block`}>Pedir a domicilio</span>
      </div>
    ),
  }

  return (
    <div ref={root} className="site relative h-full w-full overflow-hidden" style={vars}>
      <div ref={scroller} data-lenis-prevent className="no-scrollbar relative h-full overflow-y-auto overscroll-contain">
        <Block id="promo" label="Promoción" open={has('promo')}>
          <div className="flex items-center justify-center gap-2 bg-(--s-brand) px-3 py-2 text-center text-[11px] font-semibold text-(--s-on-brand)">
            <Tag size={13} weight="fill" /> {b.promo}
          </div>
        </Block>

        <Block id="header" label="Encabezado" className={tpl.overlay ? 'relative z-[3] -mb-14' : ''}>
          {tpl.header}
          <span className={`absolute top-[21px] right-[5.5cqw] text-[10px] font-semibold ${has('idiomas') ? '' : 'hidden'} ${tpl.overlay ? 'text-white' : ''} @md:right-[50%]`}>ES · EN</span>
        </Block>

        {state.blocks.map((block) => {
          const label = blockLabel(block, state.business)
          const isTpl = block.type === 'tpl'
          return (
            <Block
              key={block.uid}
              id={block.uid}
              label={label}
              open={!block.hidden && !block.closing}
              style={isTpl ? undefined : surface(block.bg)}
              selected={selected === block.uid}
              onSelect={onSelect ? () => onSelect(block.uid) : undefined}
              onAction={onAction ? (action) => onAction(block.uid, action) : undefined}
              canDuplicate={!isTpl}
            >
              {isTpl ? (
                <div className={tpl.partClass}>{tpl.parts[block.part ?? 0]}</div>
              ) : block.type in sections ? (
                sections[block.type as SectionId]
              ) : (
                renderGeneric(block, b)
              )}
            </Block>
          )
        })}

        <div ref={sel} className="sel pointer-events-none invisible absolute inset-x-1 top-0 z-[5] border-2 border-[#2f7bff] opacity-0">
          <span className="absolute -top-px left-[-2px] -translate-y-full bg-[#2f7bff] px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white">{focus.label}</span>
          {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos) => (
            <span key={pos} className={`sel-dot absolute h-2 w-2 border-2 border-[#2f7bff] bg-white ${pos}`} />
          ))}
        </div>

        <Block id="footer" label="Pie">
          <div className={`flex items-center justify-between py-5 text-[11px] opacity-60 ${pad}`}>
            <span>{name}</span>
            <span>Hecho por Hyvento</span>
          </div>
          <div className="h-16" />
        </Block>
      </div>

      {/* Floating modules, pinned to the frame rather than the scroll */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
        <div className={`float origin-bottom-left ${has('ia') ? 'opacity-100' : 'translate-y-3 opacity-0'}`}>
          <div className="flex max-w-[220px] items-start gap-2 rounded-[14px] rounded-bl-[4px] bg-(--s-ink) p-3 text-[12px] leading-snug text-(--s-bg) shadow-[0_10px_30px_rgb(0_0_0/0.25)]">
            <Sparkle size={14} weight="fill" className="mt-0.5 shrink-0 text-(--s-accent)" />
            <span>{b.chat}</span>
          </div>
        </div>
        <div className={`float origin-bottom-right ${has('whatsapp') ? 'opacity-100' : 'translate-y-3 opacity-0'}`}>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_rgb(0_0_0/0.25)]">
            <WhatsappLogo size={24} weight="fill" />
          </span>
        </div>
      </div>
    </div>
  )
}
