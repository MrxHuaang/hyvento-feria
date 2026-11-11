import { useEffect, useMemo, useRef } from 'react'
import { reducedMotion } from '../lib/scroll'

/* Woodcut drawing kit. Everything here is generated geometry pushed through one
   SVG "ink" filter that roughens the edges and re-seeds a few times a second,
   so the lines boil like hand-drawn animation frames. */

/** Small seeded RNG so drawings are stable between renders. */
export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const f = (n: number) => n.toFixed(1)

/** A line that wanders a little, like a gouge pushed through wood. */
function wobble(x1: number, y1: number, x2: number, y2: number, r: () => number, amp = 2, steps = 7) {
  const nx = -(y2 - y1)
  const ny = x2 - x1
  const len = Math.hypot(nx, ny) || 1
  let d = `M${f(x1)} ${f(y1)}`
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const j = i < steps ? (r() - 0.5) * 2 * amp : 0
    d += `L${f(x1 + (x2 - x1) * t + (nx / len) * j)} ${f(y1 + (y2 - y1) * t + (ny / len) * j)}`
  }
  return d
}

/** Filter definitions. Mount once per page. */
export function InkDefs() {
  const turb = useRef<SVGFETurbulenceElement>(null)
  useEffect(() => {
    if (reducedMotion()) return
    let seed = 1
    const id = window.setInterval(() => {
      seed = (seed % 4) + 1
      turb.current?.setAttribute('seed', String(seed))
    }, 150)
    return () => window.clearInterval(id)
  }, [])
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <filter id="ink" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id="arch-clip" clipPathUnits="objectBoundingBox">
          <path d={ARCH} transform="scale(0.0016667 0.0013158)" />
        </clipPath>
        <filter id="ink-still" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}

export const ink = { filter: 'url(#ink)' } as const
export const inkStill = { filter: 'url(#ink-still)' } as const

/* ---------------------------------------------------------- Hero pieces (600 x 760 box) */

export const ARCH = 'M70 752V300a230 230 0 0 1 460 0v452z'
export const CENTER = { x: 300, y: 300 }

/** Sunburst of uneven wedges, the way a woodcut sky is carved. */
export function Sunburst({ className = '' }: { className?: string }) {
  const wedges = useMemo(() => {
    const r = rng(11)
    return Array.from({ length: 84 }, (_, k) => {
      const a = ((k * 360) / 84) * (Math.PI / 180)
      const w = (0.35 + r() * 0.95) * (Math.PI / 180)
      const r0 = 168 + r() * 70
      const R = 520
      return `M${f(Math.cos(a) * r0)} ${f(Math.sin(a) * r0)}L${f(Math.cos(a - w) * R)} ${f(Math.sin(a - w) * R)}L${f(Math.cos(a + w) * R)} ${f(Math.sin(a + w) * R)}Z`
    })
  }, [])
  return (
    <svg viewBox="-520 -520 1040 1040" className={className} aria-hidden="true">
      <g fill="currentColor">
        {wedges.map((d, i) => (
          <path key={i} d={d} className="wedge" />
        ))}
      </g>
    </svg>
  )
}

/** Dense horizontal gouges: the ground under the medallion. */
export function Ground({ className = '' }: { className?: string }) {
  const lines = useMemo(() => {
    const r = rng(5)
    const out: { d: string; w: number }[] = []
    for (let y = 508; y < 748; y += 9 + r() * 4) {
      let x = 78
      while (x < 522) {
        const run = 40 + r() * 190
        const end = Math.min(522, x + run)
        out.push({ d: wobble(x, y, end, y + (r() - 0.5) * 3, r, 1.6, 5), w: 1.6 + r() * 3.2 })
        x = end + 8 + r() * 26
      }
    }
    return out
  }, [])
  return (
    <svg viewBox="0 0 600 760" className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        {lines.map((l, i) => (
          <path key={i} d={l.d} strokeWidth={l.w} className="gouge" />
        ))}
      </g>
    </svg>
  )
}

