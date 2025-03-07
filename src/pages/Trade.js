import React from 'react';
import TradingViewChart from '../components/TradingViewChart';
import BuySellForm from '../components/BuySellForm';

function Trade() {
    return (
        <div>
            <h1>Trade</h1>
            <TradingViewChart />
            <BuySellForm />
        </div>
    );
}

export default Trade;