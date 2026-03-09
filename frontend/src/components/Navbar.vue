<template>
  <header
    class="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <div class="flex items-center gap-3">

          <div
            class="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-md"
          >
            <svg
              class="w-4 h-4 text-gray-950"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0
                   002-2V7a2 2 0 00-2-2H5a2 2 0
                   00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <span class="font-bold text-white tracking-tight text-lg">
            LeaveDesk
          </span>

        </div>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">

          <template v-if="auth.isEmployee">

            <RouterLink
              to="/employee/dashboard"
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'EmployeeDashboard' }"
            >
              My Leaves
            </RouterLink>

            <RouterLink
              to="/employee/apply"
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'ApplyLeave' }"
            >
              Apply
            </RouterLink>

          </template>

          <template v-if="auth.isEmployer">

            <RouterLink
              to="/employer/dashboard"
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'EmployerDashboard' }"
            >
              All Requests
            </RouterLink>

          </template>

        </nav>

        <!-- Right Section -->
        <div class="flex items-center gap-3">

          <!-- User info -->
          <div class="hidden md:flex flex-col items-end">
            <span class="text-sm font-medium text-gray-200 leading-none">
              {{ auth.user?.name }}
            </span>
            <span class="text-xs text-gray-500 capitalize mt-0.5">
              {{ auth.user?.role }}
            </span>
          </div>

          <!-- Logout -->
          <button
            @click="handleLogout"
            class="btn-ghost text-gray-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0
                   01-3 3H6a3 3 0 01-3-3V7a3 3 0
                   013-3h4a3 3 0 013 3v1"
              />
            </svg>

            <span class="hidden md:inline text-xs">
              Logout
            </span>
          </button>

          <!-- Mobile menu button -->
          <button
            class="md:hidden btn-ghost"
            @click="mobileOpen = !mobileOpen"
          >
            <svg
              v-if="!mobileOpen"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>

            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>

          </button>

        </div>

      </div>

      <!-- Mobile menu -->
      <div
        v-if="mobileOpen"
        class="md:hidden border-t border-gray-800 py-3 flex flex-col gap-2"
      >

        <template v-if="auth.isEmployee">

          <RouterLink
            to="/employee/dashboard"
            class="nav-link"
            @click="mobileOpen=false"
          >
            My Leaves
          </RouterLink>

          <RouterLink
            to="/employee/apply"
            class="nav-link"
            @click="mobileOpen=false"
          >
            Apply
          </RouterLink>

        </template>

        <template v-if="auth.isEmployer">

          <RouterLink
            to="/employer/dashboard"
            class="nav-link"
            @click="mobileOpen=false"
          >
            All Requests
          </RouterLink>

        </template>

      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const auth   = useAuthStore();
const router = useRouter();

const mobileOpen = ref(false);

const handleLogout = (): void => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-gray-800 transition-all duration-150;
}
.nav-link-active {
  @apply text-brand-400 bg-brand-500/10;
}
</style>
