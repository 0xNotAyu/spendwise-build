import { apiClient } from "./client";
import type { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<{ message: string; token: string; user: User }>("/auth/login", payload);
  return { token: data.token, user: data.user };
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<{ message: string; token: string; user: User }>("/auth/register", payload);
  return { token: data.token, user: data.user };
}

export async function logout() {
  await apiClient.post("/auth/logout");
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<{ user: User }>("/auth/me");
  return data.user;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
  currency?: string;
  monthlyIncome?: number;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await apiClient.put<{ message: string; user: User }>("/users/me", payload);
  return data.user;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  await apiClient.post("/users/me/change-password", payload);
}
