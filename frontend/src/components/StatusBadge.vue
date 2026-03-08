<template>
  <span :class="badgeClass">
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass" />
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { LeaveStatus } from "../types/index";

const props = defineProps<{ status: LeaveStatus }>();

const badgeClass = computed(() => ({
  "Pending":  "badge-pending",
  "Approved": "badge-approved",
  "Rejected": "badge-rejected",
}[props.status] ?? "badge-pending"));

const dotClass = computed(() => ({
  "Pending":  "bg-amber-400",
  "Approved": "bg-emerald-400",
  "Rejected": "bg-red-400",
}[props.status] ?? "bg-amber-400"));
</script>
