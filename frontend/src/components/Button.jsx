import React from 'react';

export default function Button({
    children,
    onClick,
    className = '',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    ...props
}) {
    const baseStyles =
        'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-in-out';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg',
        ghost: 'text-blue-600 hover:bg-blue-100 active:bg-blue-200',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}
