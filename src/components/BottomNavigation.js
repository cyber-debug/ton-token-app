import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaExchangeAlt, FaWallet } from 'react-icons/fa'; // Иконки
import './BottomNavigation.css';

function BottomNavigation() {
    const location = useLocation(); // Получаем текущий путь

    // Функция для проверки активного пути
    const isActive = (path) => location.pathname === path;

    return (
        <div className="bottom-navigation">
            <Link
                to="/"
                className={`nav-button ${isActive('/') ? 'active' : ''}`}
            >
                <FaHome size={24} /> {/* Иконка дома */}
            </Link>
            <Link
                to="/trade"
                className={`nav-button ${isActive('/trade') ? 'active' : ''}`}
            >
                <FaExchangeAlt size={24} /> {/* Иконка обмена */}
            </Link>
            <Link
                to="/profile"
                className={`nav-button ${isActive('/profile') ? 'active' : ''}`}
            >
                <FaWallet size={24} /> {/* Иконка кошелька */}
            </Link>
        </div>
    );
}

export default BottomNavigation;