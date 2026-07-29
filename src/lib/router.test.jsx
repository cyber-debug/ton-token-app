import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Link, NavLink, RouterProvider } from './router';
import { useRouter } from './router-context';

function RouterHarness() {
    const { pathname } = useRouter();

    return (
        <>
            <output aria-label="Current path">{pathname}</output>
            <Link to="/trade">Open trade</Link>
            <NavLink
                to="/trade"
                className={({ isActive }) => isActive ? 'active' : 'inactive'}
            >
                Trade navigation
            </NavLink>
        </>
    );
}

describe('RouterProvider', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/');
    });

    it('navigates without a document reload and exposes active navigation state', async () => {
        const user = userEvent.setup();
        render(
            <RouterProvider mode="browser">
                <RouterHarness />
            </RouterProvider>
        );

        await user.click(screen.getByRole('link', { name: 'Open trade' }));

        expect(screen.getByLabelText('Current path')).toHaveTextContent('/trade');
        expect(screen.getByRole('link', { name: 'Trade navigation' })).toHaveClass('active');
        expect(window.location.pathname).toBe('/trade');
    });

    it('builds hash links for static hosting and reacts to hash changes', async () => {
        const user = userEvent.setup();
        render(
            <RouterProvider mode="hash">
                <RouterHarness />
            </RouterProvider>
        );

        const tradeLink = screen.getByRole('link', { name: 'Open trade' });
        expect(tradeLink).toHaveAttribute('href', '#/trade');

        await user.click(tradeLink);

        expect(window.location.hash).toBe('#/trade');
        expect(screen.getByLabelText('Current path')).toHaveTextContent('/trade');
    });
});
