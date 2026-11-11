import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type PointerEvent as RPointerEvent, type SetStateAction } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  ArrowClockwise,
  ArrowRight,
  Barbell,
  Cake,
  Check,
  Coffee,
  Desktop,
  DeviceMobile,
  Devices,
  DotsSixVertical,
  ForkKnife,
  Moon,
  Scissors,
  Shuffle,
  Storefront,
  Sun,
  TextAlignCenter,
  TextAlignLeft,
  Tooth,
  UploadSimple,
  WhatsappLogo,
  X,
  type Icon,
} from '@phosphor-icons/react'
import { LOGOS, MiniSite, type Focus } from './MiniSite'
import { HexMark, Scratches } from './Art'
import {
  BUSINESSES,
  FILTERS,
  FONTS,
  PRESETS,
  MODULES,
  RADII,
  SWATCHES,
  WHATSAPP_NUMBER,
  pts,
  getBusiness,
  moduleLabel,
  quote,
  type BusinessId,
  type FontId,
  type ModuleId,
  type PhotoFilter,
  type Radius,
  type SectionId,
  type StudioState,
} from '../lib/config'
import { holdPage, leaveEditor, reducedMotion, snapWhenNear } from '../lib/scroll'

gsap.registerPlugin(Flip)

const ICONS: Record<BusinessId, Icon> = { restaurante: ForkKnife, cafeteria: Coffee, tienda: Storefront, barberia: Scissors, consultorio: Tooth, gimnasio: Barbell, pasteleria: Cake }

/** Number that rolls to its new value. Writes to the DOM directly, no re-render per frame. */
export function Money({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const current = useRef({ v: value })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) {
      el.textContent = pts(value)
      return
    }
    const tween = gsap.to(current.current, { v: value, duration: 0.9, ease: 'expo.out', onUpdate: () => (el.textContent = pts(current.current.v)) })
    return () => {
      tween.kill()
    }
  }, [value])
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {pts(value)}
    </span>
  )
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 22) || 'tunegocio'

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]

type Tab = 'marca' | 'estilo' | 'secciones'
type Device = 'ambos' | 'pc' | 'cel'
const TABS: [Tab, string][] = [
  ['marca', 'Tu marca'],
  ['estilo', 'Estilo'],
  ['secciones', 'Secciones'],
]
const DEVICES: [Device, Icon, string][] = [
  ['ambos', Devices, 'Ambos'],
  ['pc', Desktop, 'Computador'],
  ['cel', DeviceMobile, 'Celular'],
]

interface Props {
  state: StudioState
  setState: Dispatch<SetStateAction<StudioState>>
}

