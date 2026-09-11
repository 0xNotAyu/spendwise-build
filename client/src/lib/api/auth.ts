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
  user: User;
  token: string;
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
  currency?: string;
  monthlyIncome?: number;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await apiClient.patch<User>("/users/me", payload);
  return data;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  await apiClient.post("/users/me/change-password", payload);
}
