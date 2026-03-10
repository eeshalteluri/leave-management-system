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

      <!-- ── Leave Balance Section ─────────────────────────────── -->
      <div class="mb-8">
        <h2 class="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
          Leave Balance
        </h2>

        <!-- Loading skeleton -->
        <div v-if="balanceLoading" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div v-for="n in 3" :key="n" class="card-sm animate-pulse">
            <div class="h-3 w-20 bg-gray-800 rounded mb-4" />
            <div class="h-7 w-12 bg-gray-800 rounded mb-3" />
            <div class="h-1.5 w-full bg-gray-800 rounded-full" />
          </div>
        </div>

        <!-- Balance cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div v-for="b in balanceCards" :key="b.key"
            class="card-sm group hover:border-gray-700 transition-all duration-200">

            <!-- Top row: label + icon -->
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-medium uppercase tracking-widest" :class="b.labelColor">
                {{ b.label }}
              </span>
              <div class="w-7 h-7 rounded-lg flex items-center justify-center" :class="b.iconBg">
                <svg class="w-3.5 h-3.5" :class="b.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="b.icon" />
                </svg>
              </div>
            </div>

            <!-- Remaining / total -->
            <div class="flex items-end gap-1.5 mb-3">
              <span class="text-3xl font-display font-bold leading-none" :class="b.valueColor">
                {{ b.remaining }}
              </span>
              <span class="text-xs text-gray-600 font-mono mb-1">/ {{ b.max }} days</span>
            </div>

            <!-- Progress bar -->
            <div class="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="b.barColor"
                :style="{ width: `${b.pct}%` }"
              />
            </div>

            <!-- Used label -->
            <p class="text-xs text-gray-600 mt-2 font-mono">
              {{ b.max - b.remaining }} day{{ b.max - b.remaining !== 1 ? "s" : "" }} used
            </p>

          </div>
        </div>

        <!-- Error fetching balance -->
        <p v-if="balanceError" class="text-xs text-red-400 mt-2">
          {{ balanceError }}
        </p>
      </div>

      <!-- ── Request Summary Stats ──────────────────────────────── -->
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

      <!-- ── Filter tabs ────────────────────────────────────────── -->
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
      <div v-if="leavesLoading" class="flex justify-center py-20">
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

      <!-- ── Leave list ─────────────────────────────────────────── -->
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

              <!-- Manager comment — only shown after review -->
              <div v-if="leave.managerComment"
                class="flex items-start gap-2 mt-3 px-3 py-2 rounded-lg border"
                :class="leave.status === 'Approved'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-red-500/5 border-red-500/20'">
                <svg class="w-3.5 h-3.5 shrink-0 mt-0.5"
                  :class="leave.status === 'Approved' ? 'text-emerald-500' : 'text-red-500'"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <p class="text-xs font-medium mb-0.5"
                    :class="leave.status === 'Approved' ? 'text-emerald-400' : 'text-red-400'">
                    Manager's comment
                  </p>
                  <p class="text-xs text-gray-400">{{ leave.managerComment }}</p>
                </div>
              </div>
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
import type { LeaveRequest, LeaveStatus, FilterOption, LeaveBalance } from "../types";
import { LEAVE_BALANCE_MAX } from "../types";
import type { AxiosError } from "axios";

// ── State ─────────────────────────────────────────────────────
const leaves        = ref<LeaveRequest[]>([]);
const leavesLoading = ref(true);
const fetchError    = ref("");
const active        = ref<LeaveStatus | "all">("all");

const balance        = ref<LeaveBalance | null>(null);
const balanceLoading = ref(true);
const balanceError   = ref("");

// ── Balance card config ────────────────────────────────────────
interface BalanceCard {
  key:        keyof LeaveBalance;
  label:      string;
  remaining:  number;
  max:        number;
  pct:        number;
  icon:       string;
  labelColor: string;
  valueColor: string;
  barColor:   string;
  iconBg:     string;
  iconColor:  string;
}

const balanceCards = computed<BalanceCard[]>(() => {
  const b = balance.value;

  const configs: Omit<BalanceCard, "remaining" | "max" | "pct">[] = [
    {
      key:        "annual",
      label:      "Annual Leave",
      icon:       "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
      labelColor: "text-brand-500",
      valueColor: "text-brand-400",
      barColor:   "bg-brand-500",
      iconBg:     "bg-brand-500/10",
      iconColor:  "text-brand-400",
    },
    {
      key:        "sick",
      label:      "Sick Leave",
      icon:       "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      labelColor: "text-rose-500",
      valueColor: "text-rose-400",
      barColor:   "bg-rose-500",
      iconBg:     "bg-rose-500/10",
      iconColor:  "text-rose-400",
    },
    {
      key:        "casual",
      label:      "Casual Leave",
      icon:       "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
      labelColor: "text-violet-500",
      valueColor: "text-violet-400",
      barColor:   "bg-violet-500",
      iconBg:     "bg-violet-500/10",
      iconColor:  "text-violet-400",
    },
  ];

  return configs.map((c) => {
    const remaining = b?.[c.key] ?? LEAVE_BALANCE_MAX[c.key];
    const max       = LEAVE_BALANCE_MAX[c.key];
    const pct       = Math.max(0, Math.min(100, Math.round((remaining / max) * 100)));
    return { ...c, remaining, max, pct };
  });
});

// ── Filters ────────────────────────────────────────────────────
const filters: FilterOption[] = [
  { label: "All",      value: "all" },
  { label: "Pending",  value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

const filtered = computed<LeaveRequest[]>(() =>
  active.value === "all"
    ? leaves.value
    : leaves.value.filter(l => l.status === active.value)
);

const count = (status: LeaveStatus) =>
  leaves.value.filter(l => l.status === status).length;

// ── Helpers ───────────────────────────────────────────────────
const totalDays = (l: LeaveRequest): number => {
  const diff = new Date(l.endDate).getTime() - new Date(l.startDate).getTime();
  return Math.round(diff / 86_400_000) + 1;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// ── Data fetching ─────────────────────────────────────────────
onMounted(() => {
  // Fire both requests in parallel — neither blocks the other
  Promise.all([fetchLeaves(), fetchBalance()]);
});

async function fetchLeaves(): Promise<void> {
  try {
    // ✅ GET /api/leaves/my
    const { data } = await api.get<{message: string; leaves:LeaveRequest[]}>("/leave/my");
    leaves.value = data.leaves;
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    fetchError.value = e.response?.data?.message ?? "Failed to load your leave requests.";
  } finally {
    leavesLoading.value = false;
  }
}

async function fetchBalance(): Promise<void> {
  try {
    // ✅ GET /api/auth/me — returns user object including leaveBalance
    const { data } = await api.get<{ message: string; balance: LeaveBalance }>("/user/leave-balance");
    balance.value = data.balance;
  } catch (err) {
    // Non-critical — cards still render using the max values as a safe fallback
    const e = err as AxiosError<{ message: string }>;
    balanceError.value = e.response?.data?.message ?? "Could not load leave balance.";
  } finally {
    balanceLoading.value = false;
  }
}
</script>