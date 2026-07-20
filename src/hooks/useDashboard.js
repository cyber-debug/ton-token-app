import { useEffect, useState } from 'react';
import { APP_CONFIG } from '../config';
import { apiRequest } from '../lib/api';
import { buildOfflineDashboard } from '../lib/offline';

const EMPTY_DASHBOARD = Object.freeze({ market: null, activity: [], health: null });

export function useDashboard() {
    const [state, setState] = useState({
        dashboard: EMPTY_DASHBOARD,
        loading: true,
        error: '',
    });

    useEffect(() => {
        const controller = new AbortController();

        apiRequest('/api/dashboard', {
            signal: controller.signal,
            fallback: () => buildOfflineDashboard(),
        })
            .then((payload) => {
                setState({
                    dashboard: {
                        market: payload.market || null,
                        activity: payload.activity || [],
                        health: payload.health || null,
                    },
                    loading: false,
                    error: '',
                });
            })
            .catch((error) => {
                if (error?.name !== 'AbortError') {
                    setState({
                        dashboard: EMPTY_DASHBOARD,
                        loading: false,
                        error: APP_CONFIG.demoMode ? '' : (error?.message || 'Backend unavailable.'),
                    });
                }
            });

        return () => controller.abort();
    }, []);

    return state;
}
