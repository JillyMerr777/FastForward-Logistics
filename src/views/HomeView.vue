<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { Bar, Line } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

import logo from '@/assets/Logo.png'
import favicon from '@/assets/Favicon.png'
import operationsData from '@/assets/operations-data.json'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
)

type MonthRecord = {
  month: string
  revenue: number
  shipmentVolume: number
  onTimeRate: number
  orders: number
  exceptions: number
}

type TrendMeta = {
  text: string
  icon: string
  color: 'success' | 'error' | 'medium-emphasis'
}

type KpiCard = {
  key: string
  label: string
  value: string
  icon: string
  trend: TrendMeta
  helper: string
}

const monthlyData = operationsData as MonthRecord[]
const selectedMonth = ref('All')

const { width } = useDisplay()
// Computed height fed to v-app-bar so Vuetify's layout system correctly
// offsets v-main beneath the auto-height header at every breakpoint.
// Desktop (>960px): 24+24 padding + 52px logo row = 100px
// Tablet (800–960px): 24+24 padding + 52px logo + 10px gap + 44px filter = 154px
// Mobile (≤800px): 24+24 padding + 44px filter row = 92px
const barHeight = computed(() => {
  if (width.value <= 800) return 92
  if (width.value <= 960) return 154
  return 100
})
const fallbackRecord: MonthRecord = {
  month: 'N/A',
  revenue: 0,
  shipmentVolume: 0,
  onTimeRate: 0,
  orders: 0,
  exceptions: 0,
}

const monthOptions = [
  { label: 'All', value: 'All' },
  ...monthlyData.map((item) => ({ label: item.month, value: item.month })),
]

const selectedIndex = computed(() => monthlyData.findIndex((item) => item.month === selectedMonth.value))
const selectedRecord = computed(() => monthlyData[selectedIndex.value] ?? null)
const latestRecord = computed(() => monthlyData[monthlyData.length - 1] ?? fallbackRecord)
const trendCurrentRecord = computed(() =>
  selectedMonth.value === 'All' ? latestRecord.value : (selectedRecord.value ?? latestRecord.value),
)

function previousOf(index: number): MonthRecord | null {
  if (index <= 0) return null
  return monthlyData[index - 1] ?? null
}

