import React from 'react';

export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
