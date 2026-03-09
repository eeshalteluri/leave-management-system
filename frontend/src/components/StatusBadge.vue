<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border"
    :class="badgeClass"
  >
    <span
      class="w-1.5 h-1.5 rounded-full"
      :class="dotClass"
    />
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { LeaveStatus } from "../types"

const props = defineProps<{
  status: LeaveStatus
}>()

const badgeClass = computed(() => {
  switch (props.status) {
    case "Pending":
      return "bg-amber-500/10 border-amber-500/20 text-amber-400"

    case "Approved":
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"

    case "Rejected":
      return "bg-red-500/10 border-red-500/20 text-red-400"

    default:
      return "bg-gray-800 border-gray-700 text-gray-400"
  }
})

const dotClass = computed(() => {
  switch (props.status) {
    case "Pending":
      return "bg-amber-400"

    case "Approved":
      return "bg-emerald-400"

    case "Rejected":
      return "bg-red-400"

    default:
      return "bg-gray-400"
  }
})
</script>