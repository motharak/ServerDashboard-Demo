import React, { useState, useEffect } from 'react';
import {
  Settings, Shield, User, DollarSign, Bell, Save, Check,
  Smartphone, KeyRound, Copy, CheckCheck, Loader2, AlertCircle, X, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AuthAttempt, DeviceStatus } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, deviceId } = useAuth();
  const [saved, setSaved] = useState(false);

  // Device Security & Attempt Limiting State
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [authAttempts, setAuthAttempts] = useState<AuthAttempt[]>([]);
  const [showAttempts, setShowAttempts] = useState(false);

  // 2FA state
  const [isTotpEnabled, setIsTotpEnabled] = useState<boolean>(!!user?.is_totp_enabled);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; otpauth_url: string; qr_code_svg: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Preferences
  const [pricePerKwh, setPricePerKwh] = useState('0.15');
  const [currency, setCurrency] = useState('$');
  const [tempWarn, setTempWarn] = useState('75');
  const [tempCrit, setTempCrit] = useState('85');
  const [diskWarn, setDiskWarn] = useState('85');
  const [cpuWarn, setCpuWarn] = useState('85');
  const [ramWarn, setRamWarn] = useState('90');
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [prefError, setPrefError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const p = await api.getPreferences();
        setPricePerKwh(p.electricity_price_per_kwh.toString());
        setCurrency(p.currency);
        setTempWarn(p.temp_warning_max.toString());
        setTempCrit(p.temp_critical_max.toString());
        setDiskWarn(p.storage_warning_pct.toString());
        setCpuWarn(p.cpu_warning_pct.toString());
        setRamWarn(p.ram_warning_pct.toString());
      } catch (err) {
        console.error('Failed to load operational preferences', err);
      }
    }
    async function loadDeviceSecurity() {
      try {
        const [status, attempts] = await Promise.all([
          api.getDeviceStatus(),
          api.getAuthAttempts(15)
        ]);
        setDeviceStatus(status);
        setAuthAttempts(attempts);
      } catch (err) {
        console.error('Failed to load device security info', err);
      }
    }
    loadPreferences();
    loadDeviceSecurity();
  }, []);

  useEffect(() => {
    async function load2FaStatus() {
      try {
        const res = await api.get2FaStatus();
        setIsTotpEnabled(res.is_totp_enabled);
      } catch (err) {
        console.error('Failed to load 2FA status', err);
      }
    }
    load2FaStatus();
  }, [user]);

  const handleStart2FaSetup = async () => {
    setModalError(null);
    setModalSuccess(null);
    setVerifyCode('');
    setCopiedSecret(false);
    setModalLoading(true);
    setSetupModalOpen(true);
    try {
      const data = await api.setup2Fa();
      setSetupData(data);
    } catch (err: any) {
      setModalError(err.message || 'Failed to initialize 2FA setup');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmEnable2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData || verifyCode.trim().length !== 6) {
      setModalError('Please enter a valid 6-digit code.');
      return;
    }
    setModalError(null);
    setModalLoading(true);
    try {
      await api.enable2Fa(setupData.secret, verifyCode.trim());
      setIsTotpEnabled(true);
      await refreshUser();
      setModalSuccess('Google Authenticator 2FA successfully enabled!');
      setTimeout(() => {
        setSetupModalOpen(false);
        setSetupData(null);
        setModalSuccess(null);
      }, 1500);
    } catch (err: any) {
      setModalError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDisable2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      setModalError('Please enter your account password.');
      return;
    }
    setModalError(null);
    setModalLoading(true);
    try {
      await api.disable2Fa(disablePassword);
      setIsTotpEnabled(false);
      await refreshUser();
      setDisableModalOpen(false);
      setDisablePassword('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to disable 2FA');
    } finally {
      setModalLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefError(null);
    setIsSavingPreferences(true);
    try {
      await api.updatePreferences({
        electricity_price_per_kwh: parseFloat(pricePerKwh) || 0.15,
        currency: currency.trim() || '$',
        temp_warning_max: parseFloat(tempWarn) || 75.0,
        temp_critical_max: parseFloat(tempCrit) || 85.0,
        storage_warning_pct: parseFloat(diskWarn) || 85.0,
        cpu_warning_pct: parseFloat(cpuWarn) || 85.0,
        ram_warning_pct: parseFloat(ramWarn) || 90.0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setPrefError(err.message || 'Failed to save operational preferences.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* User Session Profile Card */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-brand-500" />
          <h3 className="text-sm font-semibold text-white">Active Session Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30">
            <span className="text-[10px] text-slate-400 block uppercase">Username / Email</span>
            <span className="font-bold text-white mt-1 block truncate">{user?.email || user?.username}</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30">
            <span className="text-[10px] text-slate-400 block uppercase">Role Authority</span>
            <span className="badge-emerald mt-1">{user?.role?.toUpperCase()}</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30">
            <span className="text-[10px] text-slate-400 block uppercase">2FA Protection</span>
            <span className={isTotpEnabled ? "badge-emerald mt-1" : "badge-amber mt-1"}>
              {isTotpEnabled ? 'ENABLED (TOTP)' : 'DISABLED'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 block uppercase">Noted Device ID</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(deviceId);
                  setCopiedDeviceId(true);
                  setTimeout(() => setCopiedDeviceId(false), 2000);
                }}
                className="text-slate-400 hover:text-white"
                title="Copy Device ID"
              >
                {copiedDeviceId ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-bold text-slate-200 mt-1 block truncate font-mono text-[11px]" title={deviceId}>
              {deviceId}
            </span>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication (Google Authenticator) Card */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-surface-300/30 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-brand-500" />
            <div>
              <h3 className="text-sm font-semibold text-white">Two-Factor Authentication (Google Authenticator)</h3>
              <p className="text-xs text-slate-400">
                Enhance your server security with time-based one-time passcodes (TOTP) from Google Authenticator, Aegis, or Authy.
              </p>
            </div>
          </div>
          {isTotpEnabled ? (
            <span className="badge-emerald flex items-center gap-1.5 text-xs py-1 px-2.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Protected
            </span>
          ) : (
            <span className="badge-amber flex items-center gap-1.5 text-xs py-1 px-2.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Unprotected
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-50/50 border border-surface-300/30">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-white block">
              {isTotpEnabled
                ? 'Google Authenticator 2FA is currently active'
                : 'Google Authenticator 2FA is currently disabled'}
            </span>
            <p className="text-[11px] text-slate-400 font-mono">
              {isTotpEnabled
                ? 'Every sign-in session requires your password and a 6-digit verification code.'
                : 'Protect administrative commands and telemetry against credential leaks.'}
            </p>
          </div>

          <div>
            {isTotpEnabled ? (
              <button
                type="button"
                onClick={() => { setModalError(null); setDisablePassword(''); setDisableModalOpen(true); }}
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold font-mono transition-colors flex items-center gap-1.5"
              >
                <span>Disable 2FA</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart2FaSetup}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold font-mono transition-colors shadow-lg shadow-brand-600/20 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Configure Google Authenticator</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Device Identity & Login Attempt Rate Limiter Card */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-surface-300/30 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-500" />
            <div>
              <h3 className="text-sm font-semibold text-white">Device Identity & Attempt Limit Protection</h3>
              <p className="text-xs text-slate-400">
                Prevents brute-force authentication attacks by tracking sign-in attempts per unique device ID and client IP.
              </p>
            </div>
          </div>
          <span className="badge-emerald font-mono text-xs">
            MAX 5 TRIES / 15 MIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30">
            <span className="text-[10px] text-slate-400 block uppercase">Device Status</span>
            <span className={deviceStatus?.is_locked_out ? "badge-rose mt-1" : "badge-emerald mt-1"}>
              {deviceStatus?.is_locked_out ? 'TEMPORARILY LOCKED OUT' : 'AUTHORIZED / CLEAR'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30">
            <span className="text-[10px] text-slate-400 block uppercase">Remaining Attempts</span>
            <span className="text-base font-bold text-white mt-1 block">
              {deviceStatus?.remaining_attempts ?? 5} / {deviceStatus?.max_attempts ?? 5}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-surface-50/50 border border-surface-300/30">
            <span className="text-[10px] text-slate-400 block uppercase">Lockout Duration</span>
            <span className="font-bold text-slate-300 mt-1 block">15 minutes</span>
          </div>
        </div>

        {/* Recent Authentication Attempts Log */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Recent Sign-in Attempts (Noted by Device)
            </span>
            <button
              type="button"
              onClick={() => setShowAttempts(!showAttempts)}
              className="text-xs text-brand-500 hover:text-brand-400 font-mono"
            >
              {showAttempts ? 'Hide Log' : `View Recent (${authAttempts.length})`}
            </button>
          </div>

          {showAttempts && (
            <div className="overflow-x-auto rounded-lg border border-surface-300/30">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface-200/50 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">User</th>
                    <th className="p-2.5">Device ID</th>
                    <th className="p-2.5">IP Address</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-300/20 bg-surface-50/30">
                  {authAttempts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">No recorded login attempts yet.</td>
                    </tr>
                  ) : (
                    authAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-surface-100/50 transition-colors">
                        <td className="p-2.5 text-slate-400 whitespace-nowrap">{new Date(att.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2.5 font-bold text-white truncate max-w-[120px]">{att.username}</td>
                        <td className="p-2.5 text-slate-300 truncate max-w-[160px]" title={att.device_id}>
                          {att.device_id.length > 20 ? att.device_id.slice(0, 18) + '...' : att.device_id}
                        </td>
                        <td className="p-2.5 text-slate-400">{att.ip_address}</td>
                        <td className="p-2.5">
                          {att.success ? (
                            <span className="badge-emerald text-[10px]">SUCCESS</span>
                          ) : att.failure_reason === 'locked_out' ? (
                            <span className="badge-rose text-[10px]">LOCKED OUT</span>
                          ) : (
                            <span className="badge-amber text-[10px]">{att.failure_reason?.toUpperCase() || 'FAILED'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Setup 2FA Modal */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md card bg-surface-100 border-surface-300 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-surface-300/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Setup Google Authenticator</h3>
              </div>
              <button
                onClick={() => setSetupModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalLoading && !setupData ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                <span className="text-xs font-mono">Generating secure 2FA secret...</span>
              </div>
            ) : setupData ? (
              <form onSubmit={handleConfirmEnable2Fa} className="space-y-4 text-xs font-mono">
                {/* Step 1: Scan QR Code */}
                <div className="space-y-2 text-center">
                  <span className="text-[11px] text-slate-300 block font-sans">
                    1. Scan this QR code with Google Authenticator on your phone:
                  </span>
                  <div className="p-3 bg-white rounded-xl inline-block shadow-lg mx-auto">
                    <div
                      className="w-44 h-44 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: setupData.qr_code_svg }}
                    />
                  </div>
                </div>

                {/* Step 2: Secret String Fallback */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Or enter manual key in authenticator:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={setupData.secret}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-50 border border-surface-300/40 text-slate-300 text-xs select-all text-center tracking-widest font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(setupData.secret)}
                      className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-200 border border-surface-300/40 text-slate-300 transition-colors"
                      title="Copy Key"
                    >
                      {copiedSecret ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Step 3: Enter 6-digit verification code */}
                <div className="space-y-1.5 pt-2 border-t border-surface-300/30">
                  <label className="text-slate-300 block font-sans">
                    2. Enter the 6-digit code shown in your app to confirm:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    autoFocus
                    placeholder="123456"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-center text-base tracking-[0.3em] font-bold rounded-lg bg-surface-50 border border-brand-500/50 text-white focus:outline-none focus:border-brand-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSetupModalOpen(false)}
                    className="px-3 py-2 rounded-lg bg-surface-50 hover:bg-surface-200 text-slate-400 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading || verifyCode.length !== 6}
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-brand-600/20"
                  >
                    {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Verify & Activate 2FA</span>
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm card bg-surface-100 border-surface-300 p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-surface-300/40 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Disable 2FA Protection</h3>
              </div>
              <button
                onClick={() => setDisableModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <p className="text-xs text-slate-300 font-mono">
              Please enter your dashboard account password to confirm disabling Google Authenticator two-factor authentication.
            </p>

            <form onSubmit={handleDisable2Fa} className="space-y-3 font-mono text-xs">
              <input
                type="password"
                required
                autoFocus
                placeholder="Account password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50 border border-surface-300/40 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-200 text-slate-400 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !disablePassword}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Disable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard Preferences Form */}
      <form onSubmit={handleSave} className="card space-y-6">
        <div className="flex items-center gap-2 border-b border-surface-300/30 pb-3">
          <Settings className="w-5 h-5 text-brand-500" />
          <h3 className="text-sm font-semibold text-white">Operational Preferences & Thresholds</h3>
        </div>

        {/* Section 1: Electricity Pricing */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Electricity & Energy Rates
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">Electricity Rate per kWh</label>
              <input
                type="number"
                step="0.01"
                value={pricePerKwh}
                onChange={(e) => setPricePerKwh(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">Currency Symbol</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Alert Thresholds */}
        <div className="space-y-3 pt-3 border-t border-surface-300/30">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Bell className="w-4 h-4 text-amber-400" />
            Telemetry Thresholds
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">Thermal Warning (°C)</label>
              <input
                type="number"
                value={tempWarn}
                onChange={(e) => setTempWarn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">Thermal Critical (°C)</label>
              <input
                type="number"
                value={tempCrit}
                onChange={(e) => setTempCrit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">Storage Warning (%)</label>
              <input
                type="number"
                value={diskWarn}
                onChange={(e) => setDiskWarn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">CPU Warning (%)</label>
              <input
                type="number"
                value={cpuWarn}
                onChange={(e) => setCpuWarn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">RAM Warning (%)</label>
              <input
                type="number"
                value={ramWarn}
                onChange={(e) => setRamWarn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-50/80 border border-surface-300/40 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {prefError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{prefError}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          {saved && (
            <span className="badge-emerald flex items-center gap-1.5 text-xs py-1 px-3">
              <Check className="w-3.5 h-3.5" /> Operational preferences saved & applied
            </span>
          )}
          {!saved && <div />}

          <button
            type="submit"
            disabled={isSavingPreferences}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-brand-600/20"
          >
            {isSavingPreferences ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingPreferences ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
