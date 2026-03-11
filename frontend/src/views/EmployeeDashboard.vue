<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar />

    <div class="page-container">

      <!-- Header row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-display font-bold text-gray-900 dark:text-white">My Leave Requests</h1>
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
        <h2 class="text-xs font-medium uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-500">
          Leave Balance
        </h2>

        <!-- Loading skeleton -->
        <div v-if="balanceLoading" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div v-for="n in 3" :key="n" class="card-sm animate-pulse">
            <div class="h-3 w-20 rounded mb-4 bg-gray-200 dark:bg-gray-800" />
            <div class="h-7 w-12 rounded mb-3 bg-gray-200 dark:bg-gray-800" />
            <div class="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>

        <!-- Balance cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div v-for="b in balanceCards" :key="b.key"
            class="card-sm group hover:border-gray-300 transition-all duration-200 dark:hover:border-gray-700">

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
              <span class="text-xs font-mono mb-1 text-gray-400 dark:text-gray-600">/ {{ b.max }} days</span>
            </div>

            <!-- Progress bar -->
            <div class="w-full h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
              <div class="h-full rounded-full transition-all duration-500" :class="b.barColor" :style="{ width: `${b.pct}%` }" />
            </div>

            <!-- Used label -->
            <p class="text-xs font-mono mt-2 text-gray-400 dark:text-gray-600">
              {{ b.max - b.remaining }} day{{ b.max - b.remaining !== 1 ? "s" : "" }} used
            </p>

          </div>
        </div>

        <p v-if="balanceError" class="text-xs text-red-500 mt-2">{{ balanceError }}</p>
      </div>

      <!-- ── Request Summary Stats ──────────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div class="stat-card">
          <span class="stat-label">Total</span>
          <span class="stat-value text-gray-900 dark:text-white">{{ pagination.total || allLeaves.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label text-amber-600 dark:text-amber-500">Pending</span>
          <span class="stat-value text-amber-600 dark:text-amber-400">{{ count("Pending") }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label text-emerald-600 dark:text-emerald-500">Approved</span>
          <span class="stat-value text-emerald-600 dark:text-emerald-400">{{ count("Approved") }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label text-red-600 dark:text-red-500">Rejected</span>
          <span class="stat-value text-red-600 dark:text-red-400">{{ count("Rejected") }}</span>
        </div>
      </div>

      <!-- ── Filter tabs ────────────────────────────────────────── -->
      <div class="flex gap-2 mb-5 flex-wrap">
        <button v-for="f in filters" :key="f.value" @click="active = f.value"
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-150',
            active === f.value
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
          ]">
          {{ f.label }}
          <span v-if="f.value !== 'all'" class="ml-1.5 font-mono text-xs opacity-60">
            {{ count(f.value as LeaveStatus) }}
          </span>
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
        <div class="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-gray-100 dark:bg-gray-800">
          <svg class="w-6 h-6 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="font-medium text-gray-500 dark:text-gray-400">No requests found.</p>
        <RouterLink to="/employee/apply" class="btn-brand mt-4 inline-flex">Apply now</RouterLink>
      </div>

      <!-- ── Leave list ─────────────────────────────────────────── -->
      <div v-else class="space-y-3">
        <div v-for="(leave, i) in filtered" :key="leave._id"
          class="card hover:border-gray-300 transition-all duration-200 animate-fade-up dark:hover:border-gray-700 !p-0 overflow-hidden"
          :style="{ animationDelay: `${i * 40}ms` }">

          <div class="flex">

            <!-- Left accent strip: days count -->
            <div class="flex flex-col items-center justify-center px-4 py-5 min-w-[72px] shrink-0"
              :class="leave.status === 'Approved'  ? 'bg-emerald-500/10 dark:bg-emerald-500/10' :
                      leave.status === 'Rejected'  ? 'bg-red-500/10    dark:bg-red-500/10'    :
                                                     'bg-amber-500/10  dark:bg-amber-500/10'">
              <span class="text-3xl font-display font-bold leading-none"
                :class="leave.status === 'Approved'  ? 'text-emerald-600 dark:text-emerald-400' :
                        leave.status === 'Rejected'  ? 'text-red-600    dark:text-red-400'    :
                                                       'text-amber-600  dark:text-amber-400'">
                {{ totalDays(leave) }}
              </span>
              <span class="text-xs font-mono mt-0.5"
                :class="leave.status === 'Approved'  ? 'text-emerald-500/70' :
                        leave.status === 'Rejected'  ? 'text-red-500/70'    :
                                                       'text-amber-500/70'">
                {{ totalDays(leave) === 1 ? "day" : "days" }}
              </span>
            </div>

            <!-- Divider line -->
            <div class="w-px self-stretch bg-gray-200 dark:bg-gray-800" />

            <!-- Main content -->
            <div class="flex-1 min-w-0 p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">

              <div class="flex-1 min-w-0">

                <!-- Leave type pill + status badge -->
                <div class="flex items-center gap-2 flex-wrap mb-2.5">
                  <StatusBadge :status="leave.status" />
                  <span class="text-xs font-semibold font-mono px-2.5 py-1 rounded-full border"
                    :class="leaveTypeStyle(leave.leaveType)">
                    {{ leave.leaveType }}
                  </span>
                </div>

                <!-- Dates -->
                <p class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {{ fmtDate(leave.startDate) }}
                  <span class="font-normal text-gray-400 dark:text-gray-600 mx-1">→</span>
                  {{ fmtDate(leave.endDate) }}
                </p>

                <!-- Reason -->
                <p class="text-sm line-clamp-2 text-gray-500 dark:text-gray-500">{{ leave.reason }}</p>

                <!-- Manager comment -->
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
                      :class="leave.status === 'Approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                      Manager's comment
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ leave.managerComment }}</p>
                  </div>
                </div>

              </div>

              <!-- Applied date -->
              <div class="text-sm font-mono shrink-0 whitespace-nowrap text-gray-400 dark:text-gray-600 sm:text-right">
                <span class="block text-xs text-gray-400 dark:text-gray-600 mb-0.5">Applied</span>
                {{ fmtDate(leave.createdAt) }}
              </div>

            </div>
          </div>

        </div>
      </div>

      <!-- ── Pagination ─────────────────────────────────────────── -->
      <div v-if="totalPages > 1"
        class="flex items-center justify-between mt-6 pt-5 border-t border-gray-200 dark:border-gray-800">

        <!-- Result range info -->
        <p class="text-xs font-mono text-gray-400 dark:text-gray-600">
          Showing
          <span class="text-gray-600 dark:text-gray-400">{{ (currentPage - 1) * pageLimit + 1 }}</span>
          –
          <span class="text-gray-600 dark:text-gray-400">{{ Math.min(currentPage * pageLimit, filteredAll.length) }}</span>
          of
          <span class="text-gray-600 dark:text-gray-400">{{ filteredAll.length }}</span>
          requests
        </p>

        <!-- Page controls -->
        <div class="flex items-center gap-1">

          <!-- Previous -->
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Page numbers -->
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '...'"
              class="w-8 h-8 flex items-center justify-center text-sm text-gray-400 dark:text-gray-600">
              …
            </span>
            <button v-else @click="goToPage(p as number)"
              :class="[
                'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium border transition-all duration-150',
                p === currentPage
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
              ]">
              {{ p }}
            </button>
          </template>

          <!-- Next -->
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import Navbar from "../components/Navbar.vue";
import Spinner from "../components/Spinner.vue";
import StatusBadge from "../components/StatusBadge.vue";
import api from "../api/axios";
import type { LeaveRequest, LeaveStatus, FilterOption, LeaveBalance, MyLeavesResponse } from "../types";
import { LEAVE_BALANCE_MAX } from "../types";
import type { AxiosError } from "axios";

