import config from '../config.js';
import { BalanceService } from './balance-service.js';
import { MarketService } from './market-service.js';
import { TransferService } from './transfer-service.js';

export function createServices(serviceConfig = config) {
    const market = new MarketService(serviceConfig);

    return {
        balance: new BalanceService(serviceConfig),
        market,
        transfer: new TransferService(serviceConfig),
    };
}
