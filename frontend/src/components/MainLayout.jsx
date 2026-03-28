import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header showNavigation={false} />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