const leaves        = ref<LeaveRequest[]>([]);
const allLeaves     = ref<LeaveRequest[]>([]); // full list for stat counts only
const leavesLoading = ref(true);
const fetchError    = ref("");
const active        = ref<LeaveStatus | "all">("all");

const balance        = ref<LeaveBalance | null>(null);
const balanceLoading = ref(true);
const balanceError   = ref("");

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
      labelColor: "text-brand-600 dark:text-brand-500",
      valueColor: "text-brand-600 dark:text-brand-400",
      barColor:   "bg-brand-500",
      iconBg:     "bg-brand-500/10",
      iconColor:  "text-brand-600 dark:text-brand-400",
    },
    {
      key:        "sick",
      label:      "Sick Leave",
      icon:       "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      labelColor: "text-rose-600 dark:text-rose-500",
      valueColor: "text-rose-600 dark:text-rose-400",
      barColor:   "bg-rose-500",
      iconBg:     "bg-rose-500/10",
      iconColor:  "text-rose-600 dark:text-rose-400",
    },
    {
      key:        "casual",
      label:      "Casual Leave",
      icon:       "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
      labelColor: "text-violet-600 dark:text-violet-500",
      valueColor: "text-violet-600 dark:text-violet-400",
      barColor:   "bg-violet-500",
      iconBg:     "bg-violet-500/10",
      iconColor:  "text-violet-600 dark:text-violet-400",
    },
  ];

  return configs.map((c) => {
    const remaining = b?.[c.key] ?? LEAVE_BALANCE_MAX[c.key];
    const max       = LEAVE_BALANCE_MAX[c.key];
    const pct       = Math.max(0, Math.min(100, Math.round((remaining / max) * 100)));
    return { ...c, remaining, max, pct };
  });
});

