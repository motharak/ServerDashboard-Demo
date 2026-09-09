import {
  LiveDashboardSnapshot, SystemInfo, CpuInfo, MemoryInfo,
  StorageInfo, TemperatureInfo, NetworkInfo, PowerInfo,
  PortInfo, FirewallInfo, ServiceItem, DockerInfo,
  ProcessItem, ConfirmationTokenResponse, User,
  Preferences, SshUsageInfo, AuthAttempt, DeviceStatus
} from '../types';

// Initial System Hardware Definition
const SYSTEM_DEF: SystemInfo = {
  hostname: 'home-server-node-01',
  os_name: 'Ubuntu 24.04.1 LTS (Noble Numbat)',
  kernel: '6.8.0-40-generic',
  uptime_seconds: 423891,
  uptime_human: '4d 21h 44m',
  current_time: new Date().toISOString(),
  server_ip: '192.168.1.120',
  primary_interface: 'enp4s0',
  internet_connected: true,
  platform: 'Linux x86_64',
};

// Initial Services
let initialServices: ServiceItem[] = [
  { name: 'nginx.service', description: 'A high performance web server and reverse proxy server', status: 'running', enabled_at_boot: true, pid: 1120, cpu_pct: 0.8, memory_bytes: 44040192, uptime: '4d 21h', restart_count: 0 },
  { name: 'docker.service', description: 'Docker Application Container Engine', status: 'running', enabled_at_boot: true, pid: 1482, cpu_pct: 2.1, memory_bytes: 192937984, uptime: '4d 21h', restart_count: 0 },
  { name: 'tailscaled.service', description: 'Tailscale node agent mesh VPN', status: 'running', enabled_at_boot: true, pid: 982, cpu_pct: 0.3, memory_bytes: 39845888, uptime: '4d 21h', restart_count: 0 },
  { name: 'pihole-FTL.service', description: 'Pi-hole FTLDNS engine and ad-blocking resolver', status: 'running', enabled_at_boot: true, pid: 1040, cpu_pct: 0.6, memory_bytes: 56623104, uptime: '4d 21h', restart_count: 0 },
  { name: 'ssh.service', description: 'OpenBSD Secure Shell server daemon', status: 'running', enabled_at_boot: true, pid: 890, cpu_pct: 0.1, memory_bytes: 14680064, uptime: '4d 21h', restart_count: 0 },
  { name: 'systemd-resolved.service', description: 'Network Name Resolution daemon', status: 'running', enabled_at_boot: true, pid: 672, cpu_pct: 0.1, memory_bytes: 18874368, uptime: '4d 21h', restart_count: 0 },
  { name: 'ufw.service', description: 'Uncomplicated firewall packet filtering daemon', status: 'running', enabled_at_boot: true, pid: 710, cpu_pct: 0.0, memory_bytes: 12582912, uptime: '4d 21h', restart_count: 0 },
  { name: 'cron.service', description: 'Regular background program processing daemon', status: 'running', enabled_at_boot: true, pid: 804, cpu_pct: 0.1, memory_bytes: 8388608, uptime: '4d 21h', restart_count: 0 },
  { name: 'avahi-daemon.service', description: 'Avahi mDNS/DNS-SD Stack', status: 'running', enabled_at_boot: true, pid: 820, cpu_pct: 0.1, memory_bytes: 9437184, uptime: '4d 21h', restart_count: 0 },
  { name: 'postgresql.service', description: 'PostgreSQL RDBMS Database server', status: 'stopped', enabled_at_boot: false, restart_count: 0 },
  { name: 'cups.service', description: 'CUPS Scheduler print daemon', status: 'stopped', enabled_at_boot: false, restart_count: 0 },
  { name: 'smartmontools.service', description: 'Self-Monitoring and Reporting Technology (SMART) Daemon', status: 'running', enabled_at_boot: true, pid: 894, cpu_pct: 0.1, memory_bytes: 11534336, uptime: '4d 21h', restart_count: 0 },
];

