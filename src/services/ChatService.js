const errorMessages = {
  400: 'Please keep your question under 500 characters and try again.',
  413: 'That message is a little too long. Please shorten it and try again.',
  429: 'Chat is busy right now. Please wait a minute and try again.',
  503: 'Chat is taking a short break. Please try again in a few minutes.',
}

const genericErrorMessage = 'Chat couldn’t answer just now. Please try again in a few minutes.'

export class ChatService {
  #endpoint
  #fetch

  constructor({ endpoint, fetcher = globalThis.fetch }) {
    this.#endpoint = endpoint
    this.#fetch = fetcher
  }

  async ask(messages) {
    const response = await this.#fetch.call(globalThis, this.#endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.slice(-8) }),
    })

    let data
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok) {
      throw new Error(errorMessages[response.status] || genericErrorMessage)
    }
    if (typeof data?.answer !== 'string' || !data.answer.trim()) {
      throw new Error(genericErrorMessage)
    }

    return data.answer
  }
}
