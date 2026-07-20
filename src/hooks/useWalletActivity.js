import { useEffect, useState } from 'react';
import { ACTIVITY_EVENT, readWalletActivity } from '../lib/activity';

export function useWalletActivity(address) {
    const [activity, setActivity] = useState(() => readWalletActivity(address));

    useEffect(() => {
        const refresh = () => setActivity(readWalletActivity(address));
        refresh();
        window.addEventListener(ACTIVITY_EVENT, refresh);
        window.addEventListener('storage', refresh);

        return () => {
            window.removeEventListener(ACTIVITY_EVENT, refresh);
            window.removeEventListener('storage', refresh);
        };
    }, [address]);

    return activity;
}
