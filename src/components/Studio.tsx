import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type PointerEvent as RPointerEvent, type SetStateAction } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  ArrowClockwise,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Barbell,
  Cake,
  CaretLeft,
  Check,
  Copy,
  Coffee,
  Desktop,
  DeviceMobile,
  Devices,
  DotsSixVertical,
  Eye,
  EyeSlash,
  ForkKnife,
  Moon,
  Plus,
  Scissors,
  Shuffle,
  Storefront,
  Sun,
  TextAlignCenter,
  TextAlignLeft,
  Tooth,
  Trash,
  UploadSimple,
  WhatsappLogo,
  X,
  type Icon,
} from '@phosphor-icons/react'
import { MiniSite, type BlockAction, type Focus } from './MiniSite'
import { FIELDS, defaults } from './Blocks'
import { LOGOS } from './Logos'
import { HexMark, Scratches } from './Art'
import {
  BLOCK_META,
  BUSINESSES,
  EXTRAS,
  FILTERS,
  FONTS,
  GENERIC_IDS,
  PRESETS,
  RADII,
  SECTION_IDS,
  SWATCHES,
  TEMPLATE_PARTS,
  WHATSAPP_NUMBER,
  blockLabel,
  getBusiness,
  pts,
  quote,
  templateBlocks,
  type Block,
  type BlockBg,
  type BusinessId,
  type ExtraId,
  type FontId,
  type GenericId,
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
type Kind = 'point' | 'carry' | 'type' | 'text' | 'color' | 'logo' | 'photo' | 'size' | 'radius' | 'mode' | 'align'
type Device = 'ambos' | 'pc' | 'cel'
const TABS: [Tab, string][] = [
  ['marca', 'Tu marca'],
  ['estilo', 'Estilo'],
  ['secciones', 'Bloques'],
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
  const drag = useRef<string | null>(null)
  const [buildKey, setBuildKey] = useState(0)
  const [log, setLog] = useState('Esperando tus datos')
  const [tab, setTab] = useState<Tab>('marca')
  const [device, setDevice] = useState<Device>('ambos')
  const [dragging, setDragging] = useState<string | null>(null)
  /** uid of the block picked for editing, and whether the block inserter is open */
  const [picked, setPicked] = useState<string | null>(null)
  const [inserter, setInserter] = useState(false)
  const [ticket, setTicket] = useState(false)
  const [focus, setFocus] = useState<Focus>({ id: 'hero', label: 'Portada', n: 0 })

  const b = getBusiness(state.business)
  const q = quote(state)
  const name = state.name.trim() || b.defaultName
  const present = state.blocks.filter((x) => x.type === 'tpl').map((x) => x.part ?? 0)
  const missingParts = TEMPLATE_PARTS[state.business].map((_, i) => i).filter((i) => !present.includes(i))

  /* Builder cursor. A pointer comes in from the controls and does the edit where it happens:
     it types the headline when the type changes, dabs each button when the colour changes,
     spins the logo, opens the photograph from its centre, drags the text when it is realigned,
     and carries a new section to its place. */
  const act = (kind: Kind, id: string, label: string) => {
    const layer = root.current?.querySelector<HTMLElement>('.builder')
    if (!layer || reducedMotion() || window.innerWidth < 1024) return
    window.setTimeout(() => {
      const site = Array.from(root.current!.querySelectorAll<HTMLElement>('.site')).find((el) => el.offsetParent && el.getBoundingClientRect().width > 300) ?? root.current!.querySelector<HTMLElement>('.site')
      const block = site?.querySelector<HTMLElement>(`[data-block="${id}"]`)
      if (!site || !block) return
      const L = layer.getBoundingClientRect()
      const S = site.getBoundingClientRect()
      /** element box in layer coordinates, clipped to what the frame shows */
      const box = (el: Element) => {
        const r = el.getBoundingClientRect()
        const x1 = Math.max(r.left, S.left)
        const y1 = Math.max(r.top, S.top)
        const x2 = Math.min(r.right, S.right)
        const y2 = Math.min(r.bottom, S.bottom)
        return { x: x1 - L.left, y: y1 - L.top, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1), seen: x2 - x1 > 8 && y2 - y1 > 8 }
      }
      const seen = (sel: string, scope: Element = site) => Array.from(scope.querySelectorAll<HTMLElement>(sel)).filter((el) => box(el).seen)
      const biggest = (els: HTMLElement[]) => els.sort((a, b) => parseFloat(getComputedStyle(b).fontSize) - parseFloat(getComputedStyle(a).fontSize))[0]

      const cur = layer.querySelector<HTMLElement>('.bld-cur')!
      const piece = layer.querySelector<HTMLElement>('.bld-piece')!
      const ring = layer.querySelector<HTMLElement>('.bld-ring')!
      const caret = layer.querySelector<HTMLElement>('.bld-caret')!
      const tag = layer.querySelector<HTMLElement>('.bld-tag')!
      tag.textContent = label
      gsap.killTweensOf([cur, piece, ring, caret])
      gsap.set([piece, ring, caret], { autoAlpha: 0 })

      const start = { x: -40, y: L.height * 0.55 }
      const tl = gsap.timeline()
      tl.set(cur, { x: start.x, y: start.y, autoAlpha: 1, scale: 1 })
      const go = (x: number, y: number, at: number | string, d = 0.6) => tl.to(cur, { x, y, duration: d, ease: 'expo.inOut' }, at)
      const click = (x: number, y: number, at: number) =>
        tl
          .to(cur, { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1 }, at)
          .fromTo(ring, { x, y, scale: 0.2, autoAlpha: 0.9 }, { scale: 2.4, autoAlpha: 0, duration: 0.55, ease: 'power2.out' }, at)
      const leave = (at: number | string) => tl.to(cur, { x: '+=70', y: '+=90', autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, at)

      const B = box(block)
      const headline = biggest(seen('.site-head', block))
      const brandEls = seen('[class*="bg-(--s-brand)"]').slice(0, 3)

      if (kind === 'carry' && B.seen) {
        // a section is brought over and stretched into place
        tl.set(piece, { x: start.x + 14, y: start.y + 18, width: 170, height: 40, autoAlpha: 1 })
        go(B.x + B.w - 6, B.y + B.h - 6, 0, 0.9)
        tl.to(piece, { x: B.x, y: B.y, width: B.w, height: B.h, duration: 0.9, ease: 'expo.inOut' }, 0).to(piece, { autoAlpha: 0, duration: 0.45 }, 1.05)
        click(B.x + B.w - 6, B.y + B.h - 6, 0.95)
        leave(1.5)
      } else if ((kind === 'text' || kind === 'size' || kind === 'align') && headline) {
        const h = box(headline)
        if (kind === 'text') {
          // the headline is written again, left to right, with a caret riding the edge
          go(h.x, h.y + h.h * 0.5, 0, 0.55)
          tl.set(caret, { x: h.x, y: h.y, height: h.h, autoAlpha: 1 }, 0.55)
            .fromTo(headline, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'steps(16)', clearProps: 'clipPath' }, 0.55)
            .to(caret, { x: h.x + h.w, duration: 1, ease: 'steps(16)' }, 0.55)
            .to(cur, { x: h.x + h.w + 6, duration: 1, ease: 'steps(16)' }, 0.55)
            .to(caret, { autoAlpha: 0, duration: 0.12, repeat: 3, yoyo: true }, 1.55)
          leave(1.95)
        } else if (kind === 'size') {
          // grabbed by its corner and resized
          go(h.x + h.w, h.y + h.h, 0, 0.55)
          click(h.x + h.w, h.y + h.h, 0.55)
          tl.fromTo(headline, { scale: 0.9, transformOrigin: 'left top' }, { scale: 1, duration: 0.6, ease: 'back.out(2)', clearProps: 'transform' }, 0.6).to(cur, { x: '+=18', y: '+=14', duration: 0.6, ease: 'back.out(2)' }, 0.6)
          leave(1.3)
        } else {
          // dragged sideways into its new alignment
          const dx = state.align === 'centro' ? 60 : -60
          go(h.x + h.w * 0.5 + dx, h.y + h.h * 0.5, 0, 0.55)
          click(h.x + h.w * 0.5 + dx, h.y + h.h * 0.5, 0.55)
          tl.fromTo(headline, { x: dx }, { x: 0, duration: 0.7, ease: 'expo.out', clearProps: 'transform' }, 0.62).to(cur, { x: h.x + h.w * 0.5, duration: 0.7, ease: 'expo.out' }, 0.62)
          leave(1.4)
        }
      } else if ((kind === 'color' || kind === 'radius') && brandEls.length) {
        // each piece that wears the brand colour gets a dab, one after another
        brandEls.forEach((el, i) => {
          const r = box(el)
          const at = i * 0.5
          const cx = r.x + r.w * 0.5
          const cy = r.y + r.h * 0.5
          go(cx, cy, at, 0.45)
          click(cx, cy, at + 0.42)
          tl.fromTo(el, { scale: kind === 'color' ? 1.18 : 0.86 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' }, at + 0.44)
        })
        leave(brandEls.length * 0.5 + 0.5)
      } else if (kind === 'logo') {
        const el = seen('.t-logo')[0]
        if (!el) return
        const r = box(el)
        go(r.x + r.w * 0.5, r.y + r.h * 0.5, 0, 0.6)
        click(r.x + r.w * 0.5, r.y + r.h * 0.5, 0.6)
        tl.fromTo(el, { rotate: -200, scale: 0.2 }, { rotate: 0, scale: 1, duration: 0.9, ease: 'back.out(1.8)', clearProps: 'transform' }, 0.62)
        leave(1.45)
      } else if (kind === 'photo') {
        const el = seen('img.kb', block)[0] ?? seen('img', block)[0]
        if (!el) return
        const r = box(el)
        const cx = r.x + r.w * 0.5
        const cy = r.y + r.h * 0.5
        go(cx, cy, 0, 0.6)
        click(cx, cy, 0.6)
        // the new photograph opens out from where the pointer pressed
        tl.fromTo(el, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1, ease: 'expo.out', clearProps: 'clipPath' }, 0.62)
        leave(1.45)
      } else if (kind === 'mode') {
        // one sweep across the whole frame
        const s0 = box(site)
        go(s0.x + 30, s0.y + 30, 0, 0.45)
        go(s0.x + s0.w - 40, s0.y + s0.h - 40, 0.45, 0.9)
        leave(1.35)
      } else if (kind === 'type') {
        // while typing, the pointer simply sits at the end of the line being written
        const el = id === 'header' ? seen('.site-head', block)[0] : headline
        if (!el) return
        const r = box(el)
        tl.set(cur, { x: r.x + r.w + 6, y: r.y + r.h * 0.5 }).set(caret, { x: r.x + r.w + 2, y: r.y, height: r.h, autoAlpha: 1 })
        tl.to(caret, { autoAlpha: 0, duration: 0.3, repeat: 3, yoyo: true }, 0.1)
        leave(1.3)
      } else if (B.seen) {
        const cx = B.x + B.w * 0.5
        const cy = B.y + Math.min(B.h * 0.5, 120)
        go(cx, cy, 0, 0.7)
        click(cx, cy, 0.72)
        leave(1.27)
      }
    }, 320)
  }

  const select = (id: string, label: string, kind: Kind = 'point') => {
    setFocus((f) => ({ id, label, n: f.n + 1 }))
    act(kind, id, label)
  }

  /** What kind of gesture an edit deserves, from the fields it touches. */
  const kindOf = (p: Partial<StudioState>): Kind =>
    'name' in p || 'tagline' in p
      ? 'type'
      : 'font' in p
        ? 'text'
        : 'brand' in p
          ? 'color'
          : 'logo' in p || 'logoPreset' in p
            ? 'logo'
            : 'photo' in p || 'filter' in p
              ? 'photo'
              : 'scale' in p
                ? 'size'
                : 'radius' in p
                  ? 'radius'
                  : 'mode' in p
                    ? 'mode'
                    : 'align' in p
                      ? 'align'
                      : 'point'

  const patch = (p: Partial<StudioState>, message: string, target: 'header' | 'hero' | null = 'hero') => {
    setState((s) => ({ ...s, ...p }))
    setLog(message)
    if (target === 'header') select('header', 'Encabezado', kindOf(p))
    else if (target === 'hero') select('hero', 'Portada', kindOf(p))
  }
  const rebuild = () => setBuildKey((k) => k + 1)
  const captureFlip = () => {
    flip.current = Flip.getState('.sort-row, .site .fold')
  }

  const pickBusiness = (id: BusinessId) => {
    const next = getBusiness(id)
    patch(
      { business: id, brand: next.brand, font: next.font, mode: next.mode, photo: 0, tagline: '', blocks: [...templateBlocks(id), ...state.blocks.filter((x) => x.type !== 'tpl' && !x.closing)] },
      `Plantilla ${next.label} cargada`,
      null,
    )
    setPicked(null)
    setBuildKey((k) => Math.max(1, k))
  }

  const toggleExtra = (id: ExtraId) => {
    const label = EXTRAS.find((e) => e.id === id)!.label
    setLog(state.modules.includes(id) ? `${label} retirado` : `${label} instalado`)
    setState((s) => ({ ...s, modules: s.modules.includes(id) ? s.modules.filter((m) => m !== id) : [...s.modules, id] }))
  }

  /* ------------------------------------------------------------ Blocks: add, move, copy, hide, remove */
  const labelOf = (bl: Block) => blockLabel(bl, state.business)
  const setBlocks = (fn: (blocks: Block[]) => Block[]) => setState((s) => ({ ...s, blocks: fn(s.blocks) }))
  const pickedBlock = state.blocks.find((x) => x.uid === picked && !x.closing) ?? null

  const addBlock = (type: Block['type'], part?: number) => {
    const uid = type === 'tpl' ? (part === 0 ? 'hero' : `tpl-${part}`) : state.blocks.some((x) => x.uid === type) ? `${type}-${Date.now().toString(36)}` : type
    const block: Block =
      type === 'tpl' ? { uid, type, part } : { uid, type, props: (GENERIC_IDS as string[]).includes(type) ? defaults(type as GenericId, b, name) : undefined }
    const label = labelOf(block)
    captureFlip()
    setBlocks((blocks) => {
      // template pieces go back to their own slot; anything else lands under the picked block, or at the end
      if (type === 'tpl') {
        const before = blocks.findIndex((x) => x.type !== 'tpl' || (x.part ?? 0) > (part ?? 0))
        const at = before === -1 ? blocks.length : before
        return [...blocks.slice(0, at), block, ...blocks.slice(at)]
      }
      const i = blocks.findIndex((x) => x.uid === picked)
      const at = i === -1 ? blocks.length : i + 1
      return [...blocks.slice(0, at), block, ...blocks.slice(at)]
    })
    setInserter(false)
    setPicked(uid)
    setLog(`${label} añadido`)
    window.setTimeout(() => select(uid, label, 'carry'), 420)
  }

  const removeBlock = (uid: string) => {
    const bl = state.blocks.find((x) => x.uid === uid)
    if (!bl) return
    setLog(`${labelOf(bl)} eliminado`)
    if (picked === uid) setPicked(null)
    // fold it shut first, then take it out of the page
    setBlocks((blocks) => blocks.map((x) => (x.uid === uid ? { ...x, closing: true } : x)))
    window.setTimeout(() => setBlocks((blocks) => blocks.filter((x) => x.uid !== uid)), 600)
  }

  const duplicateBlock = (uid: string) => {
    const bl = state.blocks.find((x) => x.uid === uid)
    if (!bl || bl.type === 'tpl') return
    const copy: Block = { ...bl, uid: `${bl.type}-${Date.now().toString(36)}`, props: bl.props ? { ...bl.props } : undefined }
    captureFlip()
    setBlocks((blocks) => {
      const i = blocks.findIndex((x) => x.uid === uid)
      return [...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)]
    })
    setPicked(copy.uid)
    setLog(`${labelOf(bl)} duplicado`)
    window.setTimeout(() => select(copy.uid, labelOf(bl), 'carry'), 420)
  }

  const toggleHidden = (uid: string) => {
    const bl = state.blocks.find((x) => x.uid === uid)
    if (!bl) return
    setLog(bl.hidden ? `${labelOf(bl)} visible` : `${labelOf(bl)} oculto`)
    setBlocks((blocks) => blocks.map((x) => (x.uid === uid ? { ...x, hidden: !x.hidden } : x)))
  }

  const moveBlock = (uid: string, dir: -1 | 1) => {
    const i = state.blocks.findIndex((x) => x.uid === uid)
    const j = i + dir
    if (i === -1 || j < 0 || j >= state.blocks.length) return
    captureFlip()
    setBlocks((blocks) => {
      const next = [...blocks]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
    setLog(`${labelOf(state.blocks[i])} movido`)
    select(uid, labelOf(state.blocks[i]))
  }

  const updateBlock = (uid: string, change: Partial<Block>) => setBlocks((blocks) => blocks.map((x) => (x.uid === uid ? { ...x, ...change } : x)))
  const updateProp = (uid: string, key: string, value: string) =>
    setBlocks((blocks) => blocks.map((x) => (x.uid === uid ? { ...x, props: { ...x.props, [key]: value } } : x)))

  const onBlockAction = (uid: string, action: BlockAction) => {
    if (action === 'up') moveBlock(uid, -1)
    else if (action === 'down') moveBlock(uid, 1)
    else if (action === 'duplicate') duplicateBlock(uid)
    else if (action === 'hide') toggleHidden(uid)
    else removeBlock(uid)
  }

  /** Picking a block on the page opens its settings in the Bloques tab. */
  const pickBlock = (uid: string) => {
    setPicked(uid)
    setTab('secciones')
    setInserter(false)
  }

  const surprise = () => {
    captureFlip()
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
        // the cover stays on top, everything under it is reshuffled
        blocks: [state.blocks[0], ...state.blocks.slice(1).sort(() => Math.random() - 0.5)].filter(Boolean),
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
     and both the list and the blocks on the page glide to their new spots. */
  const onDragStart = (e: RPointerEvent, uid: string) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = uid
    setDragging(uid)
  }
  const onDragMove = (e: RPointerEvent) => {
    const uid = drag.current
    if (!uid) return
    const rows = Array.from(root.current!.querySelectorAll<HTMLElement>('.sort-row'))
    const over = rows.find((r) => {
      const box = r.getBoundingClientRect()
      return e.clientY >= box.top && e.clientY <= box.bottom
    })
    const target = over?.dataset.id
    if (!target || target === uid) return
    captureFlip()
    setBlocks((blocks) => {
      const from = blocks.findIndex((x) => x.uid === uid)
      const to = blocks.findIndex((x) => x.uid === target)
      if (from === -1 || to === -1) return blocks
      const next = blocks.filter((x) => x.uid !== uid)
      next.splice(next.findIndex((x) => x.uid === target) + (from < to ? 1 : 0), 0, blocks[from])
      return next
    })
    const bl = state.blocks.find((x) => x.uid === uid)
    if (bl) setLog(`${labelOf(bl)} movido`)
  }
  const onDragEnd = () => {
    const uid = drag.current
    drag.current = null
    setDragging(null)
    const bl = state.blocks.find((x) => x.uid === uid)
    if (bl) select(bl.uid, labelOf(bl))
  }

  useLayoutEffect(() => {
    const snapshot = flip.current
    flip.current = null
    if (!snapshot || reducedMotion()) return
    Flip.from(snapshot, { duration: 0.65, ease: 'expo.out' })
  }, [state.blocks])

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
              <div className="bld-caret invisible absolute top-0 left-0 w-[2px] bg-[#2f7bff] opacity-0" />
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
                  <MiniSite state={state} buildKey={buildKey} focus={focus} selected={picked} onSelect={pickBlock} onAction={onBlockAction} onStep={(l) => setLog(l ? `Montando ${l.toLowerCase()}` : 'Página lista')} />
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
                  <MiniSite state={state} buildKey={buildKey} focus={focus} selected={picked} onSelect={pickBlock} onAction={onBlockAction} />
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
                        className="grid h-12 w-12 place-items-center border border-line text-mute transition-[color,background-color,border-color,transform] hover:-translate-y-0.5 hover:text-bone aria-pressed:border-bone aria-pressed:bg-bone aria-pressed:text-coal"
                      >
                        <L size={30} letter={name.charAt(0)} />
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

            {tab === 'secciones' &&
              (pickedBlock ? (
                /* ------------------------------ Inspector: settings of the picked block */
                <>
                  <div>
                    <button type="button" onClick={() => setPicked(null)} className="label mb-4 flex items-center gap-2 text-mute transition-colors hover:text-bone">
                      <CaretLeft size={13} weight="bold" /> Todos los bloques
                    </button>
                    <p className="display-narrow text-[2.2rem] leading-none">{labelOf(pickedBlock)}</p>
                    <p className="mt-1.5 text-[13px] text-mute">
                      {pickedBlock.type === 'tpl' ? 'Pieza propia de esta plantilla. Sigue tu marca y tu estilo.' : `${BLOCK_META[pickedBlock.type].hint}. +${pts(BLOCK_META[pickedBlock.type].price)}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {(
                      [
                        ['up', ArrowUp, 'Subir'],
                        ['down', ArrowDown, 'Bajar'],
                        ['duplicate', Copy, 'Duplicar'],
                        ['hide', pickedBlock.hidden ? Eye : EyeSlash, pickedBlock.hidden ? 'Mostrar' : 'Ocultar'],
                        ['remove', Trash, 'Eliminar'],
                      ] as [BlockAction, Icon, string][]
                    ).map(([action, I, title]) => (
                      <button
                        key={action}
                        type="button"
                        disabled={action === 'duplicate' && pickedBlock.type === 'tpl'}
                        onClick={() => onBlockAction(pickedBlock.uid, action)}
                        className="flex flex-col items-center gap-1.5 border border-line py-2.5 text-[11px] text-mute transition-colors hover:border-bone/60 hover:text-bone disabled:opacity-30 disabled:hover:border-line"
                      >
                        <I size={17} />
                        {title}
                      </button>
                    ))}
                  </div>

                  {pickedBlock.type !== 'tpl' && (
                    <div>
                      <span className={ctlTitle}>Fondo del bloque</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(
                          [
                            ['pagina', 'Página'],
                            ['suave', 'Suave'],
                            ['marca', 'Tu color'],
                            ['oscuro', 'Oscuro'],
                          ] as [BlockBg, string][]
                        ).map(([v, label]) => (
                          <button
                            key={v}
                            type="button"
                            aria-pressed={(pickedBlock.bg ?? 'pagina') === v}
                            onClick={() => {
                              updateBlock(pickedBlock.uid, { bg: v })
                              setLog(`Fondo ${label.toLowerCase()}`)
                              select(pickedBlock.uid, labelOf(pickedBlock), 'mode')
                            }}
                            className="group border border-line p-1.5 text-left aria-pressed:border-bone"
                          >
                            <i
                              className="block h-7 border border-black/10"
                              style={{ background: v === 'pagina' ? (state.mode === 'oscuro' ? '#14110e' : '#fbf8f2') : v === 'suave' ? (state.mode === 'oscuro' ? '#27231e' : '#ece8e0') : v === 'marca' ? state.brand : '#14110e' }}
                            />
                            <span className="mt-1 block text-[11px] text-mute group-aria-pressed:text-bone">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {pickedBlock.type === 'imagen' && (
                    <div>
                      <span className={ctlTitle}>Qué foto</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[...b.photos, ...b.items.map((i) => i.img)].slice(0, 4).map((src, i) => (
                          <button
                            key={src + i}
                            type="button"
                            aria-label={`Foto ${i + 1}`}
                            aria-pressed={Number(pickedBlock.props?.photo ?? 1) === i}
                            onClick={() => {
                              updateProp(pickedBlock.uid, 'photo', String(i))
                              select(pickedBlock.uid, labelOf(pickedBlock), 'photo')
                            }}
                            className="aspect-[4/3] overflow-hidden border-2 border-transparent opacity-60 transition-opacity hover:opacity-100 aria-pressed:border-bone aria-pressed:opacity-100"
                          >
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {pickedBlock.type !== 'tpl' && pickedBlock.type in FIELDS && (
                    <div className="flex flex-col gap-5">
                      {FIELDS[pickedBlock.type as GenericId].map((field) => (
                        <div key={field.key}>
                          <label htmlFor={`f-${field.key}`} className={ctlTitle}>
                            {field.label}
                          </label>
                          {field.long ? (
                            <textarea
                              id={`f-${field.key}`}
                              rows={3}
                              className="field !text-[0.95rem] leading-snug"
                              value={pickedBlock.props?.[field.key] ?? ''}
                              onChange={(e) => updateProp(pickedBlock.uid, field.key, e.target.value)}
                            />
                          ) : (
                            <input
                              id={`f-${field.key}`}
                              className="field !text-[1.05rem]"
                              value={pickedBlock.props?.[field.key] ?? ''}
                              autoComplete="off"
                              onChange={(e) => updateProp(pickedBlock.uid, field.key, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* ------------------------------ Layers: every block on the page, in order */
                <>
                  <div>
                    <button
                      type="button"
                      onClick={() => setInserter((v) => !v)}
                      aria-expanded={inserter}
                      className={`flex w-full items-center justify-between border px-4 py-3.5 text-[14px] font-semibold transition-colors ${inserter ? 'border-bone bg-bone text-coal' : 'border-bone/50 hover:bg-bone hover:text-coal'}`}
                    >
                      Añadir bloque
                      <Plus size={17} weight="bold" className={`transition-transform duration-500 ease-[var(--ease-out-expo)] ${inserter ? 'rotate-45' : ''}`} />
                    </button>

                    <div className="fold" data-open={inserter}>
                      <div>
                        <div className="flex flex-col gap-5 pt-5">
                          {missingParts.length > 0 && (
                            <div>
                              <span className={ctlTitle}>De esta plantilla</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {missingParts.map((part) => (
                                  <button key={part} type="button" onClick={() => addBlock('tpl', part)} className="border border-line p-2.5 text-left text-[13px] font-medium transition-colors hover:border-bone/60">
                                    {TEMPLATE_PARTS[state.business][part]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {(
                            [
                              ['Para vender', SECTION_IDS],
                              ['Para contar', GENERIC_IDS],
                            ] as [string, (SectionId | GenericId)[]][]
                          ).map(([group, ids]) => (
                            <div key={group}>
                              <span className={ctlTitle}>{group}</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {ids.map((id) => (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => addBlock(id)}
                                    className="group border border-line p-2.5 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-bone/60 active:scale-[0.97]"
                                  >
                                    <span className="block text-[13px] leading-tight font-medium">{BLOCK_META[id].label}</span>
                                    <span className="mt-1 flex items-baseline justify-between gap-2 text-[11px] text-mute">
                                      <span className="truncate">{BLOCK_META[id].hint}</span>
                                      <span className="shrink-0 tabular-nums">+{pts(BLOCK_META[id].price)}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={ctlTitle}>Tu página, de arriba abajo. Arrastra para mover, toca para ajustar.</span>
                    <ul className="flex flex-col gap-1.5">
                      {state.blocks
                        .filter((x) => !x.closing)
                        .map((bl) => (
                          <li
                            key={bl.uid}
                            data-id={bl.uid}
                            onPointerDown={(e) => onDragStart(e, bl.uid)}
                            onPointerMove={onDragMove}
                            onPointerUp={onDragEnd}
                            onPointerCancel={onDragEnd}
                            className={`sort-row group flex cursor-grab touch-none items-center gap-2 border py-1.5 pr-1.5 pl-2.5 text-[14px] select-none active:cursor-grabbing ${
                              dragging === bl.uid ? 'z-[1] border-bone bg-bone text-coal shadow-[0_14px_30px_rgb(0_0_0/0.5)]' : 'border-line bg-coal-2'
                            } ${bl.hidden ? 'opacity-45' : ''}`}
                          >
                            <DotsSixVertical size={17} weight="bold" className="shrink-0 opacity-50" />
                            <button type="button" onClick={() => pickBlock(bl.uid)} className="min-w-0 flex-1 truncate py-1 text-left">
                              {labelOf(bl)}
                              {bl.type === 'tpl' && <span className="ml-2 text-[10px] tracking-[0.14em] uppercase opacity-50">plantilla</span>}
                            </button>
                            <button type="button" title={bl.hidden ? 'Mostrar' : 'Ocultar'} aria-label={bl.hidden ? 'Mostrar' : 'Ocultar'} onClick={() => toggleHidden(bl.uid)} className="grid h-8 w-8 shrink-0 place-items-center opacity-50 transition-opacity hover:opacity-100">
                              {bl.hidden ? <EyeSlash size={15} /> : <Eye size={15} />}
                            </button>
                            <button type="button" title="Eliminar" aria-label="Eliminar" onClick={() => removeBlock(bl.uid)} className="grid h-8 w-8 shrink-0 place-items-center opacity-50 transition-opacity hover:opacity-100">
                              <Trash size={15} />
                            </button>
                          </li>
                        ))}
                    </ul>
                    {state.blocks.length === 0 && <p className="border border-dashed border-line p-4 text-[13px] text-mute">La página está vacía. Añade un bloque para empezar.</p>}
                  </div>

                  <div>
                    <span className={ctlTitle}>Complementos flotantes</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {EXTRAS.map((m) => {
                        const on = state.modules.includes(m.id)
                        return (
                          <button
                            key={m.id}
                            type="button"
                            role="switch"
                            aria-checked={on}
                            onClick={() => toggleExtra(m.id)}
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
                </>
              ))}
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
                  <li key={m.key} className="flex justify-between gap-4">
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
