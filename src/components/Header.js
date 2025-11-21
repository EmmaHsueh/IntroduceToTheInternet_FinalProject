// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

// 統一配色定義
const COLOR_BACKGROUND_LIGHT = '#ffffff'; // 白色背景
const COLOR_PRIMARY_TEXT = '#333333'; // 深灰文字
const COLOR_SECONDARY_TEXT = '#666666'; // 中灰文字
const COLOR_BORDER = '#dddddd'; // 淺灰線條
const COLOR_MORANDI_HIGHLIGHT = '#1e2a38'; // 莫蘭迪藍，用於強調 Hover 效果

// 確保 Logo 檔案 (logo.png) 已放在 public 資料夾
const SITE_LOGO_PATH = '/logo.png'; 

const Header = () => {
    
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
                    <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
                        {['首頁', '看板', '會員名錄','關於我', '登入/註冊'].map((text, index) => {
                            const paths = ['/', '/boards', '/members','/profile', '/login'];
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
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;