const comparisonRecord = computed(() => {
  if (selectedMonth.value === 'All') {
    return previousOf(monthlyData.length - 1)
  }
  return previousOf(selectedIndex.value)
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

const kpiCurrent = computed(() => {
  if (selectedMonth.value === 'All') {
    const totals = monthlyData.reduce(
      (acc, item) => {
        acc.revenue += item.revenue
        acc.shipmentVolume += item.shipmentVolume
        acc.onTimeRate += item.onTimeRate
        acc.exceptions += item.exceptions
        return acc
      },
      { revenue: 0, shipmentVolume: 0, onTimeRate: 0, exceptions: 0 },
    )

    return {
      revenue: totals.revenue,
      shipmentVolume: totals.shipmentVolume,
      onTimeRate: totals.onTimeRate / monthlyData.length,
      exceptions: totals.exceptions,
      scopeLabel: 'All Months',
    }
  }

  const item = selectedRecord.value ?? latestRecord.value
  return {
    revenue: item.revenue,
    shipmentVolume: item.shipmentVolume,
    onTimeRate: item.onTimeRate,
    exceptions: item.exceptions,
    scopeLabel: item.month,
  }
})

function buildTrend(current: number, previous: number | null | undefined, invert = false): TrendMeta {
  if (previous == null || previous === 0) {
    return {
      text: 'No prior month baseline',
      icon: 'mdi-minus-thick',
      color: 'medium-emphasis',
    }
  }

  const deltaPct = ((current - previous) / previous) * 100
  const positive = invert ? deltaPct <= 0 : deltaPct >= 0

  return {
    text: `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}% vs previous month`,
    icon: deltaPct >= 0 ? 'mdi-arrow-up-right' : 'mdi-arrow-down-right',
    color: positive ? 'success' : 'error',
  }
}

const revenueTrend = computed(() => buildTrend(trendCurrentRecord.value.revenue, comparisonRecord.value?.revenue))
const volumeTrend = computed(() =>
  buildTrend(trendCurrentRecord.value.shipmentVolume, comparisonRecord.value?.shipmentVolume),
)
const onTimeTrend = computed(() =>
  buildTrend(trendCurrentRecord.value.onTimeRate, comparisonRecord.value?.onTimeRate),
)
const exceptionsTrend = computed(() =>
  buildTrend(trendCurrentRecord.value.exceptions, comparisonRecord.value?.exceptions, true),
)

const kpiCards = computed<KpiCard[]>(() => [
  {
    key: 'revenue',
    label: 'Revenue / Shipment Value',
    value: formatCurrency(kpiCurrent.value.revenue),
    icon: 'mdi-cash-multiple',
    trend: revenueTrend.value,
    helper: selectedMonth.value === 'All' ? 'Year total' : 'Selected month value',
  },
  {
    key: 'volume',
    label: 'Shipment Volume',
    value: formatNumber(kpiCurrent.value.shipmentVolume),
    icon: 'mdi-truck-fast-outline',
    trend: volumeTrend.value,
    helper: selectedMonth.value === 'All' ? 'Year total' : 'Selected month value',
  },
  {
    key: 'on-time',
    label: 'On-Time Delivery Rate',
    value: formatPercent(kpiCurrent.value.onTimeRate),
    icon: 'mdi-timer-check-outline',
    trend: onTimeTrend.value,
    helper: selectedMonth.value === 'All' ? '12-month average' : 'Selected month value',
  },
  {
    key: 'exceptions',
    label: 'Orders / Exceptions',
    value: formatNumber(kpiCurrent.value.exceptions),
    icon: 'mdi-alert-circle-outline',
    trend: exceptionsTrend.value,
    helper: selectedMonth.value === 'All' ? 'Year total' : 'Selected month value',
  },
])

const labels = computed(() => monthlyData.map((item) => item.month))

function colorByFocus(active: string, muted: string): string[] {
  if (selectedMonth.value === 'All') {
    return labels.value.map(() => active)
  }
  return labels.value.map((label) => (label === selectedMonth.value ? active : muted))
}

const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 450,
    easing: 'easeOutQuart',
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      labels: {
        color: '#c6d6ed',
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: '#0f1a2f',
      borderColor: '#325278',
      borderWidth: 1,
      titleColor: '#f2f8ff',
      bodyColor: '#d6e4f8',
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(141, 170, 203, 0.12)' },
      ticks: { color: '#b9cce8' },
    },
    y: {
      grid: { color: 'rgba(141, 170, 203, 0.16)' },
      ticks: { color: '#b9cce8' },
    },
  },
}

const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 450,
    easing: 'easeOutQuart',
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      labels: {
        color: '#c6d6ed',
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: '#0f1a2f',
      borderColor: '#325278',
      borderWidth: 1,
      titleColor: '#f2f8ff',
      bodyColor: '#d6e4f8',
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(141, 170, 203, 0.12)' },
      ticks: { color: '#b9cce8' },
    },
    y: {
      grid: { color: 'rgba(141, 170, 203, 0.16)' },
      ticks: { color: '#b9cce8' },
    },
  },
}

const revenueBarData = computed<ChartData<'bar'>>(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Revenue (USD)',
      data: monthlyData.map((item) => item.revenue),
      borderRadius: 6,
      backgroundColor: colorByFocus('rgba(28, 197, 162, 0.95)', 'rgba(28, 197, 162, 0.30)'),
      borderColor: colorByFocus('#22d3ac', 'rgba(34, 211, 172, 0.35)'),
      borderWidth: 1,
    },
  ],
}))

