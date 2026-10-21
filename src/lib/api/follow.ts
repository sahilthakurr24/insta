import { api } from "../axios";

export async function follow(userName: string) {
  const { data } = await api.post(`/users/${userName}/follow`);
  return data;
}
