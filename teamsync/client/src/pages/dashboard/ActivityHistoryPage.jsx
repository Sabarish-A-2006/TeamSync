import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  Clock,
  ArrowRight,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { availabilityService } from '../../services';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import { formatDateTime, timeAgo, getAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ActivityHistoryPage() {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
      };
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await availabilityService.getHistory(params);
      setHistory(res.data.data.history || []);
      setPagination(res.data.data.pagination || { total: 0, page: 1, limit: 15, pages: 1 });
    } catch (err) {
      console.error('Failed to load history:', err);
      toast.error('Failed to fetch activity history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [statusFilter, startDate, endDate]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchHistory(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-primary-600" />
            Availability Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Permanent historical log of every status transition, reason note, and author timestamp.
          </p>
        </div>

        <button
          onClick={() => fetchHistory(pagination.page)}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 transition-colors self-start sm:self-auto"
          title="Refresh history"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-xs py-2 w-36"
          >
            <option value="">All Statuses</option>
            <option value="available">Transitioned to Available</option>
            <option value="unavailable">Transitioned to Unavailable</option>
            <option value="away">Transitioned to Away</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input text-xs py-1.5 w-36"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input text-xs py-1.5 w-36"
          />
        </div>

        {(statusFilter || startDate || endDate) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs font-semibold text-primary-600 hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">
            Loading activity log records...
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center">
            <History className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
              No activity logs found
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Any changes made to team member availability toggles will be recorded here automatically.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
            {history.map((record) => (
              <div key={record._id} className="relative group">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
                    record.newStatus === 'available'
                      ? 'bg-green-500'
                      : record.newStatus === 'away'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                />

                <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getAvatarUrl(record.userId)}
                        alt={record.userId?.fullName || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {record.userId?.fullName || 'Deleted User'}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({record.userId?.email || 'N/A'})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDateTime(record.changedAt)}</span>
                      <span className="text-[11px] text-gray-400">
                        ({timeAgo(record.changedAt)})
                      </span>
                    </div>
                  </div>

                  {/* Transition display */}
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                    <span className="text-gray-500">Transitioned from</span>
                    <AvailabilityBadge
                      status={record.previousStatus || 'unavailable'}
                      size="sm"
                    />
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500">to</span>
                    <AvailabilityBadge status={record.newStatus} size="sm" />

                    <code className="ml-2 text-[10px] bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono text-gray-500">
                      isAvailable: {record.newAvailability ? 'true' : 'false'}
                    </code>
                  </div>

                  {/* Reason & Author info */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/60 gap-2">
                    <div>
                      {record.reason ? (
                        <span className="italic">
                          Note: "{record.reason}"
                        </span>
                      ) : (
                        <span className="text-gray-400">No note attached</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3 h-3 text-indigo-500" />
                      <span>
                        Updated by:{' '}
                        <strong>
                          {record.updatedBy?.fullName || 'System'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 text-xs text-gray-500">
            <span>
              Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} total events)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
