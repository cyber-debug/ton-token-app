import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { buildOfflineBalance } from '../lib/offline';
import { APP_CONFIG } from '../config';

const NANO_TON = 1_000_000_000n;

function formatTonAmount(balance) {
    try {
        const nano = BigInt(balance);
        const whole = nano / NANO_TON;
        const fraction = (nano % NANO_TON)
            .toString()
            .padStart(9, '0')
            .replace(/0+$/, '');
        const wholeFormatted = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return fraction ? `${wholeFormatted}.${fraction}` : wholeFormatted;
    } catch {
        return '0';
    }
}

function Balance({ address }) {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!address) {
            setBalance(null);
            setError('Connect a wallet to view your live balance.');
            setLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        let mounted = true;

        async function loadBalance() {
            setLoading(true);
            setError('');

            try {
                const data = await apiRequest(`/api/balance/${encodeURIComponent(address)}`, {
                    signal: controller.signal,
                    fallback: () => ({ balance: buildOfflineBalance(address) }),
                });

                if (data?.balance?.balanceNano === undefined || data?.balance?.balanceNano === null) {
                    throw new Error('Balance response was empty.');
                }

                if (data.balance.network && data.balance.network !== APP_CONFIG.tonChainId) {
                    throw new Error('Balance response came from the wrong TON network.');
                }

                if (mounted) {
                    setBalance(data.balance.balanceNano);
                    setError(data.balance.isStale ? 'Showing the most recent cached balance.' : '');
                }
            } catch (err) {
                if (mounted && err.name !== 'AbortError') {
                    setError('We could not load the live balance right now.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadBalance();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [address]);

    return (
        <div className="balance-widget" aria-live="polite">
            <div className="balance-heading">
                <div>
                    <div className="section-kicker">Wallet balance</div>
                    <div className="balance-value">
                        {loading ? 'Loading...' : balance !== null ? `${formatTonAmount(balance)} TON` : address ? '0 TON' : '—'}
                    </div>
                </div>
                <span className={`status-chip ${address ? 'status-chip-positive' : 'status-chip-neutral'}`}>
                    {APP_CONFIG.demoMode ? 'Demo' : address ? 'Live' : 'Disconnected'}
                </span>
            </div>
            <p className="small balance-note">
                {error ||
                    (address
                        ? `${APP_CONFIG.demoMode ? 'Demo account' : 'Account'} ${address.slice(0, 6)}…${address.slice(-4)}`
                        : 'Connect a wallet to unlock your account data.')}
            </p>
        </div>
    );
}

export default Balance;
