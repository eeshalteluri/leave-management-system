<template>
  <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="font-display font-bold tracking-tight text-gray-900 dark:text-white">LMS</span>
        </div>

        <!-- Nav links -->
        <nav class="hidden sm:flex items-center gap-1">
          <template v-if="auth.isEmployee">
            <RouterLink to="/employee/dashboard" class="nav-link" :class="{ 'nav-link-active': $route.name === 'EmployeeDashboard' }">
              My Leaves
            </RouterLink>
            <RouterLink to="/employee/apply" class="nav-link" :class="{ 'nav-link-active': $route.name === 'ApplyLeave' }">
              Apply
            </RouterLink>
          </template>
          <template v-if="auth.isManager">
            <RouterLink to="/employer/dashboard" class="nav-link" :class="{ 'nav-link-active': $route.name === 'EmployerDashboard' }">
              All Requests
            </RouterLink>
          </template>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-2">

          <!-- User info -->
          <div class="hidden sm:flex flex-col items-end mr-1">
            <span class="text-sm font-medium leading-none text-gray-900 dark:text-gray-200">{{ auth.user?.name }}</span>
            <span class="text-xs mt-0.5 font-mono capitalize text-gray-500 dark:text-gray-500">{{ auth.user?.role }}</span>
          </div>

          <!-- Theme toggle -->
          <button @click="theme.toggle()" class="btn-ghost w-9 h-9 p-0 rounded-lg" :title="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
            <!-- Sun icon — shown in dark mode -->
            <svg v-if="theme.isDark" class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon icon — shown in light mode -->
            <svg v-else class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Logout -->
          <button @click="handleLogout" class="btn-ghost text-gray-500 hover:text-red-600 hover:bg-red-500/10 dark:hover:text-red-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline text-xs">Logout</span>
          </button>

        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore }  from "../store/auth";
import { useThemeStore } from "../store/theme";
import { useRouter }     from "vue-router";

const auth   = useAuthStore();
const theme  = useThemeStore();
const router = useRouter();

const handleLogout = (): void => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 text-sm rounded-lg transition-all duration-150
         text-gray-500 hover:text-gray-900 hover:bg-gray-100
         dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800;
}
.nav-link-active {
  @apply text-brand-600 bg-brand-500/10 dark:text-brand-400;
}
</style>