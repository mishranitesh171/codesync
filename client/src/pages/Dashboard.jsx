import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiLogIn, FiLogOut, FiCode, FiClock,
  FiUsers, FiTrash2, FiCopy, FiHash, FiMenu, FiX
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

  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="layout-wrapper">
      {/* Mobile Sidebar Toggle */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar Navigation */}
      <aside className={`sidebar animate-in ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">⚡</div>
          <span>CodeSync</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <FiCode /> Dashboard
          </div>
          <div className="nav-item" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> New Room
          </div>
          <div className="nav-item" onClick={() => setShowJoinModal(true)}>
            <FiLogIn /> Join Room
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={logout}>
            <FiLogOut /> Logout
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="dashboard-header animate-slide-up">
          <div>
            <h1>
              <span>Overview</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 6 }}>
              Welcome back, <span style={{ color: '#fff', fontWeight: 600 }}>{user?.username}</span> 👋
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: 240 }}
              />
            </div>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus /> Create Room
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
            <div className="spinner" style={{ width: 48, height: 48 }}></div>
          </div>
        ) : (
          <div className="dashboard-grid">
            {rooms.length === 0 ? (
              <div className="empty-state animate-slide-up">
                <div className="empty-state-icon">✨</div>
                <h3>Your workspace is empty</h3>
                <p>Create a collab room to start coding with your team in real-time.</p>
                <button
                  className="btn-primary"
                  style={{ margin: '0 auto' }}
                  onClick={() => setShowCreateModal(true)}
                >
                  <FiPlus /> Create Your First Room
                </button>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="empty-state animate-fade-in" style={{ gridColumn: '1/-1' }}>
                <p>No rooms matching "{searchQuery}"</p>
              </div>
            ) : (
              filteredRooms.map((room, index) => (
                <div
                  key={room._id}
                  className="room-card glass-card animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/editor/${room.roomId}`)}
                >
                  <div className="room-card-header">
                    <h3>{room.name}</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-icon"
                        style={{ width: 34, height: 34 }}
                        onClick={(e) => copyRoomId(room.roomId, e)}
                        title="Copy Room ID"
                      >
                        <FiCopy size={14} />
                      </button>
                      {room.owner?._id === user?._id && (
                        <button
                          className="btn-icon"
                          style={{ width: 34, height: 34, color: 'var(--error)' }}
                          onClick={(e) => handleDeleteRoom(room.roomId, e)}
                          title="Delete Room"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="room-card-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiHash size={13} />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{room.roomId}</span>
                    </div>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiCode size={13} />
                      <span>{room.language}</span>
                    </div>
                  </div>

                  <div className="room-card-footer">
                    <div className="room-card-participants">
                      {room.participants?.slice(0, 4).map((p, i) => (
                        <img key={p._id || i} src={p.avatar} alt={p.username} title={p.username} />
                      ))}
                      {room.participants?.length > 4 && (
                        <div
                          style={{
                            marginLeft: -8, width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--bg-tertiary)', border: '2px solid var(--bg-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)',
                            zIndex: 5
                          }}
                        >
                          +{room.participants.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="badge badge-info">
                      <FiUsers size={12} />
                      {room.participants?.length || 0}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FiPlus style={{ color: 'var(--primary)' }} /> Create Room
            </h2>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label>Name your workspace</label>
                <input
                  className="input-field"
                  placeholder="e.g. Frontend Team Collab"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginTop: 20 }}>
                <label>Primary Language</label>
                <select
                  className="input-field"
                  value={newRoomLanguage}
                  onChange={(e) => setNewRoomLanguage(e.target.value)}
                  style={{ appearance: 'none' }}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : <FiPlus />}
                  {creating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FiLogIn style={{ color: 'var(--primary)' }} /> Join Session
            </h2>
            <form onSubmit={handleJoinRoom}>
              <div className="form-group">
                <label>Paste Room ID</label>
                <input
                  className="input-field"
                  placeholder="e.g. 5f8d2..."
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  autoFocus
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <FiLogIn /> Join Now
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
