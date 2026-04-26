import React, { useEffect, useState } from 'react';
import { FaChartLine, FaSyncAlt } from 'react-icons/fa';
import { apiRequest } from '../lib/api';
import { buildOfflineMarket, buildOfflineQuote } from '../lib/offline';

function BuySellForm() {
    const [amount, setAmount] = useState('10');
    const [side, setSide] = useState('buy');
    const [quote, setQuote] = useState(null);
    const [status, setStatus] = useState({
        type: 'idle',
        message: 'Quotes refresh automatically from the backend.',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const timer = window.setTimeout(async () => {
            const amountValue = Number(amount);
            if (!Number.isFinite(amountValue) || amountValue <= 0) {
                setQuote(null);
                setStatus({
                    type: 'idle',
                    message: 'Enter a positive amount to fetch a live quote.',
                });
                return;
            }

            setIsLoading(true);

            try {
                const data = await apiRequest('/api/quotes/preview', {
                    params: {
                        side,
                        amount: amountValue,
                    },
                    fallback: () => ({
                        quote: buildOfflineQuote({ side, amountTon: amountValue, market: buildOfflineMarket() }),
                        market: buildOfflineMarket(),
                    }),
                });

                if (!cancelled) {
                    setQuote(data.quote);
                    setStatus({
                        type: 'success',
                        message: `Live ${side} quote loaded from the backend.`,
                    });
                }
            } catch (error) {
                if (!cancelled) {
                    setQuote(null);
                    setStatus({
                        type: 'error',
                        message: error.message || 'Quote service unavailable.',
                    });
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }, 350);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [amount, side]);

    const refreshQuote = async () => {
        try {
            setIsLoading(true);
            const amountValue = Number(amount);
            const data = await apiRequest('/api/quotes/preview', {
                params: {
                    side,
                    amount: amountValue,
                },
                fallback: () => ({
                    quote: buildOfflineQuote({ side, amountTon: amountValue, market: buildOfflineMarket() }),
                    market: buildOfflineMarket(),
                }),
            });

            setQuote(data.quote);
            setStatus({
                type: 'success',
                message: `Live ${side} quote refreshed.`,
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message || 'Quote service unavailable.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const amountValue = Number(amount || 0);

    return (
        <div className="trade-form">
            <div className="section-header">
                <div>
                    <div className="section-kicker">Trade preview</div>
                    <h2 className="section-title">Server-priced buy and sell quotes</h2>
                </div>
                <span className="pill">
                    <FaChartLine /> Backend pricing
                </span>
            </div>

            <div className="toggle-group" role="tablist" aria-label="Order side">
                <button type="button" className={`toggle-button ${side === 'buy' ? 'active' : ''}`} onClick={() => setSide('buy')}>
                    Buy
                </button>
                <button type="button" className={`toggle-button ${side === 'sell' ? 'active' : ''}`} onClick={() => setSide('sell')}>
                    Sell
                </button>
            </div>

            <label className="field">
                <span className="field-label">Amount in TON</span>
                <input
                    className="input"
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    min="0"
                    step="0.1"
                    placeholder="10"
                />
            </label>

            <div className="quote-grid">
                <div className="metric-card">
                    <div className="metric-label">Quote status</div>
                    <div className="metric-value metric-value-sm">
                        {isLoading ? 'Refreshing...' : quote ? 'Ready' : 'Waiting'}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Amount</div>
                    <div className="metric-value metric-value-sm">{amountValue ? `${amountValue.toFixed(2)} TON` : '0 TON'}</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Expected output</div>
                    <div className="metric-value metric-value-sm">{quote ? `${quote.totalUsd.toFixed(2)} USD` : '—'}</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Fee + slippage</div>
                    <div className="metric-value metric-value-sm">{quote ? `${(quote.feeUsd + quote.slippageUsd).toFixed(2)} USD` : '—'}</div>
                </div>
            </div>

            {quote ? (
                <div className="quote-summary">
                    <div className="quote-summary-row">
                        <span>Market price</span>
                        <strong>${quote.marketPriceUsd.toFixed(2)}</strong>
                    </div>
                    <div className="quote-summary-row">
                        <span>Estimated rate</span>
                        <strong>${quote.estimatedRate.toFixed(2)}</strong>
                    </div>
                    <div className="quote-summary-row">
                        <span>Quote ID</span>
                        <strong>{quote.quoteId.slice(0, 8)}…</strong>
                    </div>
                </div>
            ) : null}

            <div className="form-actions">
                <button type="button" className="primary-button" onClick={refreshQuote}>
                    <FaSyncAlt /> {isLoading ? 'Updating...' : 'Refresh quote'}
                </button>
                <button type="button" className="secondary-button" onClick={() => setAmount('10')}>
                    Reset
                </button>
            </div>

            <p className={`small ${status.type === 'error' ? 'text-danger' : status.type === 'success' ? 'text-success' : ''}`}>
                {status.message}
            </p>
        </div>
    );
}

export default BuySellForm;
