import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { FiSend, FiCode, FiZap, FiHelpCircle, FiAlertCircle, FiCheck, FiMessageSquare, FiCopy } from 'react-icons/fi';

const QUICK_ACTIONS = [
  { icon: <FiAlertCircle size={13} />, label: 'Fix Errors', prompt: 'Fix all bugs and errors in this code. Explain what was wrong.' },
  { icon: <FiZap size={13} />, label: 'Optimize', prompt: 'Optimize this code for better performance and readability.' },
  { icon: <FiHelpCircle size={13} />, label: 'Explain', prompt: 'Explain this code step by step in simple terms.' },
  { icon: <FiCode size={13} />, label: 'Add Comments', prompt: 'Add clear, helpful comments to this code.' },
];

const AIChatPanel = ({ code, language, onApplyCode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text || text.trim().length === 0 || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: text,
        code,
        language,
        history: messages.slice(-6),
      });

      const aiMsg = {
        role: 'assistant',
        content: res.data.reply || 'No response from AI.',
        fixedCode: res.data.fixedCode || null,
        applied: false,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Chat error:', err);
      const errorMsg = {
        role: 'assistant',
        content: err.response?.data?.message || 'Something went wrong. Please try again.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleApplyCode = (fixedCode, msgIndex) => {
    if (onApplyCode && fixedCode) {
      onApplyCode(fixedCode);
      // Mark this message as applied
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[msgIndex]) {
          updated[msgIndex] = { ...updated[msgIndex], applied: true };
        }
        return [
          ...updated,
          { role: 'system', content: '✅ Code applied to editor and synced with collaborators!' },
        ];
      });
    }
  };

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
  };

  // Render markdown-like content
  const renderContent = (text) => {
    if (!text) return null;

    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const codeContent = part.replace(/```\w*\n?/, '').replace(/```$/, '').trim();
        return (
          <div key={i} className="ai-chat-code-wrapper">
            <div className="ai-chat-code-header">
              <span>Code</span>
              <button className="ai-chat-copy-btn" onClick={() => handleCopyCode(codeContent)} title="Copy code">
                <FiCopy size={12} />
              </button>
            </div>
            <pre className="ai-chat-code-block">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      return (
        <span key={i}>
          {lines.map((line, j) => {
            let formatted = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            formatted = formatted.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');
            if (formatted.startsWith('- ') || formatted.startsWith('* ')) {
              formatted = '• ' + formatted.substring(2);
            }
            // Numbered lists
            const numberedMatch = formatted.match(/^(\d+)\.\s/);
            if (numberedMatch) {
              formatted = `<b>${numberedMatch[1]}.</b> ` + formatted.substring(numberedMatch[0].length);
            }

            return (
              <span key={j}>
                <span dangerouslySetInnerHTML={{ __html: formatted }} />
                {j < lines.length - 1 && <br />}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div className="sidebar-panel ai-chat-panel">
      <div className="sidebar-header">
        <h3>
          <FiMessageSquare size={16} />
          AI Assistant
        </h3>
        {messages.length > 0 && (
          <button
            className="btn-icon"
            style={{ width: 28, height: 28, fontSize: '0.7rem' }}
            onClick={() => setMessages([])}
            title="Clear chat"
          >
            ✕
          </button>
        )}
      </div>

      <div className="ai-chat-messages">
        {messages.length === 0 && (
          <div className="ai-chat-welcome">
            <div className="ai-chat-welcome-icon">🤖</div>
            <h4>CodeSync AI</h4>
            <p>Ask me to fix bugs, explain code, optimize performance, or anything about your code!</p>

            <div className="ai-chat-quick-actions">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  className="ai-chat-quick-btn"
                  onClick={() => sendMessage(action.prompt)}
                  disabled={loading}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`ai-chat-msg ${msg.role} ${msg.isError ? 'error' : ''}`}>
            {msg.role === 'user' && (
              <div className="ai-chat-msg-bubble user">
                {msg.content.length > 100 ? msg.content.substring(0, 80) + '...' : msg.content}
              </div>
            )}
            {msg.role === 'assistant' && (
              <div className="ai-chat-msg-bubble assistant">
                <div className="ai-chat-msg-content">
                  {renderContent(msg.content)}
                </div>
                {msg.fixedCode && !msg.applied && (
                  <button
                    className="ai-chat-apply-btn"
                    onClick={() => handleApplyCode(msg.fixedCode, i)}
                  >
                    <FiCheck size={14} />
                    Apply Fix to Editor
                  </button>
                )}
                {msg.applied && (
                  <div className="ai-chat-applied-badge">
                    <FiCheck size={12} /> Applied ✓
                  </div>
                )}
              </div>
            )}
            {msg.role === 'system' && (
              <div className="ai-chat-system-msg">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="ai-chat-msg assistant">
            <div className="ai-chat-msg-bubble assistant">
              <div className="ai-chat-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && (
        <div className="ai-chat-quick-bar">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              className="ai-chat-quick-pill"
              onClick={() => sendMessage(action.prompt)}
              disabled={loading}
              title={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      <form className="ai-chat-input-area" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="ai-chat-input"
          placeholder="Ask AI about your code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="ai-chat-send-btn"
          disabled={!input.trim() || loading}
        >
          <FiSend size={16} />
        </button>
      </form>
    </div>
  );
};

export default AIChatPanel;
