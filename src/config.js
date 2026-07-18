const NETWORKS = Object.freeze({
    testnet: Object.freeze({ chainId: '-3', label: 'Testnet' }),
    mainnet: Object.freeze({ chainId: '-239', label: 'Mainnet' }),
});

function readString(name, fallback = '') {
    const value = process.env[name];
    return value === undefined ? fallback : String(value).trim();
}

function readBoolean(name, fallback) {
    const value = readString(name, String(fallback)).toLowerCase();

    if (value !== 'true' && value !== 'false') {
        throw new Error(`${name} must be true or false.`);
    }

    return value === 'true';
}

function readEnum(name, allowedValues, fallback) {
    const value = readString(name, fallback).toLowerCase();

    if (!allowedValues.includes(value)) {
        throw new Error(`${name} must be one of: ${allowedValues.join(', ')}.`);
    }

    return value;
}

function readUrlOrPath(name, fallback = '', { optional = false } = {}) {
    const value = readString(name, fallback).replace(/\/$/, '');

    if (!value && optional) {
        return '';
    }

    if (value.startsWith('/')) {
        return value;
    }

    try {
        const parsed = new URL(value);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new Error();
        }
    } catch {
        throw new Error(`${name} must be an absolute HTTP/HTTPS URL or a root-relative path.`);
    }

    return value;
}

const STATIC_HOST_SUFFIXES = Object.freeze(['github.io', 'pages.dev']);

function isStaticHostingHost() {
    if (typeof window === 'undefined') {
        return false;
    }

    const host = window.location.hostname;

    // Match the exact apex host (e.g. "github.io") or a genuine subdomain
    // (e.g. "user.github.io"). A plain substring/suffix check would wrongly
    // accept attacker-controlled hosts such as "evilgithub.io".
    return STATIC_HOST_SUFFIXES.some(
        (suffix) => host === suffix || host.endsWith(`.${suffix}`)
    );
}

const networkName = readEnum('REACT_APP_TON_NETWORK', Object.keys(NETWORKS), 'testnet');
const network = NETWORKS[networkName];

export const APP_CONFIG = Object.freeze({
    apiBaseUrl: readUrlOrPath('REACT_APP_API_BASE_URL', '', { optional: true }),
    demoMode: readBoolean('REACT_APP_DEMO_MODE', false),
    routerMode: readEnum('REACT_APP_ROUTER_MODE', ['auto', 'browser', 'hash'], 'auto'),
    tonConnectManifestUrl: readUrlOrPath('REACT_APP_TONCONNECT_MANIFEST_URL', '', { optional: true }),
    tonNetwork: networkName,
    tonNetworkLabel: network.label,
    tonChainId: network.chainId,
});

export function getTonConnectManifestUrl() {
    if (APP_CONFIG.tonConnectManifestUrl) {
        return APP_CONFIG.tonConnectManifestUrl;
    }

    if (!isStaticHostingHost()) {
        return '/api/tonconnect-manifest';
    }

    try {
        const origin = window.location.origin;
        return new URL('tonconnect-manifest.json', origin).toString();
    } catch (error) {
        console.warn('Failed to build manifest URL:', error);
        return '/api/tonconnect-manifest';
    }
}

export function shouldUseHashRouter() {
    if (APP_CONFIG.routerMode !== 'auto') {
        return APP_CONFIG.routerMode === 'hash';
    }

    return isStaticHostingHost();
}
