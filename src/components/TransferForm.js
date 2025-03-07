import React, { useState } from 'react';
import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { toNano } from '@ton/core';

async function transferTokens(sender, recipient, amount) {
    const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC' });
    const mnemonic = process.env.REACT_APP_WALLET_MNEMONIC.split(' ');
    const key = await mnemonicToWalletKey(mnemonic);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });

    const contract = client.open(wallet);
    await contract.sendTransfer({
        secretKey: key.secretKey,
        messages: [
            {
                address: recipient,
                amount: toNano(amount),
                payload: 'Transfer tokens',
            },
        ],
    });
}

function TransferForm({ sender }) {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState(0);

    const handleTransfer = async () => {
        await transferTokens(sender, recipient, amount);
        alert('Tokens transferred!');
    };

    return (
        <div>
            <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient address"
            />
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
            />
            <button onClick={handleTransfer}>Transfer Tokens</button>
        </div>
    );
}

export default TransferForm;