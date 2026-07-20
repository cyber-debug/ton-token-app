import { TtlCache } from '../lib/cache.js';
import { upstreamError } from '../lib/errors.js';
import { fetchJson } from '../lib/fetch-json.js';

const MARKET_KEY = 'ton';

function requireFiniteNumber(value, field) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        throw upstreamError(`Market data did not include a valid ${field}.`);
    }
    return parsed;
}

export class MarketService {
    constructor(config, requestJson = fetchJson) {
        this.config = config;
        this.requestJson = requestJson;
        this.marketCache = new TtlCache({ ttlMs: 30_000, staleMs: 10 * 60_000 });
        this.historyCache = new TtlCache({ ttlMs: 60_000, staleMs: 10 * 60_000 });
    }

    async getMarket() {
        const fresh = this.marketCache.getFresh(MARKET_KEY);
        if (fresh) {
            return fresh;
        }

        try {
            const data = await this.requestJson(
                `${this.config.coingeckoApiBaseUrl}/simple/price?ids=the-open-network&vs_currencies=usd,eur&include_24hr_change=true&include_market_cap=true`,
                { timeoutMs: this.config.upstreamTimeoutMs }
            );
            const snapshot = data?.['the-open-network'];

            if (!snapshot) {
                throw upstreamError('Market data response was empty.');
            }

            return this.marketCache.set(MARKET_KEY, {
                symbol: 'TON',
                priceUsd: requireFiniteNumber(snapshot.usd, 'USD price'),
                priceEur: requireFiniteNumber(snapshot.eur, 'EUR price'),
                change24h: requireFiniteNumber(snapshot.usd_24h_change, '24 hour change'),
                marketCapUsd: requireFiniteNumber(snapshot.usd_market_cap, 'market cap'),
                source: 'CoinGecko',
                isStale: false,
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            const stale = this.marketCache.getStale(MARKET_KEY);
            if (stale) {
                return { ...stale, isStale: true };
            }
            throw error;
        }
    }

    async getHistory(days) {
        const key = String(days);
        const fresh = this.historyCache.getFresh(key);
        if (fresh) {
            return fresh;
        }

        try {
            const data = await this.requestJson(
                `${this.config.coingeckoApiBaseUrl}/coins/the-open-network/market_chart?vs_currency=usd&days=${encodeURIComponent(days)}`,
                { timeoutMs: this.config.upstreamTimeoutMs }
            );
            const series = Array.isArray(data?.prices)
                ? data.prices
                    .map(([timestamp, priceUsd]) => ({
                        timestamp: new Date(timestamp).toISOString(),
                        priceUsd: Number(Number(priceUsd).toFixed(6)),
                    }))
                    .filter((point) => Number.isFinite(point.priceUsd))
                : [];

            if (!series.length) {
                throw upstreamError('Market history response was empty.');
            }

            return this.historyCache.set(key, {
                series,
                source: 'CoinGecko',
                isStale: false,
            });
        } catch (error) {
            const stale = this.historyCache.getStale(key);
            if (stale) {
                return { ...stale, isStale: true };
            }
            throw error;
        }
    }
}
