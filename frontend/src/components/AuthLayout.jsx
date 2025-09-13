import React from 'react';
import logo from '../assets/logo.svg';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <img src={logo} alt="DemandIQ Pro Logo" className="auth-logo" />
                    <h2 className="auth-title">Welcome to DemandIQ Pro</h2>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;