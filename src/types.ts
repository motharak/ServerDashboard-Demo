export interface SystemInfo {
  hostname: string;
  os_name: string;
  kernel: string;
  uptime_seconds: number;
  uptime_human: string;
  current_time: string;
  server_ip: string;
  primary_interface: string;
  internet_connected: boolean;
  platform: string;

}

export interface CpuCoreInfo {
  core_id: number;
  usage_pct: number;
  freq_mhz?: number;
}

export interface CpuInfo {
  model: string;
  total_cores: number;
  physical_cores: number;
  usage_pct: number;
  per_core: CpuCoreInfo[];
  load_avg: number[];
  temperature_c?: number;
}

export interface MemoryInfo {
  total_bytes: number;
  used_bytes: number;
  available_bytes: number;
  cached_bytes: number;
  swap_total_bytes: number;
  swap_used_bytes: number;
  usage_pct: number;
  swap_pct: number;
}

export interface DiskMountInfo {
  device: string;
  mountpoint: string;
  fstype: string;
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  usage_pct: number;
  read_speed_bytes_sec?: number;
  write_speed_bytes_sec?: number;
  temperature_c?: number;
  smart_status?: string;
  warning_level: 'normal' | 'warning' | 'critical' | 'notice';
}

export interface StorageInfo {
  disks: DiskMountInfo[];
}

export interface TempSensor {
  sensor_id: string;
  name: string;
  current_c: number;
  min_c?: number;
  max_c?: number;
  avg_c?: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface TemperatureInfo {
  sensors: TempSensor[];
  is_available: boolean;
  unavailability_reason?: string;
}

export interface DailyPowerPoint {
  date: string;
  kwh: number;
  cost: number;
  avg_watts: number;
  peak_watts: number;
}

export interface PowerInfo {
  is_available: boolean;
  unavailability_reason?: string;
  is_real_metered?: boolean;
  current_watts?: number;
  cpu_package_watts?: number;
  gpu_watts?: number;
  dram_watts?: number;
  system_watts?: number;
  energy_today_kwh?: number;
  energy_yesterday_kwh?: number;
  energy_week_kwh?: number;
  energy_month_kwh?: number;
  projected_month_kwh?: number;
  total_meter_kwh?: number;
  cost_today?: number;
  cost_month?: number;
  estimated_cost_month?: number;
  price_per_kwh?: number;
  currency: string;
  power_source?: string;
  battery_level_pct?: number;
  history_days?: DailyPowerPoint[];
}

export interface NetworkInterfaceInfo {
  name: string;
  status: string;
  ip_address?: string;
  mac_address?: string;
  rx_bytes_sec: number;
  tx_bytes_sec: number;
  rx_total_bytes: number;
  tx_total_bytes: number;
  rx_packets_sec: number;
  tx_packets_sec: number;
}

export interface NetworkInfo {
  interfaces: NetworkInterfaceInfo[];
  total_download_speed: number;
  total_upload_speed: number;
}

export interface PortInfo {
  port: number;
  protocol: 'TCP' | 'UDP';
  address: string;
  process?: string;
  pid?: number;
  service?: string;
  status: string;
  scope: 'Public' | 'LAN' | 'Localhost';
  container?: string;
}

export interface FirewallRule {
  id?: string;
  to_port: string;
  action: string;
  from_ip: string;
  comment?: string;
}

export interface FirewallInfo {
  system: string;
  status: string;
  default_incoming?: string;
  default_outgoing?: string;
  rules: FirewallRule[];
  message?: string;
}

export interface ServiceItem {
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'failed' | 'disabled';
  enabled_at_boot: boolean;
  pid?: number;
  cpu_pct?: number;
  memory_bytes?: number;
  uptime?: string;
  restart_count?: number;
}

export interface DockerContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  uptime: string;
  cpu_pct?: number;
  memory_usage_bytes?: number;
  memory_limit_bytes?: number;
  ports: string[];
  restart_policy?: string;
}

export interface DockerInfo {
  is_available: boolean;
  unavailability_reason?: string;
  containers_count: number;
  running_count: number;
  stopped_count: number;
  containers: DockerContainerInfo[];
}

export interface ProcessItem {
  pid: number;
  name: string;
  user: string;
  cpu_pct: number;
  memory_pct: number;
  memory_bytes: number;
  runtime: string;
  command: string;
  status: string;
}

export interface HealthComponent {
  name: string;
  status: 'normal' | 'warning' | 'critical';
  score: number;
  details: string;
}

export interface SystemHealth {
  overall_score: number;
  components: HealthComponent[];
}

export interface SshSession {
  pid?: number;
  user: string;
  client_ip: string;
  client_port?: number;
  terminal?: string;
  session_type: string;
  started_at?: string;
}

export interface SshUsageInfo {
  is_active: boolean;
  port: number;
  total_connections: number;
  total_sessions: number;
  sessions: SshSession[];
  message?: string;
}

export interface Preferences {
  electricity_price_per_kwh: number;
  currency: string;
  temp_warning_max: number;
  temp_critical_max: number;
  storage_warning_pct: number;
  cpu_warning_pct: number;
  ram_warning_pct: number;
}

export interface LiveDashboardSnapshot {
  system: SystemInfo;
  cpu: CpuInfo;
  memory: MemoryInfo;
  storage: StorageInfo;
  temperature: TemperatureInfo;
  power: PowerInfo;
  network: NetworkInfo;
  health: SystemHealth;
  top_services: ServiceItem[];
  docker: DockerInfo;
  ssh?: SshUsageInfo;
  recent_alerts: any[];
}

export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'read_only';
  is_active: boolean;
  is_totp_enabled?: boolean;
  created_at: string;
}

export interface ConfirmationTokenResponse {
  token: string;
  action: string;
  target: string;
  expires_at: string;
  prompt: string;
}

export interface AuthAttempt {
  id: number;
  device_id: string;
  ip_address: string;
  username: string;
  success: boolean;
  failure_reason?: string;
  user_agent?: string;
  timestamp: string;
}

export interface DeviceStatus {
  device_id: string;
  is_locked_out: boolean;
  remaining_attempts: number;
  lockout_seconds: number;
  max_attempts: number;
}

