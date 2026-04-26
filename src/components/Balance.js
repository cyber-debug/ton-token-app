import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { buildOfflineBalance } from '../lib/offline';

const NANO_TON = 1_000_000_000n;

function formatTonAmount(balance) {
    try {
        const nano = window.BigInt(balance);
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

                setBalance(data.balance.balanceNano);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError('We could not load the live balance right now.');
                }
            } finally {
                setLoading(false);
            }
        }

        loadBalance();

        return () => controller.abort();
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
                    {address ? 'Live' : 'Disconnected'}
                </span>
            </div>
            <p className="small balance-note">
                {error || (address ? `Account ${address.slice(0, 6)}…${address.slice(-4)}` : 'Connect a wallet to unlock your account data.')}
            </p>
        </div>
    );
}

export default Balance;
