import React, { useState } from 'react';
import { Server, Lock, User, KeyRound, Loader2, ShieldCheck, AlertCircle, Smartphone, ArrowLeft, Sparkles, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, setupAdmin, setupRequired, deviceId } = useAuth();
  const [username, setUsername] = useState(setupRequired ? 'admin' : 'demo-admin');
  const [password, setPassword] = useState('demo-password');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2Fa, setRequires2Fa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (setupRequired) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await setupAdmin(username, password);
      } else if (requires2Fa) {
        if (!totpCode || totpCode.trim().length !== 6) {
          throw new Error('Please enter a valid 6-digit Google Authenticator code.');
        }
        const res = await login(username, password, totpCode.trim());
        if (res.requires_2fa) {
          throw new Error('Invalid Google Authenticator code.');
        }
      } else {
        const res = await login(username, password);
        if (res.requires_2fa) {
          setRequires2Fa(true);
          setTotpCode('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'viewer') => {
    setError(null);
    setIsSubmitting(true);
    try {
      const u = role === 'admin' ? 'demo-admin' : 'demo-viewer';
      await login(u, 'demo-password');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setRequires2Fa(false);
    setTotpCode('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950">
      <div className="w-full max-w-md card bg-surface-100/80 border-surface-300/50 p-8 shadow-2xl space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
            {requires2Fa ? (
              <Smartphone className="w-6 h-6 text-white" />
            ) : (
              <Server className="w-6 h-6 text-white" />
            )}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {setupRequired
              ? 'Initialize Server Admin'
              : requires2Fa
              ? 'Two-Factor Authentication'
              : 'Home Server Management'}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {setupRequired
              ? 'Create the primary administrator credentials'
              : requires2Fa
              ? 'Enter the 6-digit code from Google Authenticator'
              : 'Sign in to access telemetry and server controls'}
          </p>
        </div>

        {/* Demo Quick Access Buttons */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-purple-500/10 border border-brand-500/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>1-Click Interactive Demo Access</span>
          </div>
          <p className="text-[11px] text-slate-400">
            No registration needed. Test all features and telemetry immediately:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/30"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemo('viewer')}
              className="py-2 px-2.5 rounded-lg bg-surface-700 hover:bg-surface-600 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-surface-600"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Viewer Demo</span>
            </button>
          </div>
        </div>

        {/* Security Assurance Banner */}
        <div className="p-3 rounded-lg bg-surface-50/70 border border-surface-300/30 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Strict Layered Security • Zero Raw Command Shells</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {!requires2Fa ? (
            <>
              <div className="space-y-1.5">
                <label className="text-slate-300 block">Username / Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username or email"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-50/80 border border-surface-300/40 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-50/80 border border-surface-300/40 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {setupRequired && (
                <div className="space-y-1.5">
                  <label className="text-slate-300 block">Confirm Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-50/80 border border-surface-300/40 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 block text-center">Google Authenticator 6-Digit Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-brand-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    autoFocus
                    autoComplete="one-time-code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-9 pr-4 py-3 text-center tracking-[0.4em] text-lg font-bold rounded-lg bg-surface-50/90 border border-brand-500/50 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Open Google Authenticator on your phone to view your 6-digit code.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-surface-700 hover:bg-surface-600 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-surface-600"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>
                {setupRequired
                  ? 'Complete Admin Setup'
                  : requires2Fa
                  ? 'Verify Code & Enter'
                  : 'Sign in with Credentials'}
              </span>
            )}
          </button>

          {requires2Fa && (
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full py-2 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to username & password</span>
            </button>
          )}

          {/* Device Identity & Rate Limit Notice */}
          <div className="pt-3 border-t border-surface-300/30 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span title={`Device ID: ${deviceId}`} className="truncate max-w-[210px]">
              Device: {deviceId.length > 22 ? deviceId.slice(0, 20) + '...' : deviceId}
            </span>
            <span className="text-slate-400">Limit: 5 tries / 15m</span>
          </div>
        </form>
      </div>
    </div>
  );
};
