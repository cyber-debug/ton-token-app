import config from './config.js';
import { createApp } from './app.js';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
    console.log(
        `VORIX API listening on http://${config.host}:${config.port} (${config.tonNetwork}, beta)`
    );
});

function shutdown(signal) {
    console.log(`${signal} received; closing HTTP server.`);
    server.close((error) => {
        if (error) {
            console.error('HTTP server shutdown failed:', error);
            process.exitCode = 1;
        }
    });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
