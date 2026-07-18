import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './styles.css';
import { Buffer } from 'buffer';
import { getTonConnectManifestUrl, shouldUseHashRouter } from './config';

if (typeof window !== 'undefined' && !window.Buffer) {
    window.Buffer = Buffer;
}

const Router = shouldUseHashRouter() ? HashRouter : BrowserRouter;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <TonConnectUIProvider manifestUrl={getTonConnectManifestUrl()}>
        <Router>
            <App />
        </Router>
    </TonConnectUIProvider>
);
