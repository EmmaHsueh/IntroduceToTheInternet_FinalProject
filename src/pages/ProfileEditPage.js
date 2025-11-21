// src/pages/ProfileEditPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 只需要 useNavigate

// 導入公版 Header
import Header from '../components/Header'; 

// ------------------------------------
// 統一配色定義 (淺色活潑大學風格)
// ------------------------------------
const COLOR_DEEP_NAVY = '#1e2a38';     // 深藍/黑 - 主要文字/標題
const COLOR_OLIVE_GREEN = '#454f3b';   // 深橄欖綠 - 次要文字
const COLOR_MORANDI_BROWN = '#a38c6b'; // 莫蘭迪棕 - 輸入框/邊框
const COLOR_BRICK_RED = '#c9362a';     // 磚紅 - 主要行動按鈕/強調色
const COLOR_LIGHT_BORDER = '#e0e0e0';  // 極淺邊框
const COLOR_OFF_WHITE = '#f3f3e6';     // 米黃/淺色 - 主要背景色

// ------------------------------------
// 🎯 已移除內嵌 Header：現在使用從 '../components/Header' 導入的公版 Header。
// ------------------------------------

// ------------------------------------
// 模擬資料 (從 ProfilePage 複製過來)
// ------------------------------------
const AVATAR_OPTIONS = [
    { key: 'emoji-bear_face', emoji: '🐻', label: '熊熊' },
    { key: 'emoji-cat_paw', emoji: '🐾', label: '貓掌' },
    { key: 'emoji-student', emoji: '🧑‍🎓', label: '學生' },
    { key: 'emoji-glasses', emoji: '🤓', label: '書呆子' },
    { key: 'emoji-pizza', emoji: '🍕', label: '披薩' },
];

const MOCK_CURRENT_USER = {
    id: 'user-001',
    user_login: 'B10901001', // 學號/登入帳號不可修改
    user_email: 'b10901001@ntnu.edu.tw', // E-mail 不可修改
    nickname: '師大阿宅',
    avatar: 'emoji-bear_face',
    bio: '熱愛美食和追劇的師大普通學生，偶爾發發廢文，歡迎一起交流！',
    gender: '男',
};

// ------------------------------------
// 樣式定義
// ------------------------------------
const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    boxSizing: 'border-box', 
    border: `1px solid ${COLOR_LIGHT_BORDER}`, 
    borderRadius: '6px', 
    outline: 'none',
    transition: 'border-color 0.3s',
    backgroundColor: 'white',
    fontSize: '1em'
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: COLOR_DEEP_NAVY,
    fontWeight: '600',
    fontSize: '0.95em'
};

const buttonPrimaryStyle = { 
    padding: '12px 30px', 
    backgroundColor: COLOR_BRICK_RED, 
    color: 'white', 
    borderRadius: '8px', 
    border: 'none', 
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '1.1em',
    transition: 'background-color 0.2s, transform 0.2s',
};

const buttonSecondaryStyle = {
    padding: '12px 30px', 
    backgroundColor: COLOR_OFF_WHITE, 
    color: COLOR_DEEP_NAVY, 
    borderRadius: '8px', 
    border: `1px solid ${COLOR_LIGHT_BORDER}`, 
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1.1em',
    transition: 'background-color 0.2s',
};


const ProfileEditPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nickname: MOCK_CURRENT_USER.nickname,
        bio: MOCK_CURRENT_USER.bio,
        gender: MOCK_CURRENT_USER.gender,
        avatar: MOCK_CURRENT_USER.avatar,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (key) => {
        setFormData(prev => ({ ...prev, avatar: key }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 實際應用：這裡會呼叫 API 更新資料
        console.log('提交更新的資料:', formData);
        
        // 模擬更新成功
        // alert('個人資料更新成功！ (功能待串接 API)'); 
        
        // 導回個人資料頁
        navigate('/profile');
    };

    return (
        <div style={{ backgroundColor: COLOR_OFF_WHITE, minHeight: '100vh' }}>
            <Header />

            <div style={{ maxWidth: '700px', margin: '30px auto', padding: '0 20px' }}>
                <h1 style={{ color: COLOR_DEEP_NAVY, borderBottom: `3px solid ${COLOR_BRICK_RED}`, paddingBottom: '15px', marginBottom: '30px', fontWeight: '600' }}>
                    ✏️ 編輯個人資料
                </h1>
                
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 6px 15px rgba(0,0,0,0.08)' }}>
                    <form onSubmit={handleSubmit}>
                        {/* 顯示不可修改的資訊 */}
                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: COLOR_OFF_WHITE, borderRadius: '6px', border: `1px solid ${COLOR_LIGHT_BORDER}` }}>
                            <p style={{ margin: '0 0 5px 0', color: COLOR_OLIVE_GREEN }}>學號/登入帳號: <strong style={{ color: COLOR_DEEP_NAVY }}>{MOCK_CURRENT_USER.user_login}</strong></p>
                            <p style={{ margin: 0, color: COLOR_OLIVE_GREEN }}>E-mail: <strong style={{ color: COLOR_DEEP_NAVY }}>{MOCK_CURRENT_USER.user_email}</strong></p>
                        </div>
                        
                        {/* 暱稱 */}
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="nickname" style={labelStyle}>使用者暱稱 (公開顯示)</label>
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                                maxLength="15"
                            />
                        </div>

                        {/* 性別 */}
                        <div style={{ marginBottom: '20px' }}>
                            <span style={labelStyle}>性別</span>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {['男', '女', '其他'].map(g => (
                                    <label key={g} style={{ cursor: 'pointer', color: COLOR_DEEP_NAVY, fontWeight: '500' }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={formData.gender === g}
                                            onChange={handleChange}
                                            style={{ marginRight: '8px' }}
                                        />
                                        {g}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 自我介紹 */}
                        <div style={{ marginBottom: '30px' }}>
                            <label htmlFor="bio" style={labelStyle}>自我介紹 (最多 150 字)</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                                maxLength="150"
                            />
                        </div>

                        {/* 頭像選擇 */}
                        <div style={{ marginBottom: '40px' }}>
                            <span style={labelStyle}>選擇頭像 (表情符號)</span>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {AVATAR_OPTIONS.map(option => (
                                    <div 
                                        key={option.key}
                                        onClick={() => handleAvatarChange(option.key)}
                                        style={{
                                            fontSize: '2.5em',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: `3px solid ${formData.avatar === option.key ? COLOR_BRICK_RED : COLOR_LIGHT_BORDER}`,
                                            backgroundColor: formData.avatar === option.key ? COLOR_OFF_WHITE : 'white',
                                            transition: 'all 0.2s',
                                            boxShadow: formData.avatar === option.key ? `0 0 10px ${COLOR_BRICK_RED}40` : 'none',
                                        }}
                                    >
                                        {option.emoji}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 按鈕組 */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button 
                                type="button" 
                                onClick={() => navigate('/profile')} 
                                style={buttonSecondaryStyle}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_LIGHT_BORDER} 
                                onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_OFF_WHITE}
                            >
                                取消/返回
                            </button>
                            <button 
                                type="submit" 
                                style={buttonPrimaryStyle}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN;
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = COLOR_BRICK_RED;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                儲存修改
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditPage;