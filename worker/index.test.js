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

  it('returns a friendly message when chat is not configured', async () => {
    const response = await worker.fetch(new Request('https://worker.example/api/chat', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', text: 'Hello' }] }),
    }), { ...env, GEMINI_API_KEY: undefined })

    assert.equal(response.status, 503)
    assert.match((await response.json()).error, /try again in a few minutes/i)
  })

  it('returns a friendly message when chat is busy', async () => {
    const response = await worker.fetch(new Request('https://worker.example/api/chat', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', text: 'Hello' }] }),
    }), {
      ...env,
      CHAT_RATE_LIMITER: { limit: async () => ({ success: false }) },
    })

    assert.equal(response.status, 429)
    assert.match((await response.json()).error, /wait a minute/i)
  })

  it('returns Gemini text and allows the portfolio origin', async () => {
    globalThis.fetch = async (url, options) => {
      assert.match(url, /gemini-3\.1-flash-lite:generateContent$/)
      assert.equal(options.headers['x-goog-api-key'], env.GEMINI_API_KEY)
      const requestBody = JSON.parse(options.body)
      assert.match(requestBody.system_instruction.parts[0].text, /You are a general-purpose AI assistant/)
      assert.match(requestBody.system_instruction.parts[0].text, /do not limit answers to the portfolio/)
      assert.match(requestBody.system_instruction.parts[0].text, /Do not say information is missing from the portfolio for unrelated questions/)
      assert.match(requestBody.system_instruction.parts[0].text, /If a message is unclear, misspelled, or appears to be a random word/)
      assert.match(requestBody.system_instruction.parts[0].text, /Only use the portfolio facts below when the visitor is specifically asking about Mark/)
      assert.match(requestBody.system_instruction.parts[0].text, /https:\/\/github\.com\/markglennlabarento/)
      assert.match(requestBody.system_instruction.parts[0].text, /Favorite Projects: pulse/)
      assert.match(requestBody.system_instruction.parts[0].text, /Instagram: labarentomarkglenn/)
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
