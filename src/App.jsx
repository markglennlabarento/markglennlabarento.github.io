import { useEffect, useRef, useState } from 'react'
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
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const dialogRef = useRef(null)
  const messagesRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, sending])

  useEffect(() => {
    if (chatOpen) {
      dialogRef.current?.showModal()
    } else if (dialogRef.current?.open) {
      dialogRef.current.close()
    }
  }, [chatOpen])

  async function sendQuestion(event) {
    event.preventDefault()
    const text = question.trim()
    if (!text || sending) return

    const conversation = [...messages, { role: 'user', text }]
    setMessages(conversation)
    setQuestion('')
    setError('')
    setSending(true)

    try {
      const response = await fetch(import.meta.env.VITE_CHAT_API_URL || '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation.slice(-8) }),
      })
      let data
      try {
        data = await response.json()
      } catch {
        throw new Error('The chat service returned an invalid response.')
      }
      if (!response.ok) throw new Error(data?.error || 'The chat service is unavailable.')
      if (typeof data?.answer !== 'string') throw new Error('The chat service returned an invalid response.')
      setMessages((current) => [...current, { role: 'assistant', text: data.answer }])
    } catch (requestError) {
      setMessages((current) => current.slice(0, -1))
      setQuestion(text)
      setError(requestError.message || 'Could not reach the chat service. Please try again.')
    } finally {
      setSending(false)
    }
  }

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

          <button className="prompt-box" type="button" onClick={() => setChatOpen(true)}>
            <span>Ask me anything...</span>
            <span className="prompt-arrow" aria-hidden="true">→</span>
          </button>

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

      <dialog
        className="chat-dialog"
        ref={dialogRef}
        aria-labelledby="chat-title"
        onClose={() => setChatOpen(false)}
      >
        <div className="chat-header">
          <div>
            <h2 id="chat-title">Ask about Mark</h2>
            <p>AI answers based on the information on this portfolio.</p>
          </div>
          <button className="chat-close" type="button" aria-label="Close chat" onClick={() => setChatOpen(false)}>
            ×
          </button>
        </div>
        <div className="chat-messages" ref={messagesRef} aria-live="polite" aria-busy={sending}>
          <p className="chat-welcome">Hi! Ask me about Mark's work or skills. I’ll let you know if something isn’t covered here.</p>
          {messages.map((message, index) => (
            <p className={`chat-message ${message.role}`} key={`${index}-${message.role}`}>
              {message.text}
            </p>
          ))}
          {sending && <p className="chat-status">Thinking…</p>}
          {error && <p className="chat-error" role="alert">{error}</p>}
        </div>
        <form className="chat-form" onSubmit={sendQuestion}>
          <label className="visually-hidden" htmlFor="chat-question">Your question</label>
          <input
            id="chat-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={500}
            placeholder="Ask a question..."
            autoComplete="off"
            disabled={sending}
          />
          <button type="submit" disabled={sending || !question.trim()}>Send</button>
        </form>
        <p className="chat-disclaimer">Powered by Google Gemini. Don’t share sensitive information.</p>
      </dialog>
    </main>
  )
}

export default App