// Initial Docker Containers
let initialContainers = [
  {
    id: 'c7f91a0293e8',
    name: 'plex-media-server',
    image: 'linuxserver/plex:latest',
    status: 'Up 4 days (healthy)',
    state: 'running',
    uptime: '4 days',
    cpu_pct: 3.6,
    memory_usage_bytes: 880803840,
    memory_limit_bytes: 34359738368,
    ports: ['0.0.0.0:32400->32400/tcp', ':::32400->32400/tcp'],
    restart_policy: 'unless-stopped'
  },
  {
    id: 'a1b2c3d4e5f6',
    name: 'vaultwarden',
    image: 'vaultwarden/server:latest',
    status: 'Up 4 days (healthy)',
    state: 'running',
    uptime: '4 days',
    cpu_pct: 0.2,
    memory_usage_bytes: 47185920,
    memory_limit_bytes: 1073741824,
    ports: ['127.0.0.1:8080->80/tcp'],
    restart_policy: 'always'
  },
  {
    id: 'f8e7d6c5b4a3',
    name: 'home-assistant',
    image: 'ghcr.io/home-assistant/home-assistant:stable',
    status: 'Up 4 days (healthy)',
    state: 'running',
    uptime: '4 days',
    cpu_pct: 1.9,
    memory_usage_bytes: 432013312,
    memory_limit_bytes: 4294967296,
    ports: ['0.0.0.0:8123->8123/tcp', ':::8123->8123/tcp'],
    restart_policy: 'unless-stopped'
  },
  {
    id: 'd4e5f6a1b2c3',
    name: 'nextcloud-app',
    image: 'nextcloud:29-fpm',
    status: 'Up 3 days',
    state: 'running',
    uptime: '3 days',
    cpu_pct: 1.1,
    memory_usage_bytes: 293601280,
    memory_limit_bytes: 2147483648,
    ports: ['127.0.0.1:9000->9000/tcp'],
    restart_policy: 'unless-stopped'
  },
  {
    id: '998877665544',
    name: 'adguard-home',
    image: 'adguard/adguardhome:latest',
    status: 'Exited (0) 2 days ago',
    state: 'stopped',
    uptime: '0s',
    cpu_pct: 0.0,
    memory_usage_bytes: 0,
    memory_limit_bytes: 1073741824,
    ports: ['0.0.0.0:53->53/udp', '0.0.0.0:3000->3000/tcp'],
    restart_policy: 'no'
  }
];

// Initial Processes
let initialProcesses: ProcessItem[] = [
  { pid: 1482, name: 'dockerd', user: 'root', cpu_pct: 2.1, memory_pct: 0.6, memory_bytes: 192937984, runtime: '117:42:10', command: '/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock', status: 'S' },
  { pid: 2891, name: 'Plex Media Server', user: 'plex', cpu_pct: 3.6, memory_pct: 2.6, memory_bytes: 880803840, runtime: '109:12:04', command: '/usr/lib/plexmediaserver/Plex Media Server', status: 'S' },
  { pid: 3104, name: 'python3', user: 'homeassistant', cpu_pct: 1.9, memory_pct: 1.3, memory_bytes: 432013312, runtime: '98:20:15', command: 'python3 -m homeassistant --config /config', status: 'S' },
  { pid: 1120, name: 'nginx: worker process', user: 'www-data', cpu_pct: 0.8, memory_pct: 0.1, memory_bytes: 44040192, runtime: '42:15:30', command: 'nginx: worker process', status: 'S' },
  { pid: 1040, name: 'pihole-FTL', user: 'pihole', cpu_pct: 0.6, memory_pct: 0.2, memory_bytes: 56623104, runtime: '117:40:01', command: '/usr/bin/pihole-FTL -f', status: 'S' },
  { pid: 982, name: 'tailscaled', user: 'root', cpu_pct: 0.3, memory_pct: 0.1, memory_bytes: 39845888, runtime: '117:44:19', command: '/usr/sbin/tailscaled --state=/var/lib/tailscale/tailscaled.state', status: 'S' },
  { pid: 1, name: 'systemd', user: 'root', cpu_pct: 0.1, memory_pct: 0.1, memory_bytes: 18874368, runtime: '117:45:00', command: '/sbin/init', status: 'S' },
  { pid: 672, name: 'systemd-resolved', user: 'systemd-resolve', cpu_pct: 0.1, memory_pct: 0.1, memory_bytes: 18874368, runtime: '117:44:50', command: '/lib/systemd/systemd-resolved', status: 'S' },
  { pid: 890, name: 'sshd', user: 'root', cpu_pct: 0.1, memory_pct: 0.0, memory_bytes: 14680064, runtime: '02:14:10', command: 'sshd: rakzi [priv]', status: 'S' },
  { pid: 4102, name: 'vaultwarden', user: 'vaultwarden', cpu_pct: 0.2, memory_pct: 0.1, memory_bytes: 47185920, runtime: '117:10:20', command: '/vaultwarden', status: 'S' },
  { pid: 4890, name: 'php-fpm8.3', user: 'www-data', cpu_pct: 0.4, memory_pct: 0.4, memory_bytes: 134217728, runtime: '82:30:10', command: 'php-fpm: pool www', status: 'S' },
  { pid: 5120, name: 'containerd', user: 'root', cpu_pct: 0.5, memory_pct: 0.2, memory_bytes: 75497472, runtime: '117:42:00', command: '/usr/bin/containerd', status: 'S' },
  { pid: 7420, name: 'node', user: 'serverdash', cpu_pct: 0.3, memory_pct: 0.3, memory_bytes: 98566144, runtime: '04:12:00', command: 'node /opt/server-dashboard/agent.js', status: 'S' },
  { pid: 8104, name: 'journald', user: 'root', cpu_pct: 0.2, memory_pct: 0.1, memory_bytes: 33554432, runtime: '117:44:00', command: '/lib/systemd/systemd-journald', status: 'S' },
  { pid: 9012, name: 'cron', user: 'root', cpu_pct: 0.0, memory_pct: 0.0, memory_bytes: 8388608, runtime: '117:43:00', command: '/usr/sbin/cron -f', status: 'S' },
];

