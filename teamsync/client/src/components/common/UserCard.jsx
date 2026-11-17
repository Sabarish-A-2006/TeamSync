import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Briefcase, Building, Mail, MessageSquare } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';
import AvailabilityToggle from './AvailabilityToggle';
import { getAvatarUrl, timeAgo } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function UserCard({ user, onStatusChange }) {
  const { user: currentUser, isAdmin } = useAuth();
  const { onlineUsers } = useSocket();

  const isSelf = currentUser?._id === user._id;
  const canEdit = isSelf || isAdmin;
  const isOnline = onlineUsers.has(user._id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header: Avatar, Name, Toggle */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={getAvatarUrl(user)}
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-950"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
                  user.availabilityStatus === 'available'
                    ? 'bg-green-500'
                    : user.availabilityStatus === 'away'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                title={user.availabilityStatus}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {user.fullName}
                </h4>
                {isSelf && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    You
                  </span>
                )}
                {user.role === 'admin' && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <AvailabilityToggle
              userId={user._id}
              isAvailable={user.isAvailable}
              availabilityStatus={user.availabilityStatus}
              canEdit={canEdit}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>

        {/* Status Message */}
        {user.statusMessage && (
          <div className="mb-3.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="italic line-clamp-2">"{user.statusMessage}"</span>
          </div>
        )}

        {/* Metadata Details */}
        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-4">
          {user.designation && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate font-medium">{user.designation}</span>
            </div>
          )}
          {user.department && (
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>Active {timeAgo(user.lastActiveAt)}</span>
          </div>
        </div>
      </div>

      {/* Footer: Badge and online status */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <AvailabilityBadge status={user.availabilityStatus} size="sm" />
        {isOnline ? (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        ) : (
          <span className="text-[11px] text-gray-400">
            Offline
          </span>
        )}
      </div>
    </motion.div>
  );
}
