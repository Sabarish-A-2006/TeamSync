import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email.');
    }, 600);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Reset password
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter your registered email address to receive password recovery instructions
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Check your inbox
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We have dispatched recovery instructions to{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>.
            </p>
          </div>
          <Link
            to="/login"
            className="btn-primary inline-flex items-center gap-2 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      ) : (
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
                placeholder="sarah@company.com"
                className="input pl-9 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
