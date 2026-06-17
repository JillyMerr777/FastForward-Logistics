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

import StatusPill from '@/components/StatusPill.vue'
import type { PillType } from '@/components/StatusPill.vue'

const regionHeaders = [
  { title: 'Region', key: 'region', sortable: false },
  { title: 'Shipments', key: 'shipments', sortable: false },
  { title: 'On-Time %', key: 'onTimeRate', sortable: false },
  { title: 'Avg Delay (hrs)', key: 'avgDelayHours', sortable: false },
  { title: 'Open Exceptions', key: 'openExceptions', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
]

function regionPillType(status: RegionPerformance['status']): PillType {
  return status.toLowerCase() as PillType
}

function priorityPillType(priority: ExceptionItem['priority']): PillType {
  return priority.toLowerCase() as PillType
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
  <v-container fluid class="dashboard pa-4 pa-md-6">

    <!-- Hero Banner -->
    <v-card class="mb-4 stagger-1" rounded="lg" border>
      <v-card-text class="pa-5">
        <v-row align="center" justify="space-between" no-gutters>
          <v-col>
            <div class="text-overline text-teal-lighten-1 mb-1">FastForward Logistics</div>
            <h1 class="text-h4 font-weight-bold mb-2">Internal Operations Dashboard</h1>
            <p class="text-body-2 text-medium-emphasis">
              Single-source operational visibility for leadership across shipment volume, delivery
              reliability, regional performance, and active exceptions.
            </p>
          </v-col>
          <v-col cols="auto" class="mt-3 mt-sm-0 d-flex gap-2">
            <StatusPill type="info" text="Live Prototype" class="font-weight-bold" />
            <StatusPill type="neutral" text="Updated: 15 min ago" :show-icon="false" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- KPI Cards -->
    <v-row class="mb-4 stagger-2">
      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="lg" border height="100%">
          <v-card-text class="pa-4">
            <div class="text-overline text-medium-emphasis mb-1">Shipment Volume (8 Weeks)</div>
            <div class="text-h4 font-weight-bold mb-2">{{ totalShipments.toLocaleString() }}</div>
            <StatusPill type="positive" text="+8.4% vs prior cycle" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="lg" border height="100%">
          <v-card-text class="pa-4">
            <div class="text-overline text-medium-emphasis mb-1">On-Time Delivery</div>
            <div class="text-h4 font-weight-bold mb-2">{{ latestOnTimeRate.toFixed(1) }}%</div>
            <StatusPill
              :type="onTimeDelta >= 0 ? 'positive' : 'negative'"
              :text="`${onTimeDelta >= 0 ? '+' : ''}${onTimeDelta.toFixed(1)} pts vs last week`"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="lg" border height="100%">
          <v-card-text class="pa-4">
            <div class="text-overline text-medium-emphasis mb-1">Regional Health</div>
            <div class="text-h4 font-weight-bold mb-2">2 Strong / 2 Watch+Risk</div>
            <StatusPill type="warning" text="Southeast requires intervention" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="lg" border height="100%">
          <v-card-text class="pa-4">
            <div class="text-overline text-medium-emphasis mb-1">Open Exceptions</div>
            <div class="text-h4 font-weight-bold mb-2">{{ openExceptions.length }}</div>
            <StatusPill type="critical" text="1 critical, 2 high priority" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Shipment Volume + On-Time Delivery -->
    <v-row class="mb-4 stagger-3">
      <v-col cols="12" md="6">
        <v-card rounded="lg" border height="100%">
          <v-card-item>
            <v-card-title class="text-subtitle-1 font-weight-bold">Shipment Volume Overview</v-card-title>
            <v-card-subtitle>Weekly throughput and on-time context</v-card-subtitle>
          </v-card-item>
          <v-card-text class="pt-2">
            <div class="volume-grid" role="img" aria-label="Shipment volume by week">
              <div v-for="week in shipmentTrend" :key="week.week" class="bar-wrap">
                <div class="bar" :style="{ height: `${(week.volume / 3200) * 100}%` }" />
                <div class="bar-week">{{ week.week }}</div>
                <div class="bar-value">{{ week.volume }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="lg" border height="100%">
          <v-card-item>
            <v-card-title class="text-subtitle-1 font-weight-bold">On-Time Delivery Performance</v-card-title>
            <v-card-subtitle>Performance consistency over the same period</v-card-subtitle>
          </v-card-item>
          <v-card-text class="pt-2">
            <div v-for="week in shipmentTrend" :key="`${week.week}-rate`" class="mb-4">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-caption text-medium-emphasis">{{ week.week }}</span>
                <span class="text-caption font-weight-bold">{{ week.onTimeRate.toFixed(1) }}%</span>
              </div>
              <v-progress-linear
                :model-value="week.onTimeRate"
                bg-color="blue-grey-darken-3"
                color="teal"
                rounded
                height="8"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Regional Performance + Open Exceptions -->
    <v-row class="stagger-4">
      <v-col cols="12" md="7">
        <v-card rounded="lg" border>
          <v-card-item>
            <v-card-title class="text-subtitle-1 font-weight-bold">Regional Performance</v-card-title>
            <v-card-subtitle>Shipment load, reliability, delay trends, and risk status</v-card-subtitle>
          </v-card-item>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th v-for="h in regionHeaders" :key="h.key" class="text-left text-overline text-medium-emphasis">
                  {{ h.title }}
                </th>
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
                  <StatusPill :type="regionPillType(region.status)" :text="region.status" shape="label" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="lg" border height="100%">
          <v-card-item>
            <v-card-title class="text-subtitle-1 font-weight-bold">Open Exceptions</v-card-title>
            <v-card-subtitle>Priority queue for immediate operational action</v-card-subtitle>
          </v-card-item>
          <v-list lines="three" bg-color="transparent">
            <v-list-item
              v-for="item in openExceptions"
              :key="item.id"
              class="mb-1"
              rounded="lg"
            >
              <template #prepend>
                <v-icon :style="{ color: item.priority === 'Critical' ? '#ffc5bf' : item.priority === 'High' ? '#ffd8a8' : '#a8d4ff' }" class="mt-1">mdi-alert-circle-outline</v-icon>
              </template>
              <template #title>
                <span class="text-caption text-medium-emphasis">{{ item.id }}</span>
              </template>
              <template #subtitle>
                <span class="text-wrap">{{ item.issue }}</span>
                <div class="text-caption text-medium-emphasis mt-1">{{ item.owner }}</div>
              </template>
              <template #append>
                <div class="d-flex flex-column align-end ga-1 ml-3">
                  <StatusPill :type="priorityPillType(item.priority)" :text="item.priority" shape="label" size="x-small" />
                  <span class="text-caption text-medium-emphasis text-no-wrap">ETA {{ item.etaHours }}h</span>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 12%, rgba(20, 177, 157, 0.14), transparent 36%),
    radial-gradient(circle at 84% 2%, rgba(255, 132, 77, 0.10), transparent 33%);
}

.volume-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  align-items: end;
  gap: 0.6rem;
  min-height: 200px;
  padding-top: 0.4rem;
}

.bar-wrap {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.bar {
  width: 100%;
  border-radius: 0.45rem 0.45rem 0.25rem 0.25rem;
  background: linear-gradient(180deg, #1cc5a2 0%, #0f8f86 100%);
  box-shadow: 0 6px 18px rgba(10, 179, 153, 0.3);
  animation: grow 850ms ease both;
}

.bar-week {
  margin-top: 0.45rem;
  font-size: 0.72rem;
  opacity: 0.7;
  font-weight: 700;
}

.bar-value {
  font-size: 0.68rem;
  opacity: 0.5;
}

.stagger-1,
.stagger-2,
.stagger-3,
.stagger-4 {
  opacity: 0;
  transform: translateY(10px);
  animation: rise 600ms ease forwards;
}

.stagger-2 { animation-delay: 120ms; }
.stagger-3 { animation-delay: 240ms; }
.stagger-4 { animation-delay: 360ms; }

@keyframes rise {
  to { opacity: 1; transform: translateY(0); }
}

@keyframes grow {
  from { height: 0; }
}
</style>
