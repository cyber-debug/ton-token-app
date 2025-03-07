import React, { useState } from 'react';

async function getTokenPrice() {
    const response = await fetch('https://api.ston.fi/v1/tokens/TON/price');
    const data = await response.json();
    return data.price;
}

function BuySellForm() {
    const [amount, setAmount] = useState(0);

    const handleBuy = async () => {
        const price = await getTokenPrice();
        const totalCost = amount * price;
        alert(`You will pay ${totalCost} TON for ${amount} tokens.`);
    };

    const handleSell = async () => {
        const price = await getTokenPrice();
        const totalRevenue = amount * price;
        alert(`You will receive ${totalRevenue} TON for ${amount} tokens.`);
    };

    return (
        <div>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
            />
            <button onClick={handleBuy}>Buy</button>
            <button onClick={handleSell}>Sell</button>
        </div>
    );
}

export default BuySellForm;