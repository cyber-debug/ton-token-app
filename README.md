# VORIX Wallet

VORIX Wallet is a production-oriented TON dashboard with a React frontend and an Express backend. It combines wallet state, live market data, quote previews, and secure transfer preparation in one polished interface.

## What’s Included

- Refreshed premium UI with a darker, more editorial visual system
- TON Connect integration with a backend-generated manifest
- Live TON balance lookup through a server API
- Market pricing and quote previews powered by backend endpoints
- Secure transfer preparation that validates recipient and amount server-side
- Backend-powered live market chart for TON / USD context
- Route animation and responsive layouts for desktop and mobile
- Basic API protections, input validation, and rate limiting

## Stack

- React 18
- React Router
- Framer Motion
- Express
- Helmet, CORS, compression, morgan
- TON Connect UI
- TON core utilities

## Development

Install dependencies:

```bash
npm install
```

Start both the API and the frontend for development:

```bash
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:3001`

## Scripts

- `npm start` - run frontend and backend together
- `npm run client` - run only the React app
- `npm run server` - run only the Express server
- `npm run launch` - build the frontend and start the production server
- `npm run build` - build the frontend for production
- `npm test` - run the frontend test suite

## Environment

Copy `.env.example` to `.env` for local development. The local `.env` file is ignored by Git and must never be committed.

The application defaults to TON testnet and live API mode. Use the following environment variables when needed:

- `BACKEND_PORT` - backend port, default `3001`
- `BACKEND_HOST` - backend host, default `127.0.0.1`
- `TRUST_PROXY_HOPS` - trusted reverse-proxy hops, default `0`
- `TON_NETWORK` - backend TON network, `testnet` or `mainnet`, default `testnet`
- `TONCENTER_API_BASE_URL` - optional TON Center API override
- `COINGECKO_API_BASE_URL` - optional CoinGecko API override
- `VITE_API_BASE_URL` - optional backend URL override for the frontend
- `VITE_TON_NETWORK` - frontend TON network, `testnet` or `mainnet`, default `testnet`
- `VITE_DEMO_MODE` - enables clearly labeled local demo data; default `false`
- `VITE_ROUTER_MODE` - `auto`, `browser`, or `hash`
- `VITE_TONCONNECT_MANIFEST_URL` - optional manifest override
- `APP_PUBLIC_URL` - optional absolute public URL used by the backend manifest route
- `CORS_ORIGIN` - optional comma-separated list of allowed origins
- `TONCENTER_API_KEY` - optional TON Center API key for balance lookups

Example:

```bash
VITE_API_BASE_URL=http://127.0.0.1:3001 npm start
```

Demo mode is intentionally separate from live mode. It may provide simulated balances, market data, and quote previews, but wallet transfers remain disabled. API failures in live mode are surfaced as errors instead of silently switching to demo data.

## Backend Endpoints

- `GET /api/health` - health and uptime
- `GET /api/tonconnect-manifest` - dynamic TonConnect manifest
- `GET /api/market/ton` - live TON market snapshot
- `GET /api/market/ton/history?days=1` - chart series for the market view
- `GET /api/quotes/preview?side=buy&amount=10` - quote preview
- `POST /api/transfer/prepare` - server-side transfer validation and draft creation
- `GET /api/balance/:address` - balance lookup
- `GET /api/activity` - recent backend activity
- `GET /api/dashboard` - combined dashboard data for the UI

## Security Notes

- The frontend no longer stores or expects a mnemonic for transfers.
- Recipient addresses and amounts are validated on the server before a transfer draft is produced.
- API routes are rate limited and protected with standard security headers.
- The backend manifest route is generated from the request origin, which makes deployment easier and reduces config drift.

## Project Layout

- `src/pages` - routed screens
- `src/components` - reusable UI pieces
- `src/lib` - shared frontend helpers
- `server` - Express backend
- `public` - static assets

## Production

For production, build the frontend and serve it from the backend:

```bash
npm run build
npm run server
```

If you deploy the frontend and backend separately, point `VITE_API_BASE_URL` at the backend origin.

## GitHub Pages

The repository includes a manual GitHub Actions workflow in `.github/workflows/deploy-pages.yml`. It does not run on pushes, preventing accidental deployment while the beta is under development.

- The Pages build uses hash routing so refreshes and deep links keep working.
- The Pages workflow explicitly enables demo mode because it publishes only the static frontend.
- Demo mode is labeled in the UI and disables wallet transfers.
- TonConnect manifest metadata is set up for the GitHub Pages site URL in the static manifest file.
