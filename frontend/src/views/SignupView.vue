<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-10 relative overflow-hidden transition-colors duration-300">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/5 dark:bg-brand-500/5 rounded-full blur-3xl" />
    </div>

    <div class="w-full max-w-md animate-fade-up relative z-10">
      <div class="flex flex-col items-center mb-10">
        <div class="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-brand-500/20">
          <svg class="w-7 h-7 text-white dark:text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Create account</h1>
        <p class="text-gray-500 dark:text-gray-500 text-sm mt-1">Join Learning Management System today</p>
      </div>

      <div class="card">
        <div v-if="error" class="alert-error mb-5 flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" novalidate class="space-y-5">
          <div>
            <label class="field-label" for="name">Full name</label>
            <input id="name" v-model="form.name" type="text" class="field" placeholder="Jane Smith" autocomplete="name" />
          </div>

          <div>
            <label class="field-label" for="email">Email</label>
            <input id="email" v-model="form.email" type="email" class="field" placeholder="you@example.com" autocomplete="email" />
          </div>

          <div>
            <label class="field-label" for="password">Password</label>
            <input id="password" v-model="form.password" type="password" class="field" placeholder="At least 6 characters" autocomplete="new-password" />
          </div>

          <div>
            <label class="field-label" for="department">Department</label>
            <select id="department" v-model="form.department" class="field">
              <option value="" disabled>Select a department</option>
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">HR</option>
            </select>
          </div>

          <!-- Role selector -->
          <div>
            <label class="field-label mb-3">I am a</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" @click="form.role = 'employee'"
                :class="[
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all duration-150',
                  form.role === 'employee'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-600 dark:hover:text-gray-400'
                ]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Employee
              </button>
              <button type="button" @click="form.role = 'manager'"
                :class="[
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all duration-150',
                  form.role === 'manager'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-600 dark:hover:text-gray-400'
                ]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Manager
              </button>
            </div>
          </div>

          <button type="submit" class="btn-brand w-full" :disabled="loading">
            <Spinner v-if="loading" size="sm" color="text-white dark:text-gray-950" />
            {{ loading ? "Creating account…" : "Create account" }}
          </button>
        </form>

        <div class="divider" />
        <p class="text-center text-sm text-gray-500 dark:text-gray-500">
          Already have an account?
          <RouterLink to="/login" class="text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors">
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import Spinner from "../components/Spinner.vue";
import type { SignupPayload } from "../types";
import type { AxiosError } from "axios";

const auth   = useAuthStore();
const router = useRouter();

const form = reactive<SignupPayload>({
  name: "", email: "", password: "", role: "employee", department: "engineering",
});
const loading = ref(false);
const error   = ref("");

async function handleSubmit(): Promise<void> {
  error.value = "";
  if (!form.name.trim() || !form.email.trim() || !form.password) {
    error.value = "Please fill in all required fields.";
    return;
  }
  if (form.password.length < 6) {
    error.value = "Password must be at least 6 characters.";
    return;
  }
  try {
    loading.value = true;
    const res = await auth.signup(form);
    router.push(res.user.role === "employee"
      ? "/employee/dashboard"
      : "/employer/dashboard");
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    error.value = e.response?.data?.message ?? "Signup failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>