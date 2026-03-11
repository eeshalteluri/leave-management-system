<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar />

    <div class="page-container">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-display font-bold text-gray-900 dark:text-white">Leave Requests</h1>
        <p class="text-sm mt-1 text-gray-500">Review and action all employee applications.</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="stat-card">
          <span class="stat-label">Total</span>
          <span class="stat-value text-gray-900 dark:text-white">{{ pagination.total || leaves.length }}</span>
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

      <!-- ── Filter bar ─────────────────────────────────────────── -->
      <div class="mb-5">

        <!-- Top row: status tabs + filter toggle -->
        <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div class="flex gap-2 flex-wrap">
            <button v-for="f in statusFilters" :key="f.value" @click="filters.status = f.value"
              :class="[
                'px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-150',
                filters.status === f.value
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              ]">
              {{ f.label }}
              <span v-if="f.value !== 'all'" class="ml-1.5 font-mono text-xs opacity-60">
                {{ count(f.value as LeaveStatus) }}
              </span>
            </button>
          </div>

          <!-- Advanced filter toggle button -->
          <button @click="showAdvanced = !showAdvanced"
            :class="[
              'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150',
              hasAdvancedFilters
                ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            ]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            <span v-if="hasAdvancedFilters"
              class="w-4 h-4 rounded-full bg-brand-500 text-gray-950 text-xs font-bold flex items-center justify-center">
              {{ activeFilterCount }}
            </span>
          </button>
        </div>

        <!-- Advanced filter panel -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="showAdvanced" class="card p-4 space-y-4">

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <!-- Employee name search -->
              <div>
                <label class="field-label mb-1.5">Employee</label>
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    v-model="filters.employee"
                    type="text"
                    class="field pl-8 text-sm"
                    placeholder="Search by name…"
                  />
                </div>
              </div>

              <!-- Leave type -->
              <div>
                <label class="field-label mb-1.5">Leave Type</label>
                <select v-model="filters.leaveType" class="field text-sm">
                  <option value="">All types</option>
                  <option v-for="t in leaveTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>

              <!-- Date from -->
              <div>
                <label class="field-label mb-1.5">From</label>
                <input
                  v-model="filters.dateFrom"
                  type="date"
                  class="field text-sm"
                />
              </div>

              <!-- Date to -->
              <div>
                <label class="field-label mb-1.5">To</label>
                <input
                  v-model="filters.dateTo"
                  type="date"
                  class="field text-sm"
                />
              </div>

            </div>

            <!-- Clear filters -->
            <div class="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-800">
              <p class="text-xs font-mono text-gray-400 dark:text-gray-600">
                {{ filteredAll.length }} result{{ filteredAll.length !== 1 ? "s" : "" }} shown
              </p>
              <button
                @click="clearAdvancedFilters"
                :disabled="!hasAdvancedFilters"
                class="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Clear filters
              </button>
            </div>

          </div>
        </Transition>

      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <Spinner size="lg" />
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="alert-error">{{ fetchError }}</div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="card text-center py-16">
        <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-gray-400 font-medium">No leave requests match your filters.</p>
        <button v-if="hasAdvancedFilters || filters.status !== 'all'"
          @click="clearAllFilters"
          class="btn-brand mt-4 inline-flex">
          Clear all filters
        </button>
      </div>

      <!-- ── Request list ────────────────────────────────────────── -->
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
                <div class="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <span class="text-xs font-semibold text-brand-400 font-mono">
                    {{ employeeName(leave).charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{{ employeeName(leave) }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 truncate">
                    {{ employeeEmail(leave) }}
                    <span v-if="employeeDept(leave)" class="text-gray-600 ml-1">
                      · {{ employeeDept(leave) }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Leave Dates -->
              <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ fmtDate(leave.startDate) }}
                <span class="text-gray-400 dark:text-gray-600">→</span>
                {{ fmtDate(leave.endDate) }}
              </div>

              <!-- Reason -->
              <p class="text-sm mt-2 line-clamp-2 text-gray-500">{{ leave.reason }}</p>

              <!-- Manager comment — shown after review -->
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
                    Your comment
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ leave.managerComment }}</p>
                </div>
              </div>

            </div>

            <!-- RIGHT SIDE -->
            <div class="flex flex-col justify-between gap-4 lg:min-w-[220px]">

              <template v-if="leave.status === 'Pending'">
                <!-- Comment input -->
                <div>
                  <label class="field-label mb-1.5">
                    Comment
                    <span class="text-gray-600 normal-case font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    v-model="comments[leave._id]"
                    rows="3"
                    class="field text-xs resize-none"
                    placeholder="Add a comment for the employee…"
                    maxlength="300"
                  />
                  <p class="text-right text-xs text-gray-700 mt-1 font-mono">
                    {{ (comments[leave._id] ?? "").length }}/300
                  </p>
                </div>

                <!-- Approve / Reject -->
                <div class="flex gap-2">
                  <button @click="updateStatus(leave._id, 'Approved')" class="btn-approve flex-1" :disabled="processing === leave._id">
                    <Spinner v-if="processing === leave._id" size="sm" color="text-emerald-400" />
                    <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                  <button @click="updateStatus(leave._id, 'Rejected')" class="btn-reject flex-1" :disabled="processing === leave._id">
                    <Spinner v-if="processing === leave._id" size="sm" color="text-red-400" />
                    <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              </template>

              <div v-else class="text-xs font-mono text-gray-400 dark:text-gray-600">Reviewed</div>

              <!-- Meta -->
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="flex flex-col">
                  <span class="text-gray-400 dark:text-gray-600">Requested at</span>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ fmtDate(leave.createdAt) }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-gray-400 dark:text-gray-600">Updated at</span>
                  <span class="text-sm text-gray-300">
                    {{ new Date(leave.updatedAt).getTime() === new Date(leave.createdAt).getTime() ? "—" : fmtDate(leave.updatedAt) }}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <!-- Action error -->
          <div v-if="actionErrors[leave._id]" class="alert-error mt-3 text-xs py-2">
            {{ actionErrors[leave._id] }}
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
          <span class="text-gray-400">{{ Math.min(currentPage * pageLimit, filteredAll.length) }}</span>
          of
          <span class="text-gray-400">{{ filteredAll.length }}</span>
          requests
        </p>

        <!-- Page controls -->
        <div class="flex items-center gap-1">

          <!-- Previous -->
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Page number buttons -->
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-gray-600 text-sm">
              …
            </span>
            <button v-else @click="goToPage(p as number)"
              :class="[
                'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium border transition-all duration-150',
                p === currentPage
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'
              ]">
              {{ p }}
            </button>
          </template>

          <!-- Next -->
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150">
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
import { ref, computed, reactive, onMounted, watch } from "vue";
import Navbar from "../components/Navbar.vue";
import Spinner from "../components/Spinner.vue";
import StatusBadge from "../components/StatusBadge.vue";
import api from "../api/axios";
import type {
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  FilterOption,
  UpdateLeaveStatusPayload,
  AllLeavesResponse,
  Pagination,
} from "../types";
import type { AxiosError } from "axios";

