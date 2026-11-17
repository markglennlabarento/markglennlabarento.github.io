import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChatService } from './infrastructure/ChatService.js'
import { ThemeService } from './infrastructure/ThemeService.js'
import './index.css'
import App from './App.jsx'

const chatService = new ChatService({
  endpoint: import.meta.env.VITE_GEMINI_API_URL || '/api/chat',
})
const themeService = new ThemeService()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App chatService={chatService} themeService={themeService} />
  </StrictMode>,
)
