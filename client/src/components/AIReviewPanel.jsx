import { useState } from 'react';
import api from '../utils/api';
import { FiCpu, FiAlertTriangle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const AIReviewPanel = ({ code, language }) => {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReview = async () => {
    if (!code || code.trim().length < 5) {
      setError('Write some code first before requesting a review.');
      return;
    }

    setLoading(true);
    setError(null);
    setReview(null);

    try {
      const res = await api.post('/ai/review', { code, language });
      setReview(res.data.review);
    } catch (err) {
      setError(err.response?.data?.message || 'AI Review failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'var(--success)';
    if (score >= 6) return 'var(--warning)';
    return 'var(--error)';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return <FiAlertCircle size={14} color="var(--error)" />;
      case 'warning': return <FiAlertTriangle size={14} color="var(--warning)" />;
      default: return <FiInfo size={14} color="var(--info)" />;
    }
  };

  return (
    <div className="sidebar-panel">
      <div className="sidebar-header">
        <h3>
          <FiCpu size={16} />
          AI Code Review
        </h3>
      </div>

      <div className="sidebar-content">
        {/* Trigger Button */}
        <button
          className="btn-primary ai-review-trigger"
          onClick={handleReview}
          disabled={loading}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Analyzing...
              </>
            ) : (
              <>
                <FiCpu />
                Analyze Code
              </>
            )}
          </span>
        </button>

        {/* Error */}
        {error && (
          <div className="ai-summary" style={{ borderLeft: '3px solid var(--error)' }}>
            {error}
          </div>
        )}

        {/* Review Results */}
        {review && (
          <div className="animate-in">
            {/* Score */}
            <div className="ai-score">
              <div
                className="ai-score-circle"
                style={{
                  borderColor: getScoreColor(review.overallScore),
                  color: getScoreColor(review.overallScore),
                  background: `${getScoreColor(review.overallScore)}11`,
                }}
              >
                {review.overallScore}
              </div>
              <div className="ai-score-label">Overall Score</div>
            </div>

            {/* Summary */}
            <div className="ai-summary">{review.summary}</div>

            {/* Issues */}
            {review.issues && review.issues.length > 0 && (
              <>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
                  Issues ({review.issues.length})
                </h4>
                <div className="ai-issues">
                  {review.issues.map((issue, i) => (
                    <div key={i} className={`ai-issue ${issue.severity}`}>
                      <div className="ai-issue-header">
                        {getSeverityIcon(issue.severity)}
                        <span className="ai-issue-severity" style={{ color: `var(--${issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'info'})` }}>
                          {issue.severity}
                        </span>
                        {issue.line > 0 && (
                          <span className="ai-issue-line">Line {issue.line}</span>
                        )}
                      </div>
                      <div className="ai-issue-message">{issue.message}</div>
                      {issue.suggestion && (
                        <div className="ai-issue-suggestion">💡 {issue.suggestion}</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Suggestions */}
            {review.suggestions && review.suggestions.length > 0 && (
              <>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
                  Suggestions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {review.suggestions.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        borderLeft: '3px solid var(--accent-secondary)',
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Code Quality Grid */}
            {review.codeQuality && (
              <>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
                  Code Quality
                </h4>
                <div className="ai-quality-grid">
                  {Object.entries(review.codeQuality).map(([key, value]) => (
                    <div key={key} className="ai-quality-item">
                      <div className="label">{key}</div>
                      <div className="value" style={{ color: getScoreColor(value) }}>
                        {value}/10
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Initial state */}
        {!review && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <FiCpu size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>Click "Analyze Code" to get AI-powered feedback on your code quality, bugs, and improvements.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIReviewPanel;
