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

import metricsData from '@/data/metrics.json'
import logo from '@/assets/Logo.png'
import favicon from '@/assets/Favicon.png'

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
  label: string
  revenue: number
  shipmentVolume: number
  onTimeDeliveryRate: number
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

const monthlyData = metricsData as MonthRecord[]
const selectedMonth = ref('All')

const { width } = useDisplay()
// Keep app bar and content offset aligned across breakpoints.
const barHeight = computed(() => {
  if (width.value <= 800) return 92
  if (width.value <= 960) return 154
  return 100
})

const fallbackRecord: MonthRecord = {
  month: 'N/A',
  label: 'N/A',
  revenue: 0,
  shipmentVolume: 0,
  onTimeDeliveryRate: 0,
  orders: 0,
  exceptions: 0,
}

const monthOptions = [
  { label: 'All', value: 'All' },
  ...monthlyData.map((item) => ({ label: item.label, value: item.month })),
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

function formatCurrencyCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

const trendContextLabel = computed(() => {
  if (selectedMonth.value !== 'All') return 'vs previous month'
  const current = trendCurrentRecord.value
  const previous = comparisonRecord.value
  if (!current || !previous) return 'vs previous month'
  return `${current.label} vs ${previous.label}`
})

const kpiCurrent = computed(() => {
  if (selectedMonth.value === 'All') {
    const totals = monthlyData.reduce(
      (acc, item) => {
        acc.revenue += item.revenue
        acc.shipmentVolume += item.shipmentVolume
        acc.onTimeDeliveryRate += item.onTimeDeliveryRate
        acc.orders += item.orders
        acc.exceptions += item.exceptions
        return acc
      },
      { revenue: 0, shipmentVolume: 0, onTimeDeliveryRate: 0, orders: 0, exceptions: 0 },
    )

    return {
      revenue: totals.revenue,
      shipmentVolume: totals.shipmentVolume,
      onTimeDeliveryRate: totals.onTimeDeliveryRate / monthlyData.length,
      orders: totals.orders,
      exceptions: totals.exceptions,
      scopeLabel: 'All Months',
    }
  }

  const item = selectedRecord.value ?? latestRecord.value
  return {
    revenue: item.revenue,
    shipmentVolume: item.shipmentVolume,
    onTimeDeliveryRate: item.onTimeDeliveryRate,
    orders: item.orders,
    exceptions: item.exceptions,
    scopeLabel: item.label,
  }
})

function buildTrend(
  current: number,
  previous: number | null | undefined,
  invert = false,
  context = 'vs previous month',
): TrendMeta {
  if (previous == null || previous === 0) {
    return {
      text: 'No prior baseline',
      icon: 'mdi-minus-thick',
      color: 'medium-emphasis',
    }
  }

  const deltaPct = ((current - previous) / previous) * 100
  const positive = invert ? deltaPct <= 0 : deltaPct >= 0

  return {
    text: `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}% ${context}`,
    icon: deltaPct >= 0 ? 'mdi-arrow-up-right' : 'mdi-arrow-down-right',
    color: positive ? 'success' : 'error',
  }
}

const revenueTrend = computed(() =>
  buildTrend(trendCurrentRecord.value.revenue, comparisonRecord.value?.revenue, false, trendContextLabel.value),
)
const volumeTrend = computed(() =>
  buildTrend(
    trendCurrentRecord.value.shipmentVolume,
    comparisonRecord.value?.shipmentVolume,
    false,
    trendContextLabel.value,
  ),
)
const onTimeTrend = computed(() =>
  buildTrend(
    trendCurrentRecord.value.onTimeDeliveryRate,
    comparisonRecord.value?.onTimeDeliveryRate,
    false,
    trendContextLabel.value,
  ),
)
const ordersTrend = computed(() =>
  buildTrend(trendCurrentRecord.value.orders, comparisonRecord.value?.orders, false, trendContextLabel.value),
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
    value: formatPercent(kpiCurrent.value.onTimeDeliveryRate),
    icon: 'mdi-timer-check-outline',
    trend: onTimeTrend.value,
    helper: selectedMonth.value === 'All' ? '12-month average' : 'Selected month value',
  },
  {
    key: 'orders',
      label: 'Orders',
    value: formatNumber(kpiCurrent.value.orders),
    icon: 'mdi-clipboard-list-outline',
    trend: ordersTrend.value,
    helper:
      selectedMonth.value === 'All'
        ? `Exceptions total: ${formatNumber(kpiCurrent.value.exceptions)}`
        : `Exceptions: ${formatNumber(kpiCurrent.value.exceptions)}`,
  },
])

