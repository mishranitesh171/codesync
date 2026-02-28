import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiSend, FiArrowLeft, FiKey, FiLock, FiCheck } from 'react-icons/fi';
import AuthBackground from '../components/AuthBackground';
import api from '../utils/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=code+newPassword
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.resetCode) {
        setGeneratedCode(data.resetCode);
        setStep(2);
        toast.success('Reset code generated!');
      } else {
        toast.error('No account found with this email.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email,
        resetCode,
        newPassword,
      });
      toast.success('Password reset successful! 🎉');
      // Store token and redirect
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBackground />
      <div className="auth-container">
        <div className="auth-card glass-card">
          <div className="auth-logo">
            <h1>🔑 Reset Password</h1>
            <p>{step === 1
              ? 'Enter your email to get a reset code.'
              : 'Enter the code and your new password.'
            }</p>
          </div>

          {step === 1 ? (
            <form className="auth-form" onSubmit={handleRequestCode}>
              <div className="form-group">
                <label htmlFor="email">
                  <FiMail style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {loading ? <div className="spinner"></div> : <FiSend />}
                  {loading ? 'Sending...' : 'Get Reset Code'}
                </span>
              </button>
            </form>
          ) : (
            <>
              {generatedCode && (
                <div className="reset-code-display">
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Your reset code (demo mode):
                  </p>
                  <div className="reset-code-value">{generatedCode}</div>
                </div>
              )}

              <form className="auth-form" onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="code">
                    <FiKey style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Reset Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    className="input-field"
                    placeholder="Enter 6-digit code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    <FiLock style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="input-field"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {loading ? <div className="spinner"></div> : <FiCheck />}
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </span>
                </button>
              </form>
            </>
          )}

          <div className="auth-footer">
            <FiArrowLeft style={{ marginRight: 4, verticalAlign: 'middle' }} />
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
