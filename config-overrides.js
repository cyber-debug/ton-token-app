const webpack = require('webpack');

module.exports = function override(config, env) {
    // Добавляем полифил для Buffer
    config.plugins.push(
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    );

    // Добавляем поддержку fallback для Node.js модулей
    config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        buffer: require.resolve('buffer'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
    };

    return config;
};
