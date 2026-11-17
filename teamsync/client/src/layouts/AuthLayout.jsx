import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Layers className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-tight">
            Team<span className="text-primary-600">Sync</span>
          </span>
        </Link>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
          Know Who's Available. Collaborate Without Limits.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-gray-900 py-8 px-6 sm:px-10 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-3xl border border-gray-100 dark:border-gray-800">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
