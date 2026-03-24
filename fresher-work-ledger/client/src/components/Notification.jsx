import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border ${
                n.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                n.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                'bg-blue-50 border-blue-100 text-blue-800'
              } min-w-[300px]`}
            >
              {n.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
              {n.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
              {n.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
              <p className="text-sm font-bold flex-1">{n.message}</p>
              <button 
                onClick={() => setNotifications((prev) => prev.filter((nt) => nt.id !== n.id))}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