// Initial Journal Logs
let initialLogs = [
  { timestamp: new Date(Date.now() - 1000 * 120).toISOString(), host: 'home-server-node-01', process: 'systemd[1]', level: 'INFO', message: 'Starting Periodic Command Scheduler...' },
  { timestamp: new Date(Date.now() - 1000 * 95).toISOString(), host: 'home-server-node-01', process: 'dockerd[1482]', level: 'INFO', message: 'Container c7f91a0293e8 (plex-media-server) health status healthy' },
  { timestamp: new Date(Date.now() - 1000 * 80).toISOString(), host: 'home-server-node-01', process: 'tailscaled[982]', level: 'INFO', message: 'magicsock: derp-9 connected; latency=22.4ms' },
  { timestamp: new Date(Date.now() - 1000 * 60).toISOString(), host: 'home-server-node-01', process: 'nginx[1120]', level: 'INFO', message: '192.168.1.45 - - [GET /api/system/overview HTTP/2.0] 200 4892' },
  { timestamp: new Date(Date.now() - 1000 * 45).toISOString(), host: 'home-server-node-01', process: 'kernel', level: 'INFO', message: 'nvme0n1: format status 0, metadata 0, lba size 512' },
  { timestamp: new Date(Date.now() - 1000 * 30).toISOString(), host: 'home-server-node-01', process: 'sshd[890]', level: 'INFO', message: 'Accepted publickey for rakzi from 192.168.1.45 port 58210 ssh2: ED25519' },
  { timestamp: new Date(Date.now() - 1000 * 15).toISOString(), host: 'home-server-node-01', process: 'pihole-FTL[1040]', level: 'INFO', message: 'Gravity database query completed: 2,145,890 domains blocked' },
  { timestamp: new Date(Date.now() - 1000 * 5).toISOString(), host: 'home-server-node-01', process: 'smartd[894]', level: 'INFO', message: 'Device: /dev/nvme0n1, SMART Prefailure Attribute: 1 Temperature Celsius 39' },
];

export type ScenarioType = 'normal' | 'cpu_spike' | 'thermal_alert' | 'network_burst';

class MockEngine {
  private listeners: ((snapshot: LiveDashboardSnapshot) => void)[] = [];
  private currentScenario: ScenarioType = 'normal';
  private scenarioTimeout: any = null;

  // Mutable in-memory state
  private services = [...initialServices];
  private containers = [...initialContainers];
  private processes = [...initialProcesses];
  private logs = [...initialLogs];
  private userRole: 'admin' | 'read_only' = 'admin';
  private loggedIn = true;
  private tickInterval: any = null;
  private logInterval: any = null;
  private uptimeSeconds = 423891;

  private preferences: Preferences = {
    electricity_price_per_kwh: 0.19,
    currency: 'USD',
    temp_warning_max: 80,
    temp_critical_max: 95,
    storage_warning_pct: 85,
    cpu_warning_pct: 90,
    ram_warning_pct: 85,
  };

  constructor() {
    this.startTicker();
  }

  public setScenario(scenario: ScenarioType) {
    this.currentScenario = scenario;
    if (this.scenarioTimeout) clearTimeout(this.scenarioTimeout);

    if (scenario !== 'normal') {
      // Auto-revert after 30 seconds
      this.scenarioTimeout = setTimeout(() => {
        this.currentScenario = 'normal';
        this.addLog('systemd[1]', 'INFO', `Simulation scenario '${scenario}' completed. Restoring equilibrium.`);
      }, 30000);
      this.addLog('systemd[1]', 'WARNING', `Simulated test scenario initiated: ${scenario.toUpperCase()}`);
    } else {
      this.addLog('systemd[1]', 'INFO', 'Telemetry simulation reset to normal baseline.');
    }
  }

  public getScenario(): ScenarioType {
    return this.currentScenario;
  }

  public subscribe(cb: (snapshot: LiveDashboardSnapshot) => void) {
    this.listeners.push(cb);
    cb(this.generateSnapshot());
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    const snap = this.generateSnapshot();
    this.listeners.forEach(cb => cb(snap));
  }

