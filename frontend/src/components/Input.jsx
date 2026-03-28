import React from 'react';

export default function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-gray-700 font-medium text-sm mb-2">
                    {label}
                </label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 placeholder-gray-400 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                    } ${className}`}
                {...props}
            />
            {error && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                    <span className="inline-block mr-1">⚠</span>
                    {error}
                </p>
            )}
        </div>
    );
}
