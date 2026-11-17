import { useState } from 'react'
import { createUserMessage } from '../domain/chat.js'

export function useChat(chatService) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function sendQuestion() {
    if (sending) return

    let userMessage
    try {
      userMessage = createUserMessage(question)
    } catch (requestError) {
      setError(requestError.message)
      return
    }
    if (!userMessage) return

    const conversation = [...messages, userMessage]
    setMessages(conversation)
    setQuestion('')
    setError('')
    setSending(true)

    try {
      const answer = await chatService.ask(conversation)
      setMessages((current) => [...current, { role: 'assistant', text: answer }])
    } catch (requestError) {
      setMessages((current) => current.slice(0, -1))
      setQuestion(userMessage.text)
      setError(
        requestError instanceof TypeError
          ? 'We couldn’t connect to chat. Please check your internet connection and try again.'
          : requestError.message || 'Chat couldn’t answer just now. Please try again in a few minutes.',
      )
    } finally {
      setSending(false)
    }
  }

  return { messages, question, setQuestion, error, sending, sendQuestion }
}
