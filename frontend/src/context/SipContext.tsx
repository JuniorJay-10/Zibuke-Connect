import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Invitation, Inviter, Registerer, RegistererState, SessionState, UserAgent, Web, type Session } from 'sip.js';
import { api } from '../lib/api';

// Where FreeSWITCH's SIP-over-WebSocket listener is exposed — the
// internal profile already listens here (ws-binding in
// freeswitch/internal.xml); docker-compose.yml just publishes the port
// to the host so the frontend (running outside the Docker network) can
// reach it. Mirrors how MeetingView.tsx hardcodes JITSI_DOMAIN: fine for
// local dev, a real deployment would point this at a real domain.
const SIP_WS_SERVER = 'ws://localhost:5066';
const SIP_DOMAIN = 'localhost';

type CallStatus = 'idle' | 'incoming' | 'outgoing' | 'in-call';

type SipContextValue = {
  // Whether our REGISTER to FreeSWITCH succeeded — i.e. whether this
  // user can currently receive calls at all.
  registered: boolean;
  status: CallStatus;
  // Name/extension of whoever we're calling, being called by, or talking to.
  remoteLabel: string | null;
  muted: boolean;
  error: string | null;
  startCall: (extension: string, label: string) => void;
  answerCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
};

const SipContext = createContext<SipContextValue | null>(null);

export function useSip(): SipContextValue {
  const ctx = useContext(SipContext);
  if (!ctx) throw new Error('useSip must be used within a SipProvider');
  return ctx;
}

type SipProviderProps = {
  token: string;
  displayName: string;
  children: ReactNode;
};

// Wraps a single SIP.js UserAgent for the lifetime of a login session:
// registers this user's browser extension with FreeSWITCH on mount, and
// exposes simple call/answer/hangup actions any component can call via
// useSip() — Contacts and Chat both use this to place calls without
// needing to know anything about SIP.js themselves.
export function SipProvider({ token, displayName, children }: SipProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const userAgentRef = useRef<UserAgent | null>(null);
  // The in-progress/active call, if any. A ref (not state) because the
  // stateChange listener below needs the current session synchronously,
  // not a stale one captured when the listener was first attached.
  const sessionRef = useRef<Session | null>(null);

  const [registered, setRegistered] = useState(false);
  const [status, setStatus] = useState<CallStatus>('idle');
  const [remoteLabel, setRemoteLabel] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        // Ask the backend which extension this user has (or gets
        // assigned right now) — see backend/src/sip/sip.service.ts.
        const config = await api.getSipConfig(token);
        if (cancelled) return;

        const uri = UserAgent.makeURI(`sip:${config.extension}@${SIP_DOMAIN}`);
        if (!uri) throw new Error('Could not build a SIP address for this account');

        const userAgent = new UserAgent({
          uri,
          displayName,
          authorizationUsername: config.extension,
          authorizationPassword: config.password,
          transportOptions: { server: SIP_WS_SERVER },
          delegate: {
            onInvite: (invitation) => {
              // This demo, like SIP.js's own SimpleUser, only handles one
              // call at a time — reject a second incoming call outright
              // rather than trying to juggle two sessions.
              if (sessionRef.current) {
                invitation.reject().catch(() => undefined);
                return;
              }

              const from = invitation.request.from;
              attachSession(invitation);
              setStatus('incoming');
              setRemoteLabel(from.displayName || from.uri.user || 'Unknown caller');
            },
          },
        });

        userAgentRef.current = userAgent;
        await userAgent.start();

        const registerer = new Registerer(userAgent);
        registerer.stateChange.addListener((state) => {
          if (cancelled) return;
          setRegistered(state === RegistererState.Registered);
        });
        await registerer.register();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not start the SIP softphone');
        }
      }
    }

    void setup();

    return () => {
      cancelled = true;
      sessionRef.current = null;
      userAgentRef.current?.stop().catch(() => undefined);
      userAgentRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, displayName]);

  // Wires up state-change handling for a session, whether it came from
  // an incoming INVITE (Invitation) or one we're placing (Inviter).
  function attachSession(session: Session) {
    sessionRef.current = session;

    session.stateChange.addListener((state) => {
      // If a newer session has replaced this one (e.g. we hung up and
      // immediately dialled someone else), ignore this stale listener.
      if (sessionRef.current !== session) return;

      switch (state) {
        case SessionState.Established:
          setStatus('in-call');
          attachRemoteAudio(session);
          break;
        case SessionState.Terminated:
          sessionRef.current = null;
          setStatus('idle');
          setRemoteLabel(null);
          setMuted(false);
          break;
        default:
          break;
      }
    });
  }

  function attachRemoteAudio(session: Session) {
    const sdh = session.sessionDescriptionHandler;
    if (!(sdh instanceof Web.SessionDescriptionHandler)) return;
    const stream = sdh.remoteMediaStream;
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
      void audioRef.current.play().catch(() => undefined);
    }
  }

  function startCall(extension: string, label: string) {
    const userAgent = userAgentRef.current;
    if (!userAgent || sessionRef.current) return;

    const target = UserAgent.makeURI(`sip:${extension}@${SIP_DOMAIN}`);
    if (!target) {
      setError(`"${extension}" isn't a valid SIP extension`);
      return;
    }

    setError(null);
    setRemoteLabel(label);
    setStatus('outgoing');

    const inviter = new Inviter(userAgent, target, {
      sessionDescriptionHandlerOptions: { constraints: { audio: true, video: false } },
    });

    attachSession(inviter);
    inviter.invite().catch((err: Error) => {
      setError(err.message || 'Call failed');
      setStatus('idle');
      sessionRef.current = null;
    });
  }

  function answerCall() {
    const session = sessionRef.current;
    if (!session || !(session instanceof Invitation)) return;

    session
      .accept({ sessionDescriptionHandlerOptions: { constraints: { audio: true, video: false } } })
      .catch((err: Error) => setError(err.message || 'Could not answer the call'));
  }

  function declineCall() {
    const session = sessionRef.current;
    if (!session || !(session instanceof Invitation)) return;

    session.reject().catch(() => undefined);
    sessionRef.current = null;
    setStatus('idle');
    setRemoteLabel(null);
  }

  function endCall() {
    const session = sessionRef.current;
    if (!session) return;

    // Which request actually ends the call depends on how far it got:
    // a BYE once the call is live, otherwise a CANCEL (if we're the
    // caller) or a rejection (if we're the callee and haven't answered).
    if (session.state === SessionState.Established) {
      session.bye().catch(() => undefined);
    } else if (session instanceof Invitation) {
      session.reject().catch(() => undefined);
    } else if (session instanceof Inviter) {
      session.cancel().catch(() => undefined);
    }

    sessionRef.current = null;
    setStatus('idle');
    setRemoteLabel(null);
    setMuted(false);
  }

  function toggleMute() {
    const session = sessionRef.current;
    const sdh = session?.sessionDescriptionHandler;
    if (!session || !(sdh instanceof Web.SessionDescriptionHandler) || !sdh.peerConnection) return;

    const nextMuted = !muted;
    sdh.peerConnection.getSenders().forEach((sender) => {
      if (sender.track) sender.track.enabled = !nextMuted;
    });
    setMuted(nextMuted);
  }

  return (
    <SipContext.Provider
      value={{ registered, status, remoteLabel, muted, error, startCall, answerCall, declineCall, endCall, toggleMute }}
    >
      {children}
      {/* Hidden — SIP.js attaches the remote party's audio stream here. */}
      <audio ref={audioRef} autoPlay />
    </SipContext.Provider>
  );
}
