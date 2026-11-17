import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  MessageSquare,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import { availabilityService } from '../../services';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import AvailabilityToggle from '../../components/common/AvailabilityToggle';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getAvatarUrl, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AvailabilityPage() {
  const { user: currentUser, isAdmin, updateUser } = useAuth();
  const { isConnected, latestEvent } = useSocket();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Reason modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('available');
  const [statusReason, setStatusReason] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Fetch all availability
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await availabilityService.getAll();
      setMembers(res.data.data.users || []);
    } catch (err) {
      console.error('Failed to load availability:', err);
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Real-time synchronization via Socket.IO
  useEffect(() => {
    if (latestEvent?.type === 'availability:updated') {
      const { userId, isAvailable, availabilityStatus, updatedAt } = latestEvent.data;
      setMembers((prev) =>
        prev.map((m) =>
          m._id === userId
            ? { ...m, isAvailable, availabilityStatus, updatedAt: updatedAt || new Date() }
            : m
        )
      );
    }
  }, [latestEvent]);

  // Reconcile with server after reconnection
  useEffect(() => {
    if (isConnected) {
      fetchAvailability();
    }
  }, [isConnected]);

  // Update a member locally
  const handleMemberStatusChange = (updates) => {
    setMembers((prev) =>
      prev.map((m) => (m._id === updates.userId ? { ...m, ...updates } : m))
    );
    if (updates.userId === currentUser?._id) {
      updateUser(updates);
    }
  };

  // Dedicated Quick-Action Status Selector for logged-in user
  const handleQuickStatus = async (statusKey) => {
    if (!currentUser) return;
    const isAvail = statusKey === 'available';

    // Optimistic
    handleMemberStatusChange({
      userId: currentUser._id,
      isAvailable: isAvail,
      availabilityStatus: statusKey,
    });

    try {
      await availabilityService.update(currentUser._id, {
        isAvailable: isAvail,
        availabilityStatus: statusKey,
        reason: statusKey === 'away' ? 'Stepped away temporarily' : '',
      });
      toast.success(`You are now marked as ${statusKey}`);
    } catch (err) {
      toast.error('Failed to update status');
      fetchAvailability(); // rollback
    }
  };

  // Submit status with reason modal
  const handleCustomStatusSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingStatus(true);
    const isAvail = targetStatus === 'available';

    try {
      await availabilityService.update(currentUser._id, {
        isAvailable: isAvail,
        availabilityStatus: targetStatus,
        reason: statusReason,
      });
      handleMemberStatusChange({
        userId: currentUser._id,
        isAvailable: isAvail,
        availabilityStatus: targetStatus,
      });
      setShowStatusModal(false);
      setStatusReason('');
      toast.success(`Status updated to ${targetStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          m.fullName?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.department?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterStatus !== 'all' && m.availabilityStatus !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [members, search, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Page Title & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-primary-600" />
            Availability Control Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Toggle your availability status instantly. Changes persist to MongoDB and broadcast across the team in real time.
          </p>
        </div>

        <button
          onClick={fetchAvailability}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 self-start sm:self-auto hover:bg-gray-50 transition-colors"
          title="Sync latest from server"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* User's Own Quick-Status Action Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white dark:from-indigo-950/30 dark:via-gray-900 dark:to-gray-900 border border-indigo-100 dark:border-indigo-900/60 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={getAvatarUrl(currentUser)}
                alt={currentUser?.fullName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary-500/20"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                  currentUser?.availabilityStatus === 'available'
                    ? 'bg-green-500'
                    : currentUser?.availabilityStatus === 'away'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  {currentUser?.fullName}
                </h3>
                <AvailabilityBadge status={currentUser?.availabilityStatus} size="sm" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Current mode: <strong className="capitalize text-gray-800 dark:text-gray-200">{currentUser?.availabilityStatus}</strong> (Boolean state: {currentUser?.isAvailable ? 'true' : 'false'})
              </p>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleQuickStatus('available')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentUser?.availabilityStatus === 'available'
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/25 ring-2 ring-green-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-green-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Available
            </button>

            <button
              onClick={() => handleQuickStatus('unavailable')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentUser?.availabilityStatus === 'unavailable'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25 ring-2 ring-red-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-red-50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Mark Unavailable
            </button>

            <button
              onClick={() => handleQuickStatus('away')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentUser?.availabilityStatus === 'away'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 ring-2 ring-amber-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Mark Away
            </button>

            <button
              onClick={() => setShowStatusModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Set Note / Reason
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member availability..."
            className="input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input text-xs py-2 w-full sm:w-36"
          >
            <option value="all">All States</option>
            <option value="available">Available only</option>
            <option value="unavailable">Unavailable only</option>
            <option value="away">Away only</option>
          </select>
        </div>
      </div>

      {/* Team Availability Table */}
      <div className="overflow-x-auto rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50/80 dark:bg-gray-800/60 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th scope="col" className="px-6 py-4">Team Member</th>
              <th scope="col" className="px-6 py-4">Current Availability</th>
              <th scope="col" className="px-6 py-4">Boolean DB Value</th>
              <th scope="col" className="px-6 py-4">Last Status Change</th>
              <th scope="col" className="px-6 py-4 text-right">Toggle Switch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-400">
                  Loading real-time availability states...
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-400">
                  No members matched current filter criteria.
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => {
                const isSelf = currentUser?._id === m._id;
                const canEdit = isSelf || isAdmin;

                return (
                  <tr
                    key={m._id}
                    className={`hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors ${
                      isSelf ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(m)}
                          alt={m.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                              {m.fullName}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {m.department || 'General'} • {m.designation || 'Team Member'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <AvailabilityBadge status={m.availabilityStatus} size="md" />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                        m.isAvailable ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        isAvailable: {m.isAvailable ? 'true' : 'false'}
                      </code>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(m.updatedAt || m.lastActiveAt)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end">
                        <AvailabilityToggle
                          userId={m._id}
                          isAvailable={m.isAvailable}
                          availabilityStatus={m.availabilityStatus}
                          canEdit={canEdit}
                          onStatusChange={handleMemberStatusChange}
                          showLabels={true}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Set Custom Status & Reason Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Set Availability & Reason Note
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              State notes will be recorded in the team activity timeline for audit transparency.
            </p>

            <form onSubmit={handleCustomStatusSubmit} className="space-y-4">
              <div>
                <label className="label text-xs">Target Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetStatus('available')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      targetStatus === 'available'
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetStatus('unavailable')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      targetStatus === 'unavailable'
                        ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Unavailable
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetStatus('away')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      targetStatus === 'away'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Away
                  </button>
                </div>
              </div>

              <div>
                <label className="label text-xs">Reason / Context (Optional)</label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. In customer demo call until 3 PM"
                  className="input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="btn-primary text-xs"
                >
                  {savingStatus ? 'Saving...' : 'Apply Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
