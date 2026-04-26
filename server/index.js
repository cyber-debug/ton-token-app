require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Address, toNano } = require('@ton/core');

const PORT = Number(process.env.BACKEND_PORT || 3001);
const HOST = process.env.BACKEND_HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
const API_PREFIX = '/api';
const MARKET_TTL_MS = 30_000;
const HISTORY_TTL_MS = 60_000;
const BALANCE_TTL_MS = 15_000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 240;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
    cors({
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
            : false,
    })
);

const requestBuckets = new Map();

function rateLimit(limit = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS) {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress || 'anonymous';
        const now = Date.now();
        const bucket = requestBuckets.get(key) || { count: 0, expiresAt: now + windowMs };

        if (bucket.expiresAt <= now) {
            bucket.count = 0;
            bucket.expiresAt = now + windowMs;
        }

        bucket.count += 1;
        requestBuckets.set(key, bucket);

        if (bucket.count > limit) {
            res.setHeader('Retry-After', Math.ceil((bucket.expiresAt - now) / 1000));
            return res.status(429).json({
                ok: false,
                error: 'Too many requests. Please try again later.',
            });
        }

        return next();
    };
}

const marketCache = {
    data: null,
    fetchedAt: 0,
};

const historyCache = new Map();

const balanceCache = new Map();
const activityLog = [];

function getRequestOrigin(req) {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');

    return process.env.APP_PUBLIC_URL || `${proto}://${host}`;
}

function cacheEntryIsFresh(entry, ttlMs) {
    return entry && Date.now() - entry.fetchedAt < ttlMs;
}

function pushActivity(entry) {
    activityLog.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...entry,
    });

    if (activityLog.length > 8) {
        activityLog.length = 8;
    }
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}

async function getTonMarket() {
    if (cacheEntryIsFresh(marketCache, MARKET_TTL_MS)) {
        return marketCache.data;
    }

    const data = await fetchJson(
        'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd,eur&include_24hr_change=true&include_market_cap=true'
    );

    const snapshot = data['the-open-network'];
    const market = {
        symbol: 'TON',
        priceUsd: snapshot.usd,
        priceEur: snapshot.eur,
        change24h: snapshot.usd_24h_change,
        marketCapUsd: snapshot.usd_market_cap,
        updatedAt: new Date().toISOString(),
    };

    marketCache.data = market;
    marketCache.fetchedAt = Date.now();

    return market;
}

function buildFallbackSeries(priceUsd) {
    const base = Number(priceUsd || 0);
    const now = Date.now();

    return Array.from({ length: 24 }, (_, index) => {
        const deviation = Math.sin(index / 2.8) * base * 0.02 + Math.cos(index / 5) * base * 0.01;
        return {
            timestamp: new Date(now - (23 - index) * 60 * 60 * 1000).toISOString(),
            priceUsd: Number((base + deviation).toFixed(4)),
        };
    });
}

async function getTonHistory(days = 1) {
    const key = String(days);
    const cached = historyCache.get(key);
    if (cacheEntryIsFresh(cached, HISTORY_TTL_MS)) {
        return cached.data;
    }

    try {
        const data = await fetchJson(
            `https://api.coingecko.com/api/v3/coins/the-open-network/market_chart?vs_currency=usd&days=${encodeURIComponent(
                days
            )}&interval=hourly`
        );

        const series = Array.isArray(data?.prices)
            ? data.prices.map(([timestamp, priceUsd]) => ({
                  timestamp: new Date(timestamp).toISOString(),
                  priceUsd: Number(Number(priceUsd).toFixed(4)),
              }))
            : [];

        const payload = series.length ? series : buildFallbackSeries((await getTonMarket()).priceUsd);
        historyCache.set(key, { data: payload, fetchedAt: Date.now() });
        return payload;
    } catch (error) {
        const fallback = buildFallbackSeries((await getTonMarket()).priceUsd);
        historyCache.set(key, { data: fallback, fetchedAt: Date.now() });
        return fallback;
    }
}

async function getWalletBalance(address) {
    if (!address) {
        throw new Error('Address is required.');
    }

    const cached = balanceCache.get(address);
    if (cacheEntryIsFresh(cached, BALANCE_TTL_MS)) {
        return cached.data;
    }

    const apiKey = process.env.TONCENTER_API_KEY ? `&api_key=${encodeURIComponent(process.env.TONCENTER_API_KEY)}` : '';
    const data = await fetchJson(
        `https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(address)}${apiKey}`
    );

    const balance = {
        address,
        balanceNano: data.result,
        balanceTon: Number(data.result) / 1_000_000_000,
        updatedAt: new Date().toISOString(),
    };

    balanceCache.set(address, {
        data: balance,
        fetchedAt: Date.now(),
    });

    return balance;
}

