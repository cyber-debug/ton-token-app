import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import App from './App';

vi.mock('react-router-dom', () => ({
    Link: ({ children, to, className, end: _end, ...props }) => (
        <a href={to} className={typeof className === 'function' ? className({ isActive: false }) : className} {...props}>
            {children}
        </a>
    ),
    NavLink: ({ children, to, className, end: _end, ...props }) => (
        <a href={to} className={typeof className === 'function' ? className({ isActive: false }) : className} {...props}>
            {children}
        </a>
    ),
    BrowserRouter: ({ children }) => <>{children}</>,
    Navigate: () => null,
    Route: ({ element }) => element,
    Routes: ({ children }) => React.Children.toArray(children)[0] || null,
    useLocation: () => ({ pathname: '/' }),
}), { virtual: true });

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
        render(<App />);

        expect(await screen.findByText(/VORIX Wallet/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /market and send/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /profile and activity/i })).toBeInTheDocument();
    });
});
