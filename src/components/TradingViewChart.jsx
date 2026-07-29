import React, { useEffect, useMemo, useState } from 'react';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { apiRequest } from '../lib/api';
import { buildOfflineHistory, buildOfflineMarket } from '../lib/offline';
import { APP_CONFIG } from '../config';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function TradingViewChart() {
    const [market, setMarket] = useState(null);
    const [series, setSeries] = useState([]);
    const [status, setStatus] = useState('Loading market data...');

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        async function loadChart() {
            try {
                const [marketResponse, historyResponse] = await Promise.all([
                    apiRequest('/api/market/ton', {
                        signal: controller.signal,
                        fallback: () => ({ market: buildOfflineMarket() }),
                    }),
                    apiRequest('/api/market/ton/history', {
                        params: { days: 1 },
                        signal: controller.signal,
                        fallback: () => ({ series: buildOfflineHistory(buildOfflineMarket()) }),
                    }),
                ]);

                if (!mounted) {
                    return;
                }

                setMarket(marketResponse.market);
                setSeries(Array.isArray(historyResponse.series) && historyResponse.series.length ? historyResponse.series : []);
                setStatus(
                    APP_CONFIG.demoMode
                        ? 'Demo market series shown.'
                        : historyResponse.isStale || marketResponse.market?.isStale
                            ? 'Showing recently cached market data.'
                            : 'Live market feed connected.'
                );
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setMarket((current) => current || null);
                setSeries([]);
                setStatus(error?.message || 'Chart data unavailable right now.');
            }
        }

        loadChart();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, []);

    const chartSeries = useMemo(() => {
        const dataPoints = series;
        return {
            labels: dataPoints.map((point) =>
                new Intl.DateTimeFormat(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                }).format(new Date(point.timestamp))
            ),
            datasets: [
                {
                    label: 'TON price',
                    data: dataPoints.map((point) => point.priceUsd),
                    borderColor: 'rgba(99, 240, 192, 0.95)',
                    backgroundColor: 'rgba(99, 240, 192, 0.16)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderWidth: 2,
                },
            ],
        };
    }, [series]);

    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: 'rgba(7, 15, 27, 0.96)',
                    borderColor: 'rgba(173, 199, 255, 0.18)',
                    borderWidth: 1,
                    titleColor: '#f4f8ff',
                    bodyColor: '#bfcfe5',
                    displayColors: false,
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#9ab0cf',
                        maxTicksLimit: 6,
                    },
                    grid: {
                        color: 'rgba(173, 199, 255, 0.08)',
                    },
                },
                y: {
                    ticks: {
                        color: '#9ab0cf',
                        callback: (value) => `$${value}`,
                    },
                    grid: {
                        color: 'rgba(173, 199, 255, 0.08)',
                    },
                },
            },
        }),
        []
    );

    return (
        <div className="chart-widget">
            <div className="section-header">
                <div>
                    <div className="section-kicker">Live market</div>
                    <h2 className="section-title">TON / USD pulse</h2>
                </div>
                <span className="pill">{APP_CONFIG.demoMode ? 'Demo chart' : 'Backend chart'}</span>
            </div>
            <div className="market-chart-shell">
                <div className="market-chart-legend">
                    <div>
                        <div className="metric-label">Current TON price</div>
                        <div className="metric-value metric-value-sm">
                            {market ? `$${Number(market.priceUsd || 0).toFixed(2)}` : 'Loading...'}
                        </div>
                    </div>
                    <div className="small">
                        {market
                            ? `Updated ${new Date(market.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : status}
                    </div>
                </div>
                {series.length ? (
                    <div className="market-chart">
                        <Line data={chartSeries} options={chartOptions} />
                    </div>
                ) : (
                    <div className="chart-empty small">Market history is unavailable. No synthetic live data is shown.</div>
                )}
            </div>
            <p className="small" aria-live="polite">{status}</p>
        </div>
    );
}

export default TradingViewChart;
