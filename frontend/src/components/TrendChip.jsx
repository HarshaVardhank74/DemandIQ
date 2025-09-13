import React from 'react';
import './TrendChip.css';

const TrendChip = ({ keyword }) => {
    return <span className="trend-chip">{keyword}</span>;
};

export default TrendChip;