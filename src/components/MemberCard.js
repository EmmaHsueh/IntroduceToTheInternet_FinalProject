// src/components/MemberCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const MemberCard = ({ member }) => {
    // 樣式模仿會員目錄的網格佈局
    const cardStyle = {
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        backgroundColor: 'white',
        margin: '10px',
        maxWidth: '250px'
    };

    const avatarStyle = {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginBottom: '15px'
    };

    return (
        <div style={cardStyle}>
            {/* 模仿 UM 預設頭像或顯示實際頭像 */}
            <img 
                src={member.avatar || "/default-avatar.png"} 
                alt={`${member.display_name} avatar`} 
                style={avatarStyle} 
            />
            
            {/* 顯示名稱，通常是暱稱或實名 */}
            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2em' }}>
                <Link to={`/member/${member.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                    {member.display_name}
                </Link>
            </h4>
            
            {/* 這裡可以顯示會員的額外資訊，例如角色或性別 */}
            <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}>{member.gender}</p>
            
            {/* 連結到個人檔案頁面 */}
            <Link 
                to={`/member/${member.id}`} 
                style={{ 
                    display: 'inline-block', 
                    marginTop: '15px', 
                    padding: '8px 15px', 
                    backgroundColor: 'darkorange', 
                    color: 'white', 
                    borderRadius: '4px', 
                    textDecoration: 'none',
                    fontSize: '0.9em'
                }}
            >
                查看檔案
            </Link>
        </div>
    );
};

export default MemberCard;