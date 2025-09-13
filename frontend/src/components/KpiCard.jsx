import React from 'react';
import './KpiCard.css';
import { motion } from 'framer-motion';

const KpiCard = ({ title, value, icon, note, index }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            className="kpi-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 40px 0 rgba(107, 114, 128, 0.25)' }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-content">
                <p className="kpi-title">{title}</p>
                <h3 className="kpi-value">{value}</h3>
                {note && <p className="kpi-note">{note}</p>}
            </div>
        </motion.div>
    );
};

export default KpiCard;