import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Profile.css';

function Profile() {
    const [activeTab, setActiveTab] = useState('balance');

    return (
        <div className="wallet-page">
            <div className="wallet-header">
                <h1>VORIX Wallet</h1>
                <p>Manage your VORIX wallet and view transaction history.</p>
            </div>

            <button className="connect-wallet-button">
                Connect Wallet
            </button>

            <div className="tab-switcher">
                <button
                    className={`tab-button ${activeTab === 'balance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('balance')}
                >
                    Balance
                </button>
                <button
                    className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
                <motion.div
                    className="slider"
                    animate={{ x: activeTab === 'balance' ? 0 : '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
            </div>

            <div className="tab-content">
                {activeTab === 'balance' ? (
                    <div className="balance-content">
                        <h2>Your VORIX Balance</h2>
                        <p>1000 VORIX</p> {/* Заглушка */}
                    </div>
                ) : (
                    <div className="history-content">
                        <h2>VORIX Transaction History</h2>
                        <ul>
                            <li>Received 100 VORIX</li>
                            <li>Sent 50 VORIX</li>
                            <li>Swapped 30 VORIX</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;