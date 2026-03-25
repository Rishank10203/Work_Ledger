import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Layout = () => {
  const { user, token, isDbOffline } = useAuthStore();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {isDbOffline && (
          <div className="bg-rose-600 text-white px-4 py-2 text-sm font-black flex items-center justify-center gap-2 animate-pulse shadow-lg z-50">
            <span className="flex h-2 w-2 rounded-full bg-white"></span>
            DATABASE OFFLINE: Please start your local MongoDB service (AdminCMD: net start MongoDB)
          </div>
        )}
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc] dark:bg-gray-900 md:p-6 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
