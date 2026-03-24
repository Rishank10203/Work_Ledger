import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { LogOut, Menu, Bell } from 'lucide-react';
import { Button } from './Button';

export const Navbar = () => {
  const { logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 transition-colors shadow-sm z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <Button variant="outline" onClick={logout} className="gap-2 hidden sm:flex">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
        <button onClick={logout} className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
