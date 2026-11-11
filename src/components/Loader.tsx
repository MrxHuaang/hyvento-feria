import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Drape, Seal, Sunburst } from './Art'
import { lockScroll, reducedMotion } from '../lib/scroll'

/**
 * Opening: the house curtain is shut, the seal turns while the count runs,
 * then the curtain parts onto the hero.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const finished = useRef(false)

  /** Ends the opening once, whichever path gets here first. */
  const finish = () => {
    if (finished.current) return
    finished.current = true
    lockScroll(false)
    onDone()
  }

  /** Fade the curtain out with plain CSS, so it works even when GSAP is not ticking. */
  const hide = () => {
    const el = root.current
    if (!el) return
    el.style.transition = 'opacity 0.45s ease'
    el.style.opacity = '0'
    el.style.pointerEvents = 'none'
    window.setTimeout(() => (el.style.display = 'none'), 480)
  }

  const skip = () => {
    finish()
    hide()
  }

  // Failsafe on a plain timer, outside GSAP: if a slow phone stalls the animation,
  // the page still opens and scrolls instead of staying behind the curtain.
  useEffect(() => {
    const id = window.setTimeout(() => {
      finish()
      // still on screen after the animation should have ended: take it down
      if (root.current && getComputedStyle(root.current).display !== 'none') hide()
    }, 5000)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useGSAP(
    () => {
      if (reducedMotion()) {
        gsap.set(root.current, { display: 'none' })
        finish()
        return
      }
      lockScroll(true)
      window.scrollTo(0, 0)
      const n = { v: 0 }
      gsap.set('.wedge', { scale: 0, transformOrigin: '0 0' })
      gsap.to('.ld-rays', { rotate: 90, duration: 6, ease: 'none' })
      gsap.to('.ld-sway', { skewX: 2.5, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.ld-seal', { scale: 0, rotate: -180, duration: 1.2, ease: 'back.out(1.5)' }, 0.1)
        .to('.wedge', { scale: 1, duration: 1.1, stagger: { each: 0.012, from: 'random' } }, 0.2)
        .from('.ld-count', { yPercent: 110, duration: 0.9 }, 0.3)
        .to(
          n,
          {
            v: 100,
            duration: 1.9,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (count.current) count.current.textContent = String(Math.round(n.v)).padStart(3, '0')
            },
          },
          0.2,
        )
        .to('.ld-seal', { rotate: 120, duration: 1.9, ease: 'power2.inOut' }, 0.4)
        .to('.ld-center', { scale: 0.6, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, 2.15)
        .add(finish, 2.5)
        .to('.ld-l', { xPercent: -104, duration: 1.5, ease: 'expo.inOut' }, 2.45)
        .to('.ld-r', { xPercent: 104, duration: 1.5, ease: 'expo.inOut' }, 2.45)
        .set(root.current, { display: 'none' })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="fixed inset-0 z-[80] overflow-hidden text-bone" onClick={skip}>
      {(['l', 'r'] as const).map((side) => (
        <div key={side} className={`ld-${side} absolute inset-y-0 w-[51%] overflow-hidden bg-coal ${side === 'l' ? 'left-0' : 'right-0'}`}>
          <Drape className="ld-sway absolute inset-0 h-full w-full origin-top opacity-45" seed={side === 'l' ? 14 : 27} />
        </div>
      ))}
      <div className="ld-center absolute inset-0 grid place-items-center">
        <div className="relative grid place-items-center">
          <div className="ld-rays absolute h-[min(92vmin,640px)] w-[min(92vmin,640px)] [mask-image:radial-gradient(closest-side,#000_45%,transparent_78%)]">
            <Sunburst className="h-full w-full" />
          </div>
          <div className="relative grid place-items-center rounded-full bg-coal p-7">
            <Seal className="ld-seal h-[min(30vmin,190px)] w-[min(30vmin,190px)]" />
          </div>
          <div className="absolute top-full mt-6 overflow-hidden">
            <span ref={count} className="ld-count deco block text-[clamp(2rem,5vmin,3.2rem)] tabular-nums">
              000
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
