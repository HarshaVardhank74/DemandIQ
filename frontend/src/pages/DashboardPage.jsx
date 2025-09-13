import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import { AuthContext } from '../context/AuthContext';
import { FiBarChart2, FiActivity, FiCalendar, FiUsers } from 'react-icons/fi';
import './DashboardPage.css';
import { motion } from 'framer-motion';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const pageVariants = {
        initial: { opacity: 0 },
        in: { opacity: 1 },
        out: { opacity: 0 }
    };

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const response = await api.get('/trends/dashboard-kpis');
                setKpis(response.data);
            } catch (err) {
                setError('Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchKpis();
    }, []);

    const userName = user?.sub ? user.sub.split('@')[0] : 'User';

    if (loading) return <div className="loading-message">Loading Dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const kpiData = [
        { title: "Total Keywords Tracked", value: kpis?.total_keywords_tracked ?? 0, icon: <FiBarChart2 /> },
        { title: "Highest Interest Term", value: kpis?.highest_interest_keyword ?? 'N/A', icon: <FiActivity />, note: `Value: ${kpis?.highest_interest_value ?? 'N/A'}` },
        { title: "Most Recent Peak", value: kpis?.most_recent_peak_date ? new Date(kpis.most_recent_peak_date).toLocaleDateString() : 'N/A', icon: <FiCalendar /> },
        { title: "Active Users", value: 1, icon: <FiUsers />, note: "Feature coming soon" }
    ];

    return (
        <motion.div 
            key="dashboard"
            className="dashboard-page"
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.4 }}
        >
            <header className="dashboard-header">
                <h1>Welcome back, <span className="gradient-text">{userName}</span>!</h1>
                <p>Here's a high-level overview of the market trends.</p>
            </header>
            
            <div className="kpi-grid">
                {kpiData.map((kpi, index) => (
                    <KpiCard key={index} index={index} {...kpi} />
                ))}
            </div>
            
            <div className="dashboard-placeholder">
                <h2>Coming Soon: At-a-Glance Charts</h2>
                <p>This area will feature charts for overall market trends, your top-performing tracked keywords, and more.</p>
            </div>
        </motion.div>
    );
};

export default DashboardPage;