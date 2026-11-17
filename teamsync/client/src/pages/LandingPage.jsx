import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Shield,
  Activity,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Bell,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  // Interactive demo preview state
  const [demoMembers, setDemoMembers] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Lead Architect',
      dept: 'Engineering',
      status: 'available',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'Alex Rivera',
      role: 'Full Stack Dev',
      dept: 'Product',
      status: 'unavailable',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'Elena Rostova',
      role: 'UI/UX Designer',
      dept: 'Design',
      status: 'away',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  ]);

  const toggleDemoMember = (id) => {
    setDemoMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextStatus = m.status === 'available' ? 'unavailable' : 'available';
        return { ...m, status: nextStatus };
      })
    );
  };

  const availableCount = demoMembers.filter((m) => m.status === 'available').length;
  const availabilityPct = Math.round((availableCount / demoMembers.length) * 100);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-slate-900 dark:text-gray-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-lg shadow-indigo-500/25">
              <Layers className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
              Team<span className="text-primary-600">Sync</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-primary-600 transition-colors">Live Preview</a>
            <a href="#benefits" className="hover:text-primary-600 transition-colors">Benefits</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary text-sm flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm flex items-center gap-1.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Real-Time Availability Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]"
          >
            Your Team. Your Time.{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              One Connected Workspace.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-normal leading-relaxed"
          >
            Track availability, coordinate better, and know exactly who's ready to collaborate with instant Socket.IO state synchronization and MongoDB persistence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-indigo-600/30 flex items-center gap-2 text-base transition-all hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo"
              className="px-6 py-3.5 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-base transition-colors"
            >
              Explore Features
            </a>
          </motion.div>
        </div>

        {/* Live Interactive Preview Card */}
        <div id="demo" className="mt-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Live Team Availability Simulator
                  </h3>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Interactive
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Click any toggle switch below to test real-time optimistic state change and instant recalculation.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Team Availability
                  </span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {availabilityPct}% Ready
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {availableCount}/{demoMembers.length}
                </div>
              </div>
            </div>

            {/* Simulated Member Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex flex-col justify-between transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                      />
                      <div>
                        <h4 className="font-semibold text-xs text-gray-900 dark:text-white">
                          {m.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {m.role}
                        </p>
                      </div>
                    </div>

                    {/* Toggle button */}
                    <button
                      type="button"
                      onClick={() => toggleDemoMember(m.id)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        m.status === 'available'
                          ? 'bg-green-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          m.status === 'available' ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60 text-xs">
                    <span className="text-gray-400 text-[11px]">{m.dept}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        m.status === 'available'
                          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                          : m.status === 'away'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {m.status === 'available' ? 'Available' : m.status === 'away' ? 'Away' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50/70 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-600">
              Powerful Core Capabilities
            </h2>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              Everything Your Organization Needs to Coordinate Availability
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                Instant Socket.IO Real-Time Sync
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Whenever a colleague flips their availability toggle, all connected users across the organization see the change immediately without page refreshes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                Robust Role-Based Security
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Full JWT authentication with bcrypt password hashing. Users can only toggle their own availability; admins retain centralized management authority.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                Audited Activity History
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Every single state transition is persisted in a dedicated MongoDB history collection with exact timestamps, previous states, and optional reasons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary-600">
            Simple 3-Step Flow
          </h2>
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            How TeamSync Streamlines Your Day
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <span className="text-4xl font-black text-indigo-100 dark:text-indigo-950 mb-4 block">01</span>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Sign In & Set Status
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Log in to your dashboard. With a single click or switch, toggle between Available, Unavailable, or Away.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <span className="text-4xl font-black text-indigo-100 dark:text-indigo-950 mb-4 block">02</span>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Instant Sync & Audit
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The backend validates your request, commits to MongoDB, creates an audit record, and broadcasts via Socket.IO.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <span className="text-4xl font-black text-indigo-100 dark:text-indigo-950 mb-4 block">03</span>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Collaborate Without Friction
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Teammates and leaders immediately know whether you are ready for calls, urgent reviews, or focused deep work.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to Connect Your Team's Schedule?
          </h2>
          <p className="text-indigo-100 max-w-xl mx-auto mb-8 text-base">
            Start tracking availability in real time today. Zero setup hassle, full enterprise security.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white text-primary-600 hover:bg-gray-50 shadow-xl transition-transform hover:scale-105 text-base"
          >
            Create Your Account Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-gray-900 dark:text-white">TeamSync</span>
            <span>— Team Availability Management Platform</span>
          </div>
          <p>© 2026 TeamSync. Production-grade MERN Stack Application.</p>
        </div>
      </footer>
    </div>
  );
}