// ── State ─────────────────────────────────────────────────────
const leaves       = ref<LeaveRequest[]>([]);   // current page only
const allLeaves    = ref<LeaveRequest[]>([]);   // full list — used for stat counts only
const loading      = ref(true);
const fetchError   = ref("");
const processing   = ref<string | null>(null);
const actionErrors = reactive<Record<string, string>>({});
const comments     = reactive<Record<string, string>>({});
const showAdvanced = ref(false);

// ── Filter state ──────────────────────────────────────────────
const filters = reactive({
  status:    "all" as LeaveStatus | "all",
  employee:  "",
  leaveType: "" as LeaveType | "",
  dateFrom:  "",
  dateTo:    "",
});

const leaveTypes: LeaveType[] = [
  "Annual Leave",
  "Sick Leave",
  "Casual Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Unpaid Leave",
];

const statusFilters: FilterOption[] = [
  { label: "All",      value: "all" },
  { label: "Pending",  value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

// ── Helpers (needed by filteredAll) ───────────────────────────
const employeeName  = (l: LeaveRequest): string => (l.employee as any)?.name       ?? "Unknown";
const employeeEmail = (l: LeaveRequest): string => (l.employee as any)?.email      ?? "";
const employeeDept  = (l: LeaveRequest): string => (l.employee as any)?.department ?? "";

// ── Pagination: client-side from allLeaves ────────────────────
const currentPage = ref(1);
const pageLimit   = ref(5);
const pagination  = ref<Pagination>({ total: 0, page: 1, limit: 5, totalPages: 1 });

// All records matching every active filter
const filteredAll = computed<LeaveRequest[]>(() => {
  let result = allLeaves.value;

  if (filters.status !== "all")
    result = result.filter(l => l.status === filters.status);

  if (filters.employee.trim()) {
    const q = filters.employee.trim().toLowerCase();
    result = result.filter(l => employeeName(l).toLowerCase().includes(q));
  }

  if (filters.leaveType)
    result = result.filter(l => l.leaveType === filters.leaveType);

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter(l => new Date(l.startDate).getTime() >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter(l => new Date(l.startDate).getTime() <= to.getTime());
  }

  return result;
});

// Slice for the current page
const filtered = computed<LeaveRequest[]>(() => {
  const start = (currentPage.value - 1) * pageLimit.value;
  return filteredAll.value.slice(start, start + pageLimit.value);
});

const totalPages = computed(() => Math.ceil(filteredAll.value.length / pageLimit.value));

// Reset to page 1 whenever any filter changes
watch(() => ({ ...filters }), () => { currentPage.value = 1; });

// ── Pagination: smart page number list ────────────────────────
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

// ── Computed: active filter indicators ────────────────────────
const hasAdvancedFilters = computed(() =>
  !!filters.employee || !!filters.leaveType || !!filters.dateFrom || !!filters.dateTo
);

const activeFilterCount = computed(() =>
  [filters.employee, filters.leaveType, filters.dateFrom, filters.dateTo]
    .filter(Boolean).length
);

// ── Helpers ───────────────────────────────────────────────────
const count = (status: LeaveStatus) =>
  allLeaves.value.filter(l => l.status === status).length;

const totalDays = (l: LeaveRequest): number => {
  const diff = new Date(l.endDate).getTime() - new Date(l.startDate).getTime();
  return Math.round(diff / 86_400_000) + 1;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function clearAdvancedFilters(): void {
  filters.employee  = "";
  filters.leaveType = "";
  filters.dateFrom  = "";
  filters.dateTo    = "";
}

function clearAllFilters(): void {
  filters.status = "all";
  clearAdvancedFilters();
}

// ── Actions ───────────────────────────────────────────────────
async function updateStatus(id: string, status: "Approved" | "Rejected"): Promise<void> {
  delete actionErrors[id];
  processing.value = id;

  try {
    const payload: UpdateLeaveStatusPayload = {
      status,
      managerComment: comments[id]?.trim() || undefined,
    };

    const { data } = await api.put(`/leave/${id}`, payload);
    const updated = data.leave;
    leaves.value    = leaves.value.map(l => l._id === id ? updated : l);
    allLeaves.value = allLeaves.value.map(l => l._id === id ? updated : l);
    delete comments[id];

  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    actionErrors[id] = e.response?.data?.message ?? "Failed to update status.";
  } finally {
    processing.value = null;
  }
}

// ── Data fetching ─────────────────────────────────────────────
async function fetchLeaves(page = currentPage.value): Promise<void> {
  loading.value = true;
  fetchError.value = "";

  try {
    const { data } = await api.get<AllLeavesResponse>("/leave/all", {
      params: { page, limit: pageLimit.value },
    });
    leaves.value     = data.leaves;
    pagination.value = data.pagination;
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    fetchError.value = e.response?.data?.message ?? "Failed to load leave requests.";
  } finally {
    loading.value = false;
  }
}

// Fetches all leaves with a large limit purely for stat counts —
// never used for rendering so it doesn't affect pagination display
async function fetchAllLeaves(): Promise<void> {
  try {
    const { data } = await api.get<AllLeavesResponse>("/leave/all", {
      params: { page: 1, limit: 9999 },
    });
    allLeaves.value = data.leaves;
  } catch {
    // Non-critical — counts just won't update if this fails
  }
}

function goToPage(page: number): void {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => Promise.all([fetchLeaves(1), fetchAllLeaves()]));
</script>