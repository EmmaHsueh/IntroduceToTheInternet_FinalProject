// src/components/LoginForm.js
import React, { useState } from 'react';

// ------------------------------------
// 統一配色定義 (淺色活潑大學風格)
// ------------------------------------
const COLOR_DEEP_NAVY = '#1e2a38';     // 主要文字/標題
const COLOR_OLIVE_GREEN = '#454f3b';   // 標籤文字/次要文字
const COLOR_MORANDI_BROWN = '#a38c6b'; // 輸入框邊框/次要按鈕/連結
const COLOR_BRICK_RED = '#c9362a';     // 主要提交按鈕 (CTA)
const COLOR_LIGHT_BORDER = '#e0e0e0';  // 極淺邊框

const LoginForm = ({ switchToRegister }) => {
    const [username, setUsername] = useState(''); // 對應 XML: 學號 or E-mail
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // TODO: 串接登入 API
        console.log('登入嘗試:', { username, password });
        alert('登入功能待串接 API'); 
    };

    // 統一輸入框樣式
    const inputStyle = { 
        width: '100%', 
        padding: '12px', 
        fontSize: '16px', 
        border: `1px solid ${COLOR_LIGHT_BORDER}`, // 預設極淺邊框
        borderRadius: '6px', 
        boxSizing: 'border-box', 
        color: COLOR_DEEP_NAVY,
        transition: 'border-color 0.3s',
    };
    
    // 統一標籤樣式
    const labelStyle = { 
        fontSize: '16px', 
        display: 'block', 
        marginBottom: '5px', 
        fontWeight: '500', 
        color: COLOR_OLIVE_GREEN // 標籤文字使用深橄欖綠
    };

    // 主要提交按鈕樣式
    const submitButtonStyle = {
        width: '100%', 
        padding: '14px', 
        backgroundColor: COLOR_BRICK_RED, // **磚紅 CTA**
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontSize: '18px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s, transform 0.2s',
        boxShadow: `0 4px 10px ${COLOR_BRICK_RED}40`
    };

    // 次要切換按鈕樣式 (前往註冊)
    const switchButtonStyle = {
        padding: '10px 20px', 
        backgroundColor: 'transparent',
        color: COLOR_MORANDI_BROWN, // **莫蘭迪棕連結色**
        border: `2px solid ${COLOR_MORANDI_BROWN}`, 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontSize: '16px',
        fontWeight: '500',
        transition: 'all 0.3s',
    };

    return (
        <div style={{ padding: '0' }}>
            {/* 標題 */}
            <h3 style={{ 
                textAlign: 'center', 
                marginBottom: '25px', 
                color: COLOR_DEEP_NAVY, 
                fontWeight: '600' 
            }}>
                登入師聲，開始發聲
            </h3>

            <form onSubmit={handleLogin}>
                {/* 學號 or E-mail */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>學號或師大信箱:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        style={inputStyle} 
                        placeholder="請輸入學號或信箱" 
                        required 
                        onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN} // Focus 莫蘭迪棕
                        onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                    />
                </div>

                {/* 密碼 */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>密碼:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={inputStyle} 
                        required 
                        onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN}
                        onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                    />
                </div>
                
                {/* 登入按鈕 */}
                <div style={{ marginBottom: '30px' }}>
                    <button 
                        type="submit" 
                        style={submitButtonStyle}
                        onMouseOver={e => {
                            e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN; // Hover 轉為莫蘭迪棕
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.backgroundColor = COLOR_BRICK_RED;
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        登入
                    </button>
                </div>
            </form>
            
            {/* 連結 (忘記密碼) - 使用莫蘭迪棕文字 */}
            <div style={{ marginTop: '5px', textAlign: 'center' }}>
                <a 
                    href="/forgot-password" 
                    style={{ 
                        color: COLOR_MORANDI_BROWN, 
                        textDecoration: 'none', 
                        fontSize: '1em',
                        transition: 'color 0.3s'
                    }}
                    onMouseOver={e => e.currentTarget.style.color = COLOR_BRICK_RED} // Hover 轉為磚紅
                    onMouseOut={e => e.currentTarget.style.color = COLOR_MORANDI_BROWN}
                >
                    忘記密碼？
                </a>
            </div>

            {/* 切換到註冊模式 */}
            <div style={{ textAlign: 'center', marginTop: '35px', borderTop: `1px solid ${COLOR_LIGHT_BORDER}`, paddingTop: '20px' }}>
                <p style={{ margin: '15px 0 10px 0', color: COLOR_OLIVE_GREEN }}>還沒有帳號嗎？</p>
                <button 
                    onClick={switchToRegister} 
                    type="button" 
                    style={switchButtonStyle}
                    onMouseOver={e => {
                        e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN;
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = COLOR_MORANDI_BROWN;
                    }}
                >
                    前往註冊
                </button>
            </div>
        </div>
    );
};

export default LoginForm;