<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 sm:px-6 relative overflow-hidden transition-colors duration-300"
  >
    <!-- Background glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-brand-500/10 dark:bg-brand-500/10 rounded-full blur-3xl"
      />
    </div>

    <div class="w-full max-w-md relative z-10">

      <!-- Logo -->
      <div class="flex flex-col items-center mb-8 sm:mb-10 text-center">
        <div
          class="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-brand-500/20"
        >
          <svg
            class="w-7 h-7 text-white dark:text-gray-950"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 class="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
          LeaveDesk
        </h1>
        <p class="text-gray-500 dark:text-gray-500 text-sm mt-1">
          Sign in to continue
        </p>
      </div>

      <!-- Card -->
      <div class="card">

        <!-- Error -->
        <div
          v-if="error"
          class="alert-error mb-5 flex items-center gap-2"
        >
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0
                 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0
                 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          {{ error }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" novalidate class="space-y-5">

          <div>
            <label class="field-label" for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="field"
              placeholder="you@example.com"
              autocomplete="email"
            />
          </div>

          <div>
            <label class="field-label" for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="field"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn-brand w-full mt-2"
            :disabled="loading"
          >
            <Spinner v-if="loading" size="sm" color="text-white dark:text-gray-950" />
            {{ loading ? "Signing in…" : "Sign in" }}
          </button>
        </form>

        <div class="divider" />

        <p class="text-center text-sm text-gray-500 dark:text-gray-500">
          No account?
          <RouterLink
            to="/signup"
            class="text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors"
          >
            Create one
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
import type { LoginPayload } from "../types";
import type { AxiosError } from "axios";

const auth   = useAuthStore();
const router = useRouter();

const form    = reactive<LoginPayload>({ email: "", password: "" });
const loading = ref(false);
const error   = ref("");

async function handleSubmit(): Promise<void> {
  error.value = "";
  if (!form.email.trim() || !form.password) {
    error.value = "Please fill in all fields.";
    return;
  }
  try {
    loading.value = true;
    const res = await auth.login(form);
    router.push(res.user.role === "employee" ? "/employee/dashboard" : "/employer/dashboard");
  } catch (err) {
    const e = err as AxiosError<{ message: string }>;
    error.value = e.response?.data?.message ?? "Invalid credentials. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>