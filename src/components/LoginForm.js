// src/components/LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ------------------------------------
// 統一配色定義 (淺色活潑大學風格)
// ------------------------------------
const COLOR_DEEP_NAVY = '#1e2a38';     // 主要文字/標題
const COLOR_OLIVE_GREEN = '#454f3b';   // 標籤文字/次要文字
const COLOR_MORANDI_BROWN = '#a38c6b'; // 輸入框邊框/次要按鈕/連結
const COLOR_BRICK_RED = '#c9362a';     // 主要提交按鈕 (CTA)
const COLOR_LIGHT_BORDER = '#e0e0e0';  // 極淺邊框
const COLOR_OFF_WHITE = '#f3f3e6';     // 淺色背景

const LoginForm = ({ switchToRegister }) => {
    const [email, setEmail] = useState(''); // 改用 email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    // 📧 Email 登入
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await login(email, password);
            setSuccess('登入成功！即將跳轉到首頁...');
            // 延遲跳轉，讓用戶看到成功訊息
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('登入錯誤:', error);
            // 顯示友善的錯誤訊息
            if (error.code === 'auth/invalid-credential') {
                setError('帳號或密碼錯誤');
            } else if (error.code === 'auth/user-not-found') {
                setError('找不到此帳號');
            } else if (error.code === 'auth/wrong-password') {
                setError('密碼錯誤');
            } else if (error.code === 'auth/too-many-requests') {
                setError('登入嘗試次數過多，請稍後再試');
            } else {
                setError('登入失敗：' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // 🔐 Google 登入
    const handleGoogleLogin = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await loginWithGoogle();
            setSuccess('Google 登入成功！即將跳轉到首頁...');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('Google 登入錯誤:', error);
            setError('Google 登入失敗');
            setLoading(false);
        }
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
                {/* 錯誤訊息 */}
                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: COLOR_BRICK_RED,
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        border: `1px solid ${COLOR_BRICK_RED}`
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* 成功訊息 */}
                {success && (
                    <div style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        border: '1px solid #c3e6cb',
                        textAlign: 'center',
                        fontWeight: '500'
                    }}>
                        {success}
                    </div>
                )}

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        placeholder="請輸入 Email (例: student@ntnu.edu.tw)"
                        required
                        disabled={loading}
                        onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN}
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
                        disabled={loading}
                        onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN}
                        onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                    />
                </div>

                {/* 登入按鈕 */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        type="submit"
                        style={{
                            ...submitButtonStyle,
                            opacity: loading ? 0.8 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                        disabled={loading}
                        onMouseOver={e => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN;
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseOut={e => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = COLOR_BRICK_RED;
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {loading && (
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid white',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }}></div>
                        )}
                        {loading ? '登入中...' : '登入'}
                    </button>
                    {loading && (
                        <style>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    )}
                </div>
            </form>

            {/* Google 登入按鈕 */}
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <div style={{
                    textAlign: 'center',
                    position: 'relative',
                    marginBottom: '20px'
                }}>
                    <span style={{
                        backgroundColor: 'white',
                        padding: '0 10px',
                        color: COLOR_OLIVE_GREEN,
                        fontSize: '14px'
                    }}>
                        或使用
                    </span>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        height: '1px',
                        backgroundColor: COLOR_LIGHT_BORDER,
                        zIndex: -1
                    }}></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'white',
                        color: COLOR_DEEP_NAVY,
                        border: `2px solid ${COLOR_LIGHT_BORDER}`,
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '500',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        opacity: loading ? 0.6 : 1
                    }}
                    onMouseOver={e => {
                        if (!loading) {
                            e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN;
                            e.currentTarget.style.backgroundColor = COLOR_OFF_WHITE;
                        }
                    }}
                    onMouseOut={e => {
                        if (!loading) {
                            e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER;
                            e.currentTarget.style.backgroundColor = 'white';
                        }
                    }}
                >
                    {loading ? (
                        <div style={{
                            width: '18px',
                            height: '18px',
                            border: '2px solid #666',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }}></div>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z"/>
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                        </svg>
                    )}
                    {loading ? '登入中...' : '使用 Google 帳號登入'}
                </button>
            </div>
            
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