const labels = computed(() => monthlyData.map((item) => item.label))

const selectedLabel = computed(() => {
  if (selectedMonth.value === 'All') return 'All'
  return monthlyData.find((item) => item.month === selectedMonth.value)?.label ?? ''
})

function colorByFocus(active: string, muted: string): string[] {
  if (selectedMonth.value === 'All') {
    return labels.value.map(() => active)
  }
  return labels.value.map((label) => (label === selectedLabel.value ? active : muted))
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
        font: {
          size: 13,
          weight: 600,
        },
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
      ticks: {
        color: '#c9ddf6',
        font: {
          size: 12,
          weight: 600,
        },
      },
    },
    y: {
      grid: { color: 'rgba(141, 170, 203, 0.16)' },
      ticks: {
        color: '#c9ddf6',
        font: {
          size: 12,
          weight: 600,
        },
        callback: (value) => formatCurrencyCompact(Number(value)),
      },
      title: {
        display: true,
        text: 'Revenue (USD)',
        color: '#d6e7fc',
        font: {
          size: 13,
          weight: 700,
        },
      },
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
        font: {
          size: 13,
          weight: 600,
        },
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
      ticks: {
        color: '#c9ddf6',
        font: {
          size: 12,
          weight: 600,
        },
      },
    },
    y: {
      grid: { color: 'rgba(141, 170, 203, 0.16)' },
      ticks: {
        color: '#c9ddf6',
        font: {
          size: 12,
          weight: 600,
        },
        callback: (value) => formatNumber(Number(value)),
      },
      title: {
        display: true,
        text: 'Shipments',
        color: '#d6e7fc',
        font: {
          size: 13,
          weight: 700,
        },
      },
    },
  },
}

const deliveryYScale: NonNullable<ChartOptions<'line'>['scales']>['y'] = {
  min: 90,
  max: 100,
  grid: { color: 'rgba(141, 170, 203, 0.16)' },
  ticks: {
    color: '#c9ddf6',
    font: {
      size: 12,
      weight: 600,
    },
    callback: (value) => `${Number(value)}%`,
  },
  title: {
    display: true,
    text: 'On-Time %',
    color: '#d6e7fc',
    font: {
      size: 13,
      weight: 700,
    },
  },
}

