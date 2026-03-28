import React from 'react';

export default function Alert({ type = 'info', title, message, onClose, className = '' }) {
    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200',
    };

    const borderColors = {
        success: 'border-l-4 border-l-green-500',
        error: 'border-l-4 border-l-red-500',
        warning: 'border-l-4 border-l-yellow-500',
        info: 'border-l-4 border-l-blue-500',
    };

    const titleColors = {
        success: 'text-green-800',
        error: 'text-red-800',
        warning: 'text-yellow-800',
        info: 'text-blue-800',
    };

    const textColors = {
        success: 'text-green-700',
        error: 'text-red-700',
        warning: 'text-yellow-700',
        info: 'text-blue-700',
    };

    return (
        <div
            className={`${bgColors[type]} ${borderColors[type]} rounded-lg p-4 animate-in slide-in-from-top duration-200 ${className}`}
        >
            <div className="flex items-start">
                <div className="flex-1">
                    {title && <h3 className={`font-bold ${titleColors[type]} mb-1`}>{title}</h3>}
                    {message && <p className={`text-sm ${textColors[type]}`}>{message}</p>}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`ml-2 text-sm font-semibold ${textColors[type]} hover:opacity-70 transition-opacity`}
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}
