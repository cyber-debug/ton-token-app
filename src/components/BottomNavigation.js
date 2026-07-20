import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaExchangeAlt, FaWallet } from 'react-icons/fa';
import './BottomNavigation.css';

function BottomNavigation() {
    return (
        <nav className="bottom-navigation" aria-label="Primary">
            <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
                aria-label="Home"
            >
                <FaHome className="nav-icon" />
                <span className="nav-label">Home</span>
            </NavLink>
            <NavLink
                to="/trade"
                className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
                aria-label="Market and send"
            >
                <FaExchangeAlt className="nav-icon" />
                <span className="nav-label">Trade</span>
            </NavLink>
            <NavLink
                to="/profile"
                className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
                aria-label="Profile and activity"
            >
                <FaWallet className="nav-icon" />
                <span className="nav-label">Profile</span>
            </NavLink>
        </nav>
    );
}

export default BottomNavigation;
