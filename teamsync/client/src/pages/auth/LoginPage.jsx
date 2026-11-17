import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      let msg = 'Invalid email or password.';
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

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter your credentials to access your team dashboard
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label text-xs">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="input pl-9 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label text-xs mb-0">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-9 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2 text-sm font-semibold"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Credentials Helper */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center mb-2.5">
          First time here?
        </p>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
          <p className="mb-2">
            Register a new account or sign in with any existing registered credentials. The first user created automatically receives <span className="font-bold text-primary-600">Admin</span> privileges!
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@teamsync.dev', 'Password123!')}
              className="flex-1 py-1 px-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 text-center"
            >
              Admin Preset
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('member@teamsync.dev', 'Password123!')}
              className="flex-1 py-1 px-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 text-center"
            >
              Member Preset
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        Don't have an account yet?{' '}
        <Link
          to="/register"
          className="font-bold text-primary-600 hover:text-primary-700"
        >
          Sign up now
        </Link>
      </div>
    </div>
  );
}
