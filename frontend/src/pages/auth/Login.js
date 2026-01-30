import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { chooseRole } from '../../utils/auth';
import { API_BASE_URL } from '../../utils/api';

const Login = () => {
  const navigate = useNavigate();
  // Start with no role selected; user can toggle selection on/off
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const ADMIN_USERNAME = '0863125891';
  const ADMIN_PASSWORD = '0863503381';
  const ADMIN_EMAIL = 'admin@example.com';

  useEffect(() => {
    try {
      const pre = sessionStorage.getItem('login_prefill_username');
      if (pre) {
        setUsername(pre);
        sessionStorage.removeItem('login_prefill_username');
      }
      const msg = sessionStorage.getItem('login_message');
      if (msg) {
        setInfo(msg);
        sessionStorage.removeItem('login_message');
      }
    } catch {}
  }, []);

  const toggleRole = (target) => {
    setRole((prev) => (prev === target ? '' : target));
  };

  const API = API_BASE_URL || process.env.REACT_APP_API_URL || '';

  const onLogin = async () => {
    setError(''); // Clear previous errors
    
    if (!username || !password) {
      setError('กรุณากรอกเบอร์โทรศัพท์ (Admin) หรืออีเมล และรหัสผ่าน');
      return;
    }
    
    const trimmedUsername = username.trim();

    // ==================================================================
    //  [ทางเข้าพิเศษ] สำหรับทดสอบระบบ
    // ==================================================================
    
    // 1. ทางเข้า "หัวหน้างาน" (Foreman)
    if (trimmedUsername === 'foreman' && password === '1234') {
        const user = { name: 'Foreman Test', role: 'foreman' };
        sessionStorage.setItem('role', 'foreman');
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('auth_token', 'mock-token-foreman');
        navigate('/foreman');
        return; 
    }

    // 2. ทางเข้า "ช่าง" (Worker)
    if (trimmedUsername === 'worker' && password === '1234') {
        const user = { name: 'Worker Test', role: 'worker' };
        sessionStorage.setItem('role', 'worker');
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('auth_token', 'mock-token-worker');
        navigate('/worker');
        return;
    }

    // 3. ✅ [เพิ่มใหม่] ทางเข้า "PM" (Project Manager)
    if (trimmedUsername === 'pm' && password === '1234') {
        const user = { name: 'Project Manager Test', role: 'project_manager' }; // หรือ role: 'pm' ตามที่คุณใช้ใน App.js
        sessionStorage.setItem('role', 'project_manager');
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('auth_token', 'mock-token-pm');
        navigate('/pm'); // เด้งไปหน้า PM ทันที
        return;
    }
    // ==================================================================


    // --- Admin Bypass Check ---
    if (trimmedUsername === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setError('');
      const token = 'admin-bypass-token';
      const user = {
        id: '11111111-1111-1111-1111-111111111111',
        phone: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        roles: ['admin']
      };
      try {
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user_id', user.id);
        sessionStorage.setItem('user_email', user.email);
        sessionStorage.setItem('role', 'admin');
      } catch {}
      const navUser = { username: user.phone, role: 'admin' };
      navigate('/admin', { state: { user: navUser, source: 'login' } });
      return;
    }

    // --- Regular Login (ล็อกอินปกติผ่าน Database) ---
    try {
      const loginUrl = API ? `${API}/api/auth/login` : '/api/auth/login';
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmedUsername, password }),
      });
      if (!res.ok) {
        setError('Username หรือ Password ไม่ถูกต้อง');
        return;
      }
      const data = await res.json();
      const { token, user } = data;
      // Persist token and identity
      try {
        sessionStorage.setItem('auth_token', token);
        if (user?.id) sessionStorage.setItem('user_id', user.id);
        if (user?.email) sessionStorage.setItem('user_email', user.email);
      } catch {}

      // Pick role: prefer selected role if present in server roles; else first role; else worker
      const serverRoles = Array.isArray(user?.roles) ? user.roles : [];

      if (role === 'admin' && !serverRoles.includes('admin')) {
        setError('บัญชีนี้ไม่ใช่ผู้ดูแลระบบ');
        return;
      }

      const chosenRole = chooseRole(role, serverRoles);
      try { sessionStorage.setItem('role', chosenRole); } catch {}

      const navUser = { username: user?.phone || username, role: chosenRole };
      
      // เลือกเส้นทางตามตำแหน่งงาน
      if (chosenRole === 'admin') {
        navigate('/admin', { state: { user: navUser, source: 'login' } });
      } else if (chosenRole === 'foreman') {
        navigate('/foreman', { state: { user: navUser, source: 'login' } });
      } else if (chosenRole === 'worker') {
        navigate('/worker', { state: { user: navUser, source: 'login' } });
      } else if (chosenRole === 'project_manager') {
        navigate('/pm', { state: { user: navUser, source: 'login' } });
      } else {
        navigate('/dashboard', { state: { user: navUser, source: 'login' } });
      }

    } catch (e) {
      console.error(e);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-page">
        <div>
          <h1 className="login-header"></h1>

          <div className="login-card">
            {info && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#e6f4ea',
                border: '1px solid #c7e8cf',
                borderRadius: '8px',
                color: '#137333',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {info}
              </div>
            )}
            {error && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            <div className="login-row">
              <label className="login-label">Username / Email</label>
              <input className="login-input" placeholder="เบอร์โทรศัพท์ (Admin) หรืออีเมล" value={username} onChange={e=>setUsername(e.target.value)} />
            </div>
            <div className="login-row">
              <label className="login-label">Password</label>
              <div className="input-with-eye">
                <input className="login-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
                  <button
                    type="button"
                    className={`eye-btn ${showPass ? 'is-show' : 'is-hide'}`}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    onClick={()=>setShowPass(s=>!s)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                    </svg>
                  </button>
              </div>
            </div>
            <div className="login-links">
              <Link to="#">Forgot password</Link>
            </div>
            <button className="login-submit" type="button" onClick={onLogin}>Login</button>
            <div className="login-footer-link">
              ต้องการบัญชีใหม่? กรุณาติดต่อผู้ดูแลระบบเพื่อสร้างบัญชีให้คุณ
            </div>
          </div>
        </div>
        <div className="login-logo-side">
          <img src="/logo123.png" alt="Logo" />
        </div>
      </div>
    </div>
  );
};

export default Login;