const volumeLineData = computed<ChartData<'line'>>(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Shipment Volume',
      data: monthlyData.map((item) => item.shipmentVolume),
      borderColor: '#8dc8ff',
      backgroundColor: 'rgba(141, 200, 255, 0.2)',
      pointBackgroundColor: colorByFocus('#c9e7ff', 'rgba(201, 231, 255, 0.35)'),
      pointBorderColor: '#0f1a2f',
      pointRadius: labels.value.map((label) =>
        selectedMonth.value === 'All' ? 3 : label === selectedMonth.value ? 5 : 2,
      ),
      pointHoverRadius: 6,
      borderWidth: 2.5,
      tension: 0.36,
    },
  ],
}))

const deliveryAreaData = computed<ChartData<'line'>>(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'On-Time Delivery Rate (%)',
      data: monthlyData.map((item) => item.onTimeRate),
      borderColor: '#ffba73',
      backgroundColor: 'rgba(255, 186, 115, 0.22)',
      fill: true,
      pointBackgroundColor: colorByFocus('#ffd9aa', 'rgba(255, 217, 170, 0.35)'),
      pointRadius: labels.value.map((label) =>
        selectedMonth.value === 'All' ? 3 : label === selectedMonth.value ? 5 : 2,
      ),
      pointHoverRadius: 6,
      borderWidth: 2.4,
      tension: 0.3,
    },
  ],
}))
</script>

<template>
  <v-app-bar flat border class="glass-bar" :height="barHeight">
    <v-container fluid class="page-shell header-shell">
      <div class="desktop-brand align-center ga-3">
        <div class="logo-lockup">
          <v-img :src="logo" alt="FastForward Logistics logo" class="logo-image" contain />
        </div>
        <span class="header-divider" aria-hidden="true">|</span>
        <div class="dashboard-title text-subtitle-1 font-weight-bold">Internal Operations Dashboard</div>
      </div>

      <div class="mobile-brand" aria-hidden="true">
        <div class="mobile-favicon-wrap">
          <v-img :src="favicon" alt="FastForward Logistics favicon" class="mobile-favicon" contain />
        </div>
      </div>

      <v-select
        v-model="selectedMonth"
        :items="monthOptions"
        item-title="label"
        item-value="value"
        label="Month Filter"
        variant="outlined"
        density="comfortable"
        hide-details
        class="month-filter"
      />
    </v-container>
  </v-app-bar>

  <v-main>
    <v-container fluid class="dashboard">
      <div class="page-shell">
      <v-card rounded="lg" border class="mb-4 summary-banner">
        <v-card-text class="py-4 px-5 d-flex flex-wrap align-center justify-space-between ga-2">
          <div>
            <div class="text-overline text-medium-emphasis">Viewing</div>
            <div class="text-h6 font-weight-bold">{{ kpiCurrent.scopeLabel }} Performance Snapshot</div>
          </div>
          <v-chip color="teal" variant="tonal" prepend-icon="mdi-chart-timeline-variant">
            Local JSON Dataset (2025)
          </v-chip>
        </v-card-text>
      </v-card>

      <v-row class="mb-4">
        <v-col v-for="card in kpiCards" :key="card.key" cols="12" sm="6" lg="3">
          <v-card rounded="lg" border height="100%" class="kpi-card">
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-start mb-2">
                <div class="text-overline text-medium-emphasis metric-label">{{ card.label }}</div>
                <v-icon :icon="card.icon" color="info" size="22" />
              </div>

              <div class="text-h4 font-weight-bold mb-3">{{ card.value }}</div>

              <div class="d-flex align-center ga-2 text-caption font-weight-medium">
                <v-icon :icon="card.trend.icon" :color="card.trend.color" size="18" />
                <span :class="`text-${card.trend.color}`">{{ card.trend.text }}</span>
              </div>

              <div class="text-caption text-medium-emphasis mt-2">{{ card.helper }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-4">
        <v-col cols="12" lg="6">
          <v-card rounded="lg" border>
            <v-card-item>
              <v-card-title class="text-subtitle-1 font-weight-bold">Revenue by Month</v-card-title>
              <v-card-subtitle>Bar chart view of shipment value trend</v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <div class="chart-shell">
                <Bar :data="revenueBarData" :options="barChartOptions" aria-label="Revenue bar chart" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card rounded="lg" border>
            <v-card-item>
              <v-card-title class="text-subtitle-1 font-weight-bold">Shipment Volume Trend</v-card-title>
              <v-card-subtitle>Line chart for monthly shipment throughput</v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <div class="chart-shell">
                <Line :data="volumeLineData" :options="lineChartOptions" aria-label="Shipment line chart" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card rounded="lg" border>
            <v-card-item>
              <v-card-title class="text-subtitle-1 font-weight-bold">On-Time Delivery Performance</v-card-title>
              <v-card-subtitle>Full-year reliability with month-aware highlighting</v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <div class="chart-shell chart-shell--wide">
                <Line :data="deliveryAreaData" :options="lineChartOptions" aria-label="On-time area chart" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      </div>
    </v-container>
  </v-main>
</template>

<style scoped>
.page-shell {
  padding-inline: clamp(16px, 3.6vw, 48px);
}

.glass-bar {
  backdrop-filter: blur(10px);
  background: rgba(12, 20, 35, 0.88);
}

.glass-bar :deep(.v-toolbar__content) {
  /* Remove default horizontal padding; let page-shell handle it. */
  padding-inline: 0;
  height: 100%;
}

.header-shell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 24px !important;
}

