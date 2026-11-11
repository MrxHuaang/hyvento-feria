import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight } from '@phosphor-icons/react'
import { Drape, Woodcut, ink } from './Art'
import { goTo, lenis, reducedMotion } from '../lib/scroll'

/* ------------------------------------------------------------ Scrollbar */

/** Custom scrollbar: a thin rail with a carved hexagon that rides it. Draggable. */
export function ScrollBar() {
  const rail = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lenis) return
    const l = lenis
    const paint = () => {
      const p = l.limit > 0 ? l.scroll / l.limit : 0
      const h = rail.current?.clientHeight ?? 0
      if (thumb.current) thumb.current.style.transform = `translate3d(-50%, ${p * h}px, 0) translateY(-50%) rotate(${p * 720}deg)`
      if (fill.current) fill.current.style.transform = `scaleY(${p})`
    }
    paint()
    l.on('scroll', paint)
    window.addEventListener('resize', paint)
    return () => {
      l.off('scroll', paint)
      window.removeEventListener('resize', paint)
    }
  }, [])

  if (!lenis) return null

  const seek = (clientY: number) => {
    const box = rail.current!.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (clientY - box.top) / box.height))
    lenis!.scrollTo(p * lenis!.limit, { immediate: true })
  }

  return (
    <div
      className="fixed top-[84px] right-[7px] bottom-5 z-50 hidden w-5 cursor-pointer touch-none justify-center mix-blend-difference sm:flex"
      onPointerDown={(e) => (e.currentTarget.setPointerCapture(e.pointerId), seek(e.clientY))}
      onPointerMove={(e) => e.buttons === 1 && seek(e.clientY)}
      aria-hidden="true"
    >
      <div ref={rail} className="relative h-full w-px bg-white/25">
        <div ref={fill} className="absolute inset-0 origin-top scale-y-0 bg-white" />
        <div ref={thumb} className="absolute top-0 left-1/2 h-4 w-4 text-white">
          <svg viewBox="0 0 40 40" className="h-full w-full">
            <path d="M20 3 35 11.5v17L20 37 5 28.5v-17Z" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- Curtain */

/**
 * Stage curtain that joins the hero to the editor: it draws shut while the editor
 * slides in underneath, then parts once the editor has landed.
 */
export function Curtain({ target }: { target: string }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      // One scrubbed pass: shut while the editor rises to mid-screen, hold a beat, part as it lands.
      // The magnet in the editor takes over from 45%, so the visitor always ends on the open stage.
      gsap
        .timeline({ scrollTrigger: { trigger: document.querySelector(target), start: 'top bottom', end: 'top top', scrub: 0.5 } })
        .fromTo('.cur-l', { xPercent: -108 }, { xPercent: 0, ease: 'power2.inOut', duration: 0.5 }, 0)
        .fromTo('.cur-r', { xPercent: 108 }, { xPercent: 0, ease: 'power2.inOut', duration: 0.5 }, 0)
        .to('.cur-l', { xPercent: -108, ease: 'power2.inOut', duration: 0.38 }, 0.62)
        .to('.cur-r', { xPercent: 108, ease: 'power2.inOut', duration: 0.38 }, 0.62)
      gsap.to('.cur-sway', { skewX: 2.5, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {(['l', 'r'] as const).map((side) => (
        <div key={side} className={`cur-${side} absolute inset-y-0 w-[51%] overflow-hidden ${side === 'l' ? 'left-0' : 'right-0'}`}>
          <div className={`cur-in-${side} absolute inset-0 bg-coal text-bone`}>
            <Drape className="cur-sway absolute inset-0 h-full w-full origin-top" seed={side === 'l' ? 14 : 27} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- Footer */

const WORK = [
  ['Zephr', 'https://adscrapper.hyvento.co'],
  ['Lumbre', 'https://lumbre.hyvento.co'],
  ['Noir', 'https://noir-poker.vercel.app'],
  ['Marrow', 'https://playmarrow.vercel.app'],
]

export function Footer() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('.wordmark span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.wordmark', start: 'top 95%' } })
      gsap.from('.foot-in', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: root.current, start: 'top 75%' } })
      gsap.to('.foot-key', { rotate: 14, y: -14, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="relative overflow-hidden border-t border-line px-5 pt-[12dvh] lg:px-10">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[18vw] text-bone/25 [mask-image:linear-gradient(to_left,#000,transparent)]">
        <Drape className="absolute inset-0 h-full w-full" seed={21} />
      </div>

      <div className="relative grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_0.8fr]">
        <div className="foot-in">
          <p className="deco max-w-[14ch] text-[clamp(2rem,3.6vw,3.4rem)] normal-case">Tu negocio ya tiene página. Falta que la veas.</p>
          <button type="button" className="btn btn-solid mt-8" onClick={() => goTo('#estudio')}>
            Armar mi página
          </button>
        </div>
        <div className="foot-in text-[15px] leading-relaxed">
          <p className="mb-3 text-mute">Grupo 18</p>
          <p>Julián Hinestroza Duarte</p>
          <p>Juan José Pantoja</p>
          <p>Lizet Mariana Colorado Esguerra</p>
          <p className="mt-5 text-mute">Décima Cuarta Feria de Emprendimiento</p>
          <p className="text-mute">Visión de las Américas, 2026</p>
        </div>
        <div className="foot-in text-[15px]">
          <p className="mb-3 text-mute">Hecho por nosotros, en línea hoy</p>
          <ul>
            {WORK.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noreferrer" className="group flex items-center justify-between border-b border-line py-2.5 transition-[padding] duration-500 ease-[var(--ease-out-expo)] hover:pl-3">
                  <span className="deco text-[1.5rem] normal-case">{name}</span>
                  <ArrowUpRight size={18} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="foot-in hidden justify-end lg:flex">
          <div className="foot-key w-[9vw] text-bone" style={ink}>
            <Woodcut name="llave" className="w-full" />
          </div>
        </div>
      </div>

      <p className="wordmark deco relative mt-[9dvh] flex justify-between overflow-hidden text-[15.4vw] leading-[0.82] select-none" aria-label="Hyvento">
        {'HYVENTO'.split('').map((l, i) => (
          <span key={i} className="inline-block" aria-hidden="true">
            {l}
          </span>
        ))}
      </p>
    </footer>
  )
}
