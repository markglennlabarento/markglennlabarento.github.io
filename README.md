# Portfolio

## Gemini Q&A

The chat UI calls a Cloudflare Worker, which proxies requests to the Gemini API. The Gemini key stays in the Worker and is never included in the static site.

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Install dependencies with `npm install`, then authenticate Wrangler with `npx wrangler login`.
3. Set the key as a Worker secret: `npx wrangler secret put GEMINI_API_KEY --config worker/wrangler.toml`.
4. Update `ALLOWED_ORIGIN` in `worker/wrangler.toml` to the exact origin serving this portfolio.
5. Deploy the API with `npm run worker:deploy`.
6. Set `VITE_CHAT_API_URL` in `.env.production` to the Worker URL shown by Wrangler, followed by `/api/chat`, then deploy the portfolio with `npm run deploy`.

For local development, create `worker/.dev.vars` with `GEMINI_API_KEY=your-key`, then run `npm run worker:dev` and `npm run dev` in separate terminals. The Vite dev server proxies `/api` requests to the Worker.

The Worker currently answers from the portfolio details visible in `worker/index.js`. Keep that context up to date as you add project and skills information. It limits each IP to about 10 requests per minute; Cloudflare's rate limiting is approximate. Gemini free-tier limits and data-use terms may change, and free-tier data may be used to improve Google's products; review Google's current terms before using it with visitors.
