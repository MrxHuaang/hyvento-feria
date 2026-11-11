import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Loader } from './components/Loader'
import { InkDefs } from './components/Art'
import { Hero, Nav } from './components/Hero'
import { Studio } from './components/Studio'
import { Curtain, Footer, ScrollBar } from './components/Sections'
import { initialState } from './lib/config'

export default function App() {
  const [ready, setReady] = useState(false)
  const [state, setState] = useState(initialState)

  useEffect(() => {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <Loader onDone={() => setReady(true)} />
      <InkDefs />
      <div className="grain" />
      <Nav />
      <ScrollBar />
      <main>
        <Hero ready={ready} />
        <Studio state={state} setState={setState} />
      </main>
      <Footer />
      <Curtain target="#estudio" />
    </>
  )
}
