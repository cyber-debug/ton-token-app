import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './styles.css';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
    window.Buffer = Buffer;
}

function getManifestUrl() {
    if (process.env.REACT_APP_TONCONNECT_MANIFEST_URL) {
        return process.env.REACT_APP_TONCONNECT_MANIFEST_URL;
    }

    if (
        typeof window !== 'undefined' &&
        (window.location.hostname.endsWith('github.io') || window.location.hostname.endsWith('pages.dev'))
    ) {
        return new URL('tonconnect-manifest.json', window.location.href).toString();
    }

    return '/api/tonconnect-manifest';
}

const Router =
    process.env.REACT_APP_ROUTER_MODE === 'hash' ||
    (typeof window !== 'undefined' &&
        (window.location.hostname.endsWith('github.io') || window.location.hostname.endsWith('pages.dev')))
        ? HashRouter
        : BrowserRouter;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <TonConnectUIProvider manifestUrl={getManifestUrl()}>
        <Router>
            <App />
        </Router>
    </TonConnectUIProvider>
);
