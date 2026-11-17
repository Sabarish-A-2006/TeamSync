import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  History,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl, getStatusColor } from '../../utils/helpers';

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const statusColors = getStatusColor(user?.availabilityStatus);

  const mainNav = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Team Members', to: '/dashboard/members', icon: Users },
    { name: 'Availability', to: '/dashboard/availability', icon: Activity },
    { name: 'Activity History', to: '/dashboard/history', icon: History },
    { name: 'My Profile', to: '/dashboard/profile', icon: User },
    { name: 'Settings', to: '/dashboard/settings', icon: Settings },
  ];

  if (isAdmin) {
    mainNav.push({
      name: 'Admin Panel',
      to: '/dashboard/admin',
      icon: ShieldAlert,
      badge: 'Admin',
    });
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Top section: Logo and Nav */}
      <div>
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">
                  Team<span className="text-primary-600">Sync</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                  Availability Hub
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                }`
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105`}
              />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User Card in Sidebar */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="relative flex-shrink-0">
            <img
              src={getAvatarUrl(user)}
              alt={user?.fullName || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${statusColors.dot}`}
              title={`Status: ${user?.availabilityStatus}`}
            />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {user?.fullName}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize truncate">
                {user?.availabilityStatus} • {user?.role}
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-30 hidden lg:block transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 transform transition-transform duration-300 lg:hidden shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
