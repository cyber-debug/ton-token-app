import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { Buffer } from 'buffer';

// Полифил для Buffer
if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);