  private startTicker() {
    this.tickInterval = setInterval(() => {
      this.uptimeSeconds += 1;
      this.notify();
    }, 1500);

    // Periodically append realistic system logs
    this.logInterval = setInterval(() => {
      const candidates = [
        { process: 'dockerd[1482]', level: 'INFO', message: 'Container health check pass: plex-media-server (pid 2891)' },
        { process: 'tailscaled[982]', level: 'INFO', message: 'peer [100.84.21.14] rx/tx ping heartbeat ok' },
        { process: 'nginx[1120]', level: 'INFO', message: `192.168.1.${Math.floor(Math.random() * 50 + 10)} - GET /status 200 OK` },
        { process: 'pihole-FTL[1040]', level: 'INFO', message: `Cached DNS query resolved: api.github.com in 1.2ms` },
        { process: 'kernel', level: 'INFO', message: `thermal thermal_zone0: temp 46000 mC, status OK` },
        { process: 'systemd[1]', level: 'INFO', message: `Reloading System Configuration and State Cache...` }
      ];
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      this.addLog(pick.process, pick.level, pick.message);
    }, 4500);
  }

  private addLog(process: string, level: string, message: string) {
    const entry = {
      timestamp: new Date().toISOString(),
      host: SYSTEM_DEF.hostname,
      process,
      level,
      message,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 300) {
      this.logs.pop();
    }
  }

