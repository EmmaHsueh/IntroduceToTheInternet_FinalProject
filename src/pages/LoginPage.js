// src/pages/LoginPage.js
import React, { useState } from 'react';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm'; 

// ------------------------------------
// 統一配色定義 (淺色活潑大學風格)
// ------------------------------------
const COLOR_DEEP_NAVY = '#1e2a38';     // 深藍/黑 - 主要文字/標題
const COLOR_OLIVE_GREEN = '#454f3b';   // 深橄欖綠 - 次要文字
const COLOR_MORANDI_BROWN = '#a38c6b'; // 莫蘭迪棕 - 邊框/次要連結
const COLOR_OFF_WHITE = '#f3f3e6';     // 米黃/淺色 - 主要背景色
const COLOR_BRICK_RED = '#c9362a';     // 磚紅 - 主要行動按鈕/切換強調

// 樣式輔助函數
const getTabStyle = (isActive) => ({
    padding: '12px 25px',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: isActive ? '700' : '500',
    fontSize: '1.1em',
    color: isActive ? 'white' : COLOR_OLIVE_GREEN,
    backgroundColor: isActive ? COLOR_BRICK_RED : COLOR_OFF_WHITE,
    border: `2px solid ${isActive ? COLOR_BRICK_RED : COLOR_MORANDI_BROWN}`,
    transition: 'all 0.3s',
    flexGrow: 1,
});


const LoginPage = () => {
    // 狀態用於切換登入 (true) 和註冊 (false) 模式
    const [isLoginMode, setIsLoginMode] = useState(true);

    const switchToLogin = () => setIsLoginMode(true);
    const switchToRegister = () => setIsLoginMode(false);

    return (
        <div style={{ backgroundColor: COLOR_OFF_WHITE, minHeight: '100vh' }}>
            {/* 確保 Header.js 存在且能正常引入 */}
            <Header />
            <main>
                <div 
                    className="auth-container" 
                    style={{ 
                        maxWidth: '480px', // 稍寬
                        margin: '60px auto', // 增加上下間距
                        padding: '0', 
                        borderRadius: '12px', 
                        boxShadow: `0 8px 20px ${COLOR_MORANDI_BROWN}33`, // 柔和的莫蘭迪棕陰影
                        backgroundColor: 'white', // 內容卡片為純白
                        overflow: 'hidden',
                        border: `1px solid ${COLOR_MORANDI_BROWN}50` // 柔和邊框
                    }}
                >
                    {/* 登入/註冊模式切換標籤 */}
                    <div className="tab-switch" style={{ display: 'flex' }}>
                        <div 
                            style={{ 
                                ...getTabStyle(isLoginMode),
                                borderTopLeftRadius: '12px',
                                borderRight: isLoginMode ? 'none' : `2px solid ${COLOR_MORANDI_BROWN}`
                            }}
                            onClick={switchToLogin}
                        >
                            登入
                        </div>
                        <div 
                            style={{ 
                                ...getTabStyle(!isLoginMode),
                                borderTopRightRadius: '12px',
                                borderLeft: isLoginMode ? `2px solid ${COLOR_MORANDI_BROWN}` : 'none'
                            }}
                            onClick={switchToRegister}
                        >
                            註冊
                        </div>
                    </div>

                    {/* 表單內容 */}
                    <div style={{ padding: '30px 40px' }}>
                        <h2 style={{ 
                            textAlign: 'center', 
                            color: COLOR_DEEP_NAVY, 
                            marginBottom: '25px',
                            fontWeight: '600',
                            borderBottom: `2px solid ${COLOR_MORANDI_BROWN}30`,
                            paddingBottom: '10px'
                        }}>
                            {isLoginMode ? '歡迎回來' : '加入師聲，暢所欲言'}
                        </h2>

                        {/* 根據 isLoginMode 顯示對應的表單，並傳入切換函數 */}
                        {isLoginMode ? 
                            <LoginForm switchToRegister={switchToRegister} /> : 
                            <RegistrationForm switchToLogin={switchToLogin} />
                        }
                    </div>

                </div>
            </main>
        </div>
    );
};

export default LoginPage;