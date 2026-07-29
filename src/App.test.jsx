import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import App from './App';
import { RouterProvider } from './lib/router';

vi.mock('@tonconnect/ui-react', () => ({
    useTonWallet: () => null,
    useTonConnectModal: () => ({ open: vi.fn(), close: vi.fn(), state: { status: 'closed' } }),
    useTonConnectUI: () => [{ sendTransaction: vi.fn() }],
}));

vi.mock('./hooks/useDashboard', () => ({
    useDashboard: () => ({
        dashboard: { market: null, activity: [], health: null },
        loading: false,
        error: '',
    }),
}));

vi.mock('./hooks/useWalletActivity', () => ({
    useWalletActivity: () => [],
}));

vi.mock('./pages/Home', () => ({
    default: () => <h1>VORIX Wallet</h1>,
}));

vi.mock('./pages/Trade', () => ({
    default: () => <h1>Market and send</h1>,
}));

vi.mock('./pages/Profile', () => ({
    default: () => <h1>Profile and activity</h1>,
}));

describe('App', () => {
    it('renders the wallet dashboard shell', async () => {
        window.history.replaceState(null, '', '/');

        render(
            <RouterProvider>
                <App />
            </RouterProvider>
        );

        expect(await screen.findByText(/VORIX Wallet/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /market and send/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /profile and activity/i })).toBeInTheDocument();
    });
});
