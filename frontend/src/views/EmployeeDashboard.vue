<template>
  <div class="min-h-screen bg-gray-950">
    <Navbar />

    <div class="page-container">

      <!-- Header row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-display font-bold text-white">My Leave Requests</h1>
          <p class="text-gray-500 text-sm mt-1">Track the status of all your applications.</p>
        </div>
        <RouterLink to="/employee/apply" class="btn-brand shrink-0">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </RouterLink>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div class="stat-card">
          <span class="stat-label">Total</span>
          <span class="stat-value text-white">{{ leaves.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label text-amber-500">Pending</span>
          <span class="stat-value text-amber-400">{{ count("Pending") }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label text-emerald-500">Approved</span>
          <span class="stat-value text-emerald-400">{{ count("Approved") }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label text-red-500">Rejected</span>
          <span class="stat-value text-red-400">{{ count("Rejected") }}</span>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-2 mb-5 flex-wrap">
        <button v-for="f in filters" :key="f.value" @click="active = f.value"
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-150',
            active === f.value
              ? 'bg-brand-500 border-brand-500 text-gray-950'
              : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
          ]">
          {{ f.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <Spinner size="lg" />
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="alert-error">{{ fetchError }}</div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="card text-center py-16">
        <div class="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-gray-400 font-medium">No requests found.</p>
        <RouterLink to="/employee/apply" class="btn-brand mt-4 inline-flex">Apply now</RouterLink>
      </div>

      <!-- Leave list -->
      <div v-else class="space-y-3">
        <div v-for="(leave, i) in filtered" :key="leave._id"
          class="card hover:border-gray-700 transition-all duration-200 animate-fade-up"
          :style="{ animationDelay: `${i * 40}ms` }">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

            <!-- Left -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <StatusBadge :status="leave.status" />
                <span class="text-xs text-gray-600 font-mono border border-gray-800 px-2 py-0.5 rounded-md">
                  {{ leave.leaveType }}
                </span>
                <span class="text-xs text-gray-600 font-mono">
                  {{ totalDays(leave) }} day{{ totalDays(leave) !== 1 ? "s" : "" }}
                </span>
              </div>
              <p class="text-sm font-medium text-gray-200">
                {{ fmtDate(leave.startDate) }} → {{ fmtDate(leave.endDate) }}
              </p>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ leave.reason }}</p>
            </div>

            <!-- Right -->
            <div class="text-xs text-gray-600 font-mono shrink-0 whitespace-nowrap">
              {{ fmtDate(leave.createdAt) }}
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Navbar from "../components/Navbar.vue";
import Spinner from "../components/Spinner.vue";
import StatusBadge from "../components/StatusBadge.vue";
import api from "../api/axios";
import type { LeaveRequest, LeaveStatus, FilterOption } from "../types";
import type { AxiosError } from "axios";

const leaves     = ref<LeaveRequest[]>([]);
const loading    = ref(true);
const fetchError = ref("");
const active     = ref<LeaveStatus | "all">("all");

const filters: FilterOption[] = [
  { label: "All",      value: "all" },
  { label: "Pending",  value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

const filtered = computed<LeaveRequest[]>(() =>
  active.value === "all" ? leaves.value : leaves.value.filter(l => l.status === active.value)
);

const count = (status: LeaveStatus) => leaves.value.filter(l => l.status === status).length;

const totalDays = (l: LeaveRequest): number => {
  const diff = new Date(l.endDate).getTime() - new Date(l.startDate).getTime();
  return Math.round(diff / 86_400_000) + 1;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

onMounted(async () => {
  try {
    // ✅ Matches: GET /api/leaves/my
    const { data } = await api.get<LeaveRequest[]>("/leaves/my");
    leaves.value = data;
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    fetchError.value = e.response?.data?.message ?? "Failed to load your leave requests.";
  } finally {
    loading.value = false;
  }
});
</script>
