const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message ?? `Request failed with status ${res.status}`);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export type AuthUser = { id: string; email: string; displayName: string };
export type AuthResponse = { accessToken: string; user: AuthUser };
export type Contact = { id: string; name: string; email: string | null; extension: string | null };

export type ChatUser = { id: string; displayName: string; email: string; sipExtension: string | null };
export type SipConfig = { extension: string; password: string };
export type ChatMessage = { id: string; content: string; senderId: string; senderName: string; createdAt: string };
export type ChatConversation = {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  createdById: string;
  createdAt: string;
  members: ChatUser[];
  lastMessage: { content: string; senderId: string; senderName: string; createdAt: string } | null;
};

export const api = {
  register(email: string, password: string, displayName: string) {
    return request<AuthResponse>('/auth/register', { method: 'POST', body: { email, password, displayName } });
  },
  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
  },
  getContacts(token: string) {
    return request<Contact[]>('/contacts', { token });
  },
  createContact(token: string, contact: { name: string; email?: string; extension?: string }) {
    return request<Contact>('/contacts', { method: 'POST', body: contact, token });
  },
  getSipConfig(token: string) {
    return request<SipConfig>('/sip/config', { token });
  },
  getChatUsers(token: string) {
    return request<ChatUser[]>('/chat/users', { token });
  },
  getConversations(token: string) {
    return request<ChatConversation[]>('/chat/conversations', { token });
  },
  createDirectConversation(token: string, userId: string) {
    return request<ChatConversation>('/chat/conversations/direct', { method: 'POST', body: { userId }, token });
  },
  createGroupConversation(token: string, name: string, userIds: string[]) {
    return request<ChatConversation>('/chat/conversations/group', { method: 'POST', body: { name, userIds }, token });
  },
  getMessages(token: string, conversationId: string) {
    return request<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`, { token });
  },
  sendMessage(token: string, conversationId: string, content: string) {
    return request<ChatMessage>(`/chat/conversations/${conversationId}/messages`, { method: 'POST', body: { content }, token });
  },
  getChatMembers(token: string, conversationId: string) {
    return request<ChatUser[]>(`/chat/conversations/${conversationId}/members`, { token });
  },
  addChatMember(token: string, conversationId: string, userId: string) {
    return request<{ message: string }>(`/chat/conversations/${conversationId}/members`, { method: 'POST', body: { userId }, token });
  },
  removeChatMember(token: string, conversationId: string, userId: string) {
    return request<{ message: string }>(`/chat/conversations/${conversationId}/members/${userId}`, { method: 'DELETE', token });
  },
};
