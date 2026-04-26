import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => {
    const React = require('react');

    const Link = ({ children, to, className, end, ...props }) => (
        <a href={to} className={typeof className === 'function' ? className({ isActive: false }) : className} {...props}>
            {children}
        </a>
    );

    return {
        Link,
        NavLink: Link,
        BrowserRouter: ({ children }) => <>{children}</>,
        Navigate: () => null,
        Route: ({ element }) => element,
        Routes: ({ children }) => React.Children.toArray(children)[0] || null,
        useLocation: () => ({ pathname: '/' }),
    };
}, { virtual: true });

jest.mock('@tonconnect/ui-react', () => ({
    useTonWallet: () => null,
    useTonConnectModal: () => ({ open: jest.fn(), close: jest.fn(), state: { status: 'closed' } }),
    useTonConnectUI: () => [{ sendTransaction: jest.fn() }],
}));

describe('App', () => {
    it('renders the wallet dashboard shell', () => {
        render(<App />);

        expect(screen.getByText(/VORIX Wallet/i)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /trade/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('link', { name: /profile/i }).length).toBeGreaterThan(0);
    });
});
