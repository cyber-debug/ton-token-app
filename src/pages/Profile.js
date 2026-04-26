import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTonConnectModal, useTonWallet } from '@tonconnect/ui-react';
import { apiRequest } from '../lib/api';
import { buildOfflineDashboard } from '../lib/offline';
import './Profile.css';

function Profile() {
    const [activeTab, setActiveTab] = useState('balance');
    const wallet = useTonWallet();
    const { open } = useTonConnectModal();
    const connectedAddress = wallet?.account?.address || '';
    const [dashboard, setDashboard] = useState({ activity: [], health: null });

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') {
            return undefined;
        }

        let mounted = true;

        apiRequest('/api/dashboard')
            .then((payload) => {
                if (mounted) {
                    setDashboard({
                        activity: payload.activity || [],
                        health: payload.health || null,
                    });
                }
            })
            .catch(() => {
                if (mounted) {
                    const fallback = buildOfflineDashboard();
                    setDashboard({
                        activity: fallback.activity,
                        health: fallback.health,
                    });
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    const walletSummary = useMemo(() => {
        if (!connectedAddress) {
            return 'Connect your wallet to unlock account details and history.';
        }

        return `${connectedAddress.slice(0, 6)}…${connectedAddress.slice(-4)} · ${wallet?.device?.appName || 'TonConnect wallet'}`;
    }, [connectedAddress, wallet?.device?.appName]);

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

    const activity = dashboard.activity.length
        ? dashboard.activity.map((entry) => ({
              label: entry.title,
              value: entry.value,
              meta: entry.meta,
          }))
        : [
              { label: 'Incoming transfer', value: '+120.0 TON', meta: 'Today' },
              { label: 'Trading preview', value: 'Ready', meta: 'Live market desk' },
              { label: 'Transfer security', value: 'Wallet signed', meta: 'No private key exposure' },
          ];

    return (
        <div className="stack profile-shell">
            <header className="page-header">
                <div>
                    <div className="section-kicker">Account center</div>
                    <h1 className="page-title">Profile and wallet state</h1>
                    <p className="page-subtitle">
                        Review the connected wallet, recent activity, and security posture in one place.
                    </p>
                </div>
                <button type="button" className="primary-button" onClick={openWalletModal}>
                    Connect wallet
                </button>
            </header>

            <section className="card card-pad profile-summary">
                <div className="profile-badge">
                    <span className={`status-chip ${connectedAddress ? 'status-chip-positive' : 'status-chip-neutral'}`}>
                        <span className="status-dot" />
                        {connectedAddress ? 'Connected' : 'Disconnected'}
                    </span>
                    <span className="pill">TonConnect</span>
                </div>
                <div className="profile-summary-text">
                    <h2 className="section-title">Wallet overview</h2>
                    <p className="small">{walletSummary}</p>
                </div>

                <div className="info-grid profile-metrics">
                    <div className="info-row">
                        <span>Network</span>
                        <strong>{wallet?.account?.chain || 'Not selected'}</strong>
                    </div>
                    <div className="info-row">
                        <span>Session</span>
                        <strong>{wallet ? 'Active' : 'Awaiting connection'}</strong>
                    </div>
                    <div className="info-row">
                        <span>Wallet app</span>
                        <strong>{wallet?.device?.appName || 'None'}</strong>
                    </div>
                    <div className="info-row">
                        <span>API health</span>
                        <strong>{dashboard.health ? 'Online' : 'Offline'}</strong>
                    </div>
                </div>
            </section>

            <section className="profile-tabs">
                <button
                    type="button"
                    className={`tab-button ${activeTab === 'balance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('balance')}
                >
                    Overview
                </button>
                <button
                    type="button"
                    className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Activity
                </button>
                <motion.div
                    className="slider"
                    animate={{ x: activeTab === 'balance' ? '0%' : '100%' }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
            </section>

            <section className="card card-pad tab-content">
                {activeTab === 'balance' ? (
                    <div className="profile-panel">
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">Overview</div>
                                <h2 className="section-title">What is active right now</h2>
                            </div>
                        </div>
                        <div className="info-grid">
                            <div className="info-row">
                                <span>Account status</span>
                                <strong>{connectedAddress ? 'Ready for transfers' : 'Connect a wallet to continue'}</strong>
                            </div>
                            <div className="info-row">
                                <span>Address</span>
                                <strong>{connectedAddress ? `${connectedAddress.slice(0, 6)}…${connectedAddress.slice(-4)}` : 'Not available'}</strong>
                            </div>
                            <div className="info-row">
                                <span>Protection</span>
                                <strong>Backend-validated actions</strong>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="profile-panel">
                        <div className="section-header">
                            <div>
                                <div className="section-kicker">Activity</div>
                                <h2 className="section-title">Recent account events</h2>
                            </div>
                        </div>
                        <div className="activity-list">
                            {activity.map((item) => (
                                <div className="activity-item" key={item.label}>
                                    <div>
                                        <div className="activity-title">{item.label}</div>
                                        <div className="small">{item.meta}</div>
                                    </div>
                                    <strong>{item.value}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Profile;
