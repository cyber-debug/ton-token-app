import React from 'react';
import { motion } from 'framer-motion';
import TradingViewChart from '../components/TradingViewChart';
import BuySellForm from '../components/BuySellForm';
import TransferForm from '../components/TransferForm';
import { apiRequest } from '../lib/api';
import { buildOfflineDashboard } from '../lib/offline';

function Trade() {
    const [dashboard, setDashboard] = React.useState({ market: null, health: null });

    React.useEffect(() => {
        if (process.env.NODE_ENV === 'test') {
            return undefined;
        }

        let mounted = true;

        apiRequest('/api/dashboard')
            .then((payload) => {
                if (mounted) {
                    setDashboard({
                        market: payload.market || null,
                        health: payload.health || null,
                    });
                }
            })
            .catch(() => {
                if (mounted) {
                    const fallback = buildOfflineDashboard();
                    setDashboard({
                        market: fallback.market,
                        health: fallback.health,
                    });
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="stack">
            <header className="page-header">
                <div>
                    <div className="section-kicker">Market desk</div>
                    <h1 className="page-title">Trade TON with a cleaner workflow</h1>
                    <p className="page-subtitle">
                        Review live charts, preview quotes, and move funds without leaving the TON Connect flow.
                    </p>
                </div>
                <span className="pill">Live + secure</span>
            </header>

            <section className="metric-grid">
                <div className="metric-card">
                    <div className="metric-label">Execution model</div>
                    <div className="metric-value metric-value-sm">Wallet signed</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Market view</div>
                    <div className="metric-value metric-value-sm">TON / USDT</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Safety</div>
                    <div className="metric-value metric-value-sm">No secrets in UI</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Backend</div>
                    <div className="metric-value metric-value-sm">{dashboard.health ? 'Online' : 'Offline'}</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">TON price</div>
                    <div className="metric-value metric-value-sm">
                        {dashboard.market ? `$${dashboard.market.priceUsd.toFixed(2)}` : 'Loading...'}
                    </div>
                </div>
            </section>

            <section className="section-grid trade-grid">
                <div className="stack">
                    <motion.div className="card card-pad" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <TradingViewChart />
                    </motion.div>
                    <motion.div className="card card-pad" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <BuySellForm />
                    </motion.div>
                </div>

                <div className="stack">
                    <motion.div className="card card-pad" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <TransferForm />
                    </motion.div>
                    <motion.div className="card card-pad" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">Execution notes</div>
                                <h2 className="section-title">How this desk behaves</h2>
                            </div>
                        </div>
                        <div className="info-grid">
                            <div className="info-row">
                                <span>Quotes</span>
                                <strong>Preview only</strong>
                            </div>
                            <div className="info-row">
                                <span>Transfers</span>
                                <strong>Sent through wallet</strong>
                            </div>
                            <div className="info-row">
                                <span>Secrets</span>
                                <strong>Never stored in UI</strong>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

export default Trade;
