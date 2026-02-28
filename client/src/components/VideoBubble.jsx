import { useRef, useEffect, useState } from 'react';
import { FiMicOff } from 'react-icons/fi';

const VideoBubble = ({ stream, username, isLocal, isCamOn, isMicOn }) => {
  const videoRef = useRef(null);
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);
  const [remoteMicOn, setRemoteMicOn] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log(`[VideoBubble] Updating srcObject for ${isLocal ? 'local' : 'remote'} user`);
      videoRef.current.srcObject = stream;

      videoRef.current.play().catch(err => {
        console.warn('[VideoBubble] Auto-play was prevented:', err);
      });

      const updateTrackStates = () => {
        if (!stream) return;
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        if (!isLocal) {
          setRemoteVideoOn(videoTrack ? (videoTrack.enabled && videoTrack.readyState === 'live') : false);
          setRemoteMicOn(audioTrack ? (audioTrack.enabled && audioTrack.readyState === 'live') : false);
        }
      };

      updateTrackStates();

      stream.onaddtrack = updateTrackStates;
      stream.onremovetrack = updateTrackStates;

      const interval = setInterval(updateTrackStates, 2000);
      return () => clearInterval(interval);
    } else if (!stream) {
      setRemoteVideoOn(false);
      setRemoteMicOn(false);
    }
  }, [stream, isLocal]);

  const showPlaceholder = isLocal ? !isCamOn : (!stream || !remoteVideoOn);
  const micMuted = isLocal ? !isMicOn : (!stream || !remoteMicOn);

  return (
    <div className={`video-bubble ${isLocal ? 'local' : 'remote'}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={showPlaceholder ? 'hidden' : ''}
      />

      {showPlaceholder && (
        <div className="video-placeholder">
          <div className="avatar-large">
            {username ? username[0].toUpperCase() : 'U'}
          </div>
        </div>
      )}

      <div className="bubble-overlay">
        <div className="bubble-meta">
          <span className="bubble-name">
            {isLocal ? 'You' : username}
            {!isLocal && !stream && <span className="connecting-badge"> • Connecting...</span>}
          </span>
          {micMuted && (
            <div className="mic-badge muted">
              <FiMicOff size={10} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoBubble;
