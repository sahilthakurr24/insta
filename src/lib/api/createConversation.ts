import { api } from "../axios";

export async function createConversationDirect(participantId: string) {
  const { data } = await api.post(`/conversations/direct/${participantId}`);
  return data;
}

export async function createConversationGroup(formData: FormData) {
  const { data } = await api.post(`/conversation/group`, formData);
  return data;
}

export async function conversation(conversatinId: string) {
  const { data } = await api.get(`/conversation/${conversatinId}/message`);
  return data;
}
