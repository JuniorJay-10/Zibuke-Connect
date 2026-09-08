import { useEffect, useState, type FormEvent } from 'react';
import { api, type Contact } from '../lib/api';
import { useSip } from '../context/SipContext';

type ContactsProps = {
  token: string;
  // Which contacts are currently checked "to meet with" — this lives in
  // the parent (App.tsx), not here, because the meeting itself is
  // started from App.tsx. This component just reports selection changes
  // upward; it doesn't decide what happens with them.
  selectedIds: Set<string>;
  onToggleSelect: (contact: Contact) => void;
};

export function Contacts({ token, selectedIds, onToggleSelect }: ContactsProps) {
  const { startCall } = useSip();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [extension, setExtension] = useState('');
  const [search, setSearch] = useState('');

  async function loadContacts() {
    try {
      const data = await api.getContacts(token);
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load contacts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createContact(token, {
        name: name.trim(),
        extension: extension.trim() || undefined,
      });
      setName('');
      setExtension('');
      await loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add contact');
    }
  }

  // Plain client-side filtering — fine at this scale (a personal contact
  // list), and avoids a round-trip to the API on every keystroke.
  const visibleContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="section">
      <h2 className="section-title">Contacts</h2>

      <input
        className="field contacts-search"
        type="text"
        placeholder="Search contacts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <form onSubmit={handleAdd} className="field-row">
        <input
          className="field"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="field"
          type="text"
          placeholder="Extension"
          value={extension}
          onChange={(e) => setExtension(e.target.value)}
        />
        <button className="btn" type="submit">
          Add
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="empty-state">Loading contacts…</p>}
      {!loading && contacts.length === 0 && (
        <p className="empty-state">No contacts yet — add someone above to reach them by call or meeting.</p>
      )}
      {!loading && contacts.length > 0 && visibleContacts.length === 0 && (
        <p className="empty-state">No contacts match "{search}".</p>
      )}

      {visibleContacts.length > 0 && (
        <>
          <div className="contact-list">
            {visibleContacts.map((contact) => (
              <label className="contact-row" key={contact.id}>
                <span className="contact-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(contact.id)}
                    onChange={() => onToggleSelect(contact)}
                  />
                  <span className="contact-name">{contact.name}</span>
                </span>
                {contact.extension && (
                  <span className="contact-right">
                    <span className="contact-ext">{contact.extension}</span>
                    <button
                      type="button"
                      className="btn call-button"
                      // This row is a <label> wrapping the selection
                      // checkbox — without stopping the click here, it
                      // would also toggle "select for meeting" above.
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startCall(contact.extension as string, contact.name);
                      }}
                    >
                      Call
                    </button>
                  </span>
                )}
              </label>
            ))}
          </div>
          {selectedIds.size > 0 && (
            <p className="invite-note">
              {selectedIds.size} contact{selectedIds.size > 1 ? 's' : ''} selected — check "Meetings"
              above to start with them.
            </p>
          )}
        </>
      )}
    </div>
  );
}