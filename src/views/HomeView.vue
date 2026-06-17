<script setup lang="ts">
type ShipmentSnapshot = {
  week: string
  volume: number
  onTimeRate: number
}

type RegionPerformance = {
  region: string
  shipments: number
  onTimeRate: number
  avgDelayHours: number
  openExceptions: number
  status: 'Strong' | 'Watch' | 'Risk'
}

type ExceptionItem = {
  id: string
  issue: string
  owner: string
  priority: 'Critical' | 'High' | 'Medium'
  etaHours: number
}

const shipmentTrend: ShipmentSnapshot[] = [
  { week: 'W1', volume: 2480, onTimeRate: 93.2 },
  { week: 'W2', volume: 2560, onTimeRate: 93.8 },
  { week: 'W3', volume: 2710, onTimeRate: 94.1 },
  { week: 'W4', volume: 2795, onTimeRate: 94.4 },
  { week: 'W5', volume: 2850, onTimeRate: 95.1 },
  { week: 'W6', volume: 2940, onTimeRate: 95.4 },
  { week: 'W7', volume: 3015, onTimeRate: 95.7 },
  { week: 'W8', volume: 3120, onTimeRate: 96.1 },
]

const regionalPerformance: RegionPerformance[] = [
  {
    region: 'West',
    shipments: 4210,
    onTimeRate: 97.2,
    avgDelayHours: 1.3,
    openExceptions: 9,
    status: 'Strong',
  },
  {
    region: 'Central',
    shipments: 3360,
    onTimeRate: 95.8,
    avgDelayHours: 2.1,
    openExceptions: 14,
    status: 'Watch',
  },
  {
    region: 'Northeast',
    shipments: 2860,
    onTimeRate: 94.9,
    avgDelayHours: 2.8,
    openExceptions: 17,
    status: 'Watch',
  },
  {
    region: 'Southeast',
    shipments: 2050,
    onTimeRate: 92.7,
    avgDelayHours: 3.6,
    openExceptions: 21,
    status: 'Risk',
  },
]

const openExceptions: ExceptionItem[] = [
  {
    id: 'EX-1482',
    issue: 'Weather reroute impacting Atlanta outbound lanes',
    owner: 'Regional Lead - Southeast',
    priority: 'Critical',
    etaHours: 6,
  },
  {
    id: 'EX-1477',
    issue: 'Carrier capacity mismatch for Midwest overnight routes',
    owner: 'Capacity Planning',
    priority: 'High',
    etaHours: 12,
  },
  {
    id: 'EX-1459',
    issue: 'Dock staffing gap causing delayed scans at Newark',
    owner: 'Terminal Operations',
    priority: 'High',
    etaHours: 18,
  },
  {
    id: 'EX-1448',
    issue: 'Label print errors from legacy handheld devices',
    owner: 'IT Support',
    priority: 'Medium',
    etaHours: 26,
  },
]

const totalShipments = shipmentTrend.reduce((sum, week) => sum + week.volume, 0)
const latestOnTimeRate = shipmentTrend[shipmentTrend.length - 1]?.onTimeRate ?? 0
const previousOnTimeRate = shipmentTrend[shipmentTrend.length - 2]?.onTimeRate ?? 0
const onTimeDelta = Number((latestOnTimeRate - previousOnTimeRate).toFixed(1))
</script>

