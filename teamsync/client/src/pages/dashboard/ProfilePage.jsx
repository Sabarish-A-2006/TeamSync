import React, { useState } from 'react';
import {
  User,
  Mail,
  Building,
  Briefcase,
  Clock,
  Globe,
  MessageSquare,
  Save,
  CheckCircle2,
  Camera,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services';
import { getAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    designation: user?.designation || '',
    department: user?.department || '',
    statusMessage: user?.statusMessage || '',
    profileImage: user?.profileImage || '',
    workingHoursStart: user?.workingHours?.start || '09:00',
    workingHoursEnd: user?.workingHours?.end || '17:00',
    timezone: user?.timezone || 'UTC',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const payload = {
        fullName: formData.fullName,
        designation: formData.designation,
        department: formData.department,
        statusMessage: formData.statusMessage,
        profileImage: formData.profileImage,
        workingHours: {
          start: formData.workingHoursStart,
          end: formData.workingHoursEnd,
        },
        timezone: formData.timezone,
      };

      const res = await userService.updateUser(user._id, payload);
      const updated = res.data.data.user;
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPreset = (url) => {
    setFormData((prev) => ({ ...prev, profileImage: url }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-primary-600" />
          My Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal identity, team department, status message, and working schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card Header */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={formData.profileImage || getAvatarUrl(user)}
              alt="Avatar preview"
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-50 dark:ring-indigo-950 shadow-md"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {formData.fullName || 'User Profile'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {user?.email} • Role: <strong className="uppercase text-primary-600">{user?.role}</strong>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                {formData.department || 'General'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {formData.designation || 'Team Member'}
              </span>
            </div>
          </div>
        </div>

        {/* General Information Fields */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs">Email Address (Read-Only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="input pl-9 text-xs bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-75"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs">Department</label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input pl-9 text-xs"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">HR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label text-xs">Designation / Role Title</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="input pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label text-xs">Profile Picture URL</label>
            <input
              type="url"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label text-xs">Personal Status Message</label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="statusMessage"
                value={formData.statusMessage}
                onChange={handleChange}
                placeholder="e.g. Working on Q4 Architecture Review 🚀"
                className="input pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Working Hours & Timezone */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">
            Working Hours & Time Zone
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label text-xs">Shift Starts</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  name="workingHoursStart"
                  value={formData.workingHoursStart}
                  onChange={handleChange}
                  className="input pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs">Shift Ends</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  name="workingHoursEnd"
                  value={formData.workingHoursEnd}
                  onChange={handleChange}
                  className="input pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs">Time Zone</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="input pl-9 text-xs"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
