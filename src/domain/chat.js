export function createUserMessage(question) {
  const text = question.trim()
  if (!text) return null
  if (text.length > 500) {
    throw new Error('Please keep your question under 500 characters and try again.')
  }
  return { role: 'user', text }
}
