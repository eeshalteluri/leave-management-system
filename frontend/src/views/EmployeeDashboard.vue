<template>
  <div class="min-h-screen bg-gray-950">

    <Navbar />

    <div class="page-container">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

        <div>
          <h1 class="text-2xl font-bold text-white">
            My Leave Requests
          </h1>

          <p class="text-gray-500 text-sm mt-1">
            Track the status of all your applications.
          </p>
        </div>

        <RouterLink
          to="/employee/apply"
          class="btn-brand flex items-center gap-2"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>

          New Request
        </RouterLink>

      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <div class="stat-card">
          <span class="stat-label">Total</span>
          <span class="stat-value text-white">
            {{ leaves.length }}
          </span>
        </div>

        <div class="stat-card">
          <span class="stat-label text-amber-400">Pending</span>
          <span class="stat-value text-amber-400">
            {{ count("Pending") }}
          </span>
        </div>

        <div class="stat-card">
          <span class="stat-label text-emerald-400">Approved</span>
          <span class="stat-value text-emerald-400">
            {{ count("Approved") }}
          </span>
        </div>

        <div class="stat-card">
          <span class="stat-label text-red-400">Rejected</span>
          <span class="stat-value text-red-400">
            {{ count("Rejected") }}
          </span>
        </div>

      </div>

      <!-- Filters -->
      <div class="flex gap-2 flex-wrap mb-6">

        <button
          v-for="f in filters"
          :key="f.value"
          @click="active = f.value"
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-full border transition',
            active === f.value
              ? 'bg-brand-500 border-brand-500 text-gray-950'
              : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
          ]"
        >
          {{ f.label }}
        </button>

      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <Spinner size="lg" />
      </div>

      <!-- Error -->
      <div
        v-else-if="fetchError"
        class="alert-error max-w-lg"
      >
        {{ fetchError }}
      </div>

      <!-- Empty -->
      <div
        v-else-if="filtered.length === 0"
        class="card text-center py-16"
      >

        <div class="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg
            class="w-6 h-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
            />
          </svg>
        </div>

        <p class="text-gray-400 font-medium">
          No requests found.
        </p>

        <RouterLink
          to="/employee/apply"
          class="btn-brand mt-4 inline-flex"
        >
          Apply now
        </RouterLink>

      </div>

      <!-- Leave List -->
      <div v-else class="space-y-4">

        <div
  v-for="(leave, i) in filtered"
  :key="leave._id"
  class="group relative card hover:border-gray-700 transition-all duration-200 animate-fade-up"
  :style="{ animationDelay: `${i * 40}ms` }"
>

  <div class="flex flex-col md:flex-row md:items-end justify-between gap-5">

    <!-- LEFT CONTENT -->
    <div class="flex-1 min-w-0">

      <!-- Status + Tags -->
      <div class="flex items-center gap-2 flex-wrap mb-3">

        <StatusBadge :status="leave.status" />

        <span class="text-xs text-gray-400 border border-gray-800 px-2 py-0.5 rounded-md">
          {{ leave.leaveType }}
        </span>

        <span class="text-xs text-gray-500 font-medium">
          {{ totalDays(leave) }} day{{ totalDays(leave) !== 1 ? "s" : "" }}
        </span>

      </div>

      <!-- Leave Dates -->
      <div class="flex items-center gap-2 text-sm font-medium text-gray-200">

        <svg
          class="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0
               002-2V7a2 2 0 00-2-2H5a2 2 0
               00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        {{ fmtDate(leave.startDate) }}
        <span class="text-gray-600">→</span>
        {{ fmtDate(leave.endDate) }}

      </div>

      <!-- Reason -->
      <p class="text-sm text-gray-500 mt-2 line-clamp-2">
        {{ leave.reason }}
      </p>

    </div>

  <!-- Right -->
  <div class="flex flex-col lg:min-w-[200px]">

    <div class="mt-auto grid grid-cols-2 gap-3 text-xs">

      <div class="flex flex-col">
        <span class="text-gray-600">
          Requested at
        </span>

        <span class="text-sm text-gray-300">
          {{ fmtDate(leave.createdAt) }}
        </span>
      </div>

      <div class="flex flex-col">
        <span class="text-gray-600">
          Updated at
        </span>

        <span class="text-sm text-gray-300">
          {{
            new Date(leave.updatedAt).getTime() === new Date(leave.createdAt).getTime()
              ? "—"
              : fmtDate(leave.updatedAt)
          }}
        </span>
      </div>

    </div>

  </div>

  </div>

  <!-- subtle hover glow -->
  <div
    class="absolute inset-0 rounded-2xl border border-transparent group-hover:border-gray-700 pointer-events-none transition"
  />

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
import type { LeaveRequest, LeaveStatus, FilterOption, MyLeavesResponse } from "../types";
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
    // ✅ Matches: GET /api/leave/my
    const { data } = await api.get<MyLeavesResponse>("/leave/my");
    leaves.value = data.leaves;
    console.log(leaves.value);
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    fetchError.value = e.response?.data?.message ?? "Failed to load your leave requests.";
  } finally {
    loading.value = false;
  }
});
</script>
