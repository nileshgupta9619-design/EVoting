import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname.startsWith(path);

    const voterMenuItems = [
        { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
        { icon: '📋', label: 'Elections', path: '/elections' },
        { icon: '🗳️', label: 'Vote', path: '/vote' },
        { icon: '📊', label: 'Results', path: '/results' },
        { icon: '🎟️', label: 'Receipt', path: '/receipt' },
    ];

    const candidateMenuItems = [
        { icon: '🏠', label: 'Dashboard', path: '/candidate/dashboard' },
        { icon: '👤', label: 'My Profile', path: '/candidate/profile' },
        { icon: '📋', label: 'Elections', path: '/candidate/elections' },
        { icon: '📊', label: 'Results', path: '/candidate/results' },
    ];

    const adminMenuItems = [
        { icon: '🏠', label: 'Dashboard', path: '/admin/dashboard' },
        { icon: '👥', label: 'Users', path: '/admin/users' },
        { icon: '👨‍💼', label: 'Candidates', path: '/admin/candidates' },
        { icon: '📋', label: 'Elections', path: '/admin/elections' },
        { icon: '📑', label: 'Registrations', path: '/admin/registrations' },
        { icon: '📊', label: 'Reports', path: '/admin/reports' },
        { icon: '📈', label: 'Monitoring', path: '/admin/monitoring' },
        { icon: '📜', label: 'Audit Logs', path: '/admin/logs' },
    ];

    let menuItems = [];
    if (user?.role === 'voter') menuItems = voterMenuItems;
    else if (user?.role === 'candidate') menuItems = candidateMenuItems;
    else menuItems = adminMenuItems;

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-20 left-4 z-40 bg-blue-600 text-white p-2 rounded-lg"
            >
                {isOpen ? '✕' : '☰'}
            </button>

            {/* Sidebar */}
            <aside
                className={`${isOpen ? 'w-64' : 'w-20'
                    } bg-gray-900 text-white h-screen fixed left-0 top-0 mt-16 transition-all duration-300 overflow-y-auto`}
            >
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            {isOpen && <span className="font-medium text-sm">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-4 left-0 right-0 px-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                        <span className="text-xl flex-shrink-0">🚪</span>
                        {isOpen && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Spacer for main content */}
            <div className={`${isOpen ? 'md:ml-64' : 'md:ml-20'} transition-all duration-300`}></div>
        </>
    );
}
