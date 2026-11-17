import React from 'react';
import { motion } from 'framer-motion';

export default function StatisticsCard({
  title,
  value,
  percentage,
  icon: Icon,
  colorScheme = 'primary',
  subtitle,
}) {
  const schemes = {
    primary: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/50',
      text: 'text-indigo-600 dark:text-indigo-400',
      bar: 'bg-indigo-600',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      bar: 'bg-emerald-500',
    },
    red: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/50',
      text: 'text-rose-600 dark:text-rose-400',
      bar: 'bg-rose-500',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/50',
      text: 'text-amber-600 dark:text-amber-400',
      bar: 'bg-amber-500',
    },
  };

  const scheme = schemes[colorScheme] || schemes.primary;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`p-5 rounded-2xl border ${scheme.border} bg-white dark:bg-gray-900 shadow-sm relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {value ?? 0}
            </h3>
            {percentage !== undefined && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scheme.bg} ${scheme.text}`}>
                {percentage}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {percentage !== undefined && (
        <div className="mt-4 w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${scheme.bar}`}
            style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
