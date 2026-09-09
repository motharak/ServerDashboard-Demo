import {
  LiveDashboardSnapshot, SystemInfo, CpuInfo, MemoryInfo,
  StorageInfo, TemperatureInfo, NetworkInfo, PowerInfo,
  PortInfo, FirewallInfo, ServiceItem, DockerInfo,
  ProcessItem, ConfirmationTokenResponse, User,
  Preferences, SshUsageInfo, AuthAttempt, DeviceStatus
} from '../types';
import { mockEngine } from './mockEngine';

let inMemoryAccessToken: string | null = 'demo-jwt-token-xyz-123';

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function getOrCreateDeviceId(): string {
  return 'demo_client_browser_session';
}

const delay = (ms: number = 60) => new Promise(res => setTimeout(res, ms));

export const api = {
  // Auth
  getDeviceId: () => getOrCreateDeviceId(),
  getAuthStatus: async () => {
    await delay(30);
    return { setup_required: false };
  },
  refreshToken: async () => {
    await delay(30);
    const user = mockEngine.getCurrentUser();
    return {
      access_token: 'demo-refreshed-token-999',
      role: user.role,
      username: user.username,
      token_type: 'bearer'
    };
  },
  getDeviceStatus: async (): Promise<DeviceStatus> => {
    await delay(20);
    return {
      device_id: getOrCreateDeviceId(),
      is_locked_out: false,
      remaining_attempts: 5,
      lockout_seconds: 0,
      max_attempts: 5
    };
  },
  getAuthAttempts: async (_limit: number = 50): Promise<AuthAttempt[]> => {
    await delay(30);
    return [
      {
        id: 1,
        device_id: 'demo_client_browser_session',
        ip_address: '192.168.1.45',
        username: 'demo-admin',
        success: true,
        user_agent: navigator.userAgent,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 2,
        device_id: 'dev_unknown_scanner',
        ip_address: '45.133.1.20',
        username: 'root',
        success: false,
        failure_reason: 'Invalid credentials - rejected by policy',
        user_agent: 'libcurl/7.81.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString()
      }
    ];
  },
  setupAdmin: async (username: string, _password: string) => {
    await delay(60);
    mockEngine.login('admin');
    return { access_token: 'demo-admin-token', role: 'admin', username };
  },
  login: async (username: string, _password: string, _totp_code?: string) => {
    await delay(60);
    const role: 'admin' | 'read_only' = username.toLowerCase().includes('viewer') ? 'read_only' : 'admin';
    mockEngine.login(role);
    setAccessToken('demo-token-' + role);
    return {
      access_token: 'demo-token-' + role,
      role,
      username: username || 'demo-admin',
      requires_2fa: false,
      device_id: getOrCreateDeviceId()
    };
  },
  getGoogleConfig: async () => ({ enabled: false }),
  loginWithGoogle: async (_credential: string) => {
    await delay(60);
    mockEngine.login('admin');
    return { access_token: 'demo-google-token', role: 'admin', username: 'google-demo-user' };
  },
  get2FaStatus: async () => ({ is_totp_enabled: false }),
  setup2Fa: async () => ({
    secret: 'JBSWY3DPEHPK3PXP',
    otpauth_url: 'otpauth://totp/HomeServer:admin?secret=JBSWY3DPEHPK3PXP&issuer=HomeServer',
    qr_code_svg: ''
  }),
  enable2Fa: async (_secret: string, _code: string) => ({ success: true, message: '2FA simulated successfully' }),
  disable2Fa: async (_password: string, _code?: string) => ({ success: true, message: '2FA disabled (simulated)' }),
  logout: async () => {
    await delay(30);
    mockEngine.logout();
    setAccessToken(null);
    return { message: 'Logged out successfully' };
  },
  getMe: async (): Promise<User> => {
    await delay(20);
    return mockEngine.getCurrentUser();
  },

  // System & Overview
  getOverview: async (): Promise<LiveDashboardSnapshot> => {
    await delay(10);
    return mockEngine.generateSnapshot();
  },
  getSystem: async (): Promise<SystemInfo> => {
    await delay(20);
    return mockEngine.generateSnapshot().system;
  },
  getCpu: async (): Promise<CpuInfo> => {
    await delay(20);
    return mockEngine.generateSnapshot().cpu;
  },
  getMemory: async (): Promise<MemoryInfo> => {
    await delay(20);
    return mockEngine.generateSnapshot().memory;
  },
  getStorage: async (): Promise<StorageInfo> => {
    await delay(20);
    return mockEngine.generateSnapshot().storage;
  },
  getTemperature: async (): Promise<TemperatureInfo> => {
    await delay(20);
    return mockEngine.generateSnapshot().temperature;
  },
  getNetwork: async (): Promise<NetworkInfo> => {
    await delay(20);
    return mockEngine.generateSnapshot().network;
  },
  getPower: async (): Promise<PowerInfo> => {
    await delay(20);
    return mockEngine.generateSnapshot().power;
  },

  // Services
  getServices: async (): Promise<ServiceItem[]> => {
    await delay(30);
    return mockEngine.getServices();
  },
  requestServiceAction: async (name: string, action: string): Promise<ConfirmationTokenResponse> => {
    await delay(40);
    return mockEngine.requestServiceAction(name, action);
  },
  confirmServiceAction: async (name: string, action: string, token: string) => {
    await delay(50);
    return mockEngine.confirmServiceAction(name, action, token);
  },

  // Ports
  getPorts: async (): Promise<PortInfo[]> => {
    await delay(30);
    return mockEngine.getPorts();
  },

  // Firewall
  getFirewall: async (): Promise<FirewallInfo> => {
    await delay(30);
    return mockEngine.getFirewall();
  },

  // Docker
  getDocker: async (): Promise<DockerInfo> => {
    await delay(30);
    return mockEngine.getDocker();
  },

  // Processes
  getProcesses: async (sort = 'cpu'): Promise<ProcessItem[]> => {
    await delay(30);
    return mockEngine.getProcesses(sort);
  },
  requestKillProcess: async (pid: number): Promise<ConfirmationTokenResponse> => {
    await delay(40);
    return mockEngine.requestKillProcess(pid);
  },
  confirmKillProcess: async (pid: number, token: string) => {
    await delay(50);
    return mockEngine.confirmKillProcess(pid, token);
  },

  // Logs
  getLogs: async (params: { lines?: number; unit?: string; priority?: string; search?: string }) => {
    await delay(40);
    return mockEngine.getLogs(params);
  },

  // Control
  requestReboot: async (): Promise<ConfirmationTokenResponse> => {
    await delay(40);
    return mockEngine.requestReboot();
  },
  confirmReboot: async (token: string) => {
    await delay(50);
    return mockEngine.confirmReboot(token);
  },
  requestShutdown: async (): Promise<ConfirmationTokenResponse> => {
    await delay(40);
    return mockEngine.requestShutdown();
  },
  confirmShutdown: async (token: string) => {
    await delay(50);
    return mockEngine.confirmShutdown(token);
  },

  // History
  getHistory: async (range = '1h') => {
    await delay(30);
    return mockEngine.getHistory(range);
  },

  // Preferences & Operational Thresholds
  getPreferences: async (): Promise<Preferences> => {
    await delay(20);
    return mockEngine.getPreferences();
  },
  updatePreferences: async (data: Preferences) => {
    await delay(40);
    const updated = mockEngine.updatePreferences(data);
    return { success: true, message: 'Settings saved in demo memory', preferences: updated };
  },

  // SSH Remote Access
  getSshUsage: async (): Promise<SshUsageInfo> => {
    await delay(20);
    return mockEngine.generateSnapshot().ssh!;
  },
};
