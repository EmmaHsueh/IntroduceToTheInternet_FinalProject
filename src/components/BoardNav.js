// src/components/BoardNav.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const getCategories = (language) => {
  const categories = {
    zh: [
      { name: '食物', link: '/boards/food' },
      { name: '國際', link: '/boards/weather' },
      { name: '活動', link: '/boards/events' },
      { name: '社團', link: '/boards/clubs' },
      { name: '課程', link: '/boards/courses' },
      { name: '宿舍', link: '/boards/outfit' },
      { name: '其他', link: '/boards/other' },
    ],
    en: [
      { name: 'Food', link: '/boards/food' },
      { name: 'International', link: '/boards/weather' },
      { name: 'Events', link: '/boards/events' },
      { name: 'Clubs', link: '/boards/clubs' },
      { name: 'Courses', link: '/boards/courses' },
      { name: 'Dormitory', link: '/boards/outfit' },
      { name: 'Other', link: '/boards/other' },
    ]
  };
  return categories[language];
};

// 定義莫蘭迪色和黑白灰
const COLOR_MORANDI_BLUE = '#1e2a38'; // 淺灰藍 (主色)
const COLOR_MORANDI_BLUE_DARK = '#799b9c'; // 深灰藍 (Hover色)
const COLOR_TEXT = '#333333'; // 深灰文字
const COLOR_BACKGROUND_LIGHT = '#ffffff'; // 白色背景 (或 #f8f8f8)
const COLOR_BORDER = '#b0adadff'; // 淺灰邊框

const BoardNav = () => {
  const { language } = useLanguage();
  const categories = getCategories(language);

  return (
    <div
      className="board-nav-group"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '20px 10px', // 增加垂直間距
        margin: '20px auto',
        maxWidth: '1000px',
        gap: '15px', // 增加間隔
        backgroundColor: COLOR_BACKGROUND_LIGHT, // 容器背景
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // 輕微陰影增加質感
      }}
    >
      {categories.map((cat) => (
        <Link 
          key={cat.name}
          to={cat.link} 
          style={{
            padding: '10px 20px', // 讓按鈕更大氣
            textDecoration: 'none',
            color: COLOR_TEXT, // 莫蘭迪色系常搭配黑色或深灰色文字
            backgroundColor: COLOR_BACKGROUND_LIGHT, // 按鈕預設為白色/淺色
            border: `1px solid ${COLOR_BORDER}`, // 淺灰邊框
            borderRadius: '6px',
            fontWeight: '600', // 加粗字體
            transition: 'all 0.3s ease', // 平滑過渡效果
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)', // 預設陰影
          }}
          // 滑鼠懸停效果 (Hover State)
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = COLOR_MORANDI_BLUE; // 懸停時變為莫蘭迪藍
            e.currentTarget.style.color = 'white'; // 文字變白
            e.currentTarget.style.borderColor = COLOR_MORANDI_BLUE_DARK;
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'; // 陰影加深
          }}
          // 滑鼠移開效果 (Unhover State)
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = COLOR_BACKGROUND_LIGHT; // 恢復淺色背景
            e.currentTarget.style.color = COLOR_TEXT; // 恢復深灰文字
            e.currentTarget.style.borderColor = COLOR_BORDER;
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)'; // 恢復預設陰影
          }}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
};

export default BoardNav;