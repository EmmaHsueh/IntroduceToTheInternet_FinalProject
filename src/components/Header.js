// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

// 確保 Logo 檔案 (logo.png) 已放在 public 資料夾
const SITE_LOGO_PATH = '/logo.png'; 

const Header = () => {
  // 樣式定義
  const headerStyle = {
    backgroundColor: '#6f6e6dff', // 深色背景
    color: 'white',
    padding: '10px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const navContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px', // 限制內容寬度
    margin: '0 auto',
  };

  const logoImgStyle = {
    height: '50px', // Logo 高度
    marginRight: '10px',
  };

  const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
  };
  
  const navItemStyle = { 
    marginLeft: '20px',
  };


  return (
    <header style={headerStyle}>
      <div style={navContainerStyle}>
        
        {/* 網站標誌 (Logo) 區塊：點擊可回首頁 (Link to="/") */}
        <Link 
            to="/" 
            style={{ 
                textDecoration: 'none', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center' 
            }}
        >
            {/* 圖片 Logo: 使用我們之前生成的 logo.png */}
            <img 
                src={SITE_LOGO_PATH} 
                alt="師聲論壇 Logo" 
                style={logoImgStyle} 
            /> 
            
            {/* 文字標題 */}
            <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>師聲NTNU Talk</span>
        </Link>
        
        {/* 導覽菜單 */}
        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
            <li style={navItemStyle}>
                <Link to="/" style={navLinkStyle}>首頁</Link>
            </li>
            <li style={navItemStyle}>
                <Link to="/boards" style={navLinkStyle}>看板</Link>
            </li>
            <li style={navItemStyle}>
                <Link to="/members" style={navLinkStyle}>會員名錄</Link>
            </li>
            <li style={navItemStyle}>
                <Link to="/login" style={navLinkStyle}>登入/註冊</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;