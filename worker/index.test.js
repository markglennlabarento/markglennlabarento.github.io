import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import worker from './index.js'

const originalFetch = globalThis.fetch
const origin = 'https://markglennlabarento.github.io'
const env = {
  ALLOWED_ORIGIN: origin,
  GEMINI_API_KEY: 'test-key',
  CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('Gemini Worker', () => {
  it('rejects disallowed origins', async () => {
    const response = await worker.fetch(new Request('https://worker.example/api/chat', {
      method: 'POST',
      headers: { Origin: 'https://other.example' },
      body: JSON.stringify({ messages: [{ role: 'user', text: 'Hello' }] }),
    }), env)

    assert.equal(response.status, 403)
  })

  it('validates message input before calling Gemini', async () => {
    globalThis.fetch = () => assert.fail('Gemini should not be called for invalid input')
    const response = await worker.fetch(new Request('https://worker.example/api/chat', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'assistant', text: 'Not a question' }] }),
    }), env)

    assert.equal(response.status, 400)
  })

  it('returns Gemini text and allows the portfolio origin', async () => {
    globalThis.fetch = async (url, options) => {
      assert.match(url, /gemini-3\.1-flash-lite:generateContent$/)
      assert.equal(options.headers['x-goog-api-key'], env.GEMINI_API_KEY)
      const requestBody = JSON.parse(options.body)
      assert.match(requestBody.system_instruction.parts[0].text, /https:\/\/github\.com\/markglennlabarento/)
      assert.match(requestBody.system_instruction.parts[0].text, /React-JS-CRUD/)
      return Response.json({
        candidates: [{ content: { parts: [{ text: 'Hello from Gemini.' }] } }],
      })
    }

    const response = await worker.fetch(new Request('https://worker.example/api/chat', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', text: 'Hello' }] }),
    }), env)

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin)
    assert.deepEqual(await response.json(), { answer: 'Hello from Gemini.' })
  })
})
