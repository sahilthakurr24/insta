import { api } from "../axios";

export async function getUserProfile(userName: string) {
  const { data } = await api.get(`/users/${userName}`);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/users/me");
  return data;
}
