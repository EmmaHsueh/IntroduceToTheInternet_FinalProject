// src/components/MemberCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { AvatarIcon } from './Icons';

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
        maxWidth: '250px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
    };

    const avatarContainerStyle = {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        margin: '0 auto 15px auto',
        backgroundColor: '#f3f3e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };

    // 判斷顯示 emoji 或圖片
    const renderAvatar = () => {
        // 如果是圖片 URL（以 http 或 data:image 開頭）
        if (member.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('data:image'))) {
            return (
                <img
                    src={member.avatar}
                    alt={`${member.display_name} avatar`}
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: '15px'
                    }}
                />
            );
        }

        // 如果是 emoji 類型或預設，使用 AvatarIcon
        return (
            <div style={avatarContainerStyle}>
                <AvatarIcon avatar={member.avatar} size={48} color="#454f3b" />
            </div>
        );
    };

    return (
        <div
            style={cardStyle}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
        >
            {/* 顯示頭像 */}
            {renderAvatar()}
            
            {/* 顯示名稱，通常是暱稱或實名 */}
            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2em' }}>
                <Link
                    to={`/members/${member.id}`}
                    style={{
                        textDecoration: 'none',
                        color: '#333',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#c9362a'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#333'}
                >
                    {member.display_name}
                </Link>
            </h4>

            {/* 這裡可以顯示會員的額外資訊，例如角色或性別 */}
            <p style={{ margin: '5px 0', fontSize: '0.85em', color: '#666' }}>
                {member.gender} {member.email && `• ${member.email.split('@')[0]}`}
            </p>

            {/* 連結到個人檔案頁面 */}
            <Link
                to={`/members/${member.id}`}
                style={{
                    display: 'inline-block',
                    marginTop: '15px',
                    padding: '8px 15px',
                    backgroundColor: '#c9362a',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9em',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a38c6b'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c9362a'}
            >
                查看檔案
            </Link>
        </div>
    );
};

export default MemberCard;