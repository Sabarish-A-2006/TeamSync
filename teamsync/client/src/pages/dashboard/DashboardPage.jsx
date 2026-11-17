import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { dashboardService } from '../../services';
import StatisticsCard from '../../components/common/StatisticsCard';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import { StatSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { timeAgo, getAvatarUrl } from '../../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const { latestEvent } = useSocket();

  const [stats, setStats] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllStats = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const [sRes, tRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTeamStats(),
      ]);
      setStats(sRes.data.data);
      setTeamStats(tRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  // Real-time automatic refresh when Socket.IO availability changes
  useEffect(() => {
    if (latestEvent?.type === 'availability:updated') {
      fetchAllStats();
    }
  }, [latestEvent]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      </div>
    );
  }

  const total = stats?.totalMembers || 0;
  const available = stats?.available || 0;
  const unavailable = stats?.unavailable || 0;
  const away = stats?.away || 0;
  const pct = stats?.availabilityPercentage || 0;

  // Chart data
  const pieData = [
    { name: 'Available', value: available, color: '#16A34A' },
    { name: 'Unavailable', value: unavailable, color: '#DC2626' },
    { name: 'Away', value: away, color: '#D97706' },
  ].filter((d) => d.value > 0);

  const deptData = (teamStats?.departmentStats || []).map((d) => ({
    name: d._id || 'Unassigned',
    available: d.available,
    unavailable: d.unavailable,
    away: d.away,
    total: d.total,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Real-Time Availability Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.fullName}!
            </h1>
            <p className="text-sm text-indigo-100 mt-2 leading-relaxed">
              Your team is currently <strong className="text-white underline decoration-emerald-400 decoration-2">{pct}% available</strong> for syncs, sprints, and collaboration today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchAllStats(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold flex items-center gap-2 border border-white/20 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Metrics
            </button>
            <Link
              to="/dashboard/availability"
              className="px-5 py-2.5 rounded-xl bg-white text-primary-700 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-transform hover:scale-[1.02] flex items-center gap-1.5"
            >
              Manage Availability
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Total Team Members"
          value={total}
          icon={Users}
          colorScheme="primary"
          subtitle="Registered members"
        />

        <StatisticsCard
          title="Available Members"
          value={available}
          percentage={total > 0 ? Math.round((available / total) * 100) : 0}
          icon={CheckCircle2}
          colorScheme="green"
          subtitle="Ready for collaboration"
        />

        <StatisticsCard
          title="Unavailable Members"
          value={unavailable}
          percentage={total > 0 ? Math.round((unavailable / total) * 100) : 0}
          icon={XCircle}
          colorScheme="red"
          subtitle="Busy / Off-duty"
        />

        <StatisticsCard
          title="Away Members"
          value={away}
          percentage={total > 0 ? Math.round((away / total) * 100) : 0}
          icon={Clock}
          colorScheme="amber"
          subtitle="Temporary away status"
        />
      </div>

      {/* Analytics Charts & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability Distribution Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Availability Ratio
              </h3>
              <span className="text-xs font-semibold text-gray-400">
                {total} Total
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Real-time proportion of active team availability states.
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: '#1E293B',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-gray-400">No member data recorded yet.</p>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-green-600 block">Available</span>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">{available}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-red-600 block">Unavailable</span>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">{unavailable}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-600 block">Away</span>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">{away}</span>
            </div>
          </div>
        </div>

        {/* Department-wise Availability Breakdown Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Department Availability
              </h3>
              <Building className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Available vs Unavailable headcounts mapped across operational departments.
            </p>
          </div>

          <div className="h-56 w-full">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: '#1E293B',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="available" name="Available" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="unavailable" name="Unavailable" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="away" name="Away" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Department metrics will populate as team members register.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-600" />
              Latest Status Transitions
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live chronological feed of team members toggling their availability.
            </p>
          </div>
          <Link
            to="/dashboard/history"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            Full History
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {(stats?.recentActivity || []).length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No status changes recorded yet. Toggle your availability above to generate the first activity!
            </div>
          ) : (
            (stats?.recentActivity || []).map((item) => (
              <div
                key={item._id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getAvatarUrl(item.userId)}
                    alt={item.userId?.fullName || 'User'}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {item.userId?.fullName || 'Unknown User'}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      Changed status to{' '}
                      <strong className="text-gray-700 dark:text-gray-200 capitalize">
                        {item.newStatus}
                      </strong>
                      {item.reason ? ` • "${item.reason}"` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <AvailabilityBadge status={item.newStatus} size="sm" />
                  <span className="text-[11px] text-gray-400 hidden sm:inline">
                    {timeAgo(item.changedAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
