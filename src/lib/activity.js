const STORAGE_PREFIX = 'vorix-wallet-activity:';
const ACTIVITY_EVENT = 'vorix-wallet-activity-changed';
const MAX_ENTRIES = 12;

function storageKey(address) {
    return `${STORAGE_PREFIX}${String(address || '').toLowerCase()}`;
}

export function readWalletActivity(address) {
    if (!address || typeof window === 'undefined') {
        return [];
    }

    try {
        const value = JSON.parse(window.localStorage.getItem(storageKey(address)) || '[]');
        return Array.isArray(value) ? value.slice(0, MAX_ENTRIES) : [];
    } catch {
        return [];
    }
}

export function addWalletActivity(address, entry) {
    if (!address || typeof window === 'undefined') {
        return;
    }

    const entries = [
        {
            id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...entry,
        },
        ...readWalletActivity(address),
    ].slice(0, MAX_ENTRIES);

    window.localStorage.setItem(storageKey(address), JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT, { detail: { address } }));
}

export { ACTIVITY_EVENT };
