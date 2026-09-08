import { useEffect, useState } from 'react';
import './App.css';
import { MeetingView } from './components/MeetingView';
import { Login } from './components/Login';
import { Contacts } from './components/Contacts';
import { Chat } from './components/Chat';
import { CallOverlay } from './components/CallOverlay';
import { SipProvider } from './context/SipContext';
import type { AuthResponse, AuthUser, Contact } from './lib/api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const AUTH_STORAGE_KEY = 'zibuke_auth';

type ApiStatus = {
  status: string;
  message: string;
};

function generateRoomCode(): string {
  const part = () => Math.random().toString(36).slice(2, 6);
  return `zibuke-${part()}-${part()}`;
}

function extractRoomCode(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    return decodeURIComponent(url.pathname.replace(/^\//, ''));
  } catch {
    return trimmed;
  }
}

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Map<string, Contact>>(new Map());

  const [auth, setAuth] = useState<AuthResponse | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as AuthResponse) : null;
  });

  useEffect(() => {
    fetch(`${API_URL}/api/hello`)
      .then((res) => {
        if (!res.ok) throw new Error(`API responded with ${res.status}`);
        return res.json();
      })
      .then((data: ApiStatus) => setApiStatus(data))
      .catch((err: Error) => setError(err.message));
  }, []);

  function handleAuthenticated(newAuth: AuthResponse) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuth));
    setAuth(newAuth);
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
    setActiveRoom(null);
  }

  function startNewMeeting() {
    const code = generateRoomCode();
    setMeetingLink(`${window.location.origin}/${code}`);
    setActiveRoom(code);
  }

  function joinExistingMeeting() {
    const code = extractRoomCode(joinInput);
    if (!code) return;
    setMeetingLink(null);
    setActiveRoom(code);
    setJoinInput('');
  }

  function toggleContactSelection(contact: Contact) {
    setSelectedContacts((prev) => {
      const next = new Map(prev);
      if (next.has(contact.id)) {
        next.delete(contact.id);
      } else {
        next.set(contact.id, contact);
      }
      return next;
    });
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!auth) {
    return <Login onAuthenticated={handleAuthenticated} />;
  }

  const user: AuthUser = auth.user;

  // Both branches below render inside the same SipProvider (see the
  // return statement at the bottom) so the browser softphone stays
  // registered — and a call can still come in — whether you're on the
  // dashboard or already inside a Jitsi meeting.
  if (activeRoom) {
    return (
      <SipProvider token={auth.accessToken} displayName={user.displayName}>
        <MeetingView
          roomName={activeRoom}
          displayName={user.displayName}
          onCallEnded={() => {
            setActiveRoom(null);
            setMeetingLink(null);
          }}
          lowDataMode={lowDataMode}
        />
        <CallOverlay />
      </SipProvider>
    );
  }

  const selected = Array.from(selectedContacts.values());
  const isPlatformOnline = Boolean(apiStatus && !error);

  return (
    <SipProvider token={auth.accessToken} displayName={user.displayName}>
      <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">Z</div>
          <div>
            <div className="brand-name">Zibuke</div>
            <div className="brand-product">Connect</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <button className="nav-item active" onClick={() => scrollToSection('home')}>
            <span className="nav-index">01</span>
            <span>Home</span>
          </button>
          <button className="nav-item" onClick={() => scrollToSection('meetings')}>
            <span className="nav-index">02</span>
            <span>Meetings</span>
          </button>
          <button className="nav-item" onClick={() => scrollToSection('contacts')}>
            <span className="nav-index">03</span>
            <span>Contacts</span>
          </button>
          <button className="nav-item" onClick={() => scrollToSection('chat')}>
            <span className="nav-index">04</span>
            <span>Chat</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className={`sidebar-status ${isPlatformOnline ? '' : 'offline'}`}>
            <span className="status-square" />
            <span>{error ? 'API offline' : apiStatus ? `Platform ${apiStatus.status}` : 'Connecting'}</span>
          </div>
          <div className="sidebar-user">{user.displayName}</div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="header-context">Unified communications</div>
          <div className="user-row">
            <span>
              Signed in as <strong>{user.displayName}</strong>
            </span>
            <button className="btn btn-primary logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <main className="content" id="home">
          <section className="welcome">
            <div className="welcome-number">01</div>
            <div>
              <div className="kicker">HOME</div>
              <h1>Everything for your next conversation.</h1>
              <p>Start a meeting, join a room, or manage the contacts linked to your account.</p>
            </div>
          </section>

          <section className="actions" id="meetings">
            <div className="action-main">
              <div className="kicker">MEETING</div>
              <h2>Start a new meeting</h2>
              <p>A new room is created when you start a meeting.</p>

              {selected.length > 0 && (
                <p className="invite-note meeting-selection">
                  Meeting with: {selected.map((contact) => contact.name).join(', ')}
                </p>
              )}

              <button className="btn btn-primary meeting-button" onClick={startNewMeeting}>
                New meeting <span aria-hidden="true">→</span>
              </button>

              {meetingLink && (
                <div className="link-banner">
                  <code>{meetingLink}</code>
                  <button className="btn" onClick={() => navigator.clipboard.writeText(meetingLink)}>
                    Copy
                  </button>
                </div>
              )}
            </div>

            <div className="join-panel">
              <div className="kicker">JOIN</div>
              <h2>Have a room code?</h2>
              <div className="input-group">
                <input
                  className="field"
                  type="text"
                  placeholder="Enter code or link"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && joinExistingMeeting()}
                />
                <button className="btn" onClick={joinExistingMeeting} disabled={!joinInput.trim()}>
                  Join
                </button>
              </div>

              <label className="check">
                <input
                  type="checkbox"
                  checked={lowDataMode}
                  onChange={(e) => setLowDataMode(e.target.checked)}
                />
                Low data mode — audio only
              </label>
            </div>
          </section>

          <section className="contacts-section" id="contacts">
            <Contacts
              token={auth.accessToken}
              selectedIds={new Set(selectedContacts.keys())}
              onToggleSelect={toggleContactSelection}
            />
          </section>

          <Chat token={auth.accessToken} currentUserId={user.id} />
        </main>
      </div>
      <CallOverlay />
      </div>
    </SipProvider>
  );
}

export default App;
