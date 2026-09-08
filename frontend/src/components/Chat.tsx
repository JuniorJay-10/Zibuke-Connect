import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, type ChatConversation, type ChatMessage, type ChatUser } from '../lib/api';
import { useSip } from '../context/SipContext';

type ChatProps = {
  token: string;
  currentUserId: string;
};

export function Chat({ token, currentUserId }: ChatProps) {
  const { startCall } = useSip();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) => user.displayName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    );
  }, [search, users]);

  async function loadChat() {
    try {
      const [directory, conversationList] = await Promise.all([
        api.getChatUsers(token),
        api.getConversations(token),
      ]);
      setUsers(directory);
      setConversations(conversationList);

      if (!selectedConversationId && conversationList.length > 0) {
        setSelectedConversationId(conversationList[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load chat');
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const data = await api.getMessages(token, conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages');
    }
  }

  useEffect(() => {
    void loadChat();
    // Chat is deliberately kept on the same API polling approach as the rest of this demo.
    const timer = window.setInterval(() => {
      void api.getConversations(token).then(setConversations).catch(() => undefined);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedConversationId);
    const timer = window.setInterval(() => {
      void api.getMessages(token, selectedConversationId).then(setMessages).catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [token, selectedConversationId]);

  async function startDirectChat(userId: string) {
    try {
      setError(null);
      const conversation = await api.createDirectConversation(token, userId);
      setSelectedConversationId(conversation.id);
      await loadChat();
      setSelectedConversationId(conversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start chat');
    }
  }

  function toggleMember(userId: string) {
    setSelectedMembers((previous) => {
      const next = new Set(previous);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    if (!groupName.trim() || selectedMembers.size === 0) return;

    try {
      setError(null);
      const conversation = await api.createGroupConversation(token, groupName.trim(), Array.from(selectedMembers));
      setGroupName('');
      setSelectedMembers(new Set());
      setShowGroupForm(false);
      setSelectedConversationId(conversation.id);
      await loadChat();
      setSelectedConversationId(conversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create group');
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const content = messageText.trim();
    if (!content || !selectedConversationId) return;

    try {
      setError(null);
      const message = await api.sendMessage(token, selectedConversationId, content);
      setMessages((previous) => [...previous, message]);
      setMessageText('');
      const refreshed = await api.getConversations(token);
      setConversations(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
    }
  }

  async function addMember(userId: string) {
    if (!selectedConversation) return;
    try {
      await api.addChatMember(token, selectedConversation.id, userId);
      await loadChat();
      setSelectedConversationId(selectedConversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add member');
    }
  }

  async function removeMember(userId: string) {
    if (!selectedConversation) return;
    try {
      await api.removeChatMember(token, selectedConversation.id, userId);
      await loadChat();
      setSelectedConversationId(selectedConversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove member');
    }
  }

  const isGroupOwner = selectedConversation?.type === 'group' && selectedConversation.createdById === currentUserId;
  const availableMembers = users.filter(
    (user) => !selectedConversation?.members.some((member) => member.id === user.id),
  );

  return (
    <div className="chat-section" id="chat">
      <div className="chat-heading">
        <div>
          <div className="kicker">04</div>
          <h2>Chat</h2>
          <p>Private conversations and company project rooms.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowGroupForm((value) => !value)}>
          New group
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {showGroupForm && (
        <form className="chat-group-form" onSubmit={createGroup}>
          <div>
            <div className="kicker">GROUP ROOM</div>
            <h3>Create a project room</h3>
          </div>
          <input
            className="field"
            placeholder="Room name"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          />
          <div className="chat-member-picker">
            {users.map((user) => (
              <label key={user.id} className="chat-picker-row">
                <input
                  type="checkbox"
                  checked={selectedMembers.has(user.id)}
                  onChange={() => toggleMember(user.id)}
                />
                <span>{user.displayName}</span>
                <small>{user.email}</small>
              </label>
            ))}
          </div>
          <div className="chat-form-actions">
            <button type="button" className="btn" onClick={() => setShowGroupForm(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={!groupName.trim() || selectedMembers.size === 0}>
              Create group
            </button>
          </div>
        </form>
      )}

      <div className="chat-workspace">
        <aside className="chat-list">
          <div className="chat-list-header">
            <div className="kicker">CONVERSATIONS</div>
            <input
              className="field"
              placeholder="Search people"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading && <p className="empty-state">Loading chat…</p>}

          {!loading && conversations.length === 0 && (
            <p className="empty-state">No conversations yet. Start a private chat below or create a group.</p>
          )}

          <div className="chat-conversation-list">
            {conversations.map((conversation) => {
              const other = conversation.type === 'direct'
                ? conversation.members.find((member) => member.id !== currentUserId)
                : null;
              const title = conversation.type === 'group' ? conversation.name ?? 'Untitled group' : other?.displayName ?? 'Direct chat';
              return (
                <button
                  className={`chat-conversation-row ${selectedConversationId === conversation.id ? 'active' : ''}`}
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                >
                  <span className="chat-avatar">{title.slice(0, 1).toUpperCase()}</span>
                  <span className="chat-conversation-copy">
                    <strong>{title}</strong>
                    <small>{conversation.lastMessage?.content ?? 'No messages yet'}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="chat-directory">
            <div className="kicker">COMPANY DIRECTORY</div>
            {filteredUsers.map((user) => (
              <div className="chat-directory-row" key={user.id}>
                <button className="chat-directory-open" onClick={() => void startDirectChat(user.id)}>
                  <span className="chat-avatar small">{user.displayName.slice(0, 1).toUpperCase()}</span>
                  <span>
                    <strong>{user.displayName}</strong>
                    <small>{user.email}</small>
                  </span>
                </button>
                {user.sipExtension && (
                  <span className="contact-right">
                    <span className="contact-ext">Ext. {user.sipExtension}</span>
                    <button className="btn call-button" onClick={() => startCall(user.sipExtension as string, user.displayName)}>
                      Call
                    </button>
                  </span>
                )}
              </div>
            ))}
          </div>
        </aside>

        <section className="chat-panel">
          {!selectedConversation ? (
            <div className="chat-empty-panel">
              <div className="kicker">MESSAGES</div>
              <h3>Select a conversation</h3>
              <p>Choose someone from the company directory or start a group room.</p>
            </div>
          ) : (
            <>
              <header className="chat-panel-header">
                <div>
                  <div className="kicker">{selectedConversation.type === 'group' ? 'GROUP ROOM' : 'PRIVATE CHAT'}</div>
                  <h3>
                    {selectedConversation.type === 'group'
                      ? selectedConversation.name
                      : selectedConversation.members.find((member) => member.id !== currentUserId)?.displayName ?? 'Direct chat'}
                  </h3>
                </div>
                {selectedConversation.type === 'group' && (
                  <button className="btn" onClick={() => setShowMembers((value) => !value)}>
                    Members ({selectedConversation.members.length})
                  </button>
                )}
                {selectedConversation.type === 'direct' && (() => {
                  const other = selectedConversation.members.find((member) => member.id !== currentUserId);
                  if (!other?.sipExtension) return null;
                  return (
                    <button className="btn" onClick={() => startCall(other.sipExtension as string, other.displayName)}>
                      Call · Ext. {other.sipExtension}
                    </button>
                  );
                })()}
              </header>

              {showMembers && selectedConversation.type === 'group' && (
                <div className="chat-members-panel">
                  {selectedConversation.members.map((member) => (
                    <div className="chat-member-row" key={member.id}>
                      <span>
                        <strong>{member.displayName}</strong>
                        <small>{member.email}</small>
                      </span>
                      {isGroupOwner && member.id !== currentUserId && (
                        <button className="btn" onClick={() => void removeMember(member.id)}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {isGroupOwner && availableMembers.length > 0 && (
                    <div className="chat-add-member">
                      <div className="kicker">ADD MEMBER</div>
                      <select className="field" defaultValue="" onChange={(event) => event.target.value && void addMember(event.target.value)}>
                        <option value="">Select a company user</option>
                        {availableMembers.map((user) => (
                          <option value={user.id} key={user.id}>
                            {user.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="chat-messages">
                {messages.length === 0 && <p className="empty-state">No messages yet. Start the conversation.</p>}
                {messages.map((message) => {
                  const own = message.senderId === currentUserId;
                  return (
                    <div className={`chat-message ${own ? 'own' : ''}`} key={message.id}>
                      <div className="chat-message-meta">
                        <strong>{own ? 'You' : message.senderName}</strong>
                        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="chat-message-body">{message.content}</div>
                    </div>
                  );
                })}
              </div>

              <form className="chat-composer" onSubmit={sendMessage}>
                <input
                  className="field"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Write a message…"
                />
                <button className="btn btn-primary" type="submit" disabled={!messageText.trim()}>
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
