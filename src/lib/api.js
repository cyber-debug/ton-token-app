const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

export function buildApiUrl(path, params = {}) {
    const url = `${API_BASE_URL}${path}`;
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.set(key, String(value));
        }
    });

    const queryString = query.toString();
    return queryString ? `${url}?${queryString}` : url;
}

export async function apiRequest(path, { method = 'GET', params, body, signal, fallback } = {}) {

    try {
        const response = await fetch(buildApiUrl(path, params), {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
            signal,
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || payload.ok === false) {
            throw new Error(payload.error || `Request failed with status ${response.status}`);
        }

        return payload;
    } catch (error) {
        if (fallback !== undefined) {
            return typeof fallback === 'function' ? fallback(error) : fallback;
        }

        throw error;
    }
}
