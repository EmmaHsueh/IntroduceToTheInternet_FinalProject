// src/components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// 統一配色定義
const COLOR_BACKGROUND_LIGHT = '#ffffff'; // 白色背景
const COLOR_PRIMARY_TEXT = '#333333'; // 深灰文字
const COLOR_SECONDARY_TEXT = '#666666'; // 中灰文字
const COLOR_BORDER = '#dddddd'; // 淺灰線條
const COLOR_MORANDI_HIGHLIGHT = '#1e2a38'; // 莫蘭迪藍，用於強調 Hover 效果
const COLOR_BRICK_RED = '#c9362a'; // 磚紅色，用於登出按鈕

// 確保 Logo 檔案 (logo.png) 已放在 public 資料夾
const SITE_LOGO_PATH = '/logo.png';

const Header = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    
    // 樣式定義
    const headerStyle = {
        backgroundColor: COLOR_BACKGROUND_LIGHT, // 修正為白色/極淺灰
        color: COLOR_PRIMARY_TEXT, // 修正為深灰文字
        padding: '15px 20px', // 調整內距
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // 增加質感陰影
        borderBottom: `1px solid ${COLOR_BORDER}`, // 添加底部淺灰線
    };

    const navContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px', 
        margin: '0 auto',
    };

    const logoImgStyle = {
        height: '45px', // Logo 高度略減，更精緻
        marginRight: '10px',
        opacity: 0.85, // 略微降低透明度，讓 Logo 與黑白灰融合
    };

    // 導覽連結基礎樣式
    const navLinkBaseStyle = {
        color: COLOR_SECONDARY_TEXT, // 使用中灰色
        textDecoration: 'none',
        fontWeight: '500', // 中等粗細
        transition: 'color 0.3s',
        padding: '5px 0',
        borderBottom: '2px solid transparent', // 預留空間給 hover 效果
    };
    
    const navItemStyle = { 
        marginLeft: '25px', // 增加間隔
    };

    // 處理 Link 的 Hover 效果
    const handleMouseOver = (e) => {
        e.currentTarget.style.color = COLOR_MORANDI_HIGHLIGHT;
        e.currentTarget.style.borderBottom = `2px solid ${COLOR_MORANDI_HIGHLIGHT}`;
    };

    const handleMouseOut = (e) => {
        e.currentTarget.style.color = COLOR_SECONDARY_TEXT;
        e.currentTarget.style.borderBottom = '2px solid transparent';
    };

    // 處理登出
    const handleLogout = async () => {
        try {
            await logout();
            setShowDropdown(false);
            navigate('/');
        } catch (error) {
            console.error('登出失敗:', error);
            alert('登出失敗，請稍後再試');
        }
    };

    return (
        <header style={headerStyle}>
            <div style={navContainerStyle}>
                
                {/* 網站標誌 (Logo) 區塊 */}
                <Link 
                    to="/" 
                    style={{ 
                        textDecoration: 'none', 
                        color: COLOR_PRIMARY_TEXT, // Logo 文字使用深灰色
                        display: 'flex', 
                        alignItems: 'center',
                        fontWeight: '300' // Logo 文字使用輕量字體
                    }}
                >
                    {/* 圖片 Logo */}
                    <img 
                        src={SITE_LOGO_PATH} 
                        alt="師聲論壇 Logo" 
                        style={logoImgStyle} 
                    /> 
                    
                    {/* 文字標題 */}
                    <span style={{ fontSize: '1.6em', fontWeight: 'bold' }}>師聲NTNU Talk</span>
                </Link>
                
                {/* 導覽菜單 */}
                <nav>
                    <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
                        {/* 基本導覽連結 */}
                        {['首頁', '看板', '會員名錄'].map((text, index) => {
                            const paths = ['/', '/boards', '/members'];
                            return (
                                <li key={text} style={navItemStyle}>
                                    <Link
                                        to={paths[index]}
                                        style={navLinkBaseStyle}
                                        onMouseOver={handleMouseOver}
                                        onMouseOut={handleMouseOut}
                                    >
                                        {text}
                                    </Link>
                                </li>
                            );
                        })}

                        {/* 根據登入狀態顯示不同內容 */}
                        {currentUser ? (
                            // 已登入：顯示用戶資訊和下拉選單
                            <li style={{ ...navItemStyle, position: 'relative' }}>
                                <div
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        padding: '5px 10px',
                                        borderRadius: '20px',
                                        backgroundColor: showDropdown ? '#f0f0f0' : 'transparent',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                    onMouseOut={(e) => {
                                        if (!showDropdown) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {/* 用戶頭像 */}
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: COLOR_MORANDI_HIGHLIGHT,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        {userProfile?.nickname?.charAt(0) || currentUser.email?.charAt(0) || '?'}
                                    </div>
                                    {/* 用戶名稱 */}
                                    <span style={{ color: COLOR_PRIMARY_TEXT, fontWeight: '500', fontSize: '15px' }}>
                                        {userProfile?.nickname || currentUser.email?.split('@')[0] || '用戶'}
                                    </span>
                                    {/* 下拉箭頭 */}
                                    <span style={{ color: COLOR_SECONDARY_TEXT, fontSize: '12px' }}>
                                        {showDropdown ? '▲' : '▼'}
                                    </span>
                                </div>

                                {/* 下拉選單 */}
                                {showDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '10px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        minWidth: '180px',
                                        zIndex: 1000,
                                        border: `1px solid ${COLOR_BORDER}`
                                    }}>
                                        {/* 個人資料連結 */}
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowDropdown(false)}
                                            style={{
                                                display: 'block',
                                                padding: '12px 16px',
                                                color: COLOR_PRIMARY_TEXT,
                                                textDecoration: 'none',
                                                borderBottom: `1px solid ${COLOR_BORDER}`,
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            👤 個人資料
                                        </Link>

                                        {/* 編輯個人資料連結 */}
                                        <Link
                                            to="/profile/edit"
                                            onClick={() => setShowDropdown(false)}
                                            style={{
                                                display: 'block',
                                                padding: '12px 16px',
                                                color: COLOR_PRIMARY_TEXT,
                                                textDecoration: 'none',
                                                borderBottom: `1px solid ${COLOR_BORDER}`,
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            ✏️ 編輯個人資料
                                        </Link>

                                        {/* 登出按鈕 */}
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: COLOR_BRICK_RED,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                borderRadius: '0 0 8px 8px',
                                                transition: 'background-color 0.2s',
                                                fontSize: '14px'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fee';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            🚪 登出
                                        </button>
                                    </div>
                                )}
                            </li>
                        ) : (
                            // 未登入：顯示登入/註冊連結
                            <li style={navItemStyle}>
                                <Link
                                    to="/login"
                                    style={navLinkBaseStyle}
                                    onMouseOver={handleMouseOver}
                                    onMouseOut={handleMouseOut}
                                >
                                    登入/註冊
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;