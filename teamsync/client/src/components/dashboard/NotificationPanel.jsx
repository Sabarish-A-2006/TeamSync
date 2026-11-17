import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Check, Clock } from 'lucide-react';
import { notificationService } from '../../services';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll({ limit: 15 });
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all read');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            Notifications
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              No notifications yet
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Availability updates and team activities will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3.5 flex items-start justify-between gap-3 transition-colors ${
                !n.isRead
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug">
                  {n.message}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{timeAgo(n.createdAt)}</span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  title="Mark as read"
                  className="p-1 rounded-md text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex-shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
