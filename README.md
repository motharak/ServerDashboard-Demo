# Home Server Management Dashboard — Live Interactive Demo

<p align="center">
  <img src="https://img.shields.io/badge/Demo-Live%20In--Browser%20Simulation-3b82f6?style=for-the-badge&logo=react&logoColor=white" alt="Live Demo" />
  <img src="https://img.shields.io/badge/Deploy-GitHub%20Pages-2ea44f?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Pages" />
  <img src="https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-61DAFB?style=for-the-badge" alt="Stack" />
</p>

Welcome to the standalone **Live Interactive Demonstration** for the [Home Server Management Dashboard](https://github.com/motharak/ServerDashboard).

This demo repository runs **100% in the browser** with zero external backend dependencies. It allows anyone to test and evaluate the complete dashboard interface, simulated real-time telemetry, service control actions, and hardware metrics directly on GitHub Pages.

---

## 🌟 Interactive Features Included in This Demo

- **High-Fidelity Telemetry Simulation:**
  - Simulating an **Ubuntu 24.04.1 LTS** home server powered by an **Intel Core i7-13700H (16 Cores / 24 Threads)**, 32 GB DDR5 RAM, and a 2 TB Samsung 990 Pro NVMe SSD.
  - Realistic jitter for CPU per-core frequencies, RAM caching, disk read/write throughput, and network RX/TX bandwidth.
  - Intel RAPL package wattage simulation scaling dynamically with CPU load.
  - Hardware thermal sensors with package and per-core temperature tracking.
- **Simulated WebSocket Streaming:**
  - The live indicator (`LIVE`) actively pulses green, receiving real-time telemetry frames every 1.5 seconds.
- **Scenario Simulation Triggers:**
  - **⚡ Spike CPU (95%):** Instantly ramps CPU load across all 16 cores, elevating power wattage and temperature.
  - **🔥 Thermal Alert (88°C):** Simulates a thermal threshold alert, updating status badges and system health score.
  - **🚀 Network Burst:** Simulates a 1 Gbps high-speed download burst.
  - **↺ Reset:** Restores steady-state baseline telemetry.
- **Full Interactive Subsystems:**
  - **Systemd Services:** Start, stop, and restart simulated services (`nginx`, `docker`, `tailscale`, `pihole-FTL`, `ssh`) with authentic two-step confirmation tokens.
  - **Docker Management:** Inspect container statuses, CPU/memory consumption, and port mappings (`plex`, `vaultwarden`, `home-assistant`, `nextcloud`, `adguard-home`).
  - **htop Process Table:** Sort by CPU or RAM utilization; terminate processes with the safe two-phase confirmation modal.
  - **Live Journalctl Logs:** Continuously streaming logs filterable by priority (INFO, WARNING, ERROR, CRITICAL) and keyword search.
  - **Power & Cost Calculator:** Interactive electricity rate slider with real-time monthly cost projections.
  - **1-Click Demo Login:** Fast login presets for **Administrator** and **Viewer** roles without needing credentials.

---

## 🚀 One-Click GitHub Pages Deployment

This repository includes a pre-configured GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### To host your own demo on GitHub Pages:
1. Push this repository to GitHub (`main` branch).
2. On GitHub, navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. GitHub Actions will automatically compile the site and publish it to:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

---

## 💻 Local Development

Run the demo locally on your workstation:

```bash
# 1. Install dependencies
npm install

# 2. Start Vite local development server
npm run dev

# 3. Build static production bundle
npm run build

# 4. Preview static production build
npm run preview
```

---

## 🔗 Parent Project

This demo showcases the frontend interface of **[Home Server Management Dashboard](https://github.com/motharak/ServerDashboard)**. 

For the full production deployment on real Linux home servers (including the FastAPI system daemon, `/proc` and `/sys` collectors, and secure systemctl controllers), visit the main repository:

👉 **[https://github.com/motharak/ServerDashboard](https://github.com/motharak/ServerDashboard)**
