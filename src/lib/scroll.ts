import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Phones and tablets: native touch scrolling, lighter effects. */
export const touchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches

// iOS shows and hides its address bar while scrolling; refreshing every time makes pinned sections jump
ScrollTrigger.config({ ignoreMobileResize: true })

// Smooth scroll is created once at import time so every component can rely on it.
// Touch screens keep native scrolling: on iOS a smoothing layer fights the finger.
export const lenis: Lenis | null = reducedMotion() || touchDevice ? null : new Lenis({ lerp: 0.09, autoRaf: false })

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update)
  // A throw inside a ticker listener would freeze every animation on the page, so keep it contained
  gsap.ticker.add((t) => {
    try {
      lenis.raf(t * 1000)
    } catch (err) {
      console.error(err)
    }
  })
  gsap.ticker.lagSmoothing(0)
  document.documentElement.classList.add('has-lenis')
}

export const lockScroll = (lock: boolean) => {
  document.body.style.overflow = lock ? 'hidden' : ''
  if (lenis) {
    if (lock) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

export function goTo(target: string) {
  const el = document.querySelector<HTMLElement>(target)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.6 })
  else el.scrollIntoView()
}

let snapOffUntil = 0

/**
 * Editor lock. Once the editor has landed the page stops scrolling, so a wheel flick over
 * the stage can never drag the visitor out of it. Only an explicit exit releases it.
 */
export function holdPage(el: HTMLElement) {
  if (!lenis) return () => {}
  const l = lenis
  const onScroll = () => {
    if (document.documentElement.classList.contains('editor-locked')) return
    if (performance.now() < snapOffUntil) return
    if (Math.abs(el.getBoundingClientRect().top) < 1.5) {
      document.documentElement.classList.add('editor-locked')
      lockScroll(true)
    }
  }
  l.on('scroll', onScroll)
  return () => l.off('scroll', onScroll)
}

/** Release the editor lock and travel somewhere else on the page. */
export function leaveEditor(target: string) {
  snapOffUntil = performance.now() + 2600
  document.documentElement.classList.remove('editor-locked')
  lockScroll(false)
  goTo(target)
}

/**
 * Magnet: when scrolling comes to rest with the element's top close to the top of the
 * viewport (but not on it), glide the last stretch so the section lands exactly in place.
 */
export function snapWhenNear(el: HTMLElement, range = 0.45) {
  if (!lenis) return () => {}
  const l = lenis
  let timer = 0
  const check = () => {
    if (performance.now() < snapOffUntil) return
    const top = el.getBoundingClientRect().top
    if (Math.abs(top) > 2 && Math.abs(top) < window.innerHeight * range) l.scrollTo(el, { duration: 0.9 })
  }
  const onScroll = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(check, 140)
  }
  l.on('scroll', onScroll)
  return () => {
    l.off('scroll', onScroll)
    window.clearTimeout(timer)
  }
}
