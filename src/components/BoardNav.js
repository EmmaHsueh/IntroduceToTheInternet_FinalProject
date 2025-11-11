// src/components/BoardNav.js
import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: '食物', link: '/boards/food' },
  { name: '天氣', link: '/boards/weather' }, // 新增
  { name: '活動', link: '/boards/events' }, // 新增
  { name: '社團', link: '/boards/clubs' }, // 新增
  { name: '課程', link: '/boards/courses' }, // 新增
  { name: '穿搭', link: '/boards/outfit' }, // 新增
  { name: '其他', link: '/boards/other' }, // 新增
];

const BoardNav = () => {
  return (
    <div 
        className="board-nav-group" 
        style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'center', 
            padding: '10px', 
            margin: '20px auto',
            maxWidth: '1000px',
            gap: '10px',
        }}
    >
      {categories.map((cat) => (
        <Link 
          key={cat.name}
          to={cat.link} 
          style={{
            padding: '8px 15px',
            textDecoration: 'none',
            color: 'white',
            backgroundColor: 'darkorange',
            border: '1px solid darkorange',
            borderRadius: '5px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'orange'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'darkorange'}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
};

export default BoardNav;