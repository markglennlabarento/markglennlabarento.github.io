import assert from 'node:assert/strict'
import { it } from 'node:test'
import { ChatService } from './ChatService.js'

it('calls fetch with the global receiver and returns the answer', async () => {
  let receiver
  let request
  const service = new ChatService({
    endpoint: '/api/chat',
    fetcher: function (url, options) {
      receiver = this
      request = { url, options }
      return Promise.resolve(Response.json({ answer: 'Hello!' }))
    },
  })

  const answer = await service.ask([{ role: 'user', text: 'Hi' }])

  assert.equal(receiver, globalThis)
  assert.equal(request.url, '/api/chat')
  assert.deepEqual(JSON.parse(request.options.body), {
    messages: [{ role: 'user', text: 'Hi' }],
  })
  assert.equal(answer, 'Hello!')
})
