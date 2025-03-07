import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWallet } from 'react-icons/fa'; // Иконка кошелька
import Balance from '../components/Balance';
import './Home.css';

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Home() {
    const [address, setAddress] = useState('');
    const [user, setUser] = useState(null); // Состояние для данных пользователя

    // Получаем данные пользователя из Telegram Web App
    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const initData = window.Telegram.WebApp.initData;
            if (initData) {
                const userData = window.Telegram.WebApp.initDataUnsafe.user;
                if (userData) {
                    setUser({
                        id: userData.id,
                        firstName: userData.first_name,
                        lastName: userData.last_name,
                        username: userData.username,
                        photoUrl: userData.photo_url,
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        const savedAddress = localStorage.getItem('tonAddress');
        if (savedAddress) {
            setAddress(savedAddress);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('tonAddress', address);
    }, [address]);

    const handleSend = () => {
        alert('"Send VORIX" feature is under development');
    };

    const handleReceive = () => {
        alert('"Receive VORIX" feature is under development');
    };

    const handleSwap = () => {
        alert('"Swap VORIX" feature is under development');
    };

    const handleConnectWallet = () => {
        alert('"Connect Wallet" feature is under development');
    };

    return (
        <div className="home">
            {/* Шапка с аватаркой и кнопкой Connect Wallet */}
            <div className="header">
                <div className="user-info">
                    {user?.photoUrl ? (
                        <img
                            src={user.photoUrl}
                            alt="User Avatar"
                            className="user-avatar"
                        />
                    ) : (
                        <div className="user-avatar placeholder"></div>
                    )}
                    <button className="connect-wallet-button" onClick={handleConnectWallet}>
                        <FaWallet /> Connect Wallet
                    </button>
                </div>
            </div>

            <h1>VORIX Wallet</h1>

            {/* Карточка с балансом VORIX */}
            <motion.div
                className="balance-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                <h2>Your VORIX Balance</h2>
                <Balance address={address} />
            </motion.div>

            {/* Блок с текущим курсом VORIX */}
            <motion.div
                className="vorix-price"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
            >
                <h2>VORIX Price</h2>
                <p>$0.50</p> {/* Заглушка */}
            </motion.div>

            {/* График изменения курса VORIX (заглушка) */}
            <motion.div
                className="vorix-chart"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
            >
                <h2>VORIX Price History</h2>
                <div className="chart-placeholder">
                    <p>Chart will be displayed here.</p>
                </div>
            </motion.div>

            {/* Блок с быстрыми действиями */}
            <motion.div
                className="quick-actions"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
            >
                <h2>Quick Actions</h2>
                <div className="actions">
                    <button onClick={handleSend}>Send VORIX</button>
                    <button onClick={handleReceive}>Receive VORIX</button>
                    <button onClick={handleSwap}>Swap VORIX</button>
                </div>
            </motion.div>
        </div>
    );
}

export default Home;