import React, { useState, useEffect, useRef, useCallback } from 'react';
import VideoBubble from './VideoBubble';
import toast from 'react-hot-toast';

const iceServers = {
  iceServers: [
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ]
};

const MediaManager = ({ socket, isConnected, roomId, user, roomUsers, isCamOn, isMicOn }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const peers = useRef({}); // { socketId: RTCPeerConnection }
  const senders = useRef({}); // { socketId: { video: RTCRtpSender, audio: RTCRtpSender } }
  const candidateQueues = useRef({}); // { socketId: [candidates] }
  const localStreamRef = useRef(null);
  const mediaInitialized = useRef(false);
  const toggleLock = useRef(false);
  const pendingCalls = useRef([]);
  const connectionRetryTimers = useRef({}); // { socketId: timerId }

  const syncTrackWithPeers = useCallback((track, kind) => {
    Object.keys(peers.current).forEach(socketId => {
      const peer = peers.current[socketId];
      if (peer && peer.connectionState !== 'closed') {
        const peerSenders = senders.current[socketId] || {};
        const sender = kind === 'video' ? peerSenders.video : peerSenders.audio;
        if (sender) {
          sender.replaceTrack(track).catch(err => console.error(`[WebRTC] replaceTrack error for ${socketId}:`, err));
        }
      }
    });
  }, []);

  const processCandidateQueue = useCallback(async (socketId) => {
    const peer = peers.current[socketId];
    const queue = candidateQueues.current[socketId] || [];
    if (peer && peer.remoteDescription && queue.length > 0) {
      console.log(`[WebRTC] Processing ${queue.length} queued candidates for ${socketId}`);
      for (const candidate of queue) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error(`[WebRTC] Error adding queued candidate for ${socketId}:`, err);
        }
      }
      candidateQueues.current[socketId] = [];
    }
  }, []);

  const cleanupPeer = useCallback((socketId) => {
    if (peers.current[socketId]) {
      peers.current[socketId].close();
      delete peers.current[socketId];
    }
    if (connectionRetryTimers.current[socketId]) {
      clearTimeout(connectionRetryTimers.current[socketId]);
      delete connectionRetryTimers.current[socketId];
    }
    delete senders.current[socketId];
    delete candidateQueues.current[socketId];
  }, []);

  const createPeer = useCallback((socketId, stream) => {
    try {
      cleanupPeer(socketId); // Clear any old connection first

      console.log(`[WebRTC] Creating peer connection for: ${socketId}`);
      const peer = new RTCPeerConnection(iceServers);
      peers.current[socketId] = peer;
      senders.current[socketId] = {};
      candidateQueues.current[socketId] = [];

      if (stream) {
        stream.getTracks().forEach(track => {
          const sender = peer.addTrack(track, stream);
          if (track.kind === 'video') senders.current[socketId].video = sender;
          if (track.kind === 'audio') senders.current[socketId].audio = sender;
        });
      }

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { to: socketId, candidate: event.candidate });
        }
      };

      peer.ontrack = (event) => {
        console.log(`[WebRTC] Track (${event.track.kind}) ARRIVED from ${socketId}`);
        const remoteStream = event.streams[0] || new MediaStream([event.track]);
        setRemoteStreams(prev => ({
          ...prev,
          [socketId]: { ...prev[socketId], stream: remoteStream }
        }));
      };

      peer.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] Peer ${socketId} ICE state: ${peer.iceConnectionState}`);
        if (peer.iceConnectionState === 'connected' || peer.iceConnectionState === 'completed') {
          if (connectionRetryTimers.current[socketId]) {
            clearTimeout(connectionRetryTimers.current[socketId]);
            delete connectionRetryTimers.current[socketId];
          }
        }
      };

      peer.onconnectionstatechange = () => {
        console.log(`[WebRTC] Peer ${socketId} state: ${peer.connectionState}`);
        if (peer.connectionState === 'failed' || peer.connectionState === 'closed') {
          setRemoteStreams(prev => ({
            ...prev,
            [socketId]: { ...prev[socketId], stream: null }
          }));
        }
      };

      return peer;
    } catch (err) {
      console.error('[WebRTC] Peer creation error:', err);
      return null;
    }
  }, [socket, cleanupPeer]);

  const initiateCall = useCallback(async (socketId, stream) => {
    if (!stream) {
      if (!pendingCalls.current.includes(socketId)) pendingCalls.current.push(socketId);
      return;
    }

    console.log(`[WebRTC] Initiating Handshake with: ${socketId}`);
    const peer = createPeer(socketId, stream);
    if (!peer) return;

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('call-user', { to: socketId, offer });

      // Handshake Recovery Timer: If not connected in 10s, retry
      if (connectionRetryTimers.current[socketId]) clearTimeout(connectionRetryTimers.current[socketId]);
      connectionRetryTimers.current[socketId] = setTimeout(() => {
        const p = peers.current[socketId];
        if (p && (p.iceConnectionState === 'new' || p.iceConnectionState === 'checking')) {
          console.log(`[WebRTC] Handshake Timeout for ${socketId}. Retrying...`);
          initiateCall(socketId, localStreamRef.current);
        }
      }, 10000);

    } catch (err) {
      console.error('[WebRTC] Offer creation failed:', err);
    }
  }, [createPeer, socket]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const initMedia = async () => {
      if (mediaInitialized.current) return;
      mediaInitialized.current = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getVideoTracks().forEach(t => t.enabled = isCamOn);
        stream.getAudioTracks().forEach(t => t.enabled = isMicOn);
        localStreamRef.current = stream;
        setLocalStream(stream);

        const queued = [...pendingCalls.current];
        pendingCalls.current = [];
        queued.forEach(id => initiateCall(id, stream));
      } catch (err) {
        console.error('[WebRTC] Device error:', err);
        mediaInitialized.current = false;
        toast.error('Could not access camera/mic.');
      }
    };

    initMedia();

    const handleCallMade = async ({ offer, socketId }) => {
      console.log(`[WebRTC] Receiving Handshake Offer from: ${socketId}`);
      const peer = createPeer(socketId, localStreamRef.current);
      if (!peer) return;

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        await processCandidateQueue(socketId);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('answer-call', { to: socketId, answer });
      } catch (err) {
        console.error('[WebRTC] Answer failed:', err);
      }
    };

    const handleAnswerMade = async ({ answer, socketId }) => {
      console.log(`[WebRTC] Handshake Answer received from: ${socketId}`);
      const peer = peers.current[socketId];
      if (peer) {
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
          await processCandidateQueue(socketId);
        } catch (err) {
          console.error('[WebRTC] Remote desc failed:', err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate, socketId }) => {
      const peer = peers.current[socketId];
      if (peer && peer.remoteDescription) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('[WebRTC] ICE ADD failed:', err);
        }
      } else {
        if (!candidateQueues.current[socketId]) candidateQueues.current[socketId] = [];
        candidateQueues.current[socketId].push(candidate);
      }
    };

    const handleUserJoined = ({ socketId, username }) => {
      console.log(`[WebRTC] User ${username} joined. Waiting for their call.`);
      setRemoteStreams(prev => ({ ...prev, [socketId]: { ...prev[socketId], username } }));
    };

    const handleRoomInfo = ({ users }) => {
      users.forEach(([socketId, data]) => {
        if (socketId !== socket.id) {
          setRemoteStreams(prev => ({ ...prev, [socketId]: { ...prev[socketId], username: data.username } }));
          initiateCall(socketId, localStreamRef.current);
        }
      });
    };

    const handleUserLeft = ({ socketId }) => {
      cleanupPeer(socketId);
      setRemoteStreams(prev => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    socket.on('call-made', handleCallMade);
    socket.on('answer-made', handleAnswerMade);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-joined', handleUserJoined);
    socket.on('room-info', handleRoomInfo);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('call-made', handleCallMade);
      socket.off('answer-made', handleAnswerMade);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-joined', handleUserJoined);
      socket.off('room-info', handleRoomInfo);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, isConnected, createPeer, initiateCall, processCandidateQueue, cleanupPeer]);

  useEffect(() => {
    const handleToggle = async () => {
      if (!localStreamRef.current || toggleLock.current) return;
      toggleLock.current = true;
      const stream = localStreamRef.current;
      try {
        let videoTrack = stream.getVideoTracks()[0];
        if (isCamOn) {
          if (!videoTrack || videoTrack.readyState === 'ended') {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newTrack = newStream.getVideoTracks()[0];
            if (videoTrack) stream.removeTrack(videoTrack);
            stream.addTrack(newTrack);
            syncTrackWithPeers(newTrack, 'video');
            setLocalStream(new MediaStream(stream.getTracks()));
          } else {
            videoTrack.enabled = true;
            syncTrackWithPeers(videoTrack, 'video');
          }
        } else if (videoTrack) {
          videoTrack.stop();
          stream.removeTrack(videoTrack);
          syncTrackWithPeers(null, 'video');
          setLocalStream(new MediaStream(stream.getTracks()));
        }
        stream.getAudioTracks().forEach(track => {
          track.enabled = !!isMicOn;
          syncTrackWithPeers(track, 'audio');
        });
      } catch (err) { console.error('[WebRTC] Toggle Error:', err); }
      finally { toggleLock.current = false; }
    };
    handleToggle();
  }, [isCamOn, isMicOn, syncTrackWithPeers]);

  useEffect(() => {
    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
      Object.keys(connectionRetryTimers.current).forEach(id => clearTimeout(connectionRetryTimers.current[id]));
    };
  }, []);

  return (
    <div className="video-container">
      {localStream && (
        <VideoBubble stream={localStream} username={user?.username || 'You'} isLocal={true} isCamOn={isCamOn} isMicOn={isMicOn} />
      )}
      {Object.entries(remoteStreams).map(([id, data]) => (
        <VideoBubble key={id} stream={data.stream} username={data.username} isLocal={false} socketId={id} />
      ))}
    </div>
  );
};

export default MediaManager;
