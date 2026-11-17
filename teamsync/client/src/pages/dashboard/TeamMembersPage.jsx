import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  UserPlus,
  ArrowUpDown,
} from 'lucide-react';
import { userService } from '../../services';
import UserCard from '../../components/common/UserCard';
import UserTable from '../../components/common/UserTable';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';

export default function TeamMembersPage() {
  const { latestEvent } = useSocket();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'available' | 'unavailable' | 'away'
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'recent' | 'status'

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers({ limit: 100 });
      setUsers(res.data.data.users || []);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Listen to Socket.IO live updates to instantly update state
  useEffect(() => {
    if (latestEvent?.type === 'availability:updated') {
      const { userId, isAvailable, availabilityStatus, updatedAt } = latestEvent.data;
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, isAvailable, availabilityStatus, updatedAt: updatedAt || new Date() }
            : u
        )
      );
    }
  }, [latestEvent]);

  // Handle immediate local state change from toggle
  const handleMemberStatusChange = (updates) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === updates.userId ? { ...u, ...updates } : u))
    );
  };

  // Derive distinct department list
  const departments = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [users]);

  // Filtered and sorted members
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = u.fullName?.toLowerCase().includes(q);
          const matchEmail = u.email?.toLowerCase().includes(q);
          const matchDept = u.department?.toLowerCase().includes(q);
          const matchDesig = u.designation?.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchDept && !matchDesig) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (u.availabilityStatus !== statusFilter) return false;
        }

        // Department filter
        if (departmentFilter !== 'all') {
          if (u.department !== departmentFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return (a.fullName || '').localeCompare(b.fullName || '');
        }
        if (sortBy === 'recent') {
          return new Date(b.updatedAt || b.lastActiveAt || 0) - new Date(a.updatedAt || a.lastActiveAt || 0);
        }
        if (sortBy === 'status') {
          return (a.availabilityStatus || '').localeCompare(b.availabilityStatus || '');
        }
        return 0;
      });
  }, [users, searchQuery, statusFilter, departmentFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary-600" />
            Team Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse all registered colleagues, inspect roles, and check real-time availability.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={fetchMembers}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, department..."
            className="input pl-9 text-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-xs py-2 w-32"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="away">Away</option>
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="input text-xs py-2 w-36"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input text-xs py-2 w-32"
          >
            <option value="name">Sort: Name</option>
            <option value="recent">Sort: Recent</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      {/* Member Counter Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span>
          Showing <strong>{filteredUsers.length}</strong> of{' '}
          <strong>{users.length}</strong> members
        </span>
        {(searchQuery || statusFilter !== 'all' || departmentFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDepartmentFilter('all');
            }}
            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Content: Grid or Table */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
            No team members matched your criteria
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status filters, or department filters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => (
            <UserCard
              key={u._id}
              user={u}
              onStatusChange={handleMemberStatusChange}
            />
          ))}
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onStatusChange={handleMemberStatusChange}
        />
      )}
    </div>
  );
}
