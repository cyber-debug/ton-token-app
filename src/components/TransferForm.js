import React, { useState } from 'react';
import { useTonConnectModal, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { FaPaperPlane, FaShieldAlt, FaWallet } from 'react-icons/fa';
import { apiRequest } from '../lib/api';
import { addWalletActivity } from '../lib/activity';
import { APP_CONFIG } from '../config';

function shortAddress(address) {
    return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'unknown recipient';
}

function TransferForm() {
    const wallet = useTonWallet();
    const { open } = useTonConnectModal();
    const [tonConnectUI] = useTonConnectUI();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('1');
    const [memo, setMemo] = useState('');
    const [status, setStatus] = useState({
        type: 'idle',
        message: APP_CONFIG.demoMode
            ? 'Transfers are disabled while demo data is enabled.'
            : 'The backend validates transfer details before the wallet signs them.',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const walletAddress = wallet?.account?.address || '';
    const walletChainId = wallet?.account?.chain || '';
    const networkMatches = !wallet || walletChainId === APP_CONFIG.tonChainId;

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

        if (APP_CONFIG.demoMode) {
            setStatus({ type: 'idle', message: 'Disable demo mode before preparing a transfer.' });
            return;
        }

        if (!wallet) {
            await openWalletModal();
            return;
        }

        if (!networkMatches) {
            setStatus({
                type: 'error',
                message: `This beta is configured for ${APP_CONFIG.tonNetworkLabel}. Switch wallet networks before sending.`,
            });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: 'idle', message: 'Preparing transfer on the backend...' });

        try {
            const data = await apiRequest('/api/transfer/prepare', {
                method: 'POST',
                body: {
                    recipient,
                    amount,
                    memo,
                    senderAddress: walletAddress,
                    walletChainId,
                },
            });

            const draft = data.transferDraft;
            if (draft.network !== APP_CONFIG.tonChainId) {
                throw new Error('The backend prepared this transfer for a different TON network.');
            }

            await tonConnectUI.sendTransaction({
                validUntil: draft.validUntil,
                network: draft.network,
                from: walletAddress,
                messages: [
                    {
                        address: draft.recipient,
                        amount: draft.amountNano,
                        ...(draft.payload ? { payload: draft.payload } : {}),
                    },
                ],
            });

            addWalletActivity(walletAddress, {
                type: 'transfer',
                title: 'Transfer approved in wallet',
                meta: `${draft.amountTon} TON to ${shortAddress(draft.recipient)}${draft.memoIncluded ? ' · memo attached' : ''}`,
                value: APP_CONFIG.tonNetworkLabel,
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
                    <h2 className="section-title">
                        {APP_CONFIG.demoMode ? 'Transfer preview disabled in demo mode' : 'Validated by the backend, signed by the wallet'}
                    </h2>
                </div>
                <span className="pill">
                    <FaShieldAlt /> Secure flow
                </span>
            </div>

            <div className="wallet-banner">
                <FaWallet />
                <span>
                    {!wallet
                        ? 'Connect a wallet to continue.'
                        : networkMatches
                            ? `Wallet connected on ${APP_CONFIG.tonNetworkLabel} and ready to sign.`
                            : `Wrong wallet network. Switch to ${APP_CONFIG.tonNetworkLabel}.`}
                </span>
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
                    required
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
                    min="0.000000001"
                    step="0.000000001"
                    required
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
                    maxLength={120}
                />
            </label>

            <div className="form-actions">
                <button
                    type="submit"
                    className="primary-button"
                    disabled={isSubmitting || APP_CONFIG.demoMode || !networkMatches}
                >
                    <FaPaperPlane />{' '}
                    {APP_CONFIG.demoMode ? 'Disabled in demo mode' : isSubmitting ? 'Submitting...' : wallet ? 'Transfer funds' : 'Connect wallet'}
                </button>
                <button type="button" className="secondary-button" onClick={openWalletModal}>
                    Connect wallet
                </button>
            </div>

            <p
                aria-live="polite"
                className={`small ${status.type === 'error' ? 'text-danger' : status.type === 'success' ? 'text-success' : ''}`}
            >
                {status.message}
            </p>
        </form>
    );
}

export default TransferForm;
