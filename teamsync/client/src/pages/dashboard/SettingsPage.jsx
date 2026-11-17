import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  Smartphone,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    toast.success('Preferences saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-primary-600" />
          Application Preferences
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your theme, notification preferences, and workspace experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
            Appearance
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Toggle between light and dark modes according to your lighting conditions.
          </p>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
                <p className="text-xs text-gray-400">
                  {isDark ? 'Comfortable for low-light environments' : 'Bright and high-contrast theme'}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="btn-secondary text-xs px-3.5 py-1.5"
            >
              Switch to {isDark ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Real-time Notifications */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-600" />
            Alerts & Notifications
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Choose what alerts you receive when teammates update their availability status.
          </p>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Live In-App Popups
                </span>
                <span className="text-[11px] text-gray-400">
                  Show toast notifications when teammates change their status
                </span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Audible Chimes
                </span>
                <span className="text-[11px] text-gray-400">
                  Play gentle sound on important team availability broadcasts
                </span>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Daily Availability Digest
                </span>
                <span className="text-[11px] text-gray-400">
                  Receive a morning email summarizing team working hours and PTO
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Security & Access */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-600" />
            Security & Authentication
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Details about your session security and account permissions.
          </p>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Account Role:</span>
              <span className="font-bold uppercase text-primary-600">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Token Type:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">JSON Web Token (JWT)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Encryption:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">bcrypt salted 12 rounds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