.desktop-brand {
  display: flex;
  min-width: 0;
}

.month-filter {
  flex: 1 1 220px;
  max-width: 320px;
  min-width: 180px;
}

.month-filter :deep(.v-field) {
  width: 100%;
}

.mobile-brand {
  display: none;
}

.mobile-favicon-wrap {
  width: 32px;
  height: 32px;
}

.mobile-favicon {
  width: 100%;
  height: 100%;
}

.dashboard {
  padding-top: 32px;
  padding-bottom: 32px;
  min-height: calc(100vh - 82px);
  background:
    radial-gradient(circle at 8% 8%, rgba(28, 197, 162, 0.16), transparent 34%),
    radial-gradient(circle at 88% 0%, rgba(117, 166, 228, 0.16), transparent 34%),
    linear-gradient(145deg, rgba(6, 12, 24, 0.92), rgba(8, 16, 30, 1));
}

.logo-lockup {
  width: 136px;
  height: 52px;
  display: flex;
  align-items: center;
}

.header-divider {
  color: rgba(255, 255, 255, 0.86);
  font-size: 1.15rem;
  line-height: 1;
  padding-inline: 10px;
}

.dashboard-title {
  color: #f5f9ff;
}

.logo-image {
  width: 100%;
  height: 100%;
}

.summary-banner {
  background: linear-gradient(120deg, rgba(19, 33, 58, 0.9), rgba(15, 28, 49, 0.9));
}

.kpi-card {
  transition: transform 160ms ease, border-color 160ms ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(109, 171, 241, 0.45);
}

.metric-label {
  line-height: 1.3;
}

.chart-shell {
  height: 280px;
}

.chart-shell--wide {
  height: 320px;
}

@media (max-width: 960px) {
  .header-shell {
    flex-wrap: wrap;
    align-items: center;
    row-gap: 10px;
  }

  .month-filter {
    flex: 1 1 100%;
    max-width: 100%;
    min-width: 0;
  }

  .chart-shell,
  .chart-shell--wide {
    height: 260px;
  }
}

@media (max-width: 800px) {
  .header-shell {
    justify-content: flex-start;
    flex-wrap: nowrap;
    gap: 40px;
  }

  .desktop-brand {
    display: none;
  }

  .mobile-brand {
    display: flex;
    justify-content: center;
    flex: 0 0 auto;
  }

  .mobile-favicon-wrap {
    width: 30px;
    height: 30px;
  }

  .month-filter {
    flex: 1 1 auto;
    max-width: none;
    min-width: 0;
  }

  .month-filter :deep(.v-field) {
    width: 100%;
  }
}
</style>