function buildQuote({ side, amountTon, market }) {
    const feeRate = side === 'buy' ? 0.0042 : 0.0032;
    const slippageRate = side === 'buy' ? 0.0085 : 0.0072;
    const grossUsd = amountTon * market.priceUsd;
    const feeUsd = grossUsd * feeRate;
    const slippageUsd = grossUsd * slippageRate;
    const totalUsd = side === 'buy' ? grossUsd + feeUsd + slippageUsd : grossUsd - feeUsd - slippageUsd;

    return {
        quoteId: crypto.randomUUID(),
        side,
        amountTon,
        marketPriceUsd: market.priceUsd,
        grossUsd: Number(grossUsd.toFixed(2)),
        feeUsd: Number(feeUsd.toFixed(2)),
        slippageUsd: Number(slippageUsd.toFixed(2)),
        totalUsd: Number(totalUsd.toFixed(2)),
        totalTon: Number(amountTon.toFixed(6)),
        estimatedRate: Number((totalUsd / amountTon).toFixed(4)),
        createdAt: new Date().toISOString(),
    };
}

function recordQuoteActivity(quote) {
    pushActivity({
        type: 'quote',
        title: `${quote.side === 'buy' ? 'Buy' : 'Sell'} quote updated`,
        meta: `${quote.amountTon} TON at ${quote.marketPriceUsd.toFixed(2)} USD`,
        value: `${quote.totalUsd.toFixed(2)} USD`,
    });
}

function normalizeAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number.');
    }
    return amount;
}

function normalizeSide(value) {
    const side = String(value || '').toLowerCase();
    if (side !== 'buy' && side !== 'sell') {
        throw new Error('Side must be buy or sell.');
    }
    return side;
}

app.get(`${API_PREFIX}/health`, (req, res) => {
    res.json({
        ok: true,
        service: 'vorix-wallet-api',
        environment: process.env.NODE_ENV || 'development',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

app.get(`${API_PREFIX}/tonconnect-manifest`, (req, res) => {
    const origin = getRequestOrigin(req);

    res.json({
        url: origin,
        name: 'VORIX Wallet',
        iconUrl: `${origin}/logo.svg`,
    });
});

app.get(`${API_PREFIX}/market/ton`, rateLimit(180), async (req, res, next) => {
    try {
        const market = await getTonMarket();
        res.json({ ok: true, market });
    } catch (error) {
        next(error);
    }
});

app.get(`${API_PREFIX}/market/ton/history`, rateLimit(120), async (req, res, next) => {
    try {
        const days = Math.max(1, Math.min(30, Number(req.query.days || 1)));
        const series = await getTonHistory(days);
        res.json({ ok: true, series });
    } catch (error) {
        next(error);
    }
});

app.get(`${API_PREFIX}/quotes/preview`, rateLimit(), async (req, res, next) => {
    try {
        const side = normalizeSide(req.query.side);
        const amountTon = normalizeAmount(req.query.amount);
        const market = await getTonMarket();
        const quote = buildQuote({ side, amountTon, market });

        recordQuoteActivity(quote);

        res.json({ ok: true, quote, market });
    } catch (error) {
        next(error);
    }
});

app.post(`${API_PREFIX}/transfer/prepare`, rateLimit(120), async (req, res, next) => {
    try {
        const recipient = String(req.body?.recipient || '').trim();
        const amountTon = normalizeAmount(req.body?.amount);
        const memo = String(req.body?.memo || '').trim();

        if (!recipient) {
            throw new Error('Recipient address is required.');
        }

        const parsedAddress = Address.parse(recipient);
        const amountNano = toNano(amountTon).toString();
        const draftId = crypto.randomUUID();

        const transferDraft = {
            draftId,
            recipient: parsedAddress.toString(),
            amountTon,
            amountNano,
            memo: memo || null,
            createdAt: new Date().toISOString(),
        };

        pushActivity({
            type: 'transfer',
            title: 'Transfer draft prepared',
            meta: `${amountTon} TON to ${parsedAddress.toString({ bounceable: false })}`,
            value: 'Awaiting wallet signature',
        });

        res.json({ ok: true, transferDraft });
    } catch (error) {
        next(error);
    }
});

app.get(`${API_PREFIX}/balance/:address`, rateLimit(), async (req, res, next) => {
    try {
        const balance = await getWalletBalance(req.params.address);
        res.json({ ok: true, balance });
    } catch (error) {
        next(error);
    }
});

app.get(`${API_PREFIX}/activity`, rateLimit(), async (req, res) => {
    res.json({
        ok: true,
        activity: activityLog,
    });
});

app.get(`${API_PREFIX}/dashboard`, rateLimit(), async (req, res, next) => {
    try {
        const market = await getTonMarket();
        res.json({
            ok: true,
            market,
            activity: activityLog,
            health: {
                service: 'vorix-wallet-api',
                uptimeSeconds: Math.round(process.uptime()),
            },
        });
    } catch (error) {
        next(error);
    }
});

app.use((req, res, next) => {
    if (req.path.startsWith(API_PREFIX)) {
        return res.status(404).json({ ok: false, error: 'Not found' });
    }

    return next();
});

app.use((error, req, res, next) => {
    const status = error.status || 500;

    res.status(status).json({
        ok: false,
        error: status === 500 ? 'Internal server error' : error.message,
    });
});

const buildPath = path.join(__dirname, '..', 'build');

if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath, { maxAge: '7d', immutable: true }));

    app.get('*', (req, res, next) => {
        if (req.path.startsWith(API_PREFIX)) {
            return next();
        }

        return res.sendFile(path.join(buildPath, 'index.html'));
    });
}

if (require.main === module) {
    app.listen(PORT, HOST, () => {
        console.log(`VORIX API listening on http://${HOST}:${PORT}`);
    });
}

module.exports = app;
