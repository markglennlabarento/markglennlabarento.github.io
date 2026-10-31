const portfolioContext = `
Name: Mark Glenn Labarento
Role: Software Engineer
Portfolio description: A growing collection of projects, experiments, and things made for the web.
GitHub profile: https://github.com/markglennlabarento
Public location listed on GitHub: Philippines
Public GitHub repository snapshot (checked 2026-10-31):
Favorite Projects: pulse.
Skills: C++, JavaScript, React, HTML, CSS, Git, GitHub.
Currently Learning: Python.
Contact:
- Twitter: MarkLabarento
- LinkedIn: Mark Glenn Labarento
- Facebook: deadly.glenn
- Instagram: labarentomarkglenn
- Dribbble: markglennlabarento
- Discord: Obito Uchiha#8112
Treat this as a snapshot of public repository names and GitHub language labels, not proof of authorship, project details, or skill level. Do not invent details beyond this context.
`

const allowedLocalOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

function jsonResponse(body, status, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  }
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
    headers.Vary = 'Origin'
  }
  return new Response(body === null ? null : JSON.stringify(body), { status, headers })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')

    if (url.pathname !== '/api/chat') {
      return jsonResponse({ error: 'Chat is unavailable here.' }, 404)
    }

    const originAllowed = !origin
      || origin === env.ALLOWED_ORIGIN
      || allowedLocalOrigins.has(origin)
    if (!originAllowed) {
      return jsonResponse({ error: 'Chat is unavailable on this page.' }, 403)
    }

    if (request.method === 'OPTIONS') {
      return jsonResponse(null, 204, origin)
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Please try sending your question again.' }, 405, origin)
    }
    const { success } = await env.CHAT_RATE_LIMITER.limit({
      key: request.headers.get('CF-Connecting-IP') || 'unknown',
    })
    if (!success) {
      return jsonResponse({ error: 'You’ve sent several questions in a short time. Please wait a minute, then try again.' }, 429, origin)
    }
    if (Number(request.headers.get('Content-Length')) > 8000) {
      return jsonResponse({ error: 'That message is a little too long. Please shorten it and try again.' }, 413, origin)
    }
    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: 'Chat is taking a short break. Please try again in a few minutes.' }, 503, origin)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'We couldn’t read that question. Please try sending it again.' }, 400, origin)
    }

    if (
      !Array.isArray(body?.messages)
      || body.messages.length < 1
      || body.messages.length > 8
      || !body.messages.every((message) => (
        ['user', 'assistant'].includes(message?.role)
        && typeof message.text === 'string'
        && message.text.trim().length > 0
        && message.text.length <= 500
      ))
      || body.messages.at(-1)?.role !== 'user'
    ) {
      return jsonResponse({ error: 'Please keep your question under 500 characters and try again.' }, 400, origin)
    }

    let upstream
    try {
      upstream = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{
                text: `Answer visitor questions using only these portfolio facts. If a detail is missing, say it is not included in the portfolio. Do not invent personal details or projects.\n${portfolioContext}`,
              }],
            },
            contents: body.messages.map(({ role, text }) => ({
              role: role === 'assistant' ? 'model' : 'user',
              parts: [{ text }],
            })),
            generationConfig: { maxOutputTokens: 250 },
          }),
        },
      )
    } catch {
      return jsonResponse({ error: 'Chat couldn’t answer just now. Please try again in a few minutes.' }, 502, origin)
    }

    let result
    try {
      result = await upstream.json()
    } catch {
      return jsonResponse({ error: 'Chat couldn’t answer just now. Please try again in a few minutes.' }, 502, origin)
    }

    if (!upstream.ok) {
      console.error('Gemini API request failed', {
        status: upstream.status,
        providerStatus: result.error?.status,
        message: result.error?.message,
      })
      if (upstream.status === 429) {
        return jsonResponse({ error: 'Chat is busy right now. Please wait a minute and try again.' }, 429, origin)
      }
      return jsonResponse({ error: 'Chat couldn’t answer just now. Please try again in a few minutes.' }, 502, origin)
    }

    const answer = result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim()
    if (!answer) {
      return jsonResponse({ error: 'Chat couldn’t answer just now. Please try again in a few minutes.' }, 502, origin)
    }
    return jsonResponse({ answer }, 200, origin)
  },
}
