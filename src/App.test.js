import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <TonConnectUIProvider manifestUrl="https://your-app.com/tonconnect-manifest.json">
        <App />
    </TonConnectUIProvider>
);
