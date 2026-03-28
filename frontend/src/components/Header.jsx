import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Header({ showNavigation = true }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">✓</span>
                        </div>
                        <span className="hidden sm:block text-xl font-bold text-gray-800">E-Voting System</span>
                    </Link>

                    {/* Navigation & User Menu */}
                    <div className="flex items-center space-x-4">
                        {showNavigation && user && (
                            <nav className="hidden md:flex space-x-1">
                                <NavLink to="/" label="Home" />
                                {user.role === 'voter' && (
                                    <>
                                        <NavLink to="/elections" label="Elections" />
                                        <NavLink to="/results" label="Results" />
                                    </>
                                )}
                                {user.role === 'candidate' && (
                                    <>
                                        <NavLink to="/candidate/profile" label="My Profile" />
                                        <NavLink to="/candidate/elections" label="Elections" />
                                    </>
                                )}
                            </nav>
                        )}

                        {/* User Dropdown */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name || 'User'}</span>
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 animate-in">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            to="/change-password"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            Change Password
                                        </Link>
                                        <hr className="my-2" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                    <Link to="/login">Login</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

function NavLink({ to, label }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`px-3 py-2 rounded-lg font-medium transition-colors ${isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            {label}
        </Link>
    );
}
