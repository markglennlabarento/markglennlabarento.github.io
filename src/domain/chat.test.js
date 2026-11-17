import assert from 'node:assert/strict'
import { it } from 'node:test'
import { createUserMessage } from './chat.js'

it('trims a question and creates a user message', () => {
  assert.deepEqual(createUserMessage('  Hello  '), { role: 'user', text: 'Hello' })
})

it('ignores a blank question', () => {
  assert.equal(createUserMessage('   '), null)
})

it('rejects a question over the supported limit', () => {
  assert.throws(
    () => createUserMessage('x'.repeat(501)),
    /under 500 characters/,
  )
})