/** Points along the arch outline, nudged so the rule looks cut by hand (no filter needed). */
function roughArch(inset: number, seed: number, amp: number) {
  const r = rng(seed)
  const j = () => (r() - 0.5) * 2 * amp
  const x0 = 70 + inset
  const x1 = 530 - inset
  const rad = 230 - inset
  const pts: string[] = []
  for (let y = 752; y > 300; y -= 22) pts.push(`${f(x0 + j())} ${f(y)}`)
  for (let k = 0; k <= 40; k++) {
    const a = Math.PI + (k / 40) * Math.PI
    pts.push(`${f(300 + Math.cos(a) * rad + j())} ${f(300 + Math.sin(a) * rad + j())}`)
  }
  for (let y = 322; y <= 752; y += 22) pts.push(`${f(x1 + j())} ${f(y)}`)
  return 'M' + pts.join('L')
}

function roughCircle(rad: number, seed: number, amp: number) {
  const r = rng(seed)
  const pts = Array.from({ length: 72 }, (_, k) => {
    const a = (k / 72) * Math.PI * 2
    const rr = rad + (r() - 0.5) * 2 * amp
    return `${f(CENTER.x + Math.cos(a) * rr)} ${f(CENTER.y + Math.sin(a) * rr)}`
  })
  return 'M' + pts.join('L') + 'Z'
}

/** The arch frame: heavy outline, thin inner rule, medallion ring and a base. */
export function ArchFrame({ className = '' }: { className?: string }) {
  const p = { pathLength: 1, strokeDasharray: 1, className: 'draw' }
  const d = useMemo(
    () => ({
      outer: roughArch(0, 31, 2.2),
      inner: roughArch(24, 47, 1.6),
      ring: roughCircle(158, 5, 2.4),
      ring2: roughCircle(143, 9, 1.4),
      base: wobble(36, 752, 564, 752, rng(2), 2.4, 14),
    }),
    [],
  )
  return (
    <svg viewBox="0 0 600 760" className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={d.outer} strokeWidth="11" {...p} />
        <path d={d.inner} strokeWidth="3" {...p} />
        <path d={d.base} strokeWidth="11" {...p} />
        <path d={d.ring} strokeWidth="9" {...p} />
        <path d={d.ring2} strokeWidth="2.5" {...p} />
        <path d="M300 70v-46M277 33l46 2" strokeWidth="6" {...p} />
        <path d="M70 478l37 2M493 480l37-2" strokeWidth="6" {...p} />
      </g>
    </svg>
  )
}

