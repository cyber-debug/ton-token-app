import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { RouterContext, useRouter } from './router-context';

function normalizePath(value) {
    const rawPath = String(value || '/').split(/[?#]/, 1)[0];
    const withLeadingSlash = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');

    return collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : '/';
}

function readPath(mode) {
    if (typeof window === 'undefined') {
        return '/';
    }

    if (mode === 'hash') {
        return normalizePath(window.location.hash.replace(/^#/, '') || '/');
    }

    return normalizePath(window.location.pathname);
}

function buildHref(mode, path) {
    const normalizedPath = normalizePath(path);
    return mode === 'hash' ? `#${normalizedPath}` : normalizedPath;
}

export function RouterProvider({ children, mode = 'browser' }) {
    const [pathname, setPathname] = useState(() => readPath(mode));

    useEffect(() => {
        const syncLocation = () => setPathname(readPath(mode));

        window.addEventListener('popstate', syncLocation);
        window.addEventListener('hashchange', syncLocation);
        syncLocation();

        return () => {
            window.removeEventListener('popstate', syncLocation);
            window.removeEventListener('hashchange', syncLocation);
        };
    }, [mode]);

    const navigate = useCallback((to, { replace = false } = {}) => {
        const nextPath = normalizePath(to);
        const nextHref = buildHref(mode, nextPath);

        if (replace) {
            window.history.replaceState(null, '', nextHref);
        } else {
            window.history.pushState(null, '', nextHref);
        }

        setPathname(nextPath);
    }, [mode]);

    const value = useMemo(() => ({
        mode,
        navigate,
        pathname,
        toHref: (to) => buildHref(mode, to),
    }), [mode, navigate, pathname]);

    return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function Link({
    children,
    download,
    onClick,
    replace = false,
    target,
    to,
    ...props
}) {
    const { navigate, toHref } = useRouter();

    const handleClick = (event) => {
        onClick?.(event);

        if (
            event.defaultPrevented
            || event.button !== 0
            || event.metaKey
            || event.ctrlKey
            || event.shiftKey
            || event.altKey
            || download
            || (target && target !== '_self')
        ) {
            return;
        }

        event.preventDefault();
        navigate(to, { replace });
    };

    return (
        <a href={toHref(to)} target={target} download={download} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}

export function NavLink({
    className,
    end = false,
    to,
    ...props
}) {
    const { pathname } = useRouter();
    const targetPath = normalizePath(to);
    const isActive = end
        ? pathname === targetPath
        : pathname === targetPath || pathname.startsWith(`${targetPath}/`);
    const resolvedClassName = typeof className === 'function'
        ? className({ isActive })
        : className;

    return (
        <Link
            to={to}
            className={resolvedClassName}
            aria-current={isActive ? 'page' : undefined}
            {...props}
        />
    );
}
