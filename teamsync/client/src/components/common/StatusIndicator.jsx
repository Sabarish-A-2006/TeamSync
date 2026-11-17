import React from 'react';
import { getStatusColor, getStatusLabel, timeAgo } from '../../utils/helpers';

export default function StatusIndicator({ status, lastActive, showTime = true, isOnline = false }) {
  const colors = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {status === 'available' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors.dot}`} />
        </span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </span>
        {isOnline && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold">
            Online
          </span>
        )}
      </div>
      {showTime && lastActive && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Active {timeAgo(lastActive)}
        </span>
      )}
    </div>
  );
}
