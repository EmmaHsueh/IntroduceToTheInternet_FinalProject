// src/components/LoginForm.js
import React, { useState } from 'react';

const LoginForm = ({ switchToRegister }) => {
  const [username, setUsername] = useState(''); // 對應 XML: 學號 or E-mail
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: 串接登入 API
    console.log('登入嘗試:', { username, password });
    alert('登入功能待串接 API'); 
  };

  const inputStyle = { width: '100%', padding: '10px', fontSize: '18px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '20px', display: 'block', marginBottom: '5px', fontWeight: 'bold' };

  return (
    <div style={{ padding: '20px' }}>
      {/* 標題 */}
      <h3 style={{ textAlign: 'center', textTransform: 'uppercase', marginBottom: '30px', color: 'darkorange' }}>
        登入師聲，開始發聲
      </h3>

      <form onSubmit={handleLogin}>
        {/* 學號 or E-mail */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>學號或師大信箱:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} placeholder="請輸入學號或信箱" required />
        </div>

        {/* 密碼 */}
        <div style={{ marginBottom: '30px' }}>
          <label style={labelStyle}>密碼:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
        </div>
        
        {/* 登入按鈕 */}
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: 'orange', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '18px' }}>
            登入
        </button>
      </form>
      
      {/* 連結 (忘記密碼) */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>
          <a href="/forgot-password" style={{ color: 'blue', textDecoration: 'none' }}>忘記密碼？</a>
        </p>
      </div>

      {/* 切換到註冊模式 */}
      <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p style={{ margin: '10px 0' }}>還沒有帳號嗎？</p>
        <button 
            onClick={switchToRegister} 
            type="button" 
            style={{ padding: '8px 15px', backgroundColor: 'darkgreen', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
            前往註冊
        </button>
      </div>
    </div>
  );
};

export default LoginForm;