export function Studio({ state, setState }: Props) {
  const root = useRef<HTMLElement>(null)
  const flip = useRef<Flip.FlipState | null>(null)
  const drag = useRef<SectionId | null>(null)
  const [buildKey, setBuildKey] = useState(0)
  const [log, setLog] = useState('Esperando tus datos')
  const [tab, setTab] = useState<Tab>('marca')
  const [device, setDevice] = useState<Device>('ambos')
  const [dragging, setDragging] = useState<SectionId | null>(null)
  const [ticket, setTicket] = useState(false)
  const [focus, setFocus] = useState<Focus>({ id: 'hero', label: 'Portada', n: 0 })

  const b = getBusiness(state.business)
  const q = quote(state)
  const name = state.name.trim() || b.defaultName
  const activeSections = state.order.filter((id) => state.modules.includes(id))

  /* Builder cursor: a pointer comes in from the controls, carrying the piece to where it goes,
     so every change is seen being placed rather than just appearing. */
  const fly = (id: string, label: string, carry: boolean) => {
    const layer = root.current?.querySelector<HTMLElement>('.builder')
    if (!layer || reducedMotion() || window.innerWidth < 1024) return
    window.setTimeout(() => {
      const site = Array.from(root.current!.querySelectorAll<HTMLElement>('.site')).find((el) => el.offsetParent && el.getBoundingClientRect().width > 300) ?? root.current!.querySelector<HTMLElement>('.site')
      const block = site?.querySelector<HTMLElement>(`[data-block="${id}"]`)
      if (!site || !block) return
      const L = layer.getBoundingClientRect()
      const S = site.getBoundingClientRect()
      const B = block.getBoundingClientRect()
      const top = Math.max(B.top, S.top)
      const bottom = Math.min(B.bottom, S.bottom)
      if (bottom - top < 12) return
      const box = { x: S.left - L.left, y: top - L.top, w: S.width, h: bottom - top }
      const cur = layer.querySelector('.bld-cur')
      const piece = layer.querySelector('.bld-piece')
      const ring = layer.querySelector('.bld-ring')
      const tag = layer.querySelector('.bld-tag')
      if (tag) tag.textContent = label
      const start = { x: -40, y: L.height * 0.55 }
      const end = { x: box.x + box.w * 0.5, y: box.y + Math.min(box.h * 0.5, 120) }
      gsap.killTweensOf([cur, piece, ring])
      const tl = gsap.timeline()
      tl.set(cur, { x: start.x, y: start.y, autoAlpha: 1, scale: 1 })
      if (carry) {
        tl.set(piece, { x: start.x + 14, y: start.y + 18, width: 170, height: 40, autoAlpha: 1 })
          .to(cur, { x: box.x + box.w - 6, y: box.y + box.h - 6, duration: 0.9, ease: 'expo.inOut' }, 0)
          .to(piece, { x: box.x, y: box.y, width: box.w, height: box.h, duration: 0.9, ease: 'expo.inOut' }, 0)
          .to(piece, { autoAlpha: 0, duration: 0.45 }, 1.05)
      } else {
        tl.to(cur, { x: end.x, y: end.y, duration: 0.7, ease: 'expo.inOut' }, 0)
      }
      const hit = carry ? 0.95 : 0.72
      tl.to(cur, { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1 }, hit)
        .fromTo(ring, { x: carry ? box.x + box.w - 6 : end.x, y: carry ? box.y + box.h - 6 : end.y, scale: 0.2, autoAlpha: 0.9 }, { scale: 2.6, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, hit)
        .to(cur, { x: '+=70', y: '+=90', autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, hit + 0.55)
    }, 320)
  }

  const select = (id: string, label: string, carry = false) => {
    setFocus((f) => ({ id, label, n: f.n + 1 }))
    fly(id, label, carry)
  }
  const patch = (p: Partial<StudioState>, message: string, target: 'header' | 'hero' | null = 'hero') => {
    setState((s) => ({ ...s, ...p }))
    setLog(message)
    if (target === 'header') select('header', 'Encabezado')
    else if (target === 'hero') select('hero', 'Portada')
  }
  const rebuild = () => setBuildKey((k) => k + 1)
  const captureFlip = () => {
    flip.current = Flip.getState('.sort-row, .site .fold')
  }

  const pickBusiness = (id: BusinessId) => {
    const next = getBusiness(id)
    patch({ business: id, brand: next.brand, font: next.font, mode: next.mode, photo: 0, tagline: '' }, `Plantilla ${next.label} cargada`, null)
    setBuildKey((k) => Math.max(1, k))
  }

  const toggleModule = (id: ModuleId) => {
    setLog(state.modules.includes(id) ? `${moduleLabel(id)} retirado` : `${moduleLabel(id)} instalado`)
    if (!state.modules.includes(id) && id !== 'whatsapp' && id !== 'ia' && id !== 'idiomas') window.setTimeout(() => select(id, moduleLabel(id), true), 420)
    setState((s) => ({ ...s, modules: s.modules.includes(id) ? s.modules.filter((m) => m !== id) : [...s.modules, id] }))
  }

  const surprise = () => {
    patch(
      {
        brand: pick(SWATCHES),
        font: pick(Object.keys(FONTS) as FontId[]),
        mode: pick(['claro', 'oscuro'] as const),
        radius: pick(Object.keys(RADII) as Radius[]),
        align: pick(['izquierda', 'centro'] as const),
        photo: Math.floor(Math.random() * 3),
        filter: pick(Object.keys(FILTERS) as PhotoFilter[]),
        logoPreset: Math.floor(Math.random() * LOGOS.length),
        logo: null,
        order: [...state.order].sort(() => Math.random() - 0.5),
      },
      'Nuevo estilo al azar',
      null,
    )
    rebuild()
  }

  const onLogo = (file: File | undefined) => {
    if (!file) return
    if (state.logo) URL.revokeObjectURL(state.logo)
    patch({ logo: URL.createObjectURL(file) }, 'Logo colocado', 'header')
  }

  /* Drag to reorder: the row under the pointer trades places with the one being dragged,
     and both the list and the sections inside the site glide to their new spots. */
  const onDragStart = (e: RPointerEvent, id: SectionId) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = id
    setDragging(id)
  }
  const onDragMove = (e: RPointerEvent) => {
    const id = drag.current
    if (!id) return
    const rows = Array.from(root.current!.querySelectorAll<HTMLElement>('.sort-row'))
    const over = rows.find((r) => {
      const box = r.getBoundingClientRect()
      return e.clientY >= box.top && e.clientY <= box.bottom
    })
    const target = over?.dataset.id as SectionId | undefined
    if (!target || target === id) return
    captureFlip()
    setState((s) => {
      const from = s.order.indexOf(id)
      const to = s.order.indexOf(target)
      const order = s.order.filter((x) => x !== id)
      order.splice(order.indexOf(target) + (from < to ? 1 : 0), 0, id)
      return { ...s, order }
    })
    setLog(`${moduleLabel(id)} movido`)
    select(id, moduleLabel(id))
  }
  const onDragEnd = () => {
    drag.current = null
    setDragging(null)
  }

  useLayoutEffect(() => {
    const snapshot = flip.current
    flip.current = null
    if (!snapshot || reducedMotion()) return
    Flip.from(snapshot, { duration: 0.65, ease: 'expo.out' })
  }, [state.order])

  // A colour change washes over the frames before they settle back to cream
  useEffect(() => {
    if (reducedMotion() || !root.current) return
    const frames = root.current.querySelectorAll('.frame-edge')
    const tween = gsap.fromTo(frames, { borderColor: state.brand }, { borderColor: '#f4ebd9', duration: 1.1, ease: 'power2.out' })
    return () => {
      tween.kill()
    }
  }, [state.brand])

  useEffect(() => {
    if (!ticket) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setTicket(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [ticket])

  useGSAP(
    () => {
      ScrollTrigger.create({ trigger: root.current, start: 'top 55%', once: true, onEnter: () => setBuildKey((k) => Math.max(1, k)) })
      const unsnapOnly = snapWhenNear(root.current!)
      const unhold = holdPage(root.current!)
      const unsnap = () => {
        unsnapOnly()
        unhold()
      }
      if (reducedMotion()) return unsnap
      gsap.from('.ctl-in', { y: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: root.current, start: 'top 55%' } })
      gsap.from('.frame-in', { y: 90, autoAlpha: 0, duration: 1.3, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: root.current, start: 'top 55%' } })

      // The frames lean toward the pointer
      const rx = gsap.quickTo('.tilt', 'rotationX', { duration: 0.9, ease: 'power3.out' })
      const ry = gsap.quickTo('.tilt', 'rotationY', { duration: 0.9, ease: 'power3.out' })
      const stage = root.current!.querySelector<HTMLElement>('.stage')!
      const move = (e: PointerEvent) => {
        if (window.innerWidth < 1024) return
        const box = stage.getBoundingClientRect()
        ry(((e.clientX - box.left) / box.width - 0.5) * 8)
        rx(-((e.clientY - box.top) / box.height - 0.5) * 6)
      }
      const leave = () => {
        rx(0)
        ry(0)
      }
      stage.addEventListener('pointermove', move)
      stage.addEventListener('pointerleave', leave)
      return () => {
        unsnap()
        stage.removeEventListener('pointermove', move)
        stage.removeEventListener('pointerleave', leave)
      }
    },
    { scope: root },
  )

  // Ticket prints out when opened
  useGSAP(
    () => {
      if (!ticket || reducedMotion()) return
      gsap.fromTo('.ticket', { clipPath: 'inset(0 0 100% 0)', y: -40 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.1, ease: 'power2.out' })
      gsap.from('.ticket li', { autoAlpha: 0, x: -12, duration: 0.5, stagger: 0.06, delay: 0.25 })
    },
    { scope: root, dependencies: [ticket] },
  )

  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    ['Hola Hyvento, armé mi página en la feria.', `Negocio: ${name} (${b.label})`, `Incluye: ${q.mods.map((m) => m.label).join(', ') || 'solo la página base'}`, `Total: ${pts(q.total)}`].join('\n'),
  )}`

  const ctlTitle = 'mb-3 block text-[13px] font-medium text-mute'
  const showPc = device !== 'cel'
  const showCel = device !== 'pc'

  return (
    <section ref={root} id="estudio" className="relative border-t border-line lg:grid lg:h-[100dvh] lg:min-h-[640px] lg:grid-cols-[minmax(380px,440px)_1fr]">
      {/* ------------------------------------------------ Stage */}
      <div className="stage sticky top-0 z-10 flex h-[50dvh] flex-col bg-coal-2 pt-[68px] lg:static lg:order-2 lg:h-auto lg:min-h-0">
        <div className="flex items-center justify-between gap-4 px-5 pb-3 lg:px-8 lg:pt-2">
          <p key={log} className="label flex min-w-0 items-center gap-2.5 text-mute [animation:rise_0.5s_var(--ease-out-expo)]">
            <span className="h-1.5 w-1.5 shrink-0 bg-bone [animation:blink_1.2s_ease-in-out_infinite]" />
            <span className="truncate">{log}</span>
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <div className="hidden border border-line lg:flex" role="group" aria-label="Vista">
              {DEVICES.map(([d, I, label]) => (
                <button
                  key={d}
                  type="button"
                  title={label}
                  aria-label={label}
                  aria-pressed={device === d}
                  onClick={() => setDevice(d)}
                  className="grid h-8 w-9 place-items-center text-mute transition-colors hover:text-bone aria-pressed:bg-bone aria-pressed:text-coal"
                >
                  <I size={16} />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                rebuild()
                setLog('Armando de nuevo')
              }}
              className="label flex items-center gap-2 text-mute transition-colors hover:text-bone"
            >
              <ArrowClockwise size={14} weight="bold" />
              <span className="hidden sm:inline">Volver a armar</span>
            </button>
            <button type="button" onClick={() => leaveEditor('#top')} className="label flex items-center gap-2 border border-line px-2.5 py-1.5 text-mute transition-colors hover:border-bone hover:text-bone">
              <X size={13} weight="bold" />
              Salir
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 px-5 pb-5 [perspective:1400px] lg:px-8 lg:pb-8">
          <div className="tilt relative h-full [transform-style:preserve-3d]">
            <div className="builder pointer-events-none absolute inset-0 z-20 hidden lg:block [transform:translateZ(90px)]" aria-hidden="true">
              <div className="bld-piece invisible absolute top-0 left-0 grid place-items-center border-2 border-dashed border-[#2f7bff] bg-[#2f7bff]/12 opacity-0">
                <span className="bld-tag bg-[#2f7bff] px-2 py-1 text-[11px] font-semibold text-white" />
              </div>
              <div className="bld-ring invisible absolute top-0 left-0 -mt-4 -ml-4 h-8 w-8 rounded-full border-2 border-[#2f7bff] opacity-0" />
              <div className="bld-cur invisible absolute top-0 left-0 opacity-0">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 2l15 7.5-6.4 1.9L9.4 18z" fill="#2f7bff" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <span className="ml-4 -mt-1 block w-fit rounded-full bg-[#2f7bff] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white">Hyvento</span>
              </div>
            </div>
            {/* Browser frame, laptop and up */}
            <div
              className={`absolute inset-y-0 left-0 hidden flex-col transition-[width,opacity,scale] duration-700 ease-[var(--ease-out-expo)] lg:flex ${
                showPc ? 'opacity-100' : 'pointer-events-none scale-95 opacity-0'
              } ${device === 'ambos' ? 'w-[calc(100%-120px)]' : 'w-full'}`}
            >
              <Scratches className="frame-in h-4 w-full shrink-0 text-bone/80" />
              <div className="frame-in frame-edge flex min-h-0 flex-1 flex-col border-[4px] border-bone bg-coal">
                <div className="flex h-10 shrink-0 items-center gap-4 border-b border-line px-4">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-2.5 w-2.5 rounded-full border border-bone/50" />
                    ))}
                  </div>
                  <div className="flex-1 truncate text-center text-[12px] text-mute">
                    <span className="text-bone">{slug(name)}</span>.com.co
                  </div>
                  <div className="w-12" />
                </div>
                <div className="min-h-0 flex-1">
                  <MiniSite state={state} buildKey={buildKey} focus={focus} onStep={(l) => setLog(l ? `Montando ${l.toLowerCase()}` : 'Página lista')} />
                </div>
              </div>
            </div>

            {/* Phone: the only frame on small screens, floating in front of the browser on large ones */}
            <div
              className={`absolute inset-0 transition-[opacity,scale,right,translate] duration-700 ease-[var(--ease-out-expo)] lg:inset-auto lg:bottom-0 lg:h-[min(88%,540px)] lg:w-[262px] lg:[transform:translateZ(70px)] ${
                showCel ? 'opacity-100' : 'lg:pointer-events-none lg:scale-90 lg:opacity-0'
              } ${device === 'cel' ? 'lg:right-1/2 lg:translate-x-1/2' : 'lg:right-0'}`}
            >
              <div className="frame-in frame-edge h-full overflow-hidden rounded-[18px] border border-line bg-coal lg:rounded-[38px] lg:border-[4px] lg:border-bone lg:p-[5px] lg:shadow-[0_40px_80px_rgb(0_0_0/0.6)]">
                <div className="h-full overflow-hidden lg:rounded-[29px]">
                  <MiniSite state={state} buildKey={buildKey} focus={focus} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ Controls */}
      <div className="relative flex flex-col border-line bg-coal lg:order-1 lg:min-h-0 lg:border-r lg:pt-[68px]">
        <div className="ctl-in flex items-end justify-between gap-4 px-5 pt-7 lg:px-8 lg:pt-3">
          <h2 className="display-narrow text-[clamp(2.6rem,4vw,3.6rem)]">Ármala tú</h2>
          <button type="button" onClick={surprise} className="btn !gap-2 !px-3.5 !py-2.5">
            <Shuffle key={buildKey} size={15} weight="bold" className="[animation:pop_0.6s_var(--ease-out-expo)]" />
            Sorpréndeme
          </button>
        </div>

        <div className="ctl-in mt-5 flex border-b border-line px-5 lg:px-8" role="tablist">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`relative mr-7 pb-3 text-[14px] font-medium transition-colors ${tab === id ? 'text-bone' : 'text-mute hover:text-bone'}`}
            >
              {label}
              <span className={`absolute inset-x-0 -bottom-px h-[3px] origin-left bg-bone transition-transform duration-500 ease-[var(--ease-out-expo)] ${tab === id ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          ))}
        </div>

        <div data-lenis-prevent className="ctl-in no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div key={tab} className="flex flex-col gap-8 px-5 pt-6 pb-8 [animation:rise_0.5s_var(--ease-out-expo)] lg:px-8">
            {tab === 'marca' && (
              <>
                <div>
                  <label htmlFor="biz-name" className={ctlTitle}>
                    ¿Cómo se llama tu negocio?
                  </label>
                  <input id="biz-name" className="field" value={state.name} maxLength={28} placeholder={b.defaultName} autoComplete="off" onChange={(e) => patch({ name: e.target.value }, 'Nombre actualizado', 'header')} />
                </div>

                <div>
                  <span className={ctlTitle}>¿Qué tipo de negocio es?</span>
                  <div className="flex flex-wrap gap-2">
                    {BUSINESSES.map((biz) => {
                      const I = ICONS[biz.id]
                      return (
                        <button key={biz.id} type="button" className="chip" aria-pressed={state.business === biz.id} onClick={() => pickBusiness(biz.id)}>
                          <I size={16} />
                          {biz.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <span className={ctlTitle}>Tu logo</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {LOGOS.map((L, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Logo de ejemplo ${i + 1}`}
                        aria-pressed={!state.logo && state.logoPreset === i}
                        onClick={() => patch({ logoPreset: i, logo: null }, 'Logo de ejemplo colocado', 'header')}
                        className="grid h-10 w-10 place-items-center border border-line text-mute transition-colors hover:text-bone aria-pressed:border-bone aria-pressed:bg-bone aria-pressed:text-coal"
                      >
                        <L size={20} weight="fill" />
                      </button>
                    ))}
                    {state.logo ? (
                      <button
                        type="button"
                        className="chip"
                        onClick={() => {
                          URL.revokeObjectURL(state.logo!)
                          patch({ logo: null }, 'Logo retirado', 'header')
                        }}
                      >
                        <img src={state.logo} alt="" className="h-5 w-5 bg-bone object-contain" />
                        Quitar <X size={12} weight="bold" />
                      </button>
                    ) : (
                      <label className="chip">
                        <UploadSimple size={16} />
                        Subir el tuyo
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => onLogo(e.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <span className={ctlTitle}>Tu color</span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {SWATCHES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Color ${c}`}
                        aria-pressed={state.brand === c}
                        onClick={() => patch({ brand: c }, 'Color aplicado')}
                        className="h-9 w-9 rounded-full border border-bone/25 outline-2 outline-offset-[3px] outline-transparent transition-[outline-color,transform] hover:scale-110 aria-pressed:outline-bone"
                        style={{ background: c }}
                      />
                    ))}
                    <label
                      className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full bg-[conic-gradient(from_0deg,#b3261e,#e8b33c,#1f4e3d,#27408b,#5b3a8c,#d4577a,#b3261e)] transition-transform hover:scale-110"
                      title="Otro color"
                    >
                      <span className="sr-only">Elegir otro color</span>
                      <input type="color" value={state.brand} onChange={(e) => patch({ brand: e.target.value }, 'Color aplicado')} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                    </label>
                  </div>
                </div>
              </>
            )}

            {tab === 'estilo' && (
              <>
                <div>
                  <span className={ctlTitle}>Estilos listos</span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map((pr) => {
                      const on = state.brand === pr.brand && state.font === pr.font && state.mode === pr.mode && state.radius === pr.radius
                      const dark = pr.mode === 'oscuro'
                      return (
                        <button
                          key={pr.name}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            patch({ brand: pr.brand, font: pr.font, mode: pr.mode, radius: pr.radius }, `Estilo ${pr.name.toLowerCase()} aplicado`, null)
                            rebuild()
                          }}
                          className="group border border-line p-1.5 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-bone/60 aria-pressed:border-bone"
                        >
                          <span className="flex h-12 items-end justify-between px-2 pb-1.5" style={{ background: dark ? '#14110e' : '#fbf8f2', color: dark ? '#f6f1e6' : '#1a1611' }}>
                            <span
                              className="text-[20px] leading-none"
                              style={{ fontFamily: FONTS[pr.font].vars['--s-head'], fontWeight: FONTS[pr.font].vars['--s-head-w'], fontStretch: FONTS[pr.font].vars['--s-head-stretch'], textTransform: FONTS[pr.font].vars['--s-head-case'] as 'none' }}
                            >
                              Aa
                            </span>
                            <i className="block h-4 w-4 border border-black/10" style={{ background: pr.brand, borderRadius: pr.radius === 'recto' ? 0 : pr.radius === 'suave' ? 4 : 999 }} />
                          </span>
                          <span className="mt-1.5 block text-[12px] text-mute group-aria-pressed:text-bone">{pr.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <span className={ctlTitle}>Tu letra</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(FONTS) as FontId[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        aria-pressed={state.font === f}
                        onClick={() => patch({ font: f }, `Letra ${FONTS[f].label.toLowerCase()}`)}
                        className="flex items-baseline justify-between gap-2 border border-line px-3 py-2.5 text-left text-mute transition-colors hover:text-bone aria-pressed:border-bone aria-pressed:bg-bone aria-pressed:text-coal"
                      >
                        <span
                          className="text-[22px] leading-none"
                          style={{
                            fontFamily: FONTS[f].vars['--s-head'],
                            fontWeight: FONTS[f].vars['--s-head-w'],
                            fontStretch: FONTS[f].vars['--s-head-stretch'],
                            textTransform: FONTS[f].vars['--s-head-case'] as 'none',
                          }}
                        >
                          Aa
                        </span>
                        <span className="text-[12px]">{FONTS[f].label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="biz-tag" className={ctlTitle}>
                    La frase de tu portada
                  </label>
                  <input id="biz-tag" className="field !text-[1.05rem]" value={state.tagline} maxLength={48} placeholder={b.tagline} autoComplete="off" onChange={(e) => patch({ tagline: e.target.value }, 'Frase actualizada')} />
                </div>

                <div>
                  <span className={ctlTitle}>La foto de portada</span>
                  <div className="grid grid-cols-3 gap-2">
                    {b.photos.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        aria-label={`Foto ${i + 1}`}
                        aria-pressed={state.photo === i}
                        onClick={() => patch({ photo: i }, 'Foto cambiada')}
                        className="aspect-[4/3] overflow-hidden border-2 border-transparent opacity-60 transition-[opacity,border-color] hover:opacity-100 aria-pressed:border-bone aria-pressed:opacity-100"
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className={ctlTitle}>Tratamiento de las fotos</span>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(FILTERS) as PhotoFilter[]).map((f) => (
                      <button key={f} type="button" className="chip" aria-pressed={state.filter === f} onClick={() => patch({ filter: f }, `Fotos en ${FILTERS[f].label.toLowerCase()}`)}>
                        {FILTERS[f].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="biz-scale" className={ctlTitle}>
                    Tamaño del titular
                  </label>
                  <input
                    id="biz-scale"
                    type="range"
                    min={0.75}
                    max={1.15}
                    step={0.05}
                    value={state.scale}
                    onChange={(e) => patch({ scale: Number(e.target.value) }, 'Titular ajustado')}
                    className="range w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className={ctlTitle}>Botones</span>
                    <div className="flex flex-col gap-2">
                      {(Object.keys(RADII) as Radius[]).map((r) => (
                        <button key={r} type="button" className="chip justify-between" aria-pressed={state.radius === r} onClick={() => patch({ radius: r }, `Botones ${RADII[r].label.toLowerCase()}`)}>
                          {RADII[r].label}
                          <span className="h-4 w-8 border-2 border-current" style={{ borderRadius: RADII[r].btn }} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    <div>
                      <span className={ctlTitle}>Fondo</span>
                      <div className="flex gap-2">
                        <button type="button" className="chip" aria-pressed={state.mode === 'claro'} onClick={() => patch({ mode: 'claro' }, 'Fondo claro')}>
                          <Sun size={16} /> Claro
                        </button>
                        <button type="button" className="chip" aria-pressed={state.mode === 'oscuro'} onClick={() => patch({ mode: 'oscuro' }, 'Fondo oscuro')}>
                          <Moon size={16} /> Oscuro
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className={ctlTitle}>Texto de portada</span>
                      <div className="flex gap-2">
                        <button type="button" className="chip" aria-label="A la izquierda" aria-pressed={state.align === 'izquierda'} onClick={() => patch({ align: 'izquierda' }, 'Portada a la izquierda')}>
                          <TextAlignLeft size={18} />
                        </button>
                        <button type="button" className="chip" aria-label="Centrado" aria-pressed={state.align === 'centro'} onClick={() => patch({ align: 'centro' }, 'Portada centrada')}>
                          <TextAlignCenter size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === 'secciones' && (
              <>
                <div>
                  <span className={ctlTitle}>¿Qué necesita tu página?</span>
                  <div className="grid grid-cols-2 gap-2">
                    {MODULES.map((m) => {
                      const on = state.modules.includes(m.id)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="switch"
                          aria-checked={on}
                          onClick={() => toggleModule(m.id)}
                          className={`flex items-start gap-2.5 border p-2.5 text-left transition-[color,background-color,border-color,transform] active:scale-[0.97] ${on ? 'border-bone bg-bone text-coal' : 'border-line hover:border-bone/50'}`}
                        >
                          <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border ${on ? 'border-coal bg-coal text-bone' : 'border-bone/40'}`}>{on && <Check size={11} weight="bold" className="[animation:pop_0.45s_var(--ease-out-expo)]" />}</span>
                          <span className="min-w-0">
                            <span className="block text-[13px] leading-tight font-medium">{m.label}</span>
                            <span className={`mt-1 block text-[12px] tabular-nums ${on ? 'opacity-70' : 'text-mute'}`}>+{pts(m.price)}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <span className={ctlTitle}>Arrastra para cambiar el orden</span>
                  {activeSections.length === 0 ? (
                    <p className="border border-dashed border-line p-4 text-[13px] text-mute">Activa una sección arriba y aparecerá aquí para ordenarla.</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {activeSections.map((id) => (
                        <li
                          key={id}
                          data-id={id}
                          onPointerDown={(e) => onDragStart(e, id)}
                          onPointerMove={onDragMove}
                          onPointerUp={onDragEnd}
                          onPointerCancel={onDragEnd}
                          className={`sort-row flex cursor-grab touch-none items-center gap-3 border px-3 py-2.5 text-[14px] select-none active:cursor-grabbing ${
                            dragging === id ? 'z-[1] border-bone bg-bone text-coal shadow-[0_14px_30px_rgb(0_0_0/0.5)]' : 'border-line bg-coal-2'
                          }`}
                        >
                          <DotsSixVertical size={18} weight="bold" className="opacity-60" />
                          {moduleLabel(id)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Running total */}
        <div className="sticky bottom-0 flex items-end justify-between gap-4 border-t border-line bg-coal px-5 py-4 lg:static lg:px-8">
          <div>
            <span className="block text-[12px] text-mute">Va en</span>
            <Money value={q.total} className="deco text-[2rem] leading-none" />
          </div>
          <button type="button" className="btn btn-solid !px-4 !py-3" onClick={() => setTicket(true)}>
            Ver cotización
            <ArrowRight size={15} weight="bold" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ Quote ticket */}
      {ticket && (
        <div className="fixed inset-0 z-[70] flex overflow-y-auto bg-coal/85 p-5 backdrop-blur-sm [animation:fade_0.3s_ease]" data-lenis-prevent onClick={() => setTicket(false)}>
          <div className="relative m-auto w-full max-w-[400px]" role="dialog" aria-modal="true" aria-label="Cotización" onClick={(e) => e.stopPropagation()}>
            <div className="relative z-[1] h-3 rounded-full bg-coal-3 shadow-[inset_0_2px_4px_rgb(0_0_0/0.7)]" />
            <div
              className="ticket mx-3 -mt-1.5 bg-bone px-6 pt-8 pb-10 text-coal"
              style={{
                mask: 'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%',
                WebkitMask: 'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <HexMark className="h-5 w-5" /> Hyvento
                </span>
                <button type="button" aria-label="Cerrar" onClick={() => setTicket(false)} className="grid h-8 w-8 place-items-center border border-coal/30 hover:bg-coal hover:text-bone">
                  <X size={14} weight="bold" />
                </button>
              </div>
              <p className="deco mt-5 text-[1.9rem] break-words">{name}</p>
              <p className="text-[13px] opacity-60">
                Página para {b.label.toLowerCase()}, lista en {q.days} días hábiles
              </p>
              <ul className="mt-5 flex flex-col gap-2 border-t border-dashed border-coal/35 pt-4 text-[14px]">
                <li className="flex justify-between gap-4">
                  <span>Página a tu medida</span>
                  <span className="tabular-nums">{pts(q.base)}</span>
                </li>
                {q.mods.map((m) => (
                  <li key={m.id} className="flex justify-between gap-4">
                    <span>{m.label}</span>
                    <span className="tabular-nums">{pts(m.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-coal/35 pt-4">
                <span className="font-semibold">Total</span>
                <span className="deco text-[2.2rem] leading-none tabular-nums">{pts(q.total)}</span>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed opacity-65">Precio en eurodólares, moneda oficial de esta feria. El valor en pesos se acuerda contigo.</p>
              <a href={wa} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 bg-coal px-4 py-3.5 text-[12px] font-semibold tracking-[0.14em] text-bone uppercase transition-transform active:scale-[0.98]">
                <WhatsappLogo size={18} weight="fill" />
                Enviar por WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  setTicket(false)
                  leaveEditor('footer')
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 border border-coal/35 px-4 py-3 text-[12px] font-semibold tracking-[0.14em] uppercase transition-colors hover:bg-coal hover:text-bone"
              >
                Terminar
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
