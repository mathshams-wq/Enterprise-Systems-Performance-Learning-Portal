import React, { useState } from 'react';
import {
  X,
  Lock,
  UserCheck,
  Shield,
  KeyRound,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { TeamMember } from '../types';
import {
  getTeamMembers,
  loginWithOfficialId,
  updateMemberPassword,
} from '../services/storageService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember | null;
  onLoginSuccess: (user: TeamMember) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'quick-select' | 'change-password'>('login');
  const [officialId, setOfficialId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // For change password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const members = getTeamMembers();

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      if (!officialId.trim()) {
        setError('Please enter your Official ID');
        return;
      }
      if (!password.trim()) {
        setError('Please enter your password');
        return;
      }

      const user = loginWithOfficialId(officialId, password);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickSelect = (member: TeamMember) => {
    const pwd = member.password || (member.role === 'admin' ? 'admin' : 'pass');
    try {
      const user = loginWithOfficialId(member.id, pwd);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentUser) {
      setError('You must be logged in to change password.');
      return;
    }
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      updateMemberPassword(currentUser.id, newPassword);
      setSuccessMsg('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccessMsg(null);
        setMode('login');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {currentUser ? 'User Profile & Switcher' : 'Team Member Sign In'}
              </h3>
              <p className="text-xs text-slate-400">
                Enterprise Systems Roster (19 Official Members)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/50 p-1 text-xs">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-center rounded-lg font-medium transition-colors ${
              mode === 'login'
                ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Official ID Login
          </button>
          <button
            onClick={() => {
              setMode('quick-select');
              setError(null);
            }}
            className={`py-2 text-center rounded-lg font-medium transition-colors ${
              mode === 'quick-select'
                ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quick Select (19)
          </button>
          <button
            onClick={() => {
              setMode('change-password');
              setError(null);
            }}
            className={`py-2 text-center rounded-lg font-medium transition-colors ${
              mode === 'change-password'
                ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Password Settings
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode 1: Manual Login */}
          {mode === 'login' && (
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Official Employee ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    placeholder="e.g. 15103001 or 15103328"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                    autoFocus
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-slate-500">
                    ID
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 3 User Types Fast Access Cards */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Choose Account Role to Test:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Card 1: Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      const admin = members.find((m) => m.role === 'admin') || members[0];
                      handleQuickSelect(admin);
                    }}
                    className="p-2.5 rounded-xl bg-amber-950/30 hover:bg-amber-950/60 border border-amber-600/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                        Admin
                      </span>
                      <span className="text-[10px] text-amber-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate">Shamsuddin</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                      Full control: manage all data, roster, LOVs & sync
                    </div>
                  </button>

                  {/* Card 2: User */}
                  <button
                    type="button"
                    onClick={() => {
                      const user = members.find((m) => m.id === '15103328') || members.find((m) => m.role !== 'admin' && m.role !== 'viewer') || members[1];
                      if (user) handleQuickSelect(user);
                    }}
                    className="p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-600/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        User
                      </span>
                      <span className="text-[10px] text-emerald-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate">Tariqul Islam</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                      Only entry: inputs & views only his own data
                    </div>
                  </button>

                  {/* Card 3: Viewer */}
                  <button
                    type="button"
                    onClick={() => {
                      const viewer = members.find((m) => m.role === 'viewer') || members.find((m) => m.id === '15103999');
                      if (viewer) handleQuickSelect(viewer);
                    }}
                    className="p-2.5 rounded-xl bg-sky-950/30 hover:bg-sky-950/60 border border-sky-600/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/20 px-1.5 py-0.2 rounded border border-sky-500/30">
                        Viewer
                      </span>
                      <span className="text-[10px] text-sky-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate">Executive Auditor</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                      Sees all data & dashboard, downloads Excel/PDF
                    </div>
                  </button>
                </div>
              </div>

              {/* Default password tip */}
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                  <span>3 User Role Credentials:</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-5 space-y-0.5">
                  <div>• <strong>Admin (Full control):</strong> ID <code className="text-amber-300 font-bold">15103001</code> / Password: <code className="text-amber-300 font-bold">admin</code></div>
                  <div>• <strong>User (Entry only):</strong> ID <code className="text-emerald-300 font-bold">15103328</code> / Password: <code className="text-emerald-300 font-bold">pass</code></div>
                  <div>• <strong>Viewer (View & Download):</strong> ID <code className="text-sky-300 font-bold">15103999</code> / Password: <code className="text-sky-300 font-bold">view</code></div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In to Portal</span>
              </button>
            </form>
          )}

          {/* Mode 2: Quick Select Persona */}
          {mode === 'quick-select' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-3">
                Select any team member, auditor, or administrator to switch accounts instantly:
              </p>
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                {members.map((m) => {
                  const isCurrent = currentUser?.id === m.id;
                  const roleBadge =
                    m.role === 'admin'
                      ? { label: 'Admin (Full)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
                      : m.role === 'viewer'
                      ? { label: 'Viewer (Read & Download)', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' }
                      : { label: 'User (Entry Only)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };

                  return (
                    <button
                      key={m.id}
                      onClick={() => handleQuickSelect(m)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-sky-950/50 border-sky-600/50 text-sky-100'
                          : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            m.role === 'admin'
                              ? 'bg-amber-600 text-white'
                              : m.role === 'viewer'
                              ? 'bg-sky-600 text-white'
                              : 'bg-emerald-700 text-white'
                          }`}
                        >
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-100">{m.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${roleBadge.color}`}>
                              {roleBadge.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[260px]">
                            {m.designation} • ID: {m.id}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-sky-400 hover:underline shrink-0">
                        {isCurrent ? 'Current' : 'Select →'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 3: Change Password */}
          {mode === 'change-password' && (
            <div className="space-y-4">
              {currentUser ? (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-xs">
                    <span className="text-slate-400">Updating password for: </span>
                    <strong className="text-slate-200">{currentUser.name}</strong> (ID: {currentUser.id})
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 4 characters"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all mt-2"
                  >
                    Save New Password
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Please log in with your Official ID first to change your password.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
