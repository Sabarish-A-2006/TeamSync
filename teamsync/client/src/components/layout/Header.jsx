import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Bell,
  Moon,
  Sun,
  Menu,
  Wifi,
  WifiOff,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { getAvatarUrl } from '../../utils/helpers';
import NotificationPanel from '../dashboard/NotificationPanel';
import AvailabilityToggle from '../common/AvailabilityToggle';
import AvailabilityBadge from '../common/AvailabilityBadge';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMobileMenuToggle, sidebarCollapsed }) {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const now = new Date();

  const handleSelfStatusChange = (updates) => {
    updateUser(updates);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-0 lg:left-64'
      }`}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile hamburger & Welcome */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                Hi, {user?.fullName?.split(' ')[0] || 'Team Member'}
              </h2>
              <span className="hidden sm:inline-flex">
                <AvailabilityBadge status={user?.availabilityStatus} size="sm" />
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {format(now, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Right: Quick Availability Toggle, Socket Status, Theme, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Quick Availability Status Toggle for current user */}
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                My Status:
              </span>
              <AvailabilityToggle
                userId={user._id}
                isAvailable={user.isAvailable}
                availabilityStatus={user.availabilityStatus}
                canEdit={true}
                onStatusChange={handleSelfStatusChange}
                showLabels={true}
              />
            </div>
          )}

          {/* Socket Connection Status */}
          <div
            title={isConnected ? 'Live Socket.IO Connected' : 'Disconnected from Realtime'}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline">
                  Live
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium hidden sm:inline">
                  Offline
                </span>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-gray-900" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none"
            >
              <img
                src={getAvatarUrl(user)}
                alt={user?.fullName || 'Profile'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
              />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl py-2 z-50 text-xs"
                >
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                    <div className="mt-1">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/dashboard/profile');
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </button>

                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
