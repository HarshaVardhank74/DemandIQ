import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const userName = user?.sub ? user.sub.split('@')[0] : 'User';
    const userEmail = user?.sub || '';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
    };

    return (
        <div className="profile-container" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="profile-button">
                <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
                <span className="profile-name">{userName}</span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="profile-dropdown"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <div className="dropdown-header">
                            <p className="user-name">{userName}</p>
                            <p className="user-email">{userEmail}</p>
                        </div>
                        <div className="dropdown-item" onClick={toggleTheme}>
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                        </div>
                        <div className="dropdown-item logout" onClick={logout}>
                            <FiLogOut />
                            <span>Logout</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;