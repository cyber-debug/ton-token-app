import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './styles.css';
import { Buffer } from 'buffer';
import { getTonConnectManifestUrl, shouldUseHashRouter } from './config';
import { RouterProvider } from './lib/router';

if (typeof window !== 'undefined' && !window.Buffer) {
    window.Buffer = Buffer;
}

const routerMode = shouldUseHashRouter() ? 'hash' : 'browser';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <TonConnectUIProvider manifestUrl={getTonConnectManifestUrl()}>
        <RouterProvider mode={routerMode}>
            <App />
        </RouterProvider>
    </TonConnectUIProvider>
);
