import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiLogIn, FiLogOut, FiCode, FiClock,
  FiUsers, FiTrash2, FiCopy, FiHash
} from 'react-icons/fi';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomLanguage, setNewRoomLanguage] = useState('javascript');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [creating, setCreating] = useState(false);

  // Fetch user's rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/rooms', {
        name: newRoomName,
        language: newRoomLanguage,
      });
      toast.success('Room created! 🎉');
      setShowCreateModal(false);
      setNewRoomName('');
      navigate(`/editor/${res.data.roomId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    setShowJoinModal(false);
    navigate(`/editor/${joinRoomId.trim()}`);
  };

  const handleDeleteRoom = async (roomId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await api.delete(`/rooms/${roomId}`);
      toast.success('Room deleted');
      setRooms(rooms.filter((r) => r.roomId !== roomId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const copyRoomId = (roomId, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied!');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header animate-in">
        <div>
          <h1>
            ⚡ <span>CodeSync</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Welcome, <strong>{user?.username}</strong>
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <span><FiPlus /> New Room</span>
          </button>
          <button className="btn-secondary" onClick={() => setShowJoinModal(true)}>
            <FiLogIn /> Join Room
          </button>
          <button className="btn-icon" onClick={logout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }}></div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {rooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚀</div>
              <h3>No rooms yet</h3>
              <p>Create your first collaborative coding room or join an existing one to start coding together.</p>
              <button
                className="btn-primary"
                style={{ marginTop: 20 }}
                onClick={() => setShowCreateModal(true)}
              >
                <span><FiPlus /> Create Your First Room</span>
              </button>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                className="room-card glass-card"
                onClick={() => navigate(`/editor/${room.roomId}`)}
              >
                <div className="room-card-header">
                  <h3>{room.name}</h3>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn-icon"
                      style={{ width: 32, height: 32, fontSize: '0.85rem' }}
                      onClick={(e) => copyRoomId(room.roomId, e)}
                      title="Copy Room ID"
                    >
                      <FiCopy />
                    </button>
                    {room.owner?._id === user?._id && (
                      <button
                        className="btn-icon"
                        style={{ width: 32, height: 32, fontSize: '0.85rem', color: 'var(--error)' }}
                        onClick={(e) => handleDeleteRoom(room.roomId, e)}
                        title="Delete Room"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>

                <div className="room-card-meta">
                  <FiHash size={12} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{room.roomId}</span>
                  <span>•</span>
                  <FiCode size={12} />
                  <span>{room.language}</span>
                  <span>•</span>
                  <FiClock size={12} />
                  <span>{formatDate(room.updatedAt)}</span>
                </div>

                <div className="room-card-footer">
                  <div className="room-card-participants">
                    {room.participants?.slice(0, 4).map((p, i) => (
                      <img key={p._id || i} src={p.avatar} alt={p.username} title={p.username} />
                    ))}
                    {room.participants?.length > 4 && (
                      <span
                        style={{
                          marginLeft: -8,
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'var(--bg-tertiary)', border: '2px solid var(--bg-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)',
                        }}
                      >
                        +{room.participants.length - 4}
                      </span>
                    )}
                  </div>
                  <span className="badge badge-info">
                    <FiUsers size={11} style={{ marginRight: 4 }} />
                    {room.participants?.length || 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h2>✨ Create New Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="auth-form">
                <div className="form-group">
                  <label>Room Name</label>
                  <input
                    className="input-field"
                    placeholder="e.g., Algorithm Practice"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <select
                    className="input-field"
                    value={newRoomLanguage}
                    onChange={(e) => setNewRoomLanguage(e.target.value)}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  <span>{creating ? 'Creating...' : 'Create Room'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h2>🔗 Join Room</h2>
            <form onSubmit={handleJoinRoom}>
              <div className="auth-form">
                <div className="form-group">
                  <label>Room ID</label>
                  <input
                    className="input-field"
                    placeholder="Enter room ID (e.g., a1b2c3d4)"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    autoFocus
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>Join Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
