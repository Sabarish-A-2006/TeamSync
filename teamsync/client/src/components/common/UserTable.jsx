import React from 'react';
import { Mail, Building, Briefcase } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';
import AvailabilityToggle from './AvailabilityToggle';
import { getAvatarUrl, timeAgo } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function UserTable({ users, onStatusChange }) {
  const { user: currentUser, isAdmin } = useAuth();
  const { onlineUsers } = useSocket();

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
        <thead className="bg-gray-50 dark:bg-gray-800/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
          <tr>
            <th scope="col" className="px-6 py-4">Member</th>
            <th scope="col" className="px-6 py-4">Department & Role</th>
            <th scope="col" className="px-6 py-4">Status</th>
            <th scope="col" className="px-6 py-4">Connection</th>
            <th scope="col" className="px-6 py-4">Last Active</th>
            <th scope="col" className="px-6 py-4 text-right">Quick Toggle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {users.map((u) => {
            const isSelf = currentUser?._id === u._id;
            const canEdit = isSelf || isAdmin;
            const isOnline = onlineUsers.has(u._id);

            return (
              <tr
                key={u._id}
                className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
              >
                {/* Member */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(u)}
                      alt={u.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {u.fullName}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Department & Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {u.designation || 'Team Member'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {u.department || 'General'}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <AvailabilityBadge status={u.availabilityStatus} size="md" />
                </td>

                {/* Connection status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isOnline ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      Offline
                    </span>
                  )}
                </td>

                {/* Last active */}
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo(u.lastActiveAt)}
                </td>

                {/* Toggle action */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end">
                    <AvailabilityToggle
                      userId={u._id}
                      isAvailable={u.isAvailable}
                      availabilityStatus={u.availabilityStatus}
                      canEdit={canEdit}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
