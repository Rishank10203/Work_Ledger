import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { LayoutDashboard, Users, FolderKanban, Clock, Settings, Briefcase, X } from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  const getLinks = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', to: '/', icon: LayoutDashboard },
          { name: 'Users', to: '/users', icon: Users },
          { name: 'Projects', to: '/projects', icon: FolderKanban },
          { name: 'Tasks', to: '/tasks', icon: Briefcase },
          { name: 'Clients', to: '/clients', icon: Settings },
          { name: 'Time Track', to: '/time', icon: Clock },
        ];
      case 'client':
        return [
          { name: 'Dashboard', to: '/', icon: LayoutDashboard },
          { name: 'Projects', to: '/projects', icon: FolderKanban },
          { name: 'Tasks', to: '/tasks', icon: Briefcase },
        ];
      case 'user':
      case 'team member':
        return [
          { name: 'Dashboard', to: '/', icon: LayoutDashboard },
          { name: 'Tasks', to: '/tasks', icon: Briefcase },
          { name: 'Time Track', to: '/time', icon: Clock },
        ];
      default:
        return [
          { name: 'Dashboard', to: '/', icon: LayoutDashboard },
        ];
    }
  };

  const navLinks = getLinks();

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-[20px_0_50_px-30px_rgba(0,0,0,0.05)]`}>
        <div className="h-24 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <FolderKanban className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent tracking-tighter">
              Work Ledger
            </span>
          </div>
          <button onClick={closeSidebar} className="md:hidden p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navLinks.map((item) => (
            <NavLink
              onClick={() => closeSidebar()}
              key={item.name}
              to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative group ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`} />
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute -left-1 w-1.5 h-6 bg-white rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/80 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'User'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role || 'Role'}</span>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
};
