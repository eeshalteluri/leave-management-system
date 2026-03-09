<template>
  <div class="min-h-screen bg-gray-950">
    <Navbar />

    <div class="page-container max-w-2xl">
      <!-- Back -->
      <RouterLink to="/employee/dashboard"
        class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to dashboard
      </RouterLink>

      <div class="mb-8">
        <h1 class="text-2xl font-display font-bold text-white">Apply for Leave</h1>
        <p class="text-gray-500 text-sm mt-1">Submit a new leave request for review.</p>
      </div>

      <div class="card animate-fade-up">
        <!-- Success banner -->
        <div v-if="success" class="alert-success mb-6 flex items-start gap-3">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-medium">Request submitted successfully!</p>
            <p class="text-emerald-500/70 text-xs mt-0.5">Your leave request is pending approval.</p>
          </div>
        </div>

        <!-- Error banner -->
        <div v-if="error" class="alert-error mb-6 flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" novalidate class="space-y-6">

          <!-- Leave type -->
          <div>
            <label class="field-label" for="leaveType">Leave type</label>
            <select id="leaveType" v-model="form.leaveType" class="field">
              <option value="" disabled>Select a type…</option>
              <option v-for="lt in leaveTypes" :key="lt.value" :value="lt.value">{{ lt.label }}</option>
            </select>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="field-label" for="startDate">Start date</label>
              <input id="startDate" v-model="form.startDate" type="date" class="field" :min="today" />
            </div>
            <div>
              <label class="field-label" for="endDate">End date</label>
              <input id="endDate" v-model="form.endDate" type="date" class="field" :min="form.startDate || today" />
            </div>
          </div>

          <!-- Duration pill -->
          <div v-if="totalDays > 0"
            class="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-lg text-sm text-brand-400 font-mono">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ totalDays }} day{{ totalDays !== 1 ? "s" : "" }} requested
          </div>

          <!-- Reason -->
          <div>
            <label class="field-label" for="reason">
              Reason
              <span class="text-gray-600 normal-case ml-1 font-normal">
                {{ form.reason.length }}/500
              </span>
            </label>
            <textarea id="reason" v-model="form.reason" rows="4"
              class="field resize-none"
              placeholder="Describe the reason for your leave (min. 10 characters)…"
              maxlength="500" />
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <RouterLink to="/employee/dashboard" class="btn-outline flex-1 justify-center">
              Cancel
            </RouterLink>
            <button type="submit" class="btn-brand flex-1" :disabled="loading">
              <Spinner v-if="loading" size="sm" color="text-gray-950" />
              {{ loading ? "Submitting…" : "Submit Request" }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import Navbar from "../components/Navbar.vue";
import Spinner from "../components/Spinner.vue";
import api from "../api/axios";
import type { ApplyLeavePayload, LeaveTypeOption } from "../types";
import type { AxiosError } from "axios";
import { useRouter } from "vue-router";

const today = new Date().toISOString().split("T")[0];

const leaveTypes: LeaveTypeOption[] = [
  { value: "Annual Leave",    label: "Annual Leave" },
  { value: "Sick Leave",      label: "Sick Leave" },
  { value: "Casual Leave",    label: "Casual Leave" },
  { value: "Maternity Leave", label: "Maternity Leave" },
  { value: "Paternity Leave", label: "Paternity Leave" },
  { value: "Unpaid Leave",    label: "Unpaid Leave" },
];

const router = useRouter();

const form = reactive<ApplyLeavePayload>({
  leaveType: "Annual Leave",
  startDate: "",
  endDate:   "",
  reason:    "",
});

const loading = ref(false);
const error   = ref("");
const success = ref(false);

const totalDays = computed<number>(() => {
  if (!form.startDate || !form.endDate) return 0;
  const diff = new Date(form.endDate).getTime() - new Date(form.startDate).getTime();
  return diff < 0 ? 0 : Math.round(diff / 86_400_000) + 1;
});

async function handleSubmit(): Promise<void> {
  error.value   = "";
  success.value = false;

  if (!form.startDate || !form.endDate || !form.reason.trim()) {
    error.value = "Please fill in all fields.";
    return;
  }
  if (form.reason.trim().length < 10) {
    error.value = "Reason must be at least 10 characters.";
    return;
  }
  if (new Date(form.endDate) < new Date(form.startDate)) {
    error.value = "End date cannot be before start date.";
    return;
  }

  try {
    loading.value = true;
    // ✅ Matches: POST /api/leave/apply
    await api.post("/leave/apply", form);
    success.value = true;
    Object.assign(form, { startDate: "", endDate: "", reason: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
    router.push("/employee/dashboard");
  }, 1200);
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    error.value = e.response?.data?.message ?? "Failed to submit request. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
