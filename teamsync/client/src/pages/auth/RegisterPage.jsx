import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Building, Key, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    teamInviteCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      let msg = 'Registration failed. Please try again.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        msg = 'Cannot connect to TeamSync backend server. Please make sure the backend is running.';
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Create an account
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Join your team workspace and manage your availability
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
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
              placeholder="Sarah Connor"
              className="input pl-9 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="label text-xs">Work Email *</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="sarah@company.com"
              className="input pl-9 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <label className="label text-xs">Designation / Role</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Software Engineer"
                className="input pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 chars"
                className="input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label text-xs">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="input pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label text-xs">
            Team Invitation Code <span className="text-gray-400">(Optional)</span>
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="teamInviteCode"
              value={formData.teamInviteCode}
              onChange={handleChange}
              placeholder="e.g. A9B2C4"
              className="input pl-9 text-xs uppercase"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-4 text-sm font-semibold"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Team Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-primary-600 hover:text-primary-700"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
