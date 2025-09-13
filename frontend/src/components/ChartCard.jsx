import React from 'react';
import './ChartCard.css';
import { motion } from 'framer-motion';

const ChartCard = ({ title, children }) => {
    return (
        <motion.div
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <h2 className="chart-title">{title}</h2>
            <div className="chart-content">
                {children}
            </div>
        </motion.div>
    );
};

export default ChartCard;