import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNavigation from './components/BottomNavigation';
import AppErrorBoundary from './components/AppErrorBoundary';
import { APP_CONFIG } from './config';
import './styles.css';

const Home = lazy(() => import('./pages/Home'));
const Trade = lazy(() => import('./pages/Trade'));
const Profile = lazy(() => import('./pages/Profile'));

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
                <div className={`environment-banner ${APP_CONFIG.demoMode ? 'environment-banner-demo' : ''}`}>
                    <strong>{APP_CONFIG.tonNetworkLabel}</strong>
                    <span>{APP_CONFIG.demoMode ? 'Demo data enabled · transfers disabled' : 'Live beta · verify every wallet prompt'}</span>
                </div>
                <AnimatePresence mode="wait">
                    <Suspense fallback={<main className="page page-loading">Loading VORIX…</main>}>
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
                    </Suspense>
                </AnimatePresence>
                <BottomNavigation />
            </div>
        </AppErrorBoundary>
    );
}

export default App;
