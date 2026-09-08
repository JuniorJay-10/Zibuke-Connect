import { useEffect, useRef, useState } from 'react';

// Where our self-hosted Jitsi instance lives. In production this would be
// a real domain (e.g. meet.zibuke.co.za); for local dev it's the container
// we stood up separately in Day 3.
const JITSI_DOMAIN = 'localhost:8443';

// Jitsi's own embed script defines this global constructor once loaded.
// TypeScript doesn't know about it by default (it's not an npm package,
// it's loaded via a <script> tag), so we declare its shape ourselves —
// just enough of it for what we actually use here.
declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: {
        roomName: string;
        parentNode: HTMLElement;
        width?: string | number;
        height?: string | number;
        userInfo?: { displayName?: string };
        configOverwrite?: Record<string, unknown>;
        interfaceConfigOverwrite?: Record<string, unknown>;
      }
    ) => JitsiMeetAPI;
  }
}

// The subset of the Jitsi API instance's methods/events we actually use.
// The real object has far more; we only type what we call, so this stays
// honest about what this component depends on.
interface JitsiMeetAPI {
  dispose: () => void;
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

type MeetingViewProps = {
  roomName: string;
  displayName?: string;
  onCallEnded?: () => void;
  // When true: no video sent/received (audio-only) and Opus's own low
  // bitrate handles the rest. This directly answers the brief's "must
  // not use excessive data" requirement, and it's a real choice the user
  // makes, not just a setting buried in Jitsi's own menus.
  lowDataMode?: boolean;
};

function loadJitsiScript(): Promise<void> {
  // If the script is already on the page (e.g. user navigated to a second
  // meeting without a full page reload), don't inject it twice.
  if (window.JitsiMeetExternalAPI) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load the Jitsi embed script'));
    document.body.appendChild(script);
  });
}

export function MeetingView({ roomName, displayName, onCallEnded, lowDataMode }: MeetingViewProps) {
  // This holds the actual <div> Jitsi will render its whole UI into.
  // Jitsi takes over this element directly — React doesn't control what's
  // inside it, which is why we use a ref instead of normal JSX children.
  const containerRef = useRef<HTMLDivElement>(null);

  // We track the API instance in a ref (not state) because we need it for
  // cleanup, but changing it should never trigger a re-render — it's not
  // something the UI displays, it's a handle to Jitsi's own object.
  const apiRef = useRef<JitsiMeetAPI | null>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadJitsiScript()
      .then(() => {
        // If the component unmounted while the script was still loading,
        // don't try to create a meeting in a container that's gone.
        if (cancelled || !containerRef.current) return;

        // Low data mode: start with no camera/video sent at all (audio
        // only). Otherwise: cap video at a modest resolution rather than
        // letting it default to HD, since most meetings don't need it.
        // Opus (audio) is already low-bandwidth by design either way.
        const configOverwrite = lowDataMode
          ? { startAudioOnly: true, startWithVideoMuted: true }
          : { resolution: 480, constraints: { video: { height: { ideal: 480, max: 720 } } } };

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: displayName ? { displayName } : undefined,
          configOverwrite,
        });

        api.addEventListener('videoConferenceLeft', () => {
          onCallEnded?.();
        });

        apiRef.current = api;
        setStatus('ready');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setErrorMessage(err.message);
        setStatus('error');
      });

    // Cleanup: if the user navigates away from this view, actually tear
    // down the Jitsi session instead of leaving it running invisibly.
    return () => {
      cancelled = true;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

  if (status === 'error') {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'crimson' }}>Couldn't load the meeting: {errorMessage}</p>
        <p>
          Make sure the Jitsi containers are running (
          <code>docker compose up</code> in the jitsi-test folder).
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {status === 'loading' && <p style={{ padding: '1rem' }}>Loading meeting…</p>}
      {/* Jitsi renders its entire UI into this element directly. */}
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
}