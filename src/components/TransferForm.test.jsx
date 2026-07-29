import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TransferForm from './TransferForm';

const mocks = vi.hoisted(() => ({
    apiRequest: vi.fn(),
    sendTransaction: vi.fn(),
    addWalletActivity: vi.fn(),
    open: vi.fn(),
    wallet: {
        account: {
            address: `0:${'1'.repeat(64)}`,
            chain: '-3',
        },
    },
}));

vi.mock('@tonconnect/ui-react', () => ({
    useTonWallet: () => mocks.wallet,
    useTonConnectModal: () => ({ open: mocks.open }),
    useTonConnectUI: () => [{ sendTransaction: mocks.sendTransaction }],
}));

vi.mock('../lib/api', () => ({
    apiRequest: mocks.apiRequest,
}));

vi.mock('../lib/activity', () => ({
    addWalletActivity: mocks.addWalletActivity,
}));

describe('TransferForm', () => {
    beforeEach(() => {
        mocks.wallet.account.chain = '-3';
        mocks.apiRequest.mockReset();
        mocks.sendTransaction.mockReset();
        mocks.addWalletActivity.mockReset();
        mocks.open.mockReset();
    });

    it('sends the backend-approved chain, sender, amount, and memo payload to TON Connect', async () => {
        const recipient = `kQ${'a'.repeat(46)}`;
        mocks.apiRequest.mockResolvedValue({
            transferDraft: {
                network: '-3',
                senderAddress: mocks.wallet.account.address,
                recipient,
                amountTon: '1.25',
                amountNano: '1250000000',
                payload: 'te6ccgEBAQEA',
                memoIncluded: true,
                validUntil: 2_000_000_000,
            },
        });
        mocks.sendTransaction.mockResolvedValue({ boc: 'signed-boc' });

        render(<TransferForm />);
        fireEvent.change(screen.getByLabelText(/recipient address/i), { target: { value: recipient } });
        fireEvent.change(screen.getByLabelText(/amount in TON/i), { target: { value: '1.25' } });
        fireEvent.change(screen.getByLabelText(/memo/i), { target: { value: 'hello beta' } });
        fireEvent.click(screen.getByRole('button', { name: /transfer funds/i }));

        await waitFor(() => expect(mocks.sendTransaction).toHaveBeenCalledTimes(1));
        expect(mocks.apiRequest).toHaveBeenCalledWith('/api/transfer/prepare', expect.objectContaining({
            method: 'POST',
            body: expect.objectContaining({
                amount: '1.25',
                memo: 'hello beta',
                walletChainId: '-3',
                senderAddress: mocks.wallet.account.address,
            }),
        }));
        expect(mocks.sendTransaction).toHaveBeenCalledWith({
            validUntil: 2_000_000_000,
            network: '-3',
            from: mocks.wallet.account.address,
            messages: [{
                address: recipient,
                amount: '1250000000',
                payload: 'te6ccgEBAQEA',
            }],
        });
        expect(mocks.addWalletActivity).toHaveBeenCalledTimes(1);
    }, 10_000);

    it('blocks signing when the connected wallet is on mainnet', () => {
        mocks.wallet.account.chain = '-239';

        render(<TransferForm />);

        expect(screen.getByText(/wrong wallet network/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /transfer funds/i })).toBeDisabled();
        expect(mocks.apiRequest).not.toHaveBeenCalled();
        expect(mocks.sendTransaction).not.toHaveBeenCalled();
    });
});
