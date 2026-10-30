import { api } from "../axios";

export async function follow(userName: string) {
  const { data } = await api.post(`/users/${userName}/follow`);
  return data;
}

export async function getFollowers(page = 1, limit = 20) {
  const { data } = await api.get("/users/me/followers", {
    params: { page, limit },
  });
  return data;
}

export async function getFollowing(page = 1, limit = 20) {
  const { data } = await api.get("/users/me/following", {
    params: { page, limit },
  });
  return data;
}
