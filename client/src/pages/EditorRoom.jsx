import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Components
import CodeEditor from '../components/CodeEditor';
import AIReviewPanel from '../components/AIReviewPanel';
import AIChatPanel from '../components/AIChatPanel';
import VersionHistory from '../components/VersionHistory';
import MediaManager from '../components/MediaManager';

// Icons
import {
  FiChevronLeft, FiPlay, FiSave, FiCpu,
  FiMessageSquare, FiClock, FiSettings, FiUsers,
  FiVideo, FiMic, FiVideoOff, FiMicOff, FiSidebar
} from 'react-icons/fi';

const EditorRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [cursors, setCursors] = useState({});
  const [activePanel, setActivePanel] = useState('ai-review');
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);

  // Media state (managed here for toggles)
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        setRoom(res.data);
        setLanguage(res.data.language || 'javascript');
        // Initial code could come from room or a version
        setCode(res.data.currentCode || '// Start coding together! 🚀');
      } catch (err) {
        toast.error('Failed to load room');
        navigate('/dashboard');
      }
    };
    fetchRoom();
  }, [roomId, navigate]);

  // Socket Events
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join room
    socket.emit('join-room', {
      roomId,
      username: user?.username,
      avatar: user?.avatar
    });

    // Listen for events
    socket.on('code-update', (newCode) => {
      setCode(newCode);
    });

    socket.on('cursor-update', ({ socketId, username, cursor, color }) => {
      setCursors(prev => ({
        ...prev,
        [socketId]: { username, cursor, color }
      }));
    });

    socket.on('room-info', ({ users }) => {
      setRoomUsers(users);
    });

    socket.on('user-joined', ({ username, users }) => {
      setRoomUsers(users);
      toast.success(`${username} joined the session`);
    });

    socket.on('user-left', ({ socketId, username }) => {
      setCursors(prev => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
      setRoomUsers(prev => prev.filter(([id]) => id !== socketId));
      toast(`${username} left the session`, { icon: '👋' });
    });

    return () => {
      socket.off('code-update');
      socket.off('cursor-update');
      socket.off('room-info');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket, isConnected, roomId, user]);

  // Handle code change
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socket && isConnected) {
      socket.emit('code-change', { roomId, code: newCode });
    }
  };

  // Handle cursor change
  const handleCursorChange = (cursor) => {
    if (socket && isConnected) {
      socket.emit('cursor-move', { roomId, cursor });
    }
  };

  // Run Code
  const runCode = async () => {
    setExecuting(true);
    setOutput(null);
    try {
      const res = await api.post('/execute', { code, language });
      setOutput(res.data);
    } catch (err) {
      toast.error('Execution failed');
      setOutput({ error: err.response?.data?.message || 'Something went wrong' });
    } finally {
      setExecuting(false);
    }
  };

  // Save Version
  const saveVersion = async () => {
    try {
      await api.post(`/versions/${roomId}`, { code, language });
      toast.success('Version saved! 💾');
    } catch (err) {
      toast.error('Failed to save version');
    }
  };

  // Load Version
  const loadVersion = (versionCode, versionLang) => {
    handleCodeChange(versionCode);
    if (versionLang) setLanguage(versionLang);
    toast.success('Version loaded');
  };

  if (!room) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="editor-page">
      {/* Navbar */}
      <nav className="editor-nav">
        <div className="nav-left">
          <button className="btn-icon" onClick={() => navigate('/dashboard')}>
            <FiChevronLeft />
          </button>
          <div className="room-info">
            <h2>{room.name}</h2>
            <span className="badge badge-info">{language}</span>
            <div className={`status-dot ${isConnected ? 'online' : 'offline'}`}></div>
          </div>
        </div>

        <div className="nav-center">
          <div className="active-users">
            <FiUsers size={14} />
            <span>{roomUsers.length} online</span>
            <div className="avatar-group">
              {roomUsers.slice(0, 3).map(([id, u]) => (
                u.avatar ? (
                  <img key={id} src={u.avatar} title={u.username} alt={u.username} />
                ) : (
                  <div key={id} className="avatar-fallback-sm" title={u.username}>
                    {u.username ? u.username[0].toUpperCase() : 'U'}
                  </div>
                )
              ))}
              {roomUsers.length > 3 && <span className="avatar-more">+{roomUsers.length - 3}</span>}
            </div>
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-media-controls">
            <button
              className={`btn-icon-sm ${isMicOn ? 'active' : 'off'}`}
              onClick={() => setIsMicOn(!isMicOn)}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <FiMic size={16} /> : <FiMicOff size={16} />}
            </button>
            <button
              className={`btn-icon-sm ${isCamOn ? 'active' : 'off'}`}
              onClick={() => setIsCamOn(!isCamOn)}
              title={isCamOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCamOn ? <FiVideo size={16} /> : <FiVideoOff size={16} />}
            </button>
          </div>

          <div className="v-divider"></div>

          <button className="btn-run" onClick={runCode} disabled={executing}>
            {executing ? <div className="spinner-sm"></div> : <FiPlay />}
            Run
          </button>
          <button className="btn-secondary" onClick={saveVersion}>
            <FiSave />
          </button>
          <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle Sidebar">
            <FiSidebar />
          </button>
        </div>
      </nav>

      <main className="editor-container">
        <MediaManager
          socket={socket}
          isConnected={isConnected}
          roomId={roomId}
          user={user}
          roomUsers={roomUsers}
          isCamOn={isCamOn}
          isMicOn={isMicOn}
        />

        {/* Editor Main Area */}
        <div className="editor-main">
          <div className="editor-wrapper">
            <CodeEditor
              code={code}
              language={language}
              onChange={handleCodeChange}
              onCursorChange={handleCursorChange}
              cursors={cursors}
            />
          </div>

          {/* Terminal / Output */}
          {output && (
            <div className="output-panel animate-up">
              <div className="panel-header">
                <span>Output</span>
                <button onClick={() => setOutput(null)}>✕</button>
              </div>
              <pre className={`output-content ${output.error ? 'error' : ''}`}>
                {output.error || output.output || 'No output'}
              </pre>
            </div>
          )}
        </div>

        {/* Sidebar Panel */}
        <aside className={`editor-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-tabs">
            <button
              className={activePanel === 'ai-review' ? 'active' : ''}
              onClick={() => setActivePanel('ai-review')}
              title="AI Review"
            >
              <FiCpu />
            </button>
            <button
              className={activePanel === 'ai-chat' ? 'active' : ''}
              onClick={() => setActivePanel('ai-chat')}
              title="AI Chat"
            >
              <FiMessageSquare />
            </button>
            <button
              className={activePanel === 'history' ? 'active' : ''}
              onClick={() => setActivePanel('history')}
              title="History"
            >
              <FiClock />
            </button>
          </div>

          <div className="sidebar-body">
            {activePanel === 'ai-review' && <AIReviewPanel code={code} language={language} />}
            {activePanel === 'ai-chat' && <AIChatPanel code={code} language={language} onApplyCode={handleCodeChange} />}
            {activePanel === 'history' && <VersionHistory roomId={roomId} onLoadVersion={loadVersion} />}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default EditorRoom;
