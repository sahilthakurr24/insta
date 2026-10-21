import { api } from "../axios";

export async function getUserProfile(userName: string) {
  const { data } = await api.get(`/users/${userName}`);
  return data;
}
