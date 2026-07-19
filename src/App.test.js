import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import App from './App';

vi.mock('react-router-dom', () => ({
    Link: ({ children, to, className, end, ...props }) => (
        <a href={to} className={typeof className === 'function' ? className({ isActive: false }) : className} {...props}>
            {children}
        </a>
    ),
    NavLink: ({ children, to, className, end, ...props }) => (
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

describe('App', () => {
    it('renders the wallet dashboard shell', () => {
        render(<App />);

        expect(screen.getByText(/VORIX Wallet/i)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /trade/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('link', { name: /profile/i }).length).toBeGreaterThan(0);
    });
});
