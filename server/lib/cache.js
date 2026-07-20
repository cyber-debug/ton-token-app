export class TtlCache {
    constructor({ ttlMs, staleMs = ttlMs * 10, maxEntries = 500 }) {
        this.ttlMs = ttlMs;
        this.staleMs = staleMs;
        this.maxEntries = maxEntries;
        this.entries = new Map();
    }

    getFresh(key) {
        const entry = this.entries.get(key);
        return entry && Date.now() - entry.savedAt < this.ttlMs ? entry.value : undefined;
    }

    getStale(key) {
        const entry = this.entries.get(key);
        if (!entry) {
            return undefined;
        }

        if (Date.now() - entry.savedAt >= this.staleMs) {
            this.entries.delete(key);
            return undefined;
        }

        return entry.value;
    }

    set(key, value) {
        this.entries.delete(key);

        if (this.entries.size >= this.maxEntries) {
            const now = Date.now();
            for (const [entryKey, entry] of this.entries) {
                if (now - entry.savedAt >= this.staleMs) {
                    this.entries.delete(entryKey);
                }
            }
        }

        while (this.entries.size >= this.maxEntries) {
            const oldestKey = this.entries.keys().next().value;
            this.entries.delete(oldestKey);
        }

        this.entries.set(key, { value, savedAt: Date.now() });
        return value;
    }
}
