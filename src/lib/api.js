import { APP_CONFIG } from '../config';

const DEFAULT_TIMEOUT_MS = 12_000;

export class ApiError extends Error {
    constructor(message, { status = 0, code = 'REQUEST_FAILED', requestId = '' } = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.requestId = requestId;
    }
}

export function buildApiUrl(path, params = {}) {
    const url = `${APP_CONFIG.apiBaseUrl}${path}`;
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.set(key, String(value));
        }
    });

    const queryString = query.toString();
    return queryString ? `${url}?${queryString}` : url;
}

export async function apiRequest(
    path,
    { method = 'GET', params, body, signal, fallback, timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) {
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort(signal?.reason);
    const timer = window.setTimeout(() => controller.abort('timeout'), timeoutMs);

    if (signal?.aborted) {
        controller.abort(signal.reason);
    } else {
        signal?.addEventListener('abort', abortFromCaller, { once: true });
    }

    try {
        const response = await fetch(buildApiUrl(path, params), {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || payload.ok === false) {
            throw new ApiError(payload.error || `Request failed with status ${response.status}.`, {
                status: response.status,
                code: payload.code,
                requestId: payload.requestId || response.headers.get('X-Request-Id') || '',
            });
        }

        return payload;
    } catch (error) {
        if (fallback !== undefined && APP_CONFIG.demoMode && error?.name !== 'AbortError') {
            return typeof fallback === 'function' ? fallback(error) : fallback;
        }

        if (error?.name === 'AbortError' && !signal?.aborted) {
            throw new ApiError('The API request timed out.', { status: 408, code: 'TIMEOUT' });
        }

        throw error;
    } finally {
        window.clearTimeout(timer);
        signal?.removeEventListener('abort', abortFromCaller);
    }
}
