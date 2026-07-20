import { upstreamError } from './errors.js';

export async function fetchJson(url, { timeoutMs, headers } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'vorix-wallet-beta/0.2',
                ...headers,
            },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw upstreamError(`Upstream service returned ${response.status}.`);
        }

        return await response.json();
    } catch (error) {
        if (error?.name === 'AbortError') {
            throw upstreamError('Upstream service timed out.', { cause: error });
        }

        if (error?.status === 502) {
            throw error;
        }

        throw upstreamError('Upstream service request failed.', { cause: error });
    } finally {
        clearTimeout(timer);
    }
}