/** Curtain of wavering vertical gouges for the sides of the stage. */
export function Drape({ className = '', seed = 3 }: { className?: string; seed?: number }) {
  const lines = useMemo(() => {
    const r = rng(seed)
    const out: { d: string; w: number }[] = []
    let x = 6
    while (x < 300) {
      const sway = 10 + r() * 14
      let d = `M${f(x)} -10`
      for (let y = 60; y <= 1010; y += 70) d += `Q${f(x + (y % 140 ? sway : -sway))} ${y - 35} ${f(x + (r() - 0.5) * 4)} ${y}`
      out.push({ d, w: 1.2 + r() * 5.5 })
      x += 7 + r() * 11
    }
    return out
  }, [seed])
  return (
    <svg viewBox="0 0 300 1000" preserveAspectRatio="none" className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        {lines.map((l, i) => (
          <path key={i} d={l.d} strokeWidth={l.w} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  )
}

/* ---------------------------------------------------------- Objects (100 x 100 box) */

export type ObjectName = 'taza' | 'campana' | 'tijeras' | 'bolsa' | 'muela' | 'sol' | 'llave' | 'estrella'

const OBJECTS: Record<ObjectName, { main: string; fine: string }> = {
  taza: {
    main: 'M20 44h48v14c0 15-11 25-24 25S20 73 20 58zM68 49h7a9 9 0 0 1 0 18h-8M12 90h66',
    fine: 'M34 34c-5-6 5-9 0-16M45 34c-5-6 5-9 0-16M56 34c-5-6 5-9 0-16M56 50v24M61 50v17M51 50v29M28 50v8',
  },
  campana: {
    main: 'M14 72a36 36 0 0 1 72 0zM8 72h84M16 82h68M50 36v-8M44 26h12',
    fine: 'M26 66a25 25 0 0 1 14-21M34 66a17 17 0 0 1 9-14M64 46c8 5 12 12 13 20M58 50c5 4 8 9 9 16',
  },
  tijeras: {
    main: 'M34 66 78 14M66 66 22 14M26 66a10 10 0 1 0 .1 0M74 66a10 10 0 1 0 .1 0',
    fine: 'M50 44v.1M40 52l-7 9M60 52l7 9M70 22l-9 11M30 22l9 11',
  },
  bolsa: {
    main: 'M22 36h56l6 54H16zM37 36v-7a13 13 0 0 1 26 0v7',
    fine: 'M30 50l-6 32M38 48l-5 36M46 48l-3 36M62 80h14M60 72h17M64 64h12',
  },
  muela: {
    main: 'M30 22c8-7 14 2 20 2s12-9 20-2c11 9 4 27 0 35-3 7-3 23-9 23s-5-19-11-19-5 19-11 19-6-16-9-23c-4-8-11-26 0-35z',
    fine: 'M36 30c-4 4-4 12-2 18M42 30c-3 3-3 8-2 12M62 34c3 6 2 14 0 20',
  },
  sol: {
    main: 'M50 34a16 16 0 1 0 .1 0M50 8v14M50 78v14M8 50h14M78 50h14M20 20l10 10M70 70l10 10M80 20 70 30M30 70 20 80',
    fine: 'M44 46v.1M56 46v.1M44 55c4 4 8 4 12 0M34 12l4 12M66 12l-4 12M34 88l4-12M66 88l-4-12M12 34l12 4M12 66l12-4M88 34l-12 4M88 66l-12-4',
  },
  llave: {
    main: 'M30 20a16 16 0 1 0 .1 0M42 48l40 40M70 76l10-10M60 66l8-8',
    fine: 'M30 30a6 6 0 1 0 .1 0M20 30c0-6 4-10 10-10',
  },
  estrella: {
    main: 'M50 8c2 23 19 40 42 42-23 2-40 19-42 42-2-23-19-40-42-42 23-2 40-19 42-42z',
    fine: 'M50 30v40M30 50h40',
  },
}

export function Woodcut({ name, className = '' }: { name: ObjectName; className?: string }) {
  const o = OBJECTS[name]
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={o.main} strokeWidth="5.5" />
        <path d={o.fine} strokeWidth="2.6" />
      </g>
    </svg>
  )
}

/** Ink frame around a panel: heavy rule with little scratches along the top, like a printed border. */
export function Scratches({ className = '', seed = 9 }: { className?: string; seed?: number }) {
  const marks = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: 70 }, () => ({ x: r() * 1000, h: 3 + r() * 13, w: 1 + r() * 2.4 }))
  }, [seed])
  return (
    <svg viewBox="0 0 1000 18" preserveAspectRatio="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round">
        {marks.map((m, i) => (
          <path key={i} d={`M${f(m.x)} 18V${f(18 - m.h)}`} strokeWidth={m.w} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  )
}

export function HexMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path d="M20 3 35 11.5v17L20 37 5 28.5v-17Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  )
}

/** Brand seal: the Hyvento hexagon cut out of a rough-edged stamp, with carved rays. */
export function Seal({ className = '' }: { className?: string }) {
  const edge = useMemo(() => {
    const r = rng(77)
    const pts = Array.from({ length: 44 }, (_, k) => {
      const a = (k / 44) * Math.PI * 2
      const rr = 47 + (r() - 0.5) * 2.6
      return `${f(50 + Math.cos(a) * rr)} ${f(50 + Math.sin(a) * rr)}`
    })
    return 'M' + pts.join('L') + 'Z'
  }, [])
  const rays = Array.from({ length: 18 }, (_, k) => {
    const a = ((k * 20 + 10) * Math.PI) / 180
    return `M${f(50 + Math.cos(a) * 33)} ${f(50 + Math.sin(a) * 33)}L${f(50 + Math.cos(a) * 41)} ${f(50 + Math.sin(a) * 41)}`
  }).join('')
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d={edge} fill="currentColor" />
      <g stroke="var(--color-coal)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={rays} strokeWidth="2.4" />
        <path d="M50 24 72.5 37v26L50 76 27.5 63V37Z" strokeWidth="7.5" />
      </g>
    </svg>
  )
}
