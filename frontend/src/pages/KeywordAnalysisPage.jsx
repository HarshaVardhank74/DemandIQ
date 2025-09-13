import React, { useState } from 'react';
import api from '../services/api';
import './Form.css';
import './KeywordAnalysisPage.css';
import { motion } from 'framer-motion';
import TrendChip from '../components/TrendChip';
import ProgressBar from '../components/ProgressBar';
import { FiTrendingUp } from 'react-icons/fi';

const KeywordAnalysisPage = () => {
    const [keyword, setKeyword] = useState('meal prep');
    const [relatedQueries, setRelatedQueries] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRelatedQueries(null);
        
        if (!keyword) {
            setError('Please enter a keyword.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/trends/related-queries', { keyword });
            setRelatedQueries(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const QueryTable = ({ title, data, type }) => {
        const itemVariants = {
            hidden: { opacity: 0, x: -10 },
            visible: i => ({
                opacity: 1,
                x: 0,
                transition: { delay: i * 0.05 },
            }),
        };

        return (
        <motion.div 
            className="query-table-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3>{title}</h3>
            {data && data.length > 0 ? (
                <ul className="query-list">
                    {data.map((item, index) => (
                        <motion.li 
                            key={index} 
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                            whileHover={{ scale: 1.03 }}
                        >
                            <TrendChip keyword={item.query} />
                            <div className="value-container">
                                {type === 'rising' && <FiTrendingUp style={{ color: '#0ea5e9'}}/>}
                                <span>{type === 'top' ? item.value : `${item.value}%`}</span>
                                <ProgressBar value={item.value} type={type} />
                            </div>
                        </motion.li>
                    ))}
                </ul>
            ) : <p className="no-data-message">No {title.toLowerCase()} queries found.</p>}
        </motion.div>
        )};
    
    return (
        <motion.div 
            key="analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="page-container"
        >
            <header className="page-header">
                <h1>Keyword Analysis</h1>
                <p>Discover top and rising search queries to find new market opportunities.</p>
            </header>
            
             <form onSubmit={handleSubmit} className="page-form">
                <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter a keyword" className="form-input"/>
                <button type="submit" disabled={loading} className="form-button">
                    {loading ? 'Analyzing...' : 'Analyze Keyword'}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}
            
            {loading && <div className="loading-message">Fetching related queries...</div>}
            
            {relatedQueries && (
                <div className="analysis-grid">
                    <QueryTable title="Top Related Queries" data={relatedQueries.top} type="top"/>
                    <QueryTable title="Rising Related Queries" data={relatedQueries.rising} type="rising"/>
                </div>
            )}
        </motion.div>
    );
};

export default KeywordAnalysisPage;