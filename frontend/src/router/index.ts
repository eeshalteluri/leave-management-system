import { createRouter, createWebHistory } from "vue-router"

import LoginView from "../views/LoginView.vue"
import SignupView from "../views/SignupView.vue"
import EmployeeDashboard from "../views/EmployeeDashboard.vue"
import EmployerDashboard from "../views/EmployerDashboard.vue"
import ApplyLeave from "../views/ApplyLeave.vue"

const routes = [
  { path: "/", redirect: "/login" },

  { path: "/login", component: LoginView },

  { path: "/signup", component: SignupView },

  { path: "/employee/dashboard", component: EmployeeDashboard },

  { path: "/employee/apply", component: ApplyLeave },

  { path: "/employer/dashboard", component: EmployerDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router