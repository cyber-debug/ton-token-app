import { Address, toNano } from '@ton/core';

function hashString(value) {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }

    return hash;
}

function buildSeriesFromPrice(priceUsd) {
    const base = Number(priceUsd || 0);
    const now = Date.now();

    return Array.from({ length: 24 }, (_, index) => {
        const deviation = Math.sin(index / 2.4) * base * 0.018 + Math.cos(index / 4.8) * base * 0.012;
        return {
            timestamp: new Date(now - (23 - index) * 60 * 60 * 1000).toISOString(),
            priceUsd: Number((base + deviation).toFixed(4)),
        };
    });
}

export function buildOfflineMarket() {
    return {
        symbol: 'TON',
        priceUsd: 1.28,
        priceEur: 1.11,
        change24h: 1.84,
        marketCapUsd: 3_267_437_121.99,
        updatedAt: new Date().toISOString(),
    };
}

export function buildOfflineHistory(market = buildOfflineMarket()) {
    return buildSeriesFromPrice(market.priceUsd);
}

export function buildOfflineBalance(address = '') {
    const seed = hashString(String(address || 'VORIX'));
    const whole = 10 + (seed % 85);
    const fraction = String(seed % 1_000_000_000).padStart(9, '0');
    const balanceNano = `${whole}${fraction}`;

    return {
        address,
        balanceNano,
        balanceTon: Number(balanceNano) / 1_000_000_000,
        updatedAt: new Date().toISOString(),
    };
}

export function buildOfflineQuote({ side, amountTon, market = buildOfflineMarket() }) {
    const feeRate = side === 'buy' ? 0.0042 : 0.0032;
    const slippageRate = side === 'buy' ? 0.0085 : 0.0072;
    const grossUsd = amountTon * market.priceUsd;
    const feeUsd = grossUsd * feeRate;
    const slippageUsd = grossUsd * slippageRate;
    const totalUsd = side === 'buy' ? grossUsd + feeUsd + slippageUsd : grossUsd - feeUsd - slippageUsd;

    return {
        quoteId: `offline-${hashString(`${side}:${amountTon}:${market.priceUsd}`)}`,
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

export function buildOfflineTransferDraft({ recipient, amountTon, memo }) {
    const parsedAddress = Address.parse(recipient);
    return {
        draftId: `offline-${hashString(`${recipient}:${amountTon}:${memo}`)}`,
        recipient: parsedAddress.toString(),
        amountTon,
        amountNano: toNano(amountTon).toString(),
        memo: memo || null,
        createdAt: new Date().toISOString(),
    };
}

export function buildOfflineDashboard(walletAddress = '') {
    return {
        market: buildOfflineMarket(),
        activity: [
            {
                id: `offline-${hashString(walletAddress || 'wallet')}-quote`,
                type: 'quote',
                title: 'Offline quote preview',
                meta: 'Fallback data shown while the API is unavailable',
                value: 'Demo mode',
            },
            {
                id: `offline-${hashString(walletAddress || 'wallet')}-transfer`,
                type: 'transfer',
                title: 'Transfer flow ready',
                meta: 'Wallet signing still works without the backend',
                value: 'Ready',
            },
        ],
        health: null,
    };
}
