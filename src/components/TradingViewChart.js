import React, { useEffect, useRef } from 'react';

function TradingViewChart() {
    const chartContainerRef = useRef(null); // Референс для контейнера графика
    const scriptAddedRef = useRef(false); // Референс для отслеживания добавления скрипта

    useEffect(() => {
        // Проверяем, что контейнер существует и скрипт еще не добавлен
        if (!chartContainerRef.current || scriptAddedRef.current) return;

        // Создаем элемент script
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": "BINANCE:TONUSDT",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "calendar": false,
            "support_host": "https://www.tradingview.com"
        });

        // Добавляем скрипт в контейнер
        chartContainerRef.current.appendChild(script);
        scriptAddedRef.current = true; // Помечаем, что скрипт добавлен

        // Очистка при размонтировании компонента
        return () => {
            if (chartContainerRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                chartContainerRef.current.innerHTML = ''; // Удаляем все дочерние элементы
                scriptAddedRef.current = false; // Сбрасываем флаг добавления скрипта
            }
        };
    }, []);

    return (
        <div>
            <h2>TON Price Chart (TradingView)</h2>
            <div className="tradingview-widget-container">
                <div ref={chartContainerRef} className="tradingview-widget-container__widget"></div>
            </div>
        </div>
    );
}

export default TradingViewChart;