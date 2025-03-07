import React, { useEffect, useState } from 'react';

async function getBalance(address) {
    const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`);
    const data = await response.json();
    return data.result;
}

function Balance({ address }) {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (address) {
            getBalance(address).then(setBalance);
        }
    }, [address]);

    return (
        <div>
            <h2>Balance: {balance} TON</h2>
        </div>
    );
}

export default Balance;