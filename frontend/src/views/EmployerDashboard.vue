<template>
  <div class="min-h-screen bg-gray-950">
    <Navbar />

    <div class="page-container">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-display font-bold text-white">Leave Requests</h1>
        <p class="text-gray-500 text-sm mt-1">Review and action all employee applications.</p>
      </div>

      <!-- Stats -->
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
          <span v-if="f.value !== 'all'" class="ml-1.5 font-mono text-xs opacity-60">
            {{ count(f.value as LeaveStatus) }}
          </span>
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
        <p class="text-gray-400 font-medium">No leave requests found.</p>
      </div>

      <!-- Request list -->
      <div v-else class="space-y-4">

<div
  v-for="(leave, i) in filtered"
  :key="leave._id"
  class="card hover:border-gray-700 transition-all duration-200 animate-fade-up"
  :style="{ animationDelay: `${i * 40}ms` }"
>

  <div class="flex flex-col md:flex-row md:items-stretch justify-between gap-6">

    <!-- LEFT SIDE -->
    <div class="flex-1 min-w-0">

      <!-- Status / Type / Duration -->
      <div class="flex items-center flex-wrap gap-2 mb-3">

        <StatusBadge :status="leave.status" />

        <span class="text-xs text-gray-400 border border-gray-800 px-2 py-0.5 rounded-md">
          {{ leave.leaveType }}
        </span>

        <span class="text-xs text-gray-500">
          {{ totalDays(leave) }} day{{ totalDays(leave) !== 1 ? "s" : "" }}
        </span>

      </div>

      <!-- Employee -->
      <div class="flex items-center gap-3 mb-3">

        <div
          class="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0"
        >
          <span class="text-xs font-semibold text-brand-400 font-mono">
            {{ employeeName(leave).charAt(0).toUpperCase() }}
          </span>
        </div>

        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-200 truncate">
            {{ employeeName(leave) }}
          </p>

          <p class="text-xs text-gray-500 truncate">
            {{ employeeEmail(leave) }}

            <span
              v-if="employeeDept(leave)"
              class="text-gray-600 ml-1"
            >
              · {{ employeeDept(leave) }}
            </span>
          </p>
        </div>

      </div>

      <!-- Leave Dates -->
      <div class="flex items-center gap-2 text-sm text-gray-400">

        <svg
          class="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round"
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


    <!-- RIGHT SIDE -->
    <div class="flex flex-col justify-between gap-4 lg:min-w-[220px]">

      <!-- ACTIONS -->
      <template v-if="leave.status === 'Pending'">

        <div class="flex gap-2">

          <button
            @click="updateStatus(leave._id, 'Approved')"
            class="btn-approve flex-1"
            :disabled="processing === leave._id"
          >
            <Spinner
              v-if="processing === leave._id"
              size="sm"
              color="text-emerald-400"
            />

            <svg
              v-else
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>

            Approve
          </button>


          <button
            @click="updateStatus(leave._id, 'Rejected')"
            class="btn-reject flex-1"
            :disabled="processing === leave._id"
          >
            <Spinner
              v-if="processing === leave._id"
              size="sm"
              color="text-red-400"
            />

            <svg
              v-else
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>

            Reject
          </button>

        </div>

      </template>

      <div
        v-else
        class="text-xs font-mono text-gray-600 capitalize"
      >
        Reviewed
      </div>


      <!-- META INFO -->
      <div class="grid grid-cols-2 gap-3 text-xs">

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


  <!-- Action Error -->
  <div
    v-if="actionErrors[leave._id]"
    class="alert-error mt-3 text-xs py-2"
  >
    {{ actionErrors[leave._id] }}
  </div>

</div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import Navbar from "../components/Navbar.vue";
import Spinner from "../components/Spinner.vue";
import StatusBadge from "../components/StatusBadge.vue";
import api from "../api/axios";
import type { LeaveRequest, LeaveStatus, FilterOption, UpdateLeaveStatusPayload, MyLeavesResponse } from "../types";
import type { AxiosError } from "axios";

const leaves      = ref<LeaveRequest[]>([]);
const loading     = ref(true);
const fetchError  = ref("");
const active      = ref<LeaveStatus | "all">("all");
const processing  = ref<string | null>(null);
const actionErrors = reactive<Record<string, string>>({});

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

// Safely extract employee fields whether populated or an embedded object
const employeeName  = (l: LeaveRequest): string => (l.employee as any)?.name  ?? "Unknown";
const employeeEmail = (l: LeaveRequest): string => (l.employee as any)?.email ?? "";
const employeeDept  = (l: LeaveRequest): string => (l.employee as any)?.department ?? "";

async function updateStatus(id: string, status: "Approved" | "Rejected"): Promise<void> {
  delete actionErrors[id];
  processing.value = id;

  try {
    const payload: UpdateLeaveStatusPayload = { status };

    const { data } = await api.put(`/leave/${id}`, payload);

    const updatedLeave = data.leave;

    leaves.value = leaves.value.map(l =>
      l._id === id ? updatedLeave : l
    );

  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    actionErrors[id] = e.response?.data?.message ?? "Failed to update status.";
  } finally {
    processing.value = null;
  }
}

onMounted(async () => {
  try {
    // ✅ Matches: GET /api/leave/all
    const { data } = await api.get<MyLeavesResponse>("/leave/all");
    leaves.value = data.leaves;
    console.log("leaves: ", leaves.value);
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    fetchError.value = e.response?.data?.message ?? "Failed to load leave requests.";
  } finally {
    loading.value = false;
  }
});
</script>
