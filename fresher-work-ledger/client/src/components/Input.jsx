import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-5 py-3.5 bg-gray-50/50 dark:bg-gray-900/50 border ${
          error ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-gray-100 dark:border-gray-800'
        } rounded-2xl text-sm font-medium focus:outline-hidden focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500/50 focus:bg-white dark:focus:bg-gray-900 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
