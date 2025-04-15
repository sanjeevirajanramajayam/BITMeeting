import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AiOutlineHome, AiOutlineBarChart, AiOutlineBell, AiOutlineDatabase, AiOutlineLogout } from 'react-icons/ai';
import { FaHeadset } from 'react-icons/fa';
import '../styles/Sidebar.css';
import Logo from '../assets/Logo.svg';
import ProfileImage from '../assets/profileimage.png'; // Add your profile image here

const Sidebar = () => {
    const location = useLocation();
    
    // User details - replace with actual user data
    const userDetails = {
        name: "John Doe",
        email: "john.doe@example.com"
    };

    return (
        <div className="sidebar">
            {/* Top Section */}
            <div className="sidebar-top">
                <div className="logo">
                    <img src={Logo} alt="Logo" className="logo-image" />
                </div>
            </div>

            {/* Menu Section */}
            <div className="sidebar-menu">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                    end
                >
                    {({ isActive }) => (
                        <>
                            <AiOutlineHome 
                                size={24} 
                                className={`icon ${isActive ? "active" : ""}`}
                                style={{ color: isActive ? '#007bff' : '#46555F' }}
                            />
                            <div className="tooltip">Dashboard</div>
                        </>
                    )}
                </NavLink>
                <NavLink 
                    to="/database" 
                    className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                >
                    {({ isActive }) => (
                        <>
                            <AiOutlineDatabase 
                                size={24} 
                                className={`icon ${isActive ? "active" : ""}`}
                                style={{ color: isActive ? '#007bff' : '#46555F' }}
                            />
                            <div className="tooltip">Database</div>
                        </>
                    )}
                </NavLink>
                <NavLink 
                    to="/reports" 
                    className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                >
                    {({ isActive }) => (
                        <>
                            <AiOutlineBarChart 
                                size={24} 
                                className={`icon ${isActive ? "active" : ""}`}
                                style={{ color: isActive ? '#007bff' : '#46555F' }}
                            />
                            <div className="tooltip">Reports</div>
                        </>
                    )}
                </NavLink>
            </div>

            {/* Notification Section */}
            <div className="sidebar-notification">
                <NavLink 
                    to="/support" 
                    className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                >
                    {({ isActive }) => (
                        <>
                            <FaHeadset 
                                size={24} 
                                className={`icon ${isActive ? "active" : ""}`}
                                style={{ color: isActive ? '#007bff' : '#46555F' }}
                            />
                            <div className="tooltip">Support</div>
                        </>
                    )}
                </NavLink>
            </div>

            <NavLink 
        to="/logout" 
    className="menu-item logout-button"
>
    <AiOutlineLogout size={24} className="icon" />
    <div className="tooltip">Logout</div>
</NavLink>


            {/* Profile Section */}
            <div className="sidebar-bottom">
                <div className="menu-item profile-container">
                    <img src={ProfileImage} alt="Profile" className="profile-image" />
                    <div className="tooltip profile-tooltip">
                        <div className="profile-name">{userDetails.name}</div>
                        <div className="profile-email">{userDetails.email}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
