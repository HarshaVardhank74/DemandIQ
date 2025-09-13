import React from 'react';
import './ProgressBar.css';
import { motion } from 'framer-motion';

const ProgressBar = ({ value, type = 'top' }) => {
    const percentage = type === 'top' ? value : (value / 5000) * 100; // Normalize rising values

    const variants = {
        hidden: { width: 0 },
        visible: { width: `${percentage}%` },
    };

    return (
        <div className={`progress-bar-container ${type}`}>
            <motion.div
                className="progress-bar-filler"
                variants={variants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.8, ease: "easeOut" }}
            ></motion.div>
        </div>
    );
};

export default ProgressBar;