  public generateSnapshot(): LiveDashboardSnapshot {
    const isSpike = this.currentScenario === 'cpu_spike';
    const isThermal = this.currentScenario === 'thermal_alert';
    const isNet = this.currentScenario === 'network_burst';

    // CPU jitter
    const baseCpu = isSpike ? 94.2 + (Math.random() * 3.5 - 1.5) : 22.4 + (Math.random() * 8.0 - 4.0);
    const cpuPct = Math.min(100, Math.max(5, parseFloat(baseCpu.toFixed(1))));

    const perCore = Array.from({ length: 16 }, (_, i) => {
      const coreUsage = Math.min(100, Math.max(4, isSpike ? 92 + Math.random() * 8 : cpuPct + (Math.random() * 24 - 12)));
      const freq = isSpike ? 4600 + Math.floor(Math.random() * 300) : 2200 + Math.floor(Math.random() * 1800);
      return {
        core_id: i,
        usage_pct: parseFloat(coreUsage.toFixed(1)),
        freq_mhz: freq,
      };
    });

    const load1 = isSpike ? 14.2 : 1.45 + (Math.random() * 0.3 - 0.15);
    const load5 = isSpike ? 9.8 : 1.38 + (Math.random() * 0.1 - 0.05);
    const load15 = isSpike ? 6.2 : 1.20;

    // Memory jitter
    const totalMem = 33554432000; // 32 GB
    const baseUsed = isSpike ? 24000000000 : 11428000000 + (Math.random() * 500000000 - 250000000);
    const usedMem = Math.floor(baseUsed);
    const cachedMem = 6871947673;
    const availMem = totalMem - usedMem;
    const memPct = parseFloat(((usedMem / totalMem) * 100).toFixed(1));

    // Power calculation scaling with CPU
    const baseWatts = isSpike ? 78.4 : 26.2 + (cpuPct * 0.22);
    const currentWatts = parseFloat((baseWatts + (Math.random() * 1.8 - 0.9)).toFixed(1));
    const cpuWatts = parseFloat((currentWatts * 0.65).toFixed(1));
    const dramWatts = parseFloat((currentWatts * 0.14).toFixed(1));

    // Temperature
    const pkgTemp = isThermal ? 87.5 + (Math.random() * 2 - 1) : isSpike ? 74.0 + (Math.random() * 3 - 1.5) : 46.5 + (Math.random() * 3 - 1.5);
    const tempStatus: 'normal' | 'warning' | 'critical' = pkgTemp >= 85 ? 'warning' : 'normal';

    // Network throughput
    const downloadSpeed = isNet ? 118400000 : 1420000 + Math.floor(Math.random() * 600000 - 300000); // 947 Mbps vs 11 Mbps
    const uploadSpeed = isNet ? 14500000 : 640000 + Math.floor(Math.random() * 200000 - 100000);

    // Health score
    let healthScore = 96;
    if (isThermal) healthScore = 74;
    else if (isSpike) healthScore = 82;

    const days = Math.floor(this.uptimeSeconds / 86400);
    const hours = Math.floor((this.uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((this.uptimeSeconds % 3600) / 60);

    const snapshot: LiveDashboardSnapshot = {
      system: {
        ...SYSTEM_DEF,
        uptime_seconds: this.uptimeSeconds,
        uptime_human: `${days}d ${hours}h ${minutes}m`,
        current_time: new Date().toISOString(),
      },
      cpu: {
        model: '13th Gen Intel(R) Core(TM) i7-13700H (16 Cores)',
        total_cores: 16,
        physical_cores: 14,
        usage_pct: cpuPct,
        per_core: perCore,
        load_avg: [parseFloat(load1.toFixed(2)), parseFloat(load5.toFixed(2)), parseFloat(load15.toFixed(2))],
        temperature_c: parseFloat(pkgTemp.toFixed(1)),
      },
      memory: {
        total_bytes: totalMem,
        used_bytes: usedMem,
        available_bytes: availMem,
        cached_bytes: cachedMem,
        swap_total_bytes: 8589934592,
        swap_used_bytes: 322122547,
        usage_pct: memPct,
        swap_pct: 3.7,
      },
      storage: {
        disks: [
          {
            device: '/dev/nvme0n1p2',
            mountpoint: '/',
            fstype: 'ext4',
            total_bytes: 983040000000,
            used_bytes: 284000000000,
            free_bytes: 699040000000,
            usage_pct: 28.9,
            read_speed_bytes_sec: 1420000,
            write_speed_bytes_sec: 4850000,
            temperature_c: 39,
            smart_status: 'PASSED',
            warning_level: 'normal'
          },
          {
            device: '/dev/sda1',
            mountpoint: '/mnt/storage',
            fstype: 'btrfs',
            total_bytes: 4000000000000,
            used_bytes: 2748000000000,
            free_bytes: 1252000000000,
            usage_pct: 68.7,
            read_speed_bytes_sec: 12800000,
            write_speed_bytes_sec: 1100000,
            temperature_c: 34,
            smart_status: 'PASSED',
            warning_level: 'normal'
          },
          {
            device: '/dev/sdb1',
            mountpoint: '/mnt/backup',
            fstype: 'ext4',
            total_bytes: 2000000000000,
            used_bytes: 1420000000000,
            free_bytes: 580000000000,
            usage_pct: 71.0,
            read_speed_bytes_sec: 0,
            write_speed_bytes_sec: 0,
            temperature_c: 31,
            smart_status: 'PASSED',
            warning_level: 'normal'
          }
        ]
      },
      temperature: {
        is_available: true,
        sensors: [
          { sensor_id: 'pkg_cpu', name: 'Package CPU (i7-13700H)', current_c: parseFloat(pkgTemp.toFixed(1)), min_c: 38, max_c: 89, avg_c: 51, status: tempStatus },
          { sensor_id: 'core_0', name: 'Core 0 (Performance)', current_c: parseFloat((pkgTemp - 1.2).toFixed(1)), min_c: 37, max_c: 88, avg_c: 49, status: tempStatus },
          { sensor_id: 'core_1', name: 'Core 1 (Performance)', current_c: parseFloat((pkgTemp + 0.8).toFixed(1)), min_c: 37, max_c: 89, avg_c: 50, status: tempStatus },
          { sensor_id: 'nvme_0', name: 'Samsung SSD 990 PRO 2TB', current_c: 39, min_c: 34, max_c: 56, avg_c: 41, status: 'normal' },
          { sensor_id: 'pch_0', name: 'Intel PCH Chipset', current_c: 44, min_c: 40, max_c: 52, avg_c: 43, status: 'normal' },
          { sensor_id: 'gpu_0', name: 'Intel Iris Xe Graphics', current_c: 41, min_c: 36, max_c: 62, avg_c: 42, status: 'normal' },
        ]
      },
      power: {
        is_available: true,
        is_real_metered: true,
        current_watts: currentWatts,
        cpu_package_watts: cpuWatts,
        dram_watts: dramWatts,
        system_watts: currentWatts,
        energy_today_kwh: 0.68,
        energy_yesterday_kwh: 0.71,
        energy_week_kwh: 4.82,
        energy_month_kwh: 20.4,
        projected_month_kwh: 22.8,
        total_meter_kwh: 412.8,
        cost_today: parseFloat((0.68 * this.preferences.electricity_price_per_kwh).toFixed(2)),
        cost_month: parseFloat((20.4 * this.preferences.electricity_price_per_kwh).toFixed(2)),
        estimated_cost_month: parseFloat((22.8 * this.preferences.electricity_price_per_kwh).toFixed(2)),
        price_per_kwh: this.preferences.electricity_price_per_kwh,
        currency: this.preferences.currency,
        power_source: 'AC Line Power',
        battery_level_pct: 100,
        history_days: [
          { date: 'Aug 27', kwh: 0.69, cost: 0.13, avg_watts: 28.7, peak_watts: 64.2 },
          { date: 'Aug 28', kwh: 0.72, cost: 0.14, avg_watts: 30.0, peak_watts: 71.0 },
          { date: 'Aug 29', kwh: 0.65, cost: 0.12, avg_watts: 27.1, peak_watts: 55.4 },
          { date: 'Aug 30', kwh: 0.68, cost: 0.13, avg_watts: 28.3, peak_watts: 62.1 },
          { date: 'Aug 31', kwh: 0.74, cost: 0.14, avg_watts: 30.8, peak_watts: 78.5 },
          { date: 'Sep 01', kwh: 0.67, cost: 0.13, avg_watts: 27.9, peak_watts: 58.0 },
          { date: 'Sep 02', kwh: 0.70, cost: 0.13, avg_watts: 29.2, peak_watts: 66.8 },
          { date: 'Sep 03', kwh: 0.71, cost: 0.13, avg_watts: 29.6, peak_watts: 69.4 },
          { date: 'Sep 04', kwh: 0.68, cost: 0.13, avg_watts: 28.3, peak_watts: 61.2 },
          { date: 'Sep 05', kwh: 0.69, cost: 0.13, avg_watts: 28.7, peak_watts: 63.5 },
          { date: 'Sep 06', kwh: 0.73, cost: 0.14, avg_watts: 30.4, peak_watts: 75.2 },
          { date: 'Sep 07', kwh: 0.66, cost: 0.13, avg_watts: 27.5, peak_watts: 57.0 },
          { date: 'Sep 08', kwh: 0.71, cost: 0.13, avg_watts: 29.6, peak_watts: 68.0 },
          { date: 'Today', kwh: 0.68, cost: 0.13, avg_watts: currentWatts, peak_watts: isSpike ? 82.4 : 59.2 },
        ]
      },
      network: {
        interfaces: [
          {
            name: 'enp4s0',
            status: 'UP',
            ip_address: '192.168.1.120',
            mac_address: 'e4:5f:01:8b:22:90',
            rx_bytes_sec: downloadSpeed,
            tx_bytes_sec: uploadSpeed,
            rx_total_bytes: 84930219482,
            tx_total_bytes: 39482019482,
            rx_packets_sec: Math.floor(downloadSpeed / 1200),
            tx_packets_sec: Math.floor(uploadSpeed / 1200),
          },
          {
            name: 'tailscale0',
            status: 'UP',
            ip_address: '100.84.21.14',
            mac_address: 'N/A',
            rx_bytes_sec: 42000,
            tx_bytes_sec: 38000,
            rx_total_bytes: 493021948,
            tx_total_bytes: 282019482,
            rx_packets_sec: 48,
            tx_packets_sec: 42,
          },
          {
            name: 'docker0',
            status: 'UP',
            ip_address: '172.17.0.1',
            mac_address: '02:42:e8:1b:99:a4',
            rx_bytes_sec: 210000,
            tx_bytes_sec: 180000,
            rx_total_bytes: 18493021948,
            tx_total_bytes: 14820194820,
            rx_packets_sec: 180,
            tx_packets_sec: 160,
          }
        ],
        total_download_speed: downloadSpeed,
        total_upload_speed: uploadSpeed,
      },
      health: {
        overall_score: healthScore,
        components: [
          { name: 'Processor', status: isSpike ? 'warning' : 'normal', score: isSpike ? 75 : 98, details: isSpike ? 'CPU usage at 94%, high execution load' : 'Load average within normal range (1.45 / 16 cores)' },
          { name: 'Memory', status: 'normal', score: 95, details: `34% allocated, ${(availMem / (1024 ** 3)).toFixed(1)} GB freely available` },
          { name: 'Storage', status: 'normal', score: 92, details: 'Mounts healthy, lowest headroom 29% free on /mnt/backup' },
          { name: 'Thermal', status: tempStatus, score: isThermal ? 65 : 99, details: isThermal ? `Package thermal alert at ${pkgTemp.toFixed(1)}°C (threshold 80°C)` : `Package at ${pkgTemp.toFixed(1)}°C, well below threshold` },
          { name: 'Power & Voltage', status: 'normal', score: 100, details: `Consuming ${currentWatts}W from AC line power` }
        ]
      },
      top_services: this.services.slice(0, 5),
      docker: {
        is_available: true,
        containers_count: this.containers.length,
        running_count: this.containers.filter(c => c.state === 'running').length,
        stopped_count: this.containers.filter(c => c.state !== 'running').length,
        containers: this.containers,
      },
      ssh: {
        is_active: true,
        port: 22,
        total_connections: 1,
        total_sessions: 1,
        sessions: [
          {
            user: 'rakzi',
            client_ip: '192.168.1.45',
            client_port: 58210,
            terminal: 'pts/0',
            session_type: 'ssh-interactive',
            started_at: '2 hours ago'
          }
        ]
      },
      recent_alerts: isThermal ? [
        { id: 'alt_1', title: 'Thermal Warning: CPU Package Exceeded 80°C', severity: 'warning', timestamp: 'Just now' }
      ] : []
    };

    return snapshot;
  }

  // Service operations
  public getServices(): ServiceItem[] {
    return [...this.services];
  }

  public requestServiceAction(name: string, action: string): ConfirmationTokenResponse {
    const token = 'tok_svc_' + Math.random().toString(36).substring(2, 10);
    return {
      token,
      action,
      target: name,
      expires_at: new Date(Date.now() + 60000).toISOString(),
      prompt: `Are you sure you want to ${action.toUpperCase()} systemd service '${name}'?`
    };
  }

  public confirmServiceAction(name: string, action: string, token: string): { message: string } {
    const svc = this.services.find(s => s.name === name);
    if (svc) {
      if (action === 'start') {
        svc.status = 'running';
        svc.uptime = 'Just started';
        svc.pid = Math.floor(Math.random() * 5000 + 1000);
      } else if (action === 'stop') {
        svc.status = 'stopped';
        svc.uptime = undefined;
        svc.pid = undefined;
        svc.cpu_pct = 0;
        svc.memory_bytes = 0;
      } else if (action === 'restart') {
        svc.status = 'running';
        svc.uptime = '0s';
        svc.restart_count = (svc.restart_count || 0) + 1;
      }
      this.addLog('systemd[1]', 'INFO', `Service '${name}' executed action '${action}'. New status: ${svc.status}`);
      this.notify();
    }
    return { message: `Service ${name} ${action} succeeded (simulated)` };
  }

  // Docker operations
  public getDocker(): DockerInfo {
    return {
      is_available: true,
      containers_count: this.containers.length,
      running_count: this.containers.filter(c => c.state === 'running').length,
      stopped_count: this.containers.filter(c => c.state !== 'running').length,
      containers: [...this.containers]
    };
  }

  // Process operations
  public getProcesses(sort: string = 'cpu'): ProcessItem[] {
    const procs = [...this.processes];
    if (sort === 'memory') {
      procs.sort((a, b) => b.memory_bytes - a.memory_bytes);
    } else {
      procs.sort((a, b) => b.cpu_pct - a.cpu_pct);
    }
    return procs;
  }

  public requestKillProcess(pid: number): ConfirmationTokenResponse {
    const proc = this.processes.find(p => p.pid === pid);
    const procName = proc ? proc.name : `PID ${pid}`;
    const token = 'tok_kill_' + Math.random().toString(36).substring(2, 10);
    return {
      token,
      action: 'kill',
      target: `${procName} (PID ${pid})`,
      expires_at: new Date(Date.now() + 60000).toISOString(),
      prompt: `Kill process '${procName}' (PID ${pid}) via SIGTERM signal?`
    };
  }

  public confirmKillProcess(pid: number, token: string): { message: string } {
    const idx = this.processes.findIndex(p => p.pid === pid);
    if (idx !== -1) {
      const killed = this.processes[idx];
      this.processes.splice(idx, 1);
      this.addLog('kernel', 'INFO', `Process ${killed.name} [PID ${pid}] terminated via SIGTERM confirmation.`);
      this.notify();
    }
    return { message: `Process ${pid} killed successfully` };
  }

  // Logs operations
  public getLogs(params: { lines?: number; unit?: string; priority?: string; search?: string }) {
    let result = [...this.logs];
    if (params.priority && params.priority !== 'all') {
      result = result.filter(l => l.level.toLowerCase() === params.priority?.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(l => l.message.toLowerCase().includes(q) || l.process.toLowerCase().includes(q));
    }
    if (params.unit) {
      const u = params.unit.toLowerCase();
      result = result.filter(l => l.process.toLowerCase().includes(u));
    }
    return result.slice(0, params.lines || 100);
  }

  // Ports
  public getPorts(): PortInfo[] {
    return [
      { port: 22, protocol: 'TCP', address: '0.0.0.0', process: 'sshd', pid: 890, service: 'SSH', status: 'LISTEN', scope: 'LAN' },
      { port: 53, protocol: 'UDP', address: '0.0.0.0', process: 'pihole-FTL', pid: 1040, service: 'DNS Resolver', status: 'LISTEN', scope: 'LAN' },
      { port: 80, protocol: 'TCP', address: '0.0.0.0', process: 'nginx', pid: 1120, service: 'HTTP Web Server', status: 'LISTEN', scope: 'LAN' },
      { port: 443, protocol: 'TCP', address: '0.0.0.0', process: 'nginx', pid: 1120, service: 'HTTPS SSL', status: 'LISTEN', scope: 'LAN' },
      { port: 3000, protocol: 'TCP', address: '0.0.0.0', process: 'node', pid: 7420, service: 'Dashboard Web App', status: 'LISTEN', scope: 'LAN' },
      { port: 8080, protocol: 'TCP', address: '127.0.0.1', process: 'docker-proxy', pid: 4102, service: 'Vaultwarden', status: 'LISTEN', scope: 'Localhost', container: 'vaultwarden' },
      { port: 8123, protocol: 'TCP', address: '0.0.0.0', process: 'docker-proxy', pid: 3104, service: 'Home Assistant', status: 'LISTEN', scope: 'LAN', container: 'home-assistant' },
      { port: 9000, protocol: 'TCP', address: '127.0.0.1', process: 'php-fpm8.3', pid: 4890, service: 'Nextcloud FastCGI', status: 'LISTEN', scope: 'Localhost' },
      { port: 32400, protocol: 'TCP', address: '0.0.0.0', process: 'docker-proxy', pid: 2891, service: 'Plex Media Server', status: 'LISTEN', scope: 'Public', container: 'plex-media-server' },
    ];
  }

  // Firewall
  public getFirewall(): FirewallInfo {
    return {
      system: 'ufw',
      status: 'active',
      default_incoming: 'deny',
      default_outgoing: 'allow',
      rules: [
        { id: '1', to_port: '22/tcp', action: 'ALLOW', from_ip: '192.168.1.0/24', comment: 'SSH from LAN only' },
        { id: '2', to_port: '80,443/tcp', action: 'ALLOW', from_ip: 'Anywhere', comment: 'Web Reverse Proxy' },
        { id: '3', to_port: '53/udp', action: 'ALLOW', from_ip: '192.168.1.0/24', comment: 'Pi-hole LAN DNS' },
        { id: '4', to_port: '32400/tcp', action: 'ALLOW', from_ip: 'Anywhere', comment: 'Plex Remote Streaming' },
        { id: '5', to_port: '8123/tcp', action: 'ALLOW', from_ip: '192.168.1.0/24', comment: 'Home Assistant LAN' },
      ]
    };
  }

  // Reboot & Shutdown control
  public requestReboot(): ConfirmationTokenResponse {
    return {
      token: 'tok_reboot_' + Math.random().toString(36).substring(2, 10),
      action: 'reboot',
      target: SYSTEM_DEF.hostname,
      expires_at: new Date(Date.now() + 60000).toISOString(),
      prompt: 'Are you sure you want to REBOOT the server? Active network and SSH sessions will temporarily disconnect.'
    };
  }

  public confirmReboot(token: string): { message: string } {
    this.addLog('systemd[1]', 'WARNING', 'System reboot scheduled by administrator (simulated)');
    setTimeout(() => {
      this.uptimeSeconds = 0;
      this.notify();
    }, 1000);
    return { message: 'Server reboot initiated (simulated).' };
  }

  public requestShutdown(): ConfirmationTokenResponse {
    return {
      token: 'tok_shutdown_' + Math.random().toString(36).substring(2, 10),
      action: 'shutdown',
      target: SYSTEM_DEF.hostname,
      expires_at: new Date(Date.now() + 60000).toISOString(),
      prompt: 'Are you sure you want to POWER OFF the server completely? Physical access or IPMI/WoL will be required to turn it back on.'
    };
  }

  public confirmShutdown(token: string): { message: string } {
    this.addLog('systemd[1]', 'CRITICAL', 'System power-off initiated by administrator (simulated)');
    return { message: 'Server shutdown initiated (simulated).' };
  }

  // History
  public getHistory(range: string = '1h') {
    const pointsCount = range === '24h' ? 24 : 30;
    const now = Date.now();
    const stepMs = (range === '24h' ? 3600 : 120) * 1000;

    const data = Array.from({ length: pointsCount }, (_, i) => {
      const time = new Date(now - (pointsCount - 1 - i) * stepMs);
      const timeLabel = range === '24h'
        ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : time.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
      
      const cpu = 20 + Math.sin(i * 0.3) * 10 + (Math.random() * 8);
      const ram = 32 + (i * 0.1) + (Math.random() * 2);
      const netDown = 10 + Math.cos(i * 0.4) * 6 + (Math.random() * 5);
      const netUp = 4 + (Math.random() * 3);
      const watts = 25 + (cpu * 0.25) + (Math.random() * 3);

      return {
        timestamp: time.toISOString(),
        time: timeLabel,
        cpu_pct: parseFloat(cpu.toFixed(1)),
        ram_pct: parseFloat(ram.toFixed(1)),
        net_rx_mbps: parseFloat(Math.max(0.1, netDown).toFixed(1)),
        net_tx_mbps: parseFloat(Math.max(0.1, netUp).toFixed(1)),
        watts: parseFloat(watts.toFixed(1)),
      };
    });

    return { range, data };
  }

  // Preferences
  public getPreferences(): Preferences {
    return { ...this.preferences };
  }

  public updatePreferences(data: Preferences): Preferences {
    this.preferences = { ...this.preferences, ...data };
    this.notify();
    return { ...this.preferences };
  }

  // Auth
  public getCurrentUser(): User {
    return {
      id: 1,
      username: 'demo-admin',
      role: this.userRole,
      is_active: true,
      is_totp_enabled: false,
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    };
  }

  public setRole(role: 'admin' | 'read_only') {
    this.userRole = role;
    this.notify();
  }

  public login(role: 'admin' | 'read_only' = 'admin') {
    this.loggedIn = true;
    this.userRole = role;
    return this.getCurrentUser();
  }

  public logout() {
    this.loggedIn = false;
  }

  public isLoggedIn() {
    return this.loggedIn;
  }
}

export const mockEngine = new MockEngine();
