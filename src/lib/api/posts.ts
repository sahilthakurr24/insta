import { api } from "../axios";

export async function createPost(formData: FormData) {
  const { data } = await api.post("/posts/create-post", formData);
  return data;
}

export async function getPost(postId: string) {
  const { data } = await api.get(`/posts/${postId}`);
  return data;
}

export async function deletePost(postId: string) {
  const { data } = await api.delete(`/posts/${postId}`);
  return data;
}

export async function updatePost(postId: string, caption: string) {
  const { data } = await api.patch(`/posts/${postId}`, { caption });
  return data;
}
