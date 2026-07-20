import crypto from 'node:crypto';
import { Address, comment, fromNano, toNano } from '@ton/core';
import { validationError } from '../lib/errors.js';

const AMOUNT_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,9})?$/;
const MAX_MEMO_BYTES = 120;

function parseAddress(value, label) {
    try {
        return Address.parse(String(value || '').trim());
    } catch {
        throw validationError(`${label} must be a valid TON address.`, 'INVALID_ADDRESS');
    }
}

function parseAmount(value, maxAmountNano) {
    const amount = String(value ?? '').trim();
    if (!AMOUNT_PATTERN.test(amount)) {
        throw validationError('Amount must be a positive TON value with no more than 9 decimal places.', 'INVALID_AMOUNT');
    }

    const amountNano = toNano(amount);
    if (amountNano <= 0n) {
        throw validationError('Amount must be greater than zero.', 'INVALID_AMOUNT');
    }

    if (amountNano > maxAmountNano) {
        throw validationError(
            `Beta transfers are limited to ${fromNano(maxAmountNano)} TON.`,
            'AMOUNT_LIMIT_EXCEEDED'
        );
    }

    return { amountNano, amountTon: fromNano(amountNano) };
}

export class TransferService {
    constructor(config) {
        this.config = config;
        this.maxAmountNano = toNano(config.maxTransferTon);
    }

    prepare(input) {
        const walletChainId = String(input?.walletChainId || '');
        if (walletChainId !== this.config.tonChainId) {
            throw validationError(
                `Connect a wallet on ${this.config.tonNetwork} before preparing a transfer.`,
                'NETWORK_MISMATCH'
            );
        }

        const sender = parseAddress(input?.senderAddress, 'Sender address');
        const recipient = parseAddress(input?.recipient, 'Recipient address');
        const { amountNano, amountTon } = parseAmount(input?.amount, this.maxAmountNano);
        const memo = String(input?.memo || '').trim();

        if (Buffer.byteLength(memo, 'utf8') > MAX_MEMO_BYTES) {
            throw validationError(`Memo must be ${MAX_MEMO_BYTES} UTF-8 bytes or fewer.`, 'MEMO_TOO_LONG');
        }

        const testOnly = this.config.tonNetwork === 'testnet';
        const payload = memo ? comment(memo).toBoc().toString('base64') : undefined;

        return {
            draftId: crypto.randomUUID(),
            network: this.config.tonChainId,
            senderAddress: sender.toRawString(),
            recipient: recipient.toString({ bounceable: true, testOnly, urlSafe: true }),
            amountTon,
            amountNano: amountNano.toString(),
            payload,
            memoIncluded: Boolean(payload),
            validUntil: Math.floor(Date.now() / 1000) + 300,
            createdAt: new Date().toISOString(),
        };
    }
}