<template>
  <main class="dashboard">
    <section class="hero card stagger-1">
      <div>
        <p class="eyebrow">FastForward Logistics</p>
        <h1>Internal Operations Dashboard</h1>
        <p class="subtitle">
          Single-source operational visibility for leadership across shipment volume, delivery
          reliability, regional performance, and active exceptions.
        </p>
      </div>
      <div class="hero-pills">
        <span class="pill">Live Prototype</span>
        <span class="pill muted">Updated: 15 min ago</span>
      </div>
    </section>

    <section class="metrics-grid stagger-2" aria-label="Operational KPI summary">
      <article class="metric card">
        <p class="metric-label">Shipment Volume (8 Weeks)</p>
        <p class="metric-value">{{ totalShipments.toLocaleString() }}</p>
        <p class="metric-trend positive">+8.4% vs prior cycle</p>
      </article>

      <article class="metric card">
        <p class="metric-label">On-Time Delivery</p>
        <p class="metric-value">{{ latestOnTimeRate.toFixed(1) }}%</p>
        <p class="metric-trend" :class="onTimeDelta >= 0 ? 'positive' : 'negative'">
          {{ onTimeDelta >= 0 ? '+' : '' }}{{ onTimeDelta.toFixed(1) }} pts vs last week
        </p>
      </article>

      <article class="metric card">
        <p class="metric-label">Regional Health</p>
        <p class="metric-value">2 Strong / 2 Watch+Risk</p>
        <p class="metric-trend neutral">Southeast requires intervention</p>
      </article>

      <article class="metric card">
        <p class="metric-label">Open Exceptions</p>
        <p class="metric-value">{{ openExceptions.length }}</p>
        <p class="metric-trend negative">1 critical, 2 high priority</p>
      </article>
    </section>

    <section class="layout-row stagger-3">
      <article class="card panel">
        <div class="panel-header">
          <h2>Shipment Volume Overview</h2>
          <p>Weekly throughput and on-time context</p>
        </div>
        <div class="volume-grid" role="img" aria-label="Shipment volume by week">
          <div v-for="week in shipmentTrend" :key="week.week" class="bar-wrap">
            <div class="bar" :style="{ height: `${(week.volume / 3200) * 100}%` }" />
            <p class="bar-week">{{ week.week }}</p>
            <p class="bar-value">{{ week.volume }}</p>
          </div>
        </div>
      </article>

      <article class="card panel">
        <div class="panel-header">
          <h2>On-Time Delivery Performance</h2>
          <p>Performance consistency over the same period</p>
        </div>
        <ul class="performance-list">
          <li v-for="week in shipmentTrend" :key="`${week.week}-rate`">
            <div class="rate-label">
              <span>{{ week.week }}</span>
              <strong>{{ week.onTimeRate.toFixed(1) }}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${week.onTimeRate}%` }" />
            </div>
          </li>
        </ul>
      </article>
    </section>

    <section class="layout-row stagger-4">
      <article class="card panel wide">
        <div class="panel-header">
          <h2>Regional Performance</h2>
          <p>Shipment load, reliability, delay trends, and risk status</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Shipments</th>
                <th>On-Time %</th>
                <th>Avg Delay (hrs)</th>
                <th>Open Exceptions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="region in regionalPerformance" :key="region.region">
                <td>{{ region.region }}</td>
                <td>{{ region.shipments.toLocaleString() }}</td>
                <td>{{ region.onTimeRate.toFixed(1) }}</td>
                <td>{{ region.avgDelayHours.toFixed(1) }}</td>
                <td>{{ region.openExceptions }}</td>
                <td>
                  <span class="status" :class="region.status.toLowerCase()">{{ region.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="card panel">
        <div class="panel-header">
          <h2>Open Exceptions</h2>
          <p>Priority queue for immediate operational action</p>
        </div>
        <ul class="exceptions-list">
          <li v-for="item in openExceptions" :key="item.id">
            <div>
              <p class="exception-id">{{ item.id }}</p>
              <p class="exception-issue">{{ item.issue }}</p>
              <p class="exception-owner">{{ item.owner }}</p>
            </div>
            <div class="exception-meta">
              <span class="priority" :class="item.priority.toLowerCase()">{{ item.priority }}</span>
              <span class="eta">ETA {{ item.etaHours }}h</span>
            </div>
          </li>
        </ul>
      </article>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 2rem clamp(1rem, 3vw, 2.5rem) 3rem;
  background:
    radial-gradient(circle at 10% 12%, rgba(20, 177, 157, 0.26), transparent 36%),
    radial-gradient(circle at 84% 2%, rgba(255, 132, 77, 0.22), transparent 33%),
    linear-gradient(135deg, #050b17 0%, #0a1222 48%, #0d1730 100%);
}

.dashboard::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: linear-gradient(rgba(132, 167, 236, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(132, 167, 236, 0.09) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}

.dashboard > * {
  position: relative;
  z-index: 1;
}

.card {
  background: linear-gradient(160deg, rgba(17, 28, 50, 0.88), rgba(11, 20, 40, 0.9));
  border: 1px solid rgba(123, 161, 233, 0.24);
  border-radius: 1.1rem;
  box-shadow: 0 24px 60px rgba(2, 7, 20, 0.6);
  backdrop-filter: blur(4px);
}

.hero {
  padding: clamp(1.2rem, 2.4vw, 1.8rem);
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
  align-items: start;
  margin-bottom: 1.1rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #5de5c9;
  font-size: 0.7rem;
  font-weight: 700;
}

h1 {
  font-family: 'Sora', 'Avenir Next', 'Segoe UI', sans-serif;
  font-weight: 700;
  color: #ecf4ff;
  font-size: clamp(1.5rem, 4vw, 2.3rem);
  margin-top: 0.4rem;
}

.subtitle {
  margin-top: 0.65rem;
  max-width: 65ch;
  color: #a5bce6;
  line-height: 1.5;
}

.hero-pills {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.pill {
  border: 1px solid #2eceb4;
  color: #b8ffee;
  background: rgba(22, 98, 92, 0.35);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.76rem;
  font-weight: 700;
}

.pill.muted {
  border-color: #5679ad;
  color: #b8cdee;
  background: rgba(45, 69, 106, 0.36);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 1.1rem;
}

.metric {
  padding: 1rem;
}

.metric-label {
  color: #86a3d6;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.metric-value {
  margin-top: 0.45rem;
  color: #f2f7ff;
  font-size: clamp(1.2rem, 3.4vw, 1.85rem);
  font-family: 'Sora', 'Avenir Next', 'Segoe UI', sans-serif;
  font-weight: 700;
}

.metric-trend {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.positive {
  color: #4ce0a8;
}

.negative {
  color: #ff8f79;
}

.neutral {
  color: #86add8;
}

.layout-row {
  display: grid;
  gap: 0.95rem;
  margin-bottom: 1.1rem;
  grid-template-columns: 1fr 1fr;
}

.panel {
  padding: 1rem;
}

.wide {
  grid-column: span 1;
}

.panel-header h2 {
  color: #e8f1ff;
  font-size: 1.02rem;
  font-family: 'Sora', 'Avenir Next', 'Segoe UI', sans-serif;
  font-weight: 700;
}

.panel-header p {
  color: #8aa8d3;
  font-size: 0.82rem;
  margin-top: 0.3rem;
}

.volume-grid {
  margin-top: 0.95rem;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  align-items: end;
  gap: 0.6rem;
  min-height: 220px;
  padding-top: 0.4rem;
}

.bar-wrap {
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  height: 100%;
}

.bar {
  width: 100%;
  border-radius: 0.55rem 0.55rem 0.35rem 0.35rem;
  background: linear-gradient(180deg, #1cc5a2 0%, #0f8f86 100%);
  box-shadow: 0 8px 24px rgba(10, 179, 153, 0.34);
  animation: grow 850ms ease both;
}

.bar-week {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #9eb8e2;
  font-weight: 700;
}

.bar-value {
  font-size: 0.72rem;
  color: #7f9ac0;
}

.performance-list {
  margin-top: 0.9rem;
  list-style: none;
  display: grid;
  gap: 0.55rem;
}

.rate-label {
  display: flex;
  justify-content: space-between;
  color: #9eb6dd;
  font-size: 0.82rem;
  margin-bottom: 0.24rem;
}

.rate-label strong {
  color: #f3f8ff;
}

.progress-track {
  height: 0.62rem;
  border-radius: 999px;
  background: #1d304f;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #16c399, #33e7b8);
  border-radius: inherit;
  animation: fill 1.1s ease both;
}

.table-wrap {
  margin-top: 0.85rem;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
}

th,
td {
  text-align: left;
  padding: 0.58rem 0.45rem;
  border-bottom: 1px solid rgba(125, 161, 223, 0.22);
}

th {
  color: #89a5ce;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.69rem;
}

td {
  color: #d7e6ff;
}

.status {
  border-radius: 999px;
  padding: 0.18rem 0.52rem;
  font-size: 0.7rem;
  font-weight: 700;
}

.status.strong {
  color: #58f0c8;
  background: rgba(36, 130, 109, 0.28);
}

.status.watch {
  color: #ffd383;
  background: rgba(148, 102, 19, 0.3);
}

.status.risk {
  color: #ff8f84;
  background: rgba(159, 64, 54, 0.3);
}

.exceptions-list {
  margin-top: 0.85rem;
  list-style: none;
  display: grid;
  gap: 0.7rem;
}

.exceptions-list li {
  border: 1px solid rgba(109, 150, 219, 0.28);
  border-radius: 0.75rem;
  background: rgba(17, 30, 55, 0.78);
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.exception-id {
  color: #88a4ce;
  font-size: 0.72rem;
  font-weight: 700;
}

.exception-issue {
  margin-top: 0.25rem;
  color: #e6f0ff;
  line-height: 1.35;
  font-size: 0.84rem;
}

.exception-owner {
  margin-top: 0.25rem;
  color: #98b1d5;
  font-size: 0.75rem;
}

.exception-meta {
  display: grid;
  gap: 0.36rem;
  align-content: start;
  justify-items: end;
}

.priority {
  font-size: 0.69rem;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-weight: 700;
}

.priority.critical {
  color: #ffc0b7;
  background: rgba(138, 47, 42, 0.34);
}

.priority.high {
  color: #ffd69a;
  background: rgba(132, 89, 16, 0.34);
}

.priority.medium {
  color: #9fd0ff;
  background: rgba(42, 85, 130, 0.34);
}

.eta {
  color: #8ba9d4;
  font-size: 0.72rem;
}

.stagger-1,
.stagger-2,
.stagger-3,
.stagger-4 {
  opacity: 0;
  transform: translateY(12px);
  animation: rise 650ms ease forwards;
}

.stagger-2 {
  animation-delay: 130ms;
}

.stagger-3 {
  animation-delay: 260ms;
}

.stagger-4 {
  animation-delay: 390ms;
}

@keyframes rise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes grow {
  from {
    height: 0;
  }
}

@keyframes fill {
  from {
    width: 0;
  }
}

@media (max-width: 1180px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .layout-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .hero {
    flex-direction: column;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .volume-grid {
    min-height: 180px;
    gap: 0.45rem;
  }

  .exceptions-list li {
    flex-direction: column;
  }

  .exception-meta {
    justify-items: start;
  }
}
</style>
