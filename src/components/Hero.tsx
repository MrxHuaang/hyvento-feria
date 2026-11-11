import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowDown } from '@phosphor-icons/react'
import { ArchFrame, Drape, Ground, Seal, Sunburst, Woodcut, ink, inkStill, type ObjectName } from './Art'
import { Armillary } from './Armillary'
import { goTo, leaveEditor, reducedMotion } from '../lib/scroll'

export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-[76px] items-center justify-between px-5 lg:px-9">
      <a href="#top" onClick={(e) => (e.preventDefault(), leaveEditor('#top'))} className="group pointer-events-auto flex items-center gap-3" aria-label="Hyvento, inicio">
        <Seal className="h-12 w-12 text-bone transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[60deg]" />
        <span className="deco hidden text-[1.55rem] text-bone sm:block [-webkit-text-stroke:5px_var(--color-coal)] [paint-order:stroke_fill]">Hyvento</span>
      </a>
      <a href="#estudio" onClick={(e) => (e.preventDefault(), goTo('#estudio'))} className="btn pointer-events-auto !bg-coal !px-4 !py-2.5">
        Arma tu página
      </a>
    </header>
  )
}

// Carved objects floating around the arch: [name, left %, top %, size vmin, depth]
const FLOATERS: [ObjectName, number, number, number, number][] = [
  ['taza', 13, 20, 17, 1],
  ['tijeras', 77, 15, 16, 0.7],
  ['bolsa', 6, 55, 15, 0.5],
  ['campana', 80, 54, 19, 1.1],
  ['sol', 27, 5, 10, 0.4],
  ['llave', 68, 78, 12, 0.8],
  ['muela', 21, 78, 11, 0.6],
  ['estrella', 92, 36, 6, 0.3],
  ['estrella', 3, 36, 5, 0.3],
  ['estrella', 34, 46, 3.5, 0.9],
  ['estrella', 64, 40, 3, 0.9],
]

const MANIFESTO = 'Una cotización en PDF no te dice cómo va a quedar. Aquí armas tu página primero. Si te gusta, hablamos de precio.'

const letters = (text: string) =>
  text.split('').map((c, i) => (
    <span key={i} className="ch inline-block">
      {c === ' ' ? ' ' : c}
    </span>
  ))

