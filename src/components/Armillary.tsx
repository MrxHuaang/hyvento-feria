import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { reducedMotion, touchDevice } from '../lib/scroll'

const CREAM = 0xf3ead8

/** Extruded Hyvento hexagon: a thick six-sided band with a hole. */
function hexBand(outer: number, inner: number, depth: number) {
  const pt = (r: number, k: number) => {
    const a = ((-90 + 60 * k) * Math.PI) / 180
    return new THREE.Vector2(r * Math.cos(a), r * Math.sin(a))
  }
  const shape = new THREE.Shape(Array.from({ length: 6 }, (_, k) => pt(outer, k)))
  shape.holes.push(new THREE.Path(Array.from({ length: 6 }, (_, k) => pt(inner, 5 - k))))
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
  geo.translate(0, 0, -depth / 2)
  return geo
}

/**
 * Armillary sphere around the Hyvento hexagon. Flat-shaded in cream so it reads
 * as a carved object rather than a glossy render. Tilts toward the pointer.
 */
export function Armillary({ className = '' }: { className?: string }) {
  const mount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mount.current!
    const still = reducedMotion()
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !touchDevice, alpha: true, powerPreference: touchDevice ? 'low-power' : 'default' })
    } catch {
      return // no WebGL: the engraved ring around it still reads fine
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touchDevice ? 1.5 : 2))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
    camera.position.z = 7.4

    // Hard two-tone light: lit faces cream, shadow faces warm brown. No gradients.
    scene.add(new THREE.AmbientLight(0x6b5a44, 1.1))
    const key = new THREE.DirectionalLight(0xffffff, 2.4)
    key.position.set(-3, 4, 5)
    scene.add(key)

    const rig = new THREE.Group()
    scene.add(rig)
    const mat = new THREE.MeshLambertMaterial({ color: CREAM, flatShading: true })

    const rings: THREE.Mesh[] = []
    const ringSpec: [number, number, number, number][] = [
      // radius, tube, tiltX, tiltZ
      [1.78, 0.045, 0, 0],
      [1.52, 0.03, 1.1, 0.3],
      [1.3, 0.03, -0.7, 1.2],
      [1.08, 0.024, 0.4, -0.9],
    ]
    for (const [r, tube, rx, rz] of ringSpec) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 96), mat)
      ring.rotation.set(rx, 0, rz)
      rings.push(ring)
      rig.add(ring)
    }

    // Tick marks on the outer ring, like a graduated instrument
    const tickGeo = new THREE.BoxGeometry(0.03, 0.16, 0.03)
    for (let k = 0; k < 48; k++) {
      const a = (k / 48) * Math.PI * 2
      const tick = new THREE.Mesh(tickGeo, mat)
      const r = k % 4 ? 1.9 : 1.94
      tick.scale.y = k % 4 ? 0.55 : 1
      tick.position.set(Math.cos(a) * r, Math.sin(a) * r, 0)
      tick.rotation.z = a + Math.PI / 2
      rings[0].add(tick)
    }

    // Little bodies riding the inner rings
    const bead = new THREE.IcosahedronGeometry(0.085, 0)
    rings.slice(1).forEach((ring, i) => {
      const b = new THREE.Mesh(bead, mat)
      const r = ringSpec[i + 1][0]
      b.position.set(r, 0, 0)
      ring.add(b)
    })

    const core = new THREE.Mesh(hexBand(0.72, 0.47, 0.34), mat)
    rig.add(core)

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let raf = 0
    let visible = false

    const resize = () => {
      const s = el.clientWidth
      renderer.setSize(s, s, false)
      if (still) frame(0)
    }

    const frame = (ms: number) => {
      const t = ms * 0.001
      pointer.x += (pointer.tx - pointer.x) * 0.05
      pointer.y += (pointer.ty - pointer.y) * 0.05
      rig.rotation.y = pointer.x * 0.7 + Math.sin(t * 0.25) * 0.25
      rig.rotation.x = pointer.y * 0.5 + 0.18
      rings[1].rotation.y = t * 0.5
      rings[2].rotation.x = -0.7 + t * 0.38
      rings[3].rotation.y = -t * 0.7
      rings[3].rotation.z = -0.9 + t * 0.2
      core.rotation.y = t * 0.6
      core.rotation.x = Math.sin(t * 0.5) * 0.3
      renderer.render(scene, camera)
    }
    const loop = (ms: number) => {
      frame(ms)
      if (visible) raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = entry.isIntersecting && !still
      if (visible && !was) raf = requestAnimationFrame(loop)
    })

    resize()
    io.observe(el)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose())
      mat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mount} className={`${className} [&>canvas]:h-full [&>canvas]:w-full`} aria-hidden="true" />
}