const filters: FilterOption[] = [
  { label: "All",      value: "all" },
  { label: "Pending",  value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

// ── Pagination (server-side fetch, client-side status filter) ─
const currentPage = ref(1);
const pageLimit   = ref(5);
const pagination  = ref<{ total: number; page: number; limit: number; totalPages: number }>({
  total: 0, page: 1, limit: 5, totalPages: 1,
});

// All records matching the active status tab
const filteredAll = computed<LeaveRequest[]>(() =>
  active.value === "all"
    ? allLeaves.value
    : allLeaves.value.filter(l => l.status === active.value)
);

// Slice for the current page
const filtered = computed<LeaveRequest[]>(() => {
  const start = (currentPage.value - 1) * pageLimit.value;
  return filteredAll.value.slice(start, start + pageLimit.value);
});

const totalPages = computed(() => Math.ceil(filteredAll.value.length / pageLimit.value));

// Reset to page 1 when status tab changes
watch(active, () => { currentPage.value = 1; });

const pageNumbers = computed<(number | "...")[]>(() => {
  const total = totalPages.value;
  const cur   = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (cur > 3) pages.push("...");
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
  if (cur < total - 2) pages.push("...");
  pages.push(total);
  return pages;
});

function goToPage(page: number): void {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const count = (status: LeaveStatus) => allLeaves.value.filter(l => l.status === status).length;

const totalDays = (l: LeaveRequest): number => {
  const diff = new Date(l.endDate).getTime() - new Date(l.startDate).getTime();
  return Math.round(diff / 86_400_000) + 1;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const leaveTypeStyles: Record<string, string> = {
  "Annual Leave":    "bg-brand-500/10  border-brand-500/30  text-brand-700  dark:text-brand-300",
  "Sick Leave":      "bg-rose-500/10   border-rose-500/30   text-rose-700   dark:text-rose-300",
  "Casual Leave":    "bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300",
  "Maternity Leave": "bg-pink-500/10   border-pink-500/30   text-pink-700   dark:text-pink-300",
  "Paternity Leave": "bg-sky-500/10    border-sky-500/30    text-sky-700    dark:text-sky-300",
  "Unpaid Leave":    "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300",
};

const leaveTypeStyle = (type: string): string =>
  leaveTypeStyles[type] ?? "bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";

onMounted(() => {
  Promise.all([fetchLeaves(1), fetchAllLeaves(), fetchBalance()]);
});

async function fetchLeaves(page = currentPage.value): Promise<void> {
  leavesLoading.value = true;
  fetchError.value    = "";
  try {
    const { data } = await api.get<MyLeavesResponse>("/leave/my", {
      params: { page, limit: pageLimit.value },
    });
    leaves.value      = data.leaves;
    currentPage.value = page;
    if (data.pagination) {
      pagination.value = data.pagination;
    }
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    fetchError.value = e.response?.data?.message ?? "Failed to load your leave requests.";
  } finally {
    leavesLoading.value = false;
  }
}

// Fetches all leaves with a large limit purely for stat counts —
// never used for rendering so it doesn't affect pagination display
async function fetchAllLeaves(): Promise<void> {
  try {
    const { data } = await api.get<MyLeavesResponse>("/leave/my", {
      params: { page: 1, limit: 9999 },
    });
    allLeaves.value = data.leaves;
  } catch {
    // Non-critical — counts just won't update if this fails
  }
}

async function fetchBalance(): Promise<void> {
  try {
    const { data } = await api.get<{ message: string; balance: LeaveBalance }>("/user/leave-balance");
    balance.value = data.balance;
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    balanceError.value = e.response?.data?.message ?? "Could not load leave balance.";
  } finally {
    balanceLoading.value = false;
  }
}
</script>