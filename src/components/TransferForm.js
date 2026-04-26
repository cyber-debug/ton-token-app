import React, { useState } from 'react';
import { toNano } from '@ton/core';
import { useTonConnectModal, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { FaPaperPlane, FaShieldAlt, FaWallet } from 'react-icons/fa';
import { apiRequest } from '../lib/api';
import { buildOfflineTransferDraft } from '../lib/offline';

function TransferForm() {
    const wallet = useTonWallet();
    const { open } = useTonConnectModal();
    const [tonConnectUI] = useTonConnectUI();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('1');
    const [memo, setMemo] = useState('');
    const [status, setStatus] = useState({
        type: 'idle',
        message: 'The backend validates transfer details before the wallet signs them.',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openWalletModal = async () => {
        try {
            await open();
        } catch (error) {
            const message = String(error?.message || error || '');
            if (!message.toLowerCase().includes('abort')) {
                setStatus({
                    type: 'error',
                    message: message || 'Could not open the wallet connection modal.',
                });
            }
        }
    };

    const handleTransfer = async (event) => {
        event.preventDefault();

        if (!wallet) {
            await openWalletModal();
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: 'idle', message: 'Preparing transfer on the backend...' });

        try {
            const amountValue = Number(amount);
            const data = await apiRequest('/api/transfer/prepare', {
                method: 'POST',
                body: {
                    recipient,
                    amount: amountValue,
                    memo,
                },
                fallback: () => ({
                    transferDraft: buildOfflineTransferDraft({
                        recipient,
                        amountTon: amountValue,
                        memo,
                    }),
                }),
            });

            await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [
                    {
                        address: data.transferDraft.recipient,
                        amount: data.transferDraft.amountNano || toNano(amountValue).toString(),
                    },
                ],
            });

            setStatus({
                type: 'success',
                message: 'Transfer request sent to your wallet for approval.',
            });
            setAmount('1');
            setRecipient('');
            setMemo('');
        } catch (error) {
            const message = String(error?.message || error || '');
            if (message.toLowerCase().includes('reject') || message.toLowerCase().includes('abort')) {
                setStatus({ type: 'idle', message: 'Transfer cancelled in wallet.' });
            } else {
                setStatus({
                    type: 'error',
                    message: message || 'Transfer could not be submitted right now.',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="transfer-form" onSubmit={handleTransfer}>
            <div className="section-header">
                <div>
                    <div className="section-kicker">Send TON</div>
                    <h2 className="section-title">Validated by the backend, signed by the wallet</h2>
                </div>
                <span className="pill">
                    <FaShieldAlt /> Secure flow
                </span>
            </div>

            <div className="wallet-banner">
                <FaWallet />
                <span>{wallet ? 'Wallet connected and ready to sign.' : 'Connect a wallet to continue.'}</span>
            </div>

            <label className="field">
                <span className="field-label">Recipient address</span>
                <input
                    className="input"
                    type="text"
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value)}
                    placeholder="EQ..."
                    autoComplete="off"
                />
            </label>

            <label className="field">
                <span className="field-label">Amount in TON</span>
                <input
                    className="input"
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="1"
                    min="0"
                    step="0.1"
                />
            </label>

            <label className="field">
                <span className="field-label">Memo</span>
                <input
                    className="input"
                    type="text"
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
                    placeholder="Optional transfer note"
                    maxLength={96}
                />
            </label>

            <div className="form-actions">
                <button type="submit" className="primary-button" disabled={isSubmitting}>
                    <FaPaperPlane /> {isSubmitting ? 'Submitting...' : wallet ? 'Transfer funds' : 'Connect wallet'}
                </button>
                <button type="button" className="secondary-button" onClick={openWalletModal}>
                    Connect wallet
                </button>
            </div>

            <p className={`small ${status.type === 'error' ? 'text-danger' : status.type === 'success' ? 'text-success' : ''}`}>
                {status.message}
            </p>
        </form>
    );
}

export default TransferForm;
