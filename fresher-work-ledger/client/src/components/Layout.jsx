import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Layout = () => {
  const { user, token } = useAuthStore();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc] dark:bg-gray-900 md:p-10 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
