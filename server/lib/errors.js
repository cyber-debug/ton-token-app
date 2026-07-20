export class HttpError extends Error {
    constructor(status, message, code = 'REQUEST_FAILED', options = {}) {
        super(message, options);
        this.name = 'HttpError';
        this.status = status;
        this.code = code;
    }
}

export function validationError(message, code = 'VALIDATION_ERROR') {
    return new HttpError(400, message, code);
}

export function upstreamError(message = 'An upstream service is unavailable.', options = {}) {
    return new HttpError(502, message, 'UPSTREAM_UNAVAILABLE', options);
}

export function asyncRoute(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function errorMiddleware(error, req, res, _next) {
    const status = error instanceof HttpError ? error.status : 500;
    const code = error instanceof HttpError ? error.code : 'INTERNAL_ERROR';

    if (status >= 500) {
        req.logError?.(error);
    }

    res.status(status).json({
        ok: false,
        error: status >= 500 && !(error instanceof HttpError)
            ? 'Internal server error.'
            : error.message,
        code,
        requestId: req.id,
    });
}
