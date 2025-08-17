// src/components/AdminLogin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import AuthService from '../services/authService';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Check if admin is already logged in
  useEffect(() => {
    // Clear any existing tokens first for testing
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    
    if (AuthService.isAdminAuthenticated()) {
      setMessage({ type: 'success', text: 'Bạn đã đăng nhập rồi!' });
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ email và mật khẩu' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Sử dụng AuthService để login
      const result = await AuthService.adminLogin(loginData);
      
      setMessage({ type: 'success', text: result.message });
      
      // Log thông tin admin đã đăng nhập
      console.log('Admin logged in:', result.user);
      console.log('Token saved:', result.token);
      console.log('Is admin authenticated:', AuthService.isAdminAuthenticated());
      
      // Redirect to admin dashboard
      setTimeout(() => {
        console.log('Redirecting to admin dashboard...');
        navigate('/admin/dashboard');
      }, 1500);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      console.error('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleTestLogin = () => {
    setLoginData({
      email: 'admin@company.com',
      password: 'admin123456'
    });
    setMessage({ type: 'info', text: 'Đã điền thông tin test admin' });
  };

  // Handle logout (for testing)
  const handleLogout = () => {
    AuthService.logout();
    setMessage({ type: 'success', text: 'Đã đăng xuất!' });
    setLoginData({ email: '', password: '' });
  };

  return (
    <div className="admin-login-container">
      {/* Main Login Container */}
      <div className="admin-login-card">
        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <Shield />
          </div>
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">Đăng nhập vào hệ thống quản trị</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`admin-message ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span style={{marginLeft: '0.75rem'}}>{message.text}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="admin-login-form">
          {/* Email Input */}
          <div className="admin-form-group">
            <Mail className="admin-form-icon" />
            <input
              type="email"
              placeholder="Email admin"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              onKeyPress={handleKeyPress}
              className="admin-form-input"
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div className="admin-form-group">
            <Lock className="admin-form-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              onKeyPress={handleKeyPress}
              className="admin-form-input"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="admin-toggle-password"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`admin-login-button ${loading ? 'admin-loading' : ''}`}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="admin-spinner"></div>
                Đang đăng nhập...
              </div>
            ) : (
              'Đăng nhập Admin'
            )}
          </button>

          {/* Test Login Button */}
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="admin-test-button"
          >
            Điền thông tin test
          </button>

          {/* Logout Button (for testing) */}
          {AuthService.isAdminAuthenticated() && (
            <button
              onClick={handleLogout}
              className="admin-test-button"
              style={{backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5'}}
            >
              Đăng xuất
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="admin-login-footer">
          <p>© 2025 Admin System. Chỉ dành cho quản trị viên.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;