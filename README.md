# Portfolio

## Gemini Q&A

The chat UI lets visitors ask general questions or ask about the portfolio. A Cloudflare Worker proxies requests to the Gemini API, keeping the Gemini key out of the static site. For questions about Mark, Gemini is instructed to rely only on the portfolio context.

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Install dependencies with `npm install`, then authenticate Wrangler with `npx wrangler login`.
3. Set the key as a Worker secret: `npx wrangler secret put GEMINI_API_KEY --config worker/wrangler.toml`.
4. Update `ALLOWED_ORIGIN` in `worker/wrangler.toml` to the exact origin serving this portfolio.
5. Deploy the API with `npm run worker:deploy`.
6. Copy `.env.example` to `.env.production`, set `VITE_GEMINI_API_URL` to the Worker URL shown by Wrangler followed by `/api/chat`, then deploy the portfolio with `npm run deploy`.

For local development, run `npm run dev`. The Vite dev server proxies chat requests to the deployed Worker, so no local API key or Worker process is needed. Local questions use the same Gemini service and rate limit as the live site. To run the Worker locally instead, create `worker/.dev.vars` with `GEMINI_API_KEY=your-key`, then run `npm run worker:dev` and `npm run dev` in separate terminals.

The Worker answers from the portfolio and public GitHub profile/repository snapshot in `worker/index.js`. Update that context as profile or project details change. It limits each IP to about 10 requests per minute; Cloudflare's rate limiting is approximate. Gemini free-tier limits and data-use terms may change, and free-tier data may be used to improve Google's products; review Google's current terms before using it with visitors.
