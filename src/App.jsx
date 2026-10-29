import { useEffect, useState } from 'react'
import heroMark from './assets/hero.png'
import './App.css'

const sections = [
  { label: 'Me', icon: '☺', color: 'teal' },
  { label: 'Projects', icon: '▣', color: 'green' },
  { label: 'Skills', icon: '▤', color: 'purple' },
  { label: 'Fun', icon: '✳', color: 'pink' },
  { label: 'Contact', icon: '↗', color: 'orange' },
]

function App() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <main className="portfolio">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Portfolio home">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>Mark Glenn Labarento</span>
        </a>
        <button
          className="theme-toggle"
          type="button"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
        </button>
      </header>

      <section className="hero-section" id="home">
        <div className="glow glow-one" aria-hidden="true" />
        <div className="glow glow-two" aria-hidden="true" />
        <img className="hero-mark" src={heroMark} alt="" />

        <div className="hero-content">
          <p className="greeting">Hey, I'm Mark Glenn <span aria-hidden="true">👋</span></p>
          <h1>Software Engineer</h1>
          <p className="hero-description">
            A growing collection of projects, experiments, and things made for
            the web.
          </p>

          <div className="prompt-box">
            <span>Ask me anything...</span>
            <span className="prompt-arrow" aria-hidden="true">→</span>
          </div>

          <ul className="section-nav" aria-label="Portfolio sections">
            {sections.map(({ label, icon, color }) => (
              <li className="nav-card" key={label}>
                <span className={`nav-icon ${color}`} aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="background-word" aria-hidden="true">PORTFOLIO</p>
      </section>
    </main>
  )
}

export default App
