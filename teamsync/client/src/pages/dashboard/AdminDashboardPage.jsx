import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  UserPlus,
  Trash2,
  Edit,
  FolderPlus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { userService, teamService, authService } from '../../services';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { user: currentUser, isAdmin } = useAuth();

  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);

  // Forms
  const [newMember, setNewMember] = useState({
    fullName: '',
    email: '',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    department: 'Engineering',
    designation: 'Software Engineer',
    role: 'member',
  });

  const [newTeam, setNewTeam] = useState({
    teamName: '',
    description: '',
    department: 'Engineering',
  });

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [uRes, tRes] = await Promise.all([
        userService.getAllUsers({ limit: 100 }),
        teamService.getAll(),
      ]);
      setMembers(uRes.data.data.users || []);
      setTeams(tRes.data.data.teams || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to load administrative records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
          You must have administrator privileges to view and configure this panel.
        </p>
      </div>
    );
  }

  // Handle Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await authService.register(newMember);
      toast.success(`Member "${newMember.fullName}" created successfully!`);
      setShowAddMemberModal(false);
      setNewMember({
        fullName: '',
        email: '',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        department: 'Engineering',
        designation: 'Software Engineer',
        role: 'member',
      });
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  // Handle Create Team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await teamService.create(newTeam);
      toast.success(`Team "${newTeam.teamName}" created successfully!`);
      setShowCreateTeamModal(false);
      setNewTeam({ teamName: '', description: '', department: 'Engineering' });
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    }
  };

  // Handle Role Change
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await userService.updateUser(userId, { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m._id === userId ? { ...m, role: newRole } : m))
      );
      toast.success('Member role updated!');
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  // Handle Delete Member
  const handleDeleteMember = async () => {
    if (!deleteTargetUser) return;
    try {
      await userService.deleteUser(deleteTargetUser._id);
      setMembers((prev) => prev.filter((m) => m._id !== deleteTargetUser._id));
      toast.success(`Removed ${deleteTargetUser.fullName}`);
    } catch (err) {
      toast.error('Failed to remove member');
    } finally {
      setDeleteTargetUser(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
            Admin Operations Panel
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage organization members, departments, roles, and teams with full elevated privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>

          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Create Team
          </button>

          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase">
            Total Staff Count
          </span>
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            {members.length}
          </h3>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase">
            Registered Teams
          </span>
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            {teams.length}
          </h3>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase">
            Admin Accounts
          </span>
          <h3 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {members.filter((m) => m.role === 'admin').length}
          </h3>
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">
            Active Workspace Teams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teams.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      {t.teamName}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold">
                      Code: {t.inviteCode || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {t.description || 'No description provided.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                  <span>{t.department || 'General'}</span>
                  <span>{t.members?.length || 0} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member Management Table */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter members..."
              className="input pl-9 text-xs"
            />
          </div>
          <span className="text-xs text-gray-400">
            Showing {filteredMembers.length} of {members.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50/80 dark:bg-gray-800/60 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Department & Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Access Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredMembers.map((m) => {
                const isSelf = currentUser?._id === m._id;

                return (
                  <tr key={m._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(m)}
                          alt={m.fullName}
                          className="w-9 h-9 rounded-full object-cover"
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
                          <span className="text-xs text-gray-400">{m.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="font-medium text-gray-800 dark:text-gray-200 block">
                        {m.department || 'General'}
                      </span>
                      <span className="text-gray-400">{m.designation || 'Team Member'}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <AvailabilityBadge status={m.availabilityStatus} size="sm" />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={m.role}
                        disabled={isSelf}
                        onChange={(e) => handleUpdateRole(m._id, e.target.value)}
                        className={`text-xs font-semibold py-1 px-2 rounded-lg border focus:outline-none ${
                          m.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                            : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {!isSelf && (
                        <button
                          onClick={() => setDeleteTargetUser(m)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Add New Team Member
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Create an account for a new colleague with default credentials.
            </p>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="label text-xs">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label text-xs">Email *</label>
                <input
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs">Department</label>
                  <select
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="input text-xs"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">HR</option>
                  </select>
                </div>

                <div>
                  <label className="label text-xs">Role</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="input text-xs"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-xs">Designation</label>
                <input
                  type="text"
                  value={newMember.designation}
                  onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label text-xs">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value, confirmPassword: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Create New Workspace Team
            </h3>

            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div>
                <label className="label text-xs">Team Name *</label>
                <input
                  type="text"
                  required
                  value={newTeam.teamName}
                  onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                  placeholder="e.g. Core Platform Guild"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label text-xs">Department</label>
                <input
                  type="text"
                  value={newTeam.department}
                  onChange={(e) => setNewTeam({ ...newTeam, department: e.target.value })}
                  placeholder="Engineering"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label text-xs">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Team mission and focus..."
                  rows={3}
                  className="input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTargetUser}
        title="Remove Team Member"
        message={`Are you certain you wish to delete ${deleteTargetUser?.fullName}? This removes their profile and disassociates them from all teams.`}
        confirmText="Delete Account"
        isDanger={true}
        onConfirm={handleDeleteMember}
        onCancel={() => setDeleteTargetUser(null)}
      />
    </div>
  );
}
