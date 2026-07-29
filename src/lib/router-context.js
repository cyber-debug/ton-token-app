import { createContext, useContext } from 'react';

export const RouterContext = createContext(null);

export function useRouter() {
    const router = useContext(RouterContext);

    if (!router) {
        throw new Error('Router components must be rendered inside RouterProvider.');
    }

    return router;
}
