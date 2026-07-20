import { describe, expect, it, vi } from 'vitest';
import { TtlCache } from './cache.js';

describe('TtlCache', () => {
    it('evicts the oldest entry when its configured bound is reached', () => {
        const cache = new TtlCache({ ttlMs: 100, staleMs: 1_000, maxEntries: 2 });

        cache.set('first', 1);
        cache.set('second', 2);
        cache.set('third', 3);

        expect(cache.getStale('first')).toBeUndefined();
        expect(cache.getFresh('second')).toBe(2);
        expect(cache.getFresh('third')).toBe(3);
    });

    it('removes entries after the stale window expires', () => {
        vi.useFakeTimers();
        try {
            const cache = new TtlCache({ ttlMs: 100, staleMs: 200 });
            cache.set('market', { price: 1 });

            vi.advanceTimersByTime(201);

            expect(cache.getStale('market')).toBeUndefined();
            expect(cache.entries.size).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });
});
