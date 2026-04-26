import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import Trade from './pages/Trade';
import Profile from './pages/Profile';
import BottomNavigation from './components/BottomNavigation';
import AppErrorBoundary from './components/AppErrorBoundary';
import './styles.css';

const pageTransition = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.28, ease: 'easeOut' },
};

function AnimatedPage({ children }) {
    return (
        <motion.main className="page" {...pageTransition}>
            {children}
        </motion.main>
    );
}

function App() {
    const location = useLocation();

    return (
        <AppErrorBoundary>
            <div className="app-shell">
                <div className="app-backdrop" aria-hidden="true" />
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route
                            path="/"
                            element={
                                <AnimatedPage>
                                    <Home />
                                </AnimatedPage>
                            }
                        />
                        <Route
                            path="/trade"
                            element={
                                <AnimatedPage>
                                    <Trade />
                                </AnimatedPage>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <AnimatedPage>
                                    <Profile />
                                </AnimatedPage>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AnimatePresence>
                <BottomNavigation />
            </div>
        </AppErrorBoundary>
    );
}

export default App;
