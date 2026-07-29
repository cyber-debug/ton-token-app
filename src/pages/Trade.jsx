import React from 'react';
import { motion } from 'framer-motion';
import TradingViewChart from '../components/TradingViewChart';
import BuySellForm from '../components/BuySellForm';
import TransferForm from '../components/TransferForm';
import { APP_CONFIG } from '../config';
import { useDashboard } from '../hooks/useDashboard';

function Trade() {
    const { dashboard, loading, error } = useDashboard();

    return (
        <div className="stack">
            <header className="page-header">
                <div>
                    <div className="section-kicker">Market desk</div>
                    <h1 className="page-title">Review TON and send with confidence</h1>
                    <p className="page-subtitle">
                        Review live market data, calculate informational estimates, and sign real transfers through TON Connect.
                    </p>
                </div>
                <span className="pill">{APP_CONFIG.demoMode ? 'Demo preview' : 'Live API mode'}</span>
            </header>

            <section className="metric-grid">
                <div className="metric-card">
                    <div className="metric-label">Execution model</div>
                    <div className="metric-value metric-value-sm">
                        {APP_CONFIG.demoMode ? 'Disabled in demo' : 'Wallet signed + chain locked'}
                    </div>
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
                    <div className="metric-value metric-value-sm">
                        {APP_CONFIG.demoMode
                            ? 'Demo'
                            : dashboard.health?.chainId && dashboard.health.chainId !== APP_CONFIG.tonChainId
                                ? 'Wrong network'
                                : dashboard.health
                                    ? 'Online'
                                    : loading
                                        ? 'Connecting…'
                                        : 'Offline'}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">TON price</div>
                    <div className="metric-value metric-value-sm">
                        {dashboard.market ? `$${dashboard.market.priceUsd.toFixed(2)}` : error ? 'Unavailable' : 'Loading...'}
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
                                <strong>Estimate only</strong>
                            </div>
                            <div className="info-row">
                                <span>Transfers</span>
                                <strong>Chain-locked wallet signing</strong>
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
