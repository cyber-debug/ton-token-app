import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import Trade from './pages/Trade';
import Profile from './pages/Profile';
import BottomNavigation from './components/BottomNavigation';
import './styles.css';

function App() {
    const location = useLocation();

    return (
        <div className="App">
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route
                        path="/"
                        element={
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Home />
                            </motion.div>
                        }
                    />
                    <Route
                        path="/trade"
                        element={
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Trade />
                            </motion.div>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Profile />
                            </motion.div>
                        }
                    />
                </Routes>
            </AnimatePresence>
            <BottomNavigation />
        </div>
    );
}

export default function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}