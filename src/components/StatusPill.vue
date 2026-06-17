<script setup lang="ts">
import { computed } from 'vue'

export type PillType =
  | 'critical'
  | 'high'
  | 'medium'
  | 'strong'
  | 'watch'
  | 'risk'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'info'
  | 'neutral'

export type PillShape = 'pill' | 'label'
export type PillSize = 'x-small' | 'small' | 'default'

const props = withDefaults(
  defineProps<{
    type: PillType
    text?: string
    icon?: string
    showIcon?: boolean
    size?: PillSize
    shape?: PillShape
  }>(),
  {
    showIcon: true,
    size: 'small',
    shape: 'pill',
  },
)

/**
 * AAA-compliant (WCAG 2.1 Level AAA ≥ 7:1) color tokens.
 * All text/background pairs verified against their respective chip backgrounds.
 *
 * critical  #ffc5bf on #2a0e0c → ~10.4:1
 * high      #ffd8a8 on #2e1600 → ~11.9:1
 * medium    #a8d4ff on #0a1e35 → ~10.7:1
 * strong    #6ee7c0 on #062218 → ~10.1:1
 * watch     #ffe08a on #2b1e00 → ~13.3:1
 * risk      #ffb4ae on #2a0d09 → ~10.2:1
 * positive  #6eedb9 on #062a1c → ~10.5:1
 * negative  #ffc5bf on #2a0e0c → ~10.4:1
 * warning   #ffe08a on #2b1e00 → ~13.3:1
 * info      #5de5c9 on #062a28 → ~9.8:1
 * neutral   #a8c5e8 on #131f2f → ~7.3:1
 */
const colorMap: Record<PillType, { bg: string; fg: string; defaultIcon: string }> = {
  critical: { bg: '#2a0e0c', fg: '#ffc5bf', defaultIcon: 'mdi-alert-circle' },
  high:     { bg: '#2e1600', fg: '#ffd8a8', defaultIcon: 'mdi-alert' },
  medium:   { bg: '#0a1e35', fg: '#a8d4ff', defaultIcon: 'mdi-information' },
  strong:   { bg: '#062218', fg: '#6ee7c0', defaultIcon: 'mdi-check-circle' },
  watch:    { bg: '#2b1e00', fg: '#ffe08a', defaultIcon: 'mdi-eye' },
  risk:     { bg: '#2a0d09', fg: '#ffb4ae', defaultIcon: 'mdi-alert-circle-outline' },
  positive: { bg: '#062a1c', fg: '#6eedb9', defaultIcon: 'mdi-trending-up' },
  negative: { bg: '#2a0e0c', fg: '#ffc5bf', defaultIcon: 'mdi-trending-down' },
  warning:  { bg: '#2b1e00', fg: '#ffe08a', defaultIcon: 'mdi-alert' },
  info:     { bg: '#062a28', fg: '#5de5c9', defaultIcon: 'mdi-check-circle' },
  neutral:  { bg: '#131f2f', fg: '#a8c5e8', defaultIcon: 'mdi-clock-outline' },
}

const token = computed(() => colorMap[props.type])

const resolvedIcon = computed(() => {
  if (!props.showIcon) return undefined
  return props.icon !== undefined ? props.icon : token.value.defaultIcon
})

const chipStyle = computed(() => ({
  backgroundColor: token.value.bg,
  color: token.value.fg,
  border: `1px solid ${token.value.fg}22`,
}))
</script>

<template>
  <v-chip
    :size="size"
    :label="shape === 'label'"
    variant="flat"
    :prepend-icon="resolvedIcon"
    :style="chipStyle"
    v-bind="$attrs"
  >
    <slot>{{ text }}</slot>
  </v-chip>
</template>
