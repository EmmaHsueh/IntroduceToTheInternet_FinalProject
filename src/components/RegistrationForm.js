// src/components/RegistrationForm.js
import React, { useState } from 'react';

// ------------------------------------
// 統一配色定義 (淺色活潑大學風格)
// ------------------------------------
const COLOR_DEEP_NAVY = '#1e2a38';     // 主要文字/標題
const COLOR_OLIVE_GREEN = '#454f3b';   // 標籤文字
const COLOR_MORANDI_BROWN = '#a38c6b'; // 輸入框邊框/次要按鈕/連結
const COLOR_BRICK_RED = '#c9362a';     // 主要提交按鈕 (CTA)/必填符號
const COLOR_LIGHT_BORDER = '#e0e0e0';  // 極淺邊框

const RegistrationForm = ({ switchToLogin }) => {
    const [formData, setFormData] = useState({
        user_login: '',
        user_email: '',
        user_password: '',
        last_name: '',
        first_name: '',
        nickname: '',
        gender: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: 串接註冊 API
        console.log('註冊表單提交:', formData);
        alert('註冊功能待串接 API'); 
    };

    // 統一輸入框樣式
    const inputStyle = { 
        width: '100%', 
        padding: '12px', // 增加內距，更寬鬆
        fontSize: '16px', 
        border: `1px solid ${COLOR_LIGHT_BORDER}`, // 預設極淺邊框
        borderRadius: '6px', // 稍圓潤
        boxSizing: 'border-box', 
        marginBottom: '15px',
        color: COLOR_DEEP_NAVY,
        transition: 'border-color 0.3s',
    };
    
    // 統一標籤樣式
    const labelStyle = { 
        fontSize: '16px', 
        display: 'block', 
        marginBottom: '5px', 
        fontWeight: '500', 
        color: COLOR_OLIVE_GREEN 
    };

    // 主要提交按鈕樣式
    const submitButtonStyle = {
        width: '100%', 
        padding: '14px', // 增加高度
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

    // 次要切換按鈕樣式
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
        // 移除多餘的 padding，讓外部容器 (LoginPage) 負責
        <div style={{ padding: '0' }}> 
            <h3 style={{ 
                textAlign: 'center', 
                color: COLOR_DEEP_NAVY, 
                marginBottom: '20px', 
                fontWeight: '600' 
            }}>
                建立你的師大帳號
            </h3>
            
            <form onSubmit={handleSubmit}>
                
                {/* 必填欄位：學號 */}
                <label style={labelStyle}>學號 <span style={{color: COLOR_BRICK_RED}}>*</span>:</label>
                <input 
                    type="text" 
                    name="user_login" 
                    value={formData.user_login} 
                    onChange={handleChange} 
                    style={inputStyle} 
                    required 
                    placeholder="請輸入學號 (用於身份驗證)" 
                    onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN} // Focus 莫蘭迪棕
                    onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                />

                {/* 必填欄位：師大信箱 */}
                <label style={labelStyle}>師大信箱 <span style={{color: COLOR_BRICK_RED}}>*</span>:</label>
                <input 
                    type="email" 
                    name="user_email" 
                    value={formData.user_email} 
                    onChange={handleChange} 
                    style={inputStyle} 
                    required 
                    placeholder="請輸入師大信箱 (用於通知)" 
                    onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN}
                    onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                />

                {/* 必填欄位：密碼 */}
                <label style={labelStyle}>密碼 <span style={{color: COLOR_BRICK_RED}}>*</span>:</label>
                <input 
                    type="password" 
                    name="user_password" 
                    value={formData.user_password} 
                    onChange={handleChange} 
                    style={inputStyle} 
                    required 
                    placeholder="請設定密碼 (至少 6 位)" 
                    onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN}
                    onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                />

                {/* 姓名欄位 */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>姓氏:</label>
                        <input 
                            type="text" 
                            name="last_name" 
                            value={formData.last_name} 
                            onChange={handleChange} 
                            style={inputStyle} 
                            placeholder="姓" 
                            onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN}
                            onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>名字:</label>
                        <input 
                            type="text" 
                            name="first_name" 
                            value={formData.first_name} 
                            onChange={handleChange} 
                            style={inputStyle} 
                            placeholder="名" 
                            onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN}
                            onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                        />
                    </div>
                </div>
                
                {/* 暱稱 */}
                <label style={labelStyle}>暱稱 (匿名可選):</label>
                <input 
                    type="text" 
                    name="nickname" 
                    value={formData.nickname} 
                    onChange={handleChange} 
                    style={inputStyle} 
                    placeholder="若不填，將顯示預設暱稱或學號" 
                    onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN}
                    onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                />

                {/* 性別 (Radio) - 使用莫蘭迪棕文字 */}
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: COLOR_OLIVE_GREEN }}>性別:</label>
                <div style={{ marginBottom: '25px', color: COLOR_DEEP_NAVY }}>
                    <label style={{ marginRight: '25px', cursor: 'pointer' }}>
                        <input type="radio" name="gender" value="男性" checked={formData.gender === '男性'} onChange={handleChange} style={{ marginRight: '5px' }} /> 男性
                    </label>
                    <label style={{ cursor: 'pointer' }}>
                        <input type="radio" name="gender" value="女性" checked={formData.gender === '女性'} onChange={handleChange} style={{ marginRight: '5px' }} /> 女性
                    </label>
                </div>

                {/* 提交按鈕 */}
                <button 
                    type="submit" 
                    style={submitButtonStyle}
                    onMouseOver={e => {
                        e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN; // Hover 轉為莫蘭迪棕
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.backgroundColor = COLOR_BRICK_RED;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    立即註冊，加入師聲
                </button>
            </form>
            
            {/* 切換到登入模式 */}
            <div style={{ textAlign: 'center', marginTop: '35px' }}>
                <p style={{ margin: '15px 0 10px 0', color: COLOR_OLIVE_GREEN }}>已經有帳號了？</p>
                <button 
                    onClick={switchToLogin} 
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
                    前往登入頁面
                </button>
            </div>
        </div>
    );
};

export default RegistrationForm;