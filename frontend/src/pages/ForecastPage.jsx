import React, { useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';
import ChartCard from '../components/ChartCard';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Chart as ChartJS, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { ThemeContext } from '../context/ThemeContext';
import './Form.css';
import './ForecastPage.css';

ChartJS.register(...registerables, zoomPlugin); // Register zoom plugin

const ForecastPage = () => {
    const { theme } = useContext(ThemeContext);
    const [keyword, setKeyword] = useState('iPhone');
    const [model, setModel] = useState('prophet');
    const [promotionDate, setPromotionDate] = useState('');
    
    const [interestData, setInterestData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const resultsRef = useRef(null);

    // Dynamic Chart options based on theme
    const getChartOptions = (title) => {
        const isDark = theme === 'dark';
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: isDark ? '#f9fafb' : '#111827' } },
                title: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#374151' : '#fff',
                    titleColor: isDark ? '#f9fafb' : '#111827',
                    bodyColor: isDark ? '#f9fafb' : '#111827',
                    borderColor: isDark ? '#4b5563' : '#e5e7eb',
                    borderWidth: 1,
                },
                zoom: {
                    pan: { enabled: true, mode: 'x' },
                    zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
                }
            },
            scales: {
                x: { 
                    ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
                    grid: { color: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)' }
                },
                y: { 
                    ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
                    grid: { color: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)' }
                }
            }
        };
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInterestData(null);
        setForecastData(null);

        if (!keyword) {
            setError('Please enter a keyword.');
            setLoading(false);
            return;
        }

        try {
            const requestBody = { 
                keyword,
                model,
                promotion_dates: promotionDate ? [promotionDate] : []
            };
            const [interestRes, forecastRes] = await Promise.all([
                api.post('/trends/interest-over-time', { keyword }),
                api.post('/trends/forecast', requestBody)
            ]);

            const chartColors = {
                historical: theme === 'dark' ? '#818cf8' : '#4f46e5',
                historicalBg: theme === 'dark' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                forecast: theme === 'dark' ? '#f472b6' : '#ef4444',
            };

            const interestChartData = {
                labels: interestRes.data.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    label: `Historical Interest for "${keyword}"`,
                    data: interestRes.data.map(d => d.value),
                    borderColor: chartColors.historical,
                    backgroundColor: chartColors.historicalBg,
                    fill: true,
                    tension: 0.1,
                }]
            };

            const forecastLabels = forecastRes.data.map(d => new Date(d.ds).toLocaleDateString());
            
            const forecastChartData = {
                labels: [...interestChartData.labels, ...forecastLabels],
                datasets: [
                    {
                        label: 'Historical',
                        data: interestRes.data.map(d => d.value),
                        borderColor: '#9ca3af',
                        tension: 0.2,
                        pointRadius: 0,
                    },
                    {
                        label: `Forecast (${model})`,
                        data: [
                            ...Array(interestRes.data.length - 1).fill(null),
                            interestRes.data[interestRes.data.length - 1]?.value,
                            ...forecastRes.data.map(d => d.yhat)
                        ],
                        borderColor: chartColors.forecast,
                        borderDash: [5, 5],
                        tension: 0.2,
                        fill: false,
                        pointRadius: 2,
                    }
                ]
            };
            
            setInterestData({ data: interestChartData, options: getChartOptions() });
            setForecastData({ data: forecastChartData, options: getChartOptions() });

            // Smooth scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (err) {
            setError(err.response?.data?.detail || 'An unexpected error occurred. Please try another keyword.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <motion.div 
            key="forecast"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
        >
            <div className="forecast-fixed-header">
                <header className="page-header">
                    <h1>Demand Forecasting</h1>
                    <p>Analyze historical interest and generate a 52-week forecast using advanced models.</p>
                </header>
                
                <motion.form 
                    onSubmit={handleSubmit} 
                    className="page-form forecast-form"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="input-group">
                        <label htmlFor="keyword-input">Keyword</label>
                        <input id="keyword-input" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g., iPhone" className="form-input" />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="model-select">Forecasting Model</label>
                        <select id="model-select" value={model} onChange={(e) => setModel(e.target.value)} className="form-input">
                            <option value="prophet">Prophet (Recommended)</option>
                            <option value="xgboost">XGBoost (Experimental)</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label htmlFor="promo-dates">Promotion Date (Optional)</label>
                        <input id="promo-dates" type="date" value={promotionDate} onChange={(e) => setPromotionDate(e.target.value)} className="form-input"/>
                    </div>

                    <button type="submit" disabled={loading} className="form-button-large">
                        {loading ? 'Analyzing...' : 'Generate Forecast'}
                    </button>
                </motion.form>
            </div>
            
            <div className="forecast-results" ref={resultsRef}>
                {error && <p className="error-message">{error}</p>}
                
                <div className="chart-grid">
                    {interestData && (
                        <ChartCard title="Historical Search Interest (5 Years)">
                            <Line data={interestData.data} options={getChartOptions()} />
                        </ChartCard>
                    )}
                    {forecastData && (
                        <ChartCard title={`Interest Forecast - ${model.toUpperCase()} (Next 52 Weeks)`}>
                            <Line data={forecastData.data} options={getChartOptions()} />
                        </ChartCard>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ForecastPage;