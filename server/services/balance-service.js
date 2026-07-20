import { Address } from '@ton/core';
import { TtlCache } from '../lib/cache.js';
import { upstreamError, validationError } from '../lib/errors.js';
import { fetchJson } from '../lib/fetch-json.js';

export class BalanceService {
    constructor(config, requestJson = fetchJson) {
        this.config = config;
        this.requestJson = requestJson;
        this.cache = new TtlCache({ ttlMs: 15_000, staleMs: 60_000 });
    }

    normalizeAddress(value) {
        try {
            return Address.parse(String(value || '').trim());
        } catch {
            throw validationError('A valid TON wallet address is required.', 'INVALID_ADDRESS');
        }
    }

    async getBalance(addressValue) {
        const address = this.normalizeAddress(addressValue);
        const rawAddress = address.toRawString();
        const cached = this.cache.getFresh(rawAddress);
        if (cached) {
            return cached;
        }

        const headers = this.config.toncenterApiKey
            ? { 'X-API-Key': this.config.toncenterApiKey }
            : undefined;

        try {
            const data = await this.requestJson(
                `${this.config.toncenterApiBaseUrl}/getAddressBalance?address=${encodeURIComponent(rawAddress)}`,
                { headers, timeoutMs: this.config.upstreamTimeoutMs }
            );
            const balanceNano = String(data?.result ?? '');

            if (data?.ok !== true || !/^\d+$/.test(balanceNano)) {
                throw upstreamError('TON Center returned an invalid balance response.');
            }

            return this.cache.set(rawAddress, {
                address: rawAddress,
                balanceNano,
                network: this.config.tonChainId,
                source: 'TON Center',
                isStale: false,
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            const stale = this.cache.getStale(rawAddress);
            if (stale) {
                return { ...stale, isStale: true };
            }
            throw error;
        }
    }
}
