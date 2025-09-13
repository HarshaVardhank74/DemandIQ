import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiSearch } from 'react-icons/fi';
import ProfileDropdown from './ProfileDropdown';
import logo from '../assets/logo.svg'; 
import './Navbar.css';

const Navbar = () => {
    const navLinkClasses = ({ isActive }) =>
        isActive ? 'nav-link active' : 'nav-link';

    return (
        <aside className="navbar">
            <div className="navbar-header">
                <img src={logo} alt="DemandIQ Pro Logo" className="navbar-logo" />
                <h1 className="navbar-title">DemandIQ Pro</h1>
            </div>
            <nav className="navbar-nav">
                <NavLink to="/dashboard" className={navLinkClasses}>
                    <FiHome />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/forecast" className={navLinkClasses}>
                    <FiTrendingUp />
                    <span>Forecasting</span>
                </NavLink>
                <NavLink to="/analysis" className={navLinkClasses}>
                    <FiSearch />
                    <span>Analysis</span>
                </NavLink>
            </nav>
            <ProfileDropdown />
        </aside>
    );
};

export default Navbar;