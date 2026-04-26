import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaBolt, FaExchangeAlt, FaPaperPlane, FaWallet } from 'react-icons/fa';
import { useTonConnectModal, useTonWallet } from '@tonconnect/ui-react';
import Balance from '../components/Balance';
import { apiRequest } from '../lib/api';
import { buildOfflineDashboard } from '../lib/offline';
import './Home.css';

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, delay },
    }),
};

function Home() {
    const wallet = useTonWallet();
    const { open } = useTonConnectModal();
    const [telegramUser, setTelegramUser] = useState(null);
    const [dashboard, setDashboard] = useState({
        market: null,
        activity: [],
        health: null,
    });

    useEffect(() => {
        const userData = window.Telegram?.WebApp?.initDataUnsafe?.user;

        if (userData) {
            setTelegramUser({
                id: userData.id,
                firstName: userData.first_name,
                lastName: userData.last_name,
                username: userData.username,
                photoUrl: userData.photo_url,
            });
        }
    }, []);

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') {
            return undefined;
        }

        let mounted = true;

        apiRequest('/api/dashboard')
            .then((payload) => {
                if (mounted) {
                    setDashboard({
                        market: payload.market,
                        activity: payload.activity || [],
                        health: payload.health,
                    });
                }
            })
            .catch(() => {
                if (mounted) {
                    setDashboard(buildOfflineDashboard());
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    const walletAddress = wallet?.account?.address || '';

    const shortAddress = useMemo(() => {
        if (!walletAddress) {
            return 'No wallet connected';
        }

        return `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
    }, [walletAddress]);

    const openWalletModal = async () => {
        try {
            await open();
        } catch (error) {
            const message = String(error?.message || error || '');
            if (process.env.NODE_ENV !== 'production' && !message.toLowerCase().includes('abort')) {
                console.error('Failed to open TonConnect modal:', error);
            }
        }
    };

    const quickActions = [
        {
            label: 'Trade',
            description: 'Review live charts and quote previews.',
            to: '/trade',
            icon: FaExchangeAlt,
        },
        {
            label: 'Send',
            description: 'Prepare a secure transfer request.',
            to: '/trade',
            icon: FaPaperPlane,
        },
        {
            label: 'Profile',
            description: 'Review wallet status and history.',
            to: '/profile',
            icon: FaWallet,
        },
    ];

    const snapshot = [
        { label: 'Wallet status', value: wallet ? 'Connected' : 'Disconnected' },
        { label: 'TON price', value: dashboard.market ? `$${dashboard.market.priceUsd.toFixed(2)}` : 'Loading...' },
        { label: 'API status', value: dashboard.health ? 'Online' : 'Offline' },
    ];

    const activity = dashboard.activity.length
        ? dashboard.activity
        : [
              { title: 'Balance sync', meta: 'Live query', value: wallet ? 'Updated' : 'Waiting' },
              { title: 'Trade desk', meta: 'Market view', value: 'Ready' },
              { title: 'Transfer flow', meta: 'Wallet signing', value: 'Protected' },
          ];

    return (
        <div className="stack">
            <motion.section className="card card-pad home-hero" variants={fadeUp} initial="hidden" animate="visible">
                <div className="hero-copy">
                    <span className="pill">Telegram-ready wallet studio</span>
                    <h1 className="page-title">VORIX Wallet</h1>
                    <p className="page-subtitle">
                        {telegramUser
                            ? `Welcome back, ${telegramUser.firstName}. Your Telegram profile is linked and ready.`
                            : 'Track TON balance, review market context, and move funds from a polished wallet cockpit.'}
                    </p>

                    <div className="hero-actions">
                        <button type="button" className="primary-button" onClick={openWalletModal}>
                            <FaWallet /> {wallet ? 'Switch wallet' : 'Connect wallet'}
                        </button>
                        <Link to="/trade" className="secondary-button">
                            <FaArrowRight /> Open trade desk
                        </Link>
                    </div>

                    <div className="status-row">
                        <span className={`status-chip ${wallet ? 'status-chip-positive' : 'status-chip-neutral'}`}>
                            <span className="status-dot" />
                            {wallet ? 'Connected' : 'Disconnected'}
                        </span>
                        <span className="small">{shortAddress}</span>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="wallet-preview">
                        {telegramUser?.photoUrl ? (
                            <img
                                src={telegramUser.photoUrl}
                                alt={`${telegramUser.firstName} avatar`}
                                className="avatar avatar-large"
                            />
                        ) : (
                            <div className="avatar avatar-large avatar-placeholder">
                                {telegramUser?.firstName?.[0] || 'V'}
                            </div>
                        )}
                        <div>
                            <div className="section-kicker">Telegram profile</div>
                            <div className="feature-value">
                                {telegramUser
                                    ? `${telegramUser.firstName}${telegramUser.lastName ? ` ${telegramUser.lastName}` : ''}`
                                    : 'No Telegram session'}
                            </div>
                            <div className="small">{wallet ? 'Wallet connected' : 'Connect a wallet to continue'}</div>
                        </div>
                    </div>

                    <div className="metric-grid metric-grid-compact">
                        {snapshot.map((item) => (
                            <div className="metric-card" key={item.label}>
                                <div className="metric-label">{item.label}</div>
                                <div className="metric-value metric-value-sm">{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {dashboard.market ? (
                        <div className="info-grid">
                            <div className="info-row">
                                <span>24h change</span>
                                <strong>{Number(dashboard.market.change24h || 0).toFixed(2)}%</strong>
                            </div>
                            <div className="info-row">
                                <span>Market cap</span>
                                <strong>${Number(dashboard.market.marketCapUsd || 0).toLocaleString()}</strong>
                            </div>
                        </div>
                    ) : null}
                </div>
            </motion.section>

            <section className="section-grid">
                <div className="stack">
                    <motion.section className="card card-pad" variants={fadeUp} initial="hidden" animate="visible" custom={0.08}>
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">Wallet balance</div>
                                <h2 className="section-title">Your TON balance</h2>
                            </div>
                            <FaBolt className="section-icon" />
                        </div>
                        <Balance address={walletAddress} />
                    </motion.section>

                    <motion.section className="card card-pad" variants={fadeUp} initial="hidden" animate="visible" custom={0.16}>
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">Quick actions</div>
                                <h2 className="section-title">Move between core workflows</h2>
                            </div>
                        </div>
                        <div className="action-grid">
                            {quickActions.map((action) => {
                                const Icon = action.icon;

                                return (
                                    <Link to={action.to} className="action-card" key={action.label}>
                                        <div className="action-card-top">
                                            <span className="action-icon">
                                                <Icon />
                                            </span>
                                            <FaArrowRight className="action-arrow" />
                                        </div>
                                        <div className="action-title">{action.label}</div>
                                        <div className="small">{action.description}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.section>
                </div>

                <div className="stack">
                    <motion.section className="card card-pad" variants={fadeUp} initial="hidden" animate="visible" custom={0.24}>
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">Network snapshot</div>
                                <h2 className="section-title">Operational status</h2>
                            </div>
                        </div>
                        <div className="info-grid">
                            <div className="info-row">
                                <span>Wallet source</span>
                                <strong>{telegramUser ? 'Telegram Mini App' : 'Browser session'}</strong>
                            </div>
                            <div className="info-row">
                                <span>Signing model</span>
                                <strong>TonConnect</strong>
                            </div>
                            <div className="info-row">
                                <span>Transfer safety</span>
                                <strong>Backend-validated</strong>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section className="card card-pad" variants={fadeUp} initial="hidden" animate="visible" custom={0.32}>
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">Recent activity</div>
                                <h2 className="section-title">What is ready now</h2>
                            </div>
                        </div>
                        <div className="activity-list">
                            {activity.map((entry) => (
                                <div className="activity-item" key={entry.id || entry.title}>
                                    <div>
                                        <div className="activity-title">{entry.title}</div>
                                        <div className="small">{entry.meta}</div>
                                    </div>
                                    <strong>{entry.value}</strong>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </section>
        </div>
    );
}

export default Home;
