import { useSip } from '../context/SipContext';

// Renders nothing while there's no call in progress — App.tsx mounts this
// once, alongside everything else, and it only shows itself when the SIP
// context's status changes.
export function CallOverlay() {
  const { status, remoteLabel, muted, error, answerCall, declineCall, endCall, toggleMute } = useSip();

  if (status === 'idle') {
    return error ? (
      <div className="call-overlay call-overlay-error">
        <p className="error-text">{error}</p>
      </div>
    ) : null;
  }

  return (
    <div className="call-overlay">
      <div className="call-card">
        <div className="kicker">{status === 'incoming' ? 'INCOMING CALL' : status === 'outgoing' ? 'CALLING' : 'ON CALL'}</div>
        <h3 className="call-remote-name">{remoteLabel ?? 'Unknown'}</h3>

        {status === 'incoming' && (
          <div className="call-actions">
            <button className="btn btn-primary" onClick={answerCall}>
              Answer
            </button>
            <button className="btn" onClick={declineCall}>
              Decline
            </button>
          </div>
        )}

        {(status === 'outgoing' || status === 'in-call') && (
          <div className="call-actions">
            {status === 'in-call' && (
              <button className="btn" onClick={toggleMute}>
                {muted ? 'Unmute' : 'Mute'}
              </button>
            )}
            <button className="btn" onClick={endCall}>
              End call
            </button>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
