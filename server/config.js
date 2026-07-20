import 'dotenv/config';

const NETWORK_DEFAULTS = Object.freeze({
    testnet: Object.freeze({
        chainId: '-3',
        toncenterApiBaseUrl: 'https://testnet.toncenter.com/api/v2',
    }),
    mainnet: Object.freeze({
        chainId: '-239',
        toncenterApiBaseUrl: 'https://toncenter.com/api/v2',
    }),
});

function readString(name, fallback = '') {
    const value = process.env[name];
    return value === undefined ? fallback : String(value).trim();
}

function readEnum(name, allowedValues, fallback) {
    const value = readString(name, fallback).toLowerCase();

    if (!allowedValues.includes(value)) {
        throw new Error(`${name} must be one of: ${allowedValues.join(', ')}.`);
    }

    return value;
}

function readInteger(name, fallback, { min, max }) {
    const rawValue = readString(name, String(fallback));
    const value = Number(rawValue);

    if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(`${name} must be an integer between ${min} and ${max}.`);
    }

    return value;
}

function readPositiveDecimal(name, fallback) {
    const value = readString(name, fallback);

    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,9})?$/.test(value) || Number(value) <= 0) {
        throw new Error(`${name} must be a positive TON amount with no more than 9 decimal places.`);
    }

    return value;
}

function parseHttpUrl(name, rawValue, { optional = false } = {}) {
    if (!rawValue && optional) {
        return '';
    }

    let parsed;
    try {
        parsed = new URL(rawValue);
    } catch {
        throw new Error(`${name} must be an absolute HTTP or HTTPS URL.`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`${name} must use HTTP or HTTPS.`);
    }

    return parsed.toString().replace(/\/$/, '');
}

function readHttpUrl(name, fallback = '', options = {}) {
    return parseHttpUrl(name, readString(name, fallback), options);
}

function readCorsOrigins() {
    const rawValue = readString('CORS_ORIGIN');
    if (!rawValue) {
        return [];
    }

    return rawValue
        .split(',')
        .map((origin) => parseHttpUrl('CORS_ORIGIN', origin.trim()))
        .map((origin) => new URL(origin).origin);
}

const nodeEnv = readEnum('NODE_ENV', ['development', 'test', 'production'], 'development');
const tonNetwork = readEnum('TON_NETWORK', Object.keys(NETWORK_DEFAULTS), 'testnet');
const networkDefaults = NETWORK_DEFAULTS[tonNetwork];
const appPublicUrl = readHttpUrl('APP_PUBLIC_URL', '', { optional: true });

if (nodeEnv === 'production' && !appPublicUrl) {
    throw new Error('APP_PUBLIC_URL is required when NODE_ENV=production.');
}

if (nodeEnv === 'production' && appPublicUrl) {
    const publicUrl = new URL(appPublicUrl);
    const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
    if (publicUrl.protocol !== 'https:' && !localHosts.has(publicUrl.hostname)) {
        throw new Error('APP_PUBLIC_URL must use HTTPS in production.');
    }
}

const config = Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === 'production',
    port: readInteger('BACKEND_PORT', 4174, { min: 1, max: 65535 }),
    host: readString('BACKEND_HOST', nodeEnv === 'production' ? '0.0.0.0' : '127.0.0.1'),
    trustProxyHops: readInteger('TRUST_PROXY_HOPS', 0, { min: 0, max: 10 }),
    tonNetwork,
    tonChainId: networkDefaults.chainId,
    toncenterApiBaseUrl: readHttpUrl(
        'TONCENTER_API_BASE_URL',
        networkDefaults.toncenterApiBaseUrl
    ),
    toncenterApiKey: readString('TONCENTER_API_KEY'),
    coingeckoApiBaseUrl: readHttpUrl('COINGECKO_API_BASE_URL', 'https://api.coingecko.com/api/v3'),
    appPublicUrl,
    corsOrigins: Object.freeze(readCorsOrigins()),
    upstreamTimeoutMs: readInteger('UPSTREAM_TIMEOUT_MS', 8_000, { min: 1_000, max: 30_000 }),
    apiRateLimitMax: readInteger('API_RATE_LIMIT_MAX', 240, { min: 20, max: 10_000 }),
    transferRateLimitMax: readInteger('TRANSFER_RATE_LIMIT_MAX', 30, { min: 1, max: 1_000 }),
    maxTransferTon: readPositiveDecimal('MAX_TRANSFER_TON', '100'),
});

export { NETWORK_DEFAULTS };
export default config;
