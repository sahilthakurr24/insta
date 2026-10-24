import { api } from "../axios";

export async function doLikeUnlike(postId: string) {
  const { data } = await api.post(`/posts/${postId}/like`);
  return data;
}
