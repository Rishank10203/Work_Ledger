import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchableSelect = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option...", 
  error,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${error ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-2xl text-sm font-bold flex items-center justify-between cursor-pointer hover:border-primary-500 transition-all focus:ring-4 focus:ring-primary-500/10`}
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 font-medium'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[60] left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-gray-900/95"
          >
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                autoFocus
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      value === opt.value 
                      ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-600' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-tight">{opt.label}</span>
                    {value === opt.value && <Check size={14} />}
                  </div>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-xs text-gray-400 font-medium italic">
                  No matching results found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1">{error}</p>}
    </div>
  );
};