const deliveryChartOptions = computed<ChartOptions<'line'>>(() => ({
  ...lineChartOptions,
  scales: {
    ...lineChartOptions.scales,
    y: deliveryYScale,
  },
}))

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
        selectedMonth.value === 'All' ? 3 : label === selectedLabel.value ? 5 : 2,
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
      data: monthlyData.map((item) => item.onTimeDeliveryRate),
      borderColor: '#ffba73',
      backgroundColor: 'rgba(255, 186, 115, 0.22)',
      fill: true,
      pointBackgroundColor: colorByFocus('#ffd9aa', 'rgba(255, 217, 170, 0.35)'),
      pointRadius: labels.value.map((label) =>
        selectedMonth.value === 'All' ? 3 : label === selectedLabel.value ? 5 : 2,
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
            <div class="summary-eyebrow text-medium-emphasis">Viewing</div>
            <div class="summary-title">{{ kpiCurrent.scopeLabel }} Performance Snapshot</div>
          </div>
          <div class="summary-meta text-medium-emphasis">Updated through Dec 2025</div>
        </v-card-text>
      </v-card>

      <v-row class="mb-4 staged-row">
        <v-col v-for="card in kpiCards" :key="card.key" cols="12" sm="6" lg="3">
          <v-card rounded="lg" border height="100%" class="kpi-card">
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-start mb-2">
                <div class="text-overline text-medium-emphasis metric-label">{{ card.label }}</div>
                <v-icon :icon="card.icon" color="info" size="22" />
              </div>

              <div class="kpi-value mb-3">{{ card.value }}</div>

              <div class="d-flex align-center ga-2 text-caption font-weight-medium trend-row">
                <v-icon :icon="card.trend.icon" :color="card.trend.color" size="18" />
                <span :class="`text-${card.trend.color}`">{{ card.trend.text }}</span>
              </div>

              <div class="text-caption text-medium-emphasis mt-2">{{ card.helper }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-4 staged-row">
        <v-col cols="12" lg="6">
          <v-card rounded="lg" border class="chart-card">
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
          <v-card rounded="lg" border class="chart-card">
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

      <v-row class="staged-row">
        <v-col cols="12">
          <v-card rounded="lg" border class="chart-card">
            <v-card-item>
              <v-card-title class="text-subtitle-1 font-weight-bold">On-Time Delivery Performance</v-card-title>
              <v-card-subtitle>Full-year reliability with month-aware highlighting</v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <div class="chart-shell chart-shell--wide">
                <Line :data="deliveryAreaData" :options="deliveryChartOptions" aria-label="On-time area chart" />
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
  padding-inline: clamp(18px, 3.8vw, 52px);
}

.glass-bar {
  backdrop-filter: blur(10px);
  background: linear-gradient(180deg, rgba(12, 20, 35, 0.95), rgba(12, 20, 35, 0.82));
  border-bottom: 1px solid rgba(155, 189, 227, 0.3);
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

.month-filter {
  flex: 0 1 280px;
  max-width: 320px;
  min-width: 140px;
}

.month-filter :deep(.v-field) {
  width: 100%;
  border-radius: 12px;
}

.month-filter :deep(.v-field__outline) {
  --v-field-border-opacity: 0.55;
}

.month-filter :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
}

.dashboard {
  padding-top: 36px;
  padding-bottom: 36px;
  min-height: calc(100vh - 82px);
  background:
    radial-gradient(circle at 8% 8%, rgba(28, 197, 162, 0.16), transparent 34%),
    radial-gradient(circle at 88% 0%, rgba(117, 166, 228, 0.16), transparent 34%),
    linear-gradient(145deg, rgba(6, 12, 24, 0.92), rgba(8, 16, 30, 1));
}

.dashboard-title {
  color: #f8fbff;
  font-size: clamp(1.08rem, 0.95rem + 0.35vw, 1.32rem);
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

.logo-image {
  width: 100%;
  height: 100%;
}

.summary-banner {
  background: linear-gradient(120deg, rgba(24, 38, 66, 0.92), rgba(16, 30, 53, 0.88));
  border-color: rgba(129, 170, 217, 0.28);
}

.summary-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.summary-title {
  font-family: 'Sora', 'Manrope', sans-serif;
  font-size: clamp(1.05rem, 0.9rem + 0.55vw, 1.38rem);
  font-weight: 600;
  line-height: 1.25;
}

.summary-meta {
  font-size: 0.9rem;
  font-weight: 600;
  color: #d6e2f4 !important;
}

.kpi-card {
  transition: transform 160ms ease, border-color 160ms ease;
  background: linear-gradient(160deg, rgba(23, 38, 65, 0.88), rgba(17, 30, 54, 0.82));
  border-color: rgba(129, 168, 213, 0.24);
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(109, 171, 241, 0.45);
}

.metric-label {
  line-height: 1.3;
  letter-spacing: 0.05em;
  color: #d4e0f2 !important;
}

.kpi-value {
  font-family: 'Sora', 'Manrope', sans-serif;
  font-size: clamp(1.55rem, 1.2rem + 1.1vw, 2rem);
  font-weight: 700;
  line-height: 1.1;
}

.trend-row {
  line-height: 1.35;
  font-size: 0.84rem;
}

.text-caption.text-medium-emphasis {
  color: #cad9ee !important;
}

.v-card-subtitle {
  color: #cfddf1 !important;
  opacity: 1;
  font-size: 0.88rem;
  line-height: 1.35;
}

:deep(.v-card-title) {
  font-family: 'Sora', 'Manrope', sans-serif;
  font-size: 1.06rem !important;
  letter-spacing: 0.01em;
}

.chart-card {
  background: linear-gradient(160deg, rgba(19, 32, 57, 0.86), rgba(13, 24, 45, 0.8));
  border-color: rgba(122, 165, 213, 0.24);
}

.chart-shell {
  height: 280px;
}

.chart-shell--wide {
  height: 320px;
}

.staged-row {
  animation: staged-enter 500ms ease-out both;
}

.staged-row:nth-of-type(2) {
  animation-delay: 80ms;
}

.staged-row:nth-of-type(3) {
  animation-delay: 150ms;
}

@keyframes staged-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .summary-meta {
    width: 100%;
    text-align: left;
  }

  .kpi-value {
    font-size: clamp(1.38rem, 1.15rem + 1.2vw, 1.75rem);
  }
}
</style>
