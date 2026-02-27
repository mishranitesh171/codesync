import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiClock, FiDownload, FiUser } from 'react-icons/fi';

const VersionHistory = ({ roomId, onLoadVersion }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [roomId]);

  const fetchVersions = async () => {
    try {
      const res = await api.get(`/versions/${roomId}`);
      setVersions(res.data);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="sidebar-panel">
      <div className="sidebar-header">
        <h3>
          <FiClock size={16} />
          Version History
        </h3>
        <button className="btn-icon" onClick={fetchVersions} title="Refresh" style={{ width: 30, height: 30, fontSize: '0.8rem' }}>
          ↻
        </button>
      </div>

      <div className="sidebar-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30 }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : versions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <FiClock size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No versions saved yet. Click the save button (💾) to create a snapshot.</p>
          </div>
        ) : (
          <div className="version-list">
            {versions.map((version) => (
              <div
                key={version._id}
                className="version-item"
                onClick={() => onLoadVersion(version.code, version.language)}
              >
                <div className="version-item-header">
                  <span className="version-item-label">
                    {version.label}
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                    {version.language}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="version-item-user">
                    <FiUser size={11} style={{ marginRight: 4 }} />
                    {version.savedBy?.username || 'Unknown'}
                  </span>
                  <span className="version-item-time">
                    {formatTime(version.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionHistory;
