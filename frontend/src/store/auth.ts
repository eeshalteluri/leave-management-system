import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../api/axios";
import type { User, SignupPayload, LoginPayload, AuthResponse } from "../types";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem("user") ?? "null") as User | null
  );

  const isLoggedIn  = computed<boolean>(() => !!token.value);
  const isEmployee  = computed<boolean>(() => user.value?.role === "employee");
  const isEmployer  = computed<boolean>(() => user.value?.role === "employer");

  function persist(t: string, u: User): void {
    token.value = t;
    user.value  = u;
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
  }

  async function signup(payload: SignupPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/signup", payload);
    persist(data.token, data.user);
    return data;
  }

  async function login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    persist(data.token, data.user);
    return data;
  }

  function logout(): void {
    token.value = null;
    user.value  = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return { token, user, isLoggedIn, isEmployee, isEmployer, signup, login, logout };
});
