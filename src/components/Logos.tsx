import type { ReactNode } from 'react'

/**
 * Example logos drawn for the demo. They are marks, not interface icons: badges,
 * wreaths and a monogram that picks up the first letter of the business name.
 * All of them paint with currentColor so they follow the brand colour.
 */

export interface LogoProps {
  size?: number
  className?: string
  /** first letter of the business, used by the monogram */
  letter?: string
}

export type LogoMark = (props: LogoProps) => ReactNode

function Svg({ size = 24, className = '', children }: LogoProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  )
}

/** Ember badge: a flame with a hollow heart inside a ring. */
const Brasa: LogoMark = (p) => (
  <Svg {...p}>
    <circle cx="24" cy="24" r="21" />
    <path
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M24.5 9c1.6 6.2 8.5 8.6 8.5 17a9 9 0 0 1-18 0c0-4.4 2.2-6.6 3.3-9.8 1 3 2.6 4.4 4.3 4.6C22.4 16.600 21.800 13 24.5 9zM24 25c1.500 2.600 3.800 3.600 3.800 6.800a3.800 3.800 0 0 1-7.600 0c0-2.600 2.200-3.800 3.800-6.800z"
    />
  </Svg>
)

/** Laurel wreath around a four-point star. */
const Laurel: LogoMark = (p) => {
  const side = (
    <>
      <path d="M22 42C12 39 7 31 8 19" />
      {[
        [9.500, 16, -20],
        [9, 23.500, -5],
        [11, 30.500, 18],
        [15.500, 36.500, 42],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2.6" ry="5" transform={`rotate(${r} ${x} ${y})`} fill="currentColor" stroke="none" />
      ))}
    </>
  )
  return (
    <Svg {...p}>
      {side}
      <g transform="translate(48 0) scale(-1 1)">{side}</g>
      <path fill="currentColor" stroke="none" d="M24 12c.9 6 3.100 8.200 9 9-5.900.800-8.100 3-9 9-.9-6-3.100-8.200-9-9 5.900-.800 8.100-3 9-9z" />
    </Svg>
  )
}

/** Crown with three jewels on a plinth. */
const Corona: LogoMark = (p) => (
  <Svg {...p}>
    <path fill="currentColor" stroke="none" d="M9 33 6.500 17l9 7.500L24 11.500l8.500 13 9-7.500L39 33z" />
    <path d="M9 39h30" strokeWidth="3.4" />
    <g fill="currentColor" stroke="none">
      <circle cx="6.500" cy="14" r="2.600" />
      <circle cx="24" cy="8" r="2.600" />
      <circle cx="41.500" cy="14" r="2.600" />
    </g>
  </Svg>
)

/** Sun coming up over three lines of water. */
const Amanecer: LogoMark = (p) => (
  <Svg {...p}>
    <path fill="currentColor" stroke="none" d="M11 30a13 13 0 0 1 26 0z" />
    <path d="M24 5v6M9.500 11.500l4 4.500M38.500 11.500l-4 4.500M3.500 24h5M39.500 24h5" />
    <path d="M4 35h40M10 40h28M17 45h14" />
  </Svg>
)

/** Cut gem, all facets shown. */
const Gema: LogoMark = (p) => (
  <Svg {...p}>
    <path d="M14 7h20l10 12.500L24 43 4 19.500z" />
    <path d="M4 19.500h40M14 7l5 12.500L24 7l5 12.500L34 7M19 19.500 24 43l5-23.500" strokeWidth="1.800" />
  </Svg>
)

/** Doorway with a star above the threshold. */
const Portal: LogoMark = (p) => (
  <Svg {...p}>
    <path d="M11 42V21a13 13 0 0 1 26 0v21" />
    <path d="M17 42V22a7 7 0 0 1 14 0v20" strokeWidth="1.800" />
    <path d="M5 42h38" strokeWidth="3.400" />
    <path fill="currentColor" stroke="none" d="M24 3.500c.5 3 1.500 4 4.500 4.500-3 .5-4 1.500-4.500 4.500-.5-3-1.500-4-4.500-4.500 3-.5 4-1.500 4.500-4.500z" />
  </Svg>
)

/** Peaks and a moon inside a seal. */
const Cumbre: LogoMark = (p) => (
  <Svg {...p}>
    <circle cx="24" cy="24" r="21" />
    <path fill="currentColor" stroke="none" d="M6.500 35 17.500 18l6 8.500 4.500-6L41.500 35a21 21 0 0 1-35 0z" />
    <circle cx="33" cy="13.500" r="3.400" fill="currentColor" stroke="none" />
  </Svg>
)

/** Monogram: the business initial inside a double hexagon. */
const Monograma: LogoMark = ({ letter = 'H', ...p }) => (
  <Svg {...p}>
    <path d="M24 3 42 13.500v21L24 45 6 34.500v-21z" />
    <path d="M24 8.500 37.500 16.200v15.600L24 39.500 10.500 31.800V16.200z" strokeWidth="1.200" />
    <text x="24" y="31.500" textAnchor="middle" fontSize="21" fontWeight="700" fill="currentColor" stroke="none" style={{ fontFamily: 'var(--s-head, inherit)' }}>
      {letter.toUpperCase()}
    </text>
  </Svg>
)

export const LOGOS: LogoMark[] = [Brasa, Laurel, Corona, Amanecer, Gema, Portal, Cumbre, Monograma]