const KINDS = ['restaurante', 'cafetería', 'tienda', 'barbería', 'consultorio', 'gimnasio', 'pastelería']

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const art = useRef<HTMLDivElement>(null)
  const [kind, setKind] = useState(0)

  // The art is drawn in a fixed 600x760 box and scaled to the viewport
  useEffect(() => {
    const fit = () => {
      const k = Math.min((window.innerHeight * 0.88) / 760, (window.innerWidth * 0.9) / 600)
      art.current?.style.setProperty('--k', String(k))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setKind((k) => (k + 1) % KINDS.length), 2400)
    return () => window.clearInterval(id)
  }, [])

  // Intro: curtains part, the sky is carved, the frame is drawn, type rises
  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.set('.line-mask > span', { yPercent: 115 })
      gsap.set('.draw', { strokeDashoffset: 1 })
      gsap.set('.wedge', { scale: 0, transformOrigin: '0 0' })
      gsap.set('.gouge', { scaleX: 0, transformOrigin: 'left center' })
      gsap.set('.hero-fade, .floater, .orb', { autoAlpha: 0 })
      gsap.set('.drape-l', { xPercent: 90 })
      gsap.set('.drape-r', { xPercent: -90 })
      if (!ready) return
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .to('.drape-l, .drape-r', { xPercent: 0, duration: 2.2, ease: 'expo.inOut' }, 0)
        .to('.wedge', { scale: 1, duration: 1.4, stagger: { each: 0.012, from: 'random' } }, 0.5)
        .to('.draw', { strokeDashoffset: 0, duration: 1.8, stagger: 0.12, ease: 'power2.inOut' }, 0.6)
        .to('.gouge', { scaleX: 1, duration: 0.9, stagger: { each: 0.008, from: 'random' } }, 1)
        .to('.orb', { autoAlpha: 1, duration: 1.2 }, 1.2)
        .to('.line-mask > span', { yPercent: 0, duration: 1.3, stagger: 0.14 }, 1.1)
        .fromTo('.floater', { autoAlpha: 0, scale: 0.4, rotate: -25 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(1.6)', stagger: 0.08 }, 1.4)
        .to('.hero-fade', { autoAlpha: 1, duration: 1, stagger: 0.1 }, 1.9)
    },
    { scope: root, dependencies: [ready] },
  )

  // Idle loop (the hero sits on screen at the stand) + pointer parallax + scroll hand-off
  useGSAP(
    () => {
      if (reducedMotion()) return
      const idle: gsap.core.Animation[] = [
        gsap.to('.rays', { rotate: 360, duration: 150, ease: 'none', repeat: -1 }),
        gsap.to('.rays-pulse', { scale: 1.06, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
        // Every few seconds a ripple runs through the headline and the sky, so the stand screen never sits still
        gsap
          .timeline({ repeat: -1, repeatDelay: 5, delay: 6 })
          .to('.ch', { yPercent: -9, duration: 0.45, ease: 'sine.out', stagger: { each: 0.035, yoyo: true, repeat: 1 } }, 0)
          .to('.wedge', { scale: 1.1, duration: 0.5, ease: 'sine.out', stagger: { each: 0.008, yoyo: true, repeat: 1 } }, 0.1)
          .to('.floater-in', { scale: 1.12, duration: 0.4, ease: 'back.out(3)', stagger: { each: 0.06, yoyo: true, repeat: 1 } }, 0.3),
      ]
      gsap.utils.toArray<HTMLElement>('.floater-in').forEach((el, i) => {
        idle.push(gsap.to(el, { y: i % 2 ? 16 : -18, rotate: i % 2 ? 7 : -6, duration: 3.2 + (i % 4) * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }))
      })
      idle.push(gsap.to('.drape-sway', { skewX: 3, scaleX: 1.06, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }))
      // Stop the loops once the visitor is in the editor; nothing here is on screen then
      ScrollTrigger.create({ trigger: document.querySelector('#estudio'), start: 'top 15%', end: 'max', onToggle: (self) => idle.forEach((t) => (self.isActive ? t.pause() : t.resume())) })

      const movers = gsap.utils.toArray<HTMLElement>('[data-depth]').map((el) => ({
        d: Number(el.dataset.depth),
        x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' }),
      }))
      const move = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        for (const m of movers) {
          m.x(-nx * 60 * m.d)
          m.y(-ny * 40 * m.d)
        }
      }
      window.addEventListener('pointermove', move, { passive: true })

      // Scroll: one continuous scene. We walk into the arch, the statement is spelled out over
      // the dimmed sky, and the stage curtain (see Curtain) closes as the editor arrives.
      gsap.set('.manifesto', { autoAlpha: 0 })
      gsap.set('.word', { opacity: 0.12 })
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=230%', pin: true, scrub: 0.6 } })
        .to('.zoom', { scale: 2.7, ease: 'power2.inOut', duration: 0.42 }, 0)
        .to('.h-top', { yPercent: -180, ease: 'power1.in', duration: 0.22 }, 0)
        .to('.h-bot', { yPercent: 180, ease: 'power1.in', duration: 0.22 }, 0)
        .to('.hero-ui', { autoAlpha: 0, duration: 0.1 }, 0)
        .to('.floaters', { scale: 1.7, autoAlpha: 0, ease: 'power1.in', duration: 0.28 }, 0)
        .to('.drape-out-l', { xPercent: -100, duration: 0.25 }, 0)
        .to('.drape-out-r', { xPercent: 100, duration: 0.25 }, 0)
        .to('.stage', { autoAlpha: 0.2, duration: 0.2 }, 0.26)
        .to('.manifesto', { autoAlpha: 1, duration: 0.1 }, 0.28)
        .to('.word', { opacity: 1, ease: 'none', duration: 0.05, stagger: { amount: 0.48 } }, 0.32)
        .to('.zoom', { rotate: 8, ease: 'none', duration: 0.58 }, 0.42)
        .to({}, { duration: 0.08 }, 0.92)

      return () => window.removeEventListener('pointermove', move)
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" className="relative h-[100dvh] min-h-[560px] overflow-hidden">
      {/* Curtains */}
      <div className="drape-l pointer-events-none absolute inset-y-0 left-0 w-[17vw] text-bone/45 [mask-image:linear-gradient(to_right,#000_20%,transparent)]">
        <div className="drape-out-l absolute inset-0">
          <Drape className="drape-sway absolute inset-0 h-full w-full origin-top" seed={3} />
        </div>
      </div>
      <div className="drape-r pointer-events-none absolute inset-y-0 right-0 w-[17vw] text-bone/45 [mask-image:linear-gradient(to_left,#000_20%,transparent)]">
        <div className="drape-out-r absolute inset-0">
          <Drape className="drape-sway absolute inset-0 h-full w-full origin-top" seed={8} />
        </div>
      </div>

      {/* Arch + sky + 3D instrument. Drawn at 2x and scaled down so the scroll zoom stays sharp. */}
      <div className="stage pointer-events-none absolute inset-0">
        <div className="zoom absolute inset-0 origin-[50%_41%]" data-depth="0.25">
          <div ref={art} className="absolute top-1/2 left-1/2 h-[1520px] w-[1200px] text-bone [transform:translate(-50%,-50%)_scale(calc(var(--k,1)/2))]">
            <div className="absolute inset-0 [clip-path:url(#arch-clip)]">
              <div className="rays-pulse absolute top-[39.47%] left-1/2 aspect-square w-[173.3%] -translate-x-1/2 -translate-y-1/2">
                <Sunburst className="rays h-full w-full" />
              </div>
              <Ground className="absolute inset-0 h-full w-full" />
            </div>
            <ArchFrame className="absolute inset-0 h-full w-full" />
            <div className="orb absolute top-[18.4%] left-[23.3%] aspect-square w-[53.4%]">
              <Armillary className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating carved objects */}
      <div className="floaters pointer-events-none absolute inset-0 hidden text-bone sm:block">
        {FLOATERS.map(([name, x, y, size, depth], i) => (
          <div key={i} className="floater absolute" data-depth={depth} style={{ left: `${x}%`, top: `${y}%`, width: `${size}vmin` }}>
            <div className="floater-in" style={i < 4 ? ink : inkStill}>
              <Woodcut name={name} className="w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Headline, split above and below the medallion */}
      <h1 className="deco pointer-events-none absolute inset-0 text-center text-[clamp(2.1rem,8.3vw,10rem)] text-bone [-webkit-text-stroke:0.11em_var(--color-coal)] [paint-order:stroke_fill]">
        <span className="h-top line-mask absolute inset-x-0 top-[11dvh]">
          <span>{letters('Míralo antes')}</span>
        </span>
        <span className="h-bot line-mask absolute inset-x-0 bottom-[12dvh]">
          <span>{letters('de pagarlo')}</span>
        </span>
      </h1>

      {/* Statement, spelled out over the dimmed sky while pinned */}
      <p className="manifesto deco pointer-events-none absolute motion-reduce:hidden inset-0 m-auto flex h-fit max-w-[20ch] flex-wrap justify-center gap-x-[0.28em] px-5 text-center text-[clamp(1.6rem,4.2vw,4.6rem)] leading-[1.08] normal-case">
        {MANIFESTO.split(' ').map((w, i) => (
          <span key={i} className="word">
            {w}
          </span>
        ))}
      </p>

      {/* Corners */}
      <div className="hero-ui absolute inset-x-5 bottom-6 flex items-end justify-between gap-6 lg:inset-x-10 lg:bottom-8">
        <p className="hero-fade max-w-[30ch] text-[15px] leading-snug text-bone lg:text-[17px]">
          La página de tu{' '}
          <span key={kind} className="deco inline-block text-[1.25em] [animation:rise_0.6s_var(--ease-out-expo)]">
            {KINDS[kind]}
          </span>
          <br />
          armada en vivo, con tu logo y tus colores.
        </p>
        <a href="#estudio" onClick={(e) => (e.preventDefault(), goTo('#estudio'))} className="btn btn-solid hero-fade shrink-0">
          Armar mi página
          <ArrowDown size={16} weight="bold" />
        </a>
      </div>
    </section>
  )
}

