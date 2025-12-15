import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AVATAR_OPTIONS, AvatarIcon } from '../components/Icons';

// ------------------------------------
// 統一配色定義 (淺色活潑大學風格)
// ------------------------------------
const COLOR_DEEP_NAVY = '#1e2a38';     // 主要文字/標題
const COLOR_OLIVE_GREEN = '#454f3b';   // 標籤文字
const COLOR_MORANDI_BROWN = '#a38c6b'; // 輸入框邊框/次要按鈕/連結
const COLOR_BRICK_RED = '#c9362a';     // 主要提交按鈕 (CTA)/必填符號
const COLOR_LIGHT_BORDER = '#e0e0e0';  // 極淺邊框
const COLOR_OFF_WHITE = '#f3f3e6';     // 米黃色 (用於預覽背景)

const RegistrationForm = ({ switchToLogin }) => {
    const [formData, setFormData] = useState({
        user_login: '',
        user_email: '',
        user_password: '',
        last_name: '',
        first_name: '',
        nickname: '',
        gender: '',
        avatar_url: AVATAR_OPTIONS[0].value, // 預設第一個頭像
    });
    // 新增狀態來儲存自訂圖片的本地 URL，用於即時預覽
    const [customAvatarUrl, setCustomAvatarUrl] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState(''); // 用於檔案上傳狀態
    const [success, setSuccess] = useState(''); // 用於註冊成功訊息
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    // 處理預設頭像選擇
    const handleAvatarSelect = (value) => {
        // 如果切換回預設頭像，釋放舊的本地 URL 資源
        if (customAvatarUrl) {
            URL.revokeObjectURL(customAvatarUrl);
            setCustomAvatarUrl(null);
        }
        setFormData({ ...formData, avatar_url: value });
        setRegistrationStatus(''); // 清除上傳提示
    };

    // 模擬檔案上傳 (實際需串接 API 或 Firebase Storage)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Revoke old URL if it exists to prevent memory leaks
            if (customAvatarUrl) {
                URL.revokeObjectURL(customAvatarUrl);
            }
            
            // 創建本地預覽 URL
            const newUrl = URL.createObjectURL(file);
            setCustomAvatarUrl(newUrl);
            setFormData({ ...formData, avatar_url: newUrl }); // Store the local URL
            setRegistrationStatus(`已選取自訂檔案: ${file.name} (圖片預覽成功)`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setRegistrationStatus('');
        setLoading(true);

        // 驗證密碼長度
        if (formData.user_password.length < 6) {
            setError('密碼至少需要 6 個字元');
            setLoading(false);
            return;
        }

        try {
            // 註冊用戶
            await signup(formData.user_email, formData.user_password, {
                user_login: formData.user_login,
                nickname: formData.nickname || formData.user_login,
                first_name: formData.first_name,
                last_name: formData.last_name,
                gender: formData.gender || '保密',
                avatar: formData.avatar_url,
                bio: '這個人很懶，什麼都沒留下。'
            });

            setSuccess('註冊成功！即將跳轉至首頁...');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('註冊錯誤:', error);

            // 顯示友善的錯誤訊息
            if (error.code === 'auth/email-already-in-use') {
                setError('此 Email 已被註冊');
            } else if (error.code === 'auth/invalid-email') {
                setError('Email 格式不正確');
            } else if (error.code === 'auth/weak-password') {
                setError('密碼強度不足');
            } else {
                setError('註冊失敗：' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------
    // 渲染目前選中頭像的內容
    // ------------------------------------
    const renderSelectedAvatar = () => {
        const selectedValue = formData.avatar_url;

        // 1. 自訂圖片預覽 (使用本地 URL)
        if (customAvatarUrl && selectedValue === customAvatarUrl) {
            return (
                <img
                    src={customAvatarUrl}
                    alt="Custom Avatar Preview"
                    // 確保圖片能填滿圓形容器
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            );
        }

        // 2. 預設 Emoji 頭像 - 使用 AvatarIcon 组件
        return <AvatarIcon avatar={selectedValue} size={40} color={COLOR_OLIVE_GREEN} />;
    };

    // 統一輸入框樣式
    const inputStyle = { 
        width: '100%', 
        padding: '12px', 
        fontSize: '16px', 
        border: `1px solid ${COLOR_LIGHT_BORDER}`, 
        borderRadius: '6px', 
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
        padding: '14px', 
        backgroundColor: COLOR_BRICK_RED, 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontSize: '18px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s, transform 0.2s',
        boxShadow: `0 4px 10px ${COLOR_BRICK_RED}40`,
        marginBottom: '15px',
    };

    // 次要切換按鈕樣式
    const switchButtonStyle = {
        padding: '10px 20px', 
        backgroundColor: 'transparent',
        color: COLOR_MORANDI_BROWN, 
        border: `2px solid ${COLOR_MORANDI_BROWN}`, 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontSize: '16px',
        fontWeight: '500',
        transition: 'all 0.3s',
    };

    // 頭像選項樣式
    const avatarOptionStyle = (isSelected) => ({
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: isSelected ? '#fff9f9' : '#ffffff', 
        border: `3px solid ${isSelected ? COLOR_BRICK_RED : COLOR_LIGHT_BORDER}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '28px',
        boxShadow: isSelected ? `0 0 8px ${COLOR_BRICK_RED}60` : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s',
        transform: isSelected ? 'scale(1.1)' : 'scale(1.0)',
        flexShrink: 0,
    });
    
    // 自訂上傳按鈕樣式
    const customUploadButtonStyle = {
        padding: '8px 15px',
        backgroundColor: 'white',
        color: COLOR_OLIVE_GREEN,
        border: `1px solid ${COLOR_MORANDI_BROWN}`,
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.3s',
        marginTop: '10px',
        display: 'block'
    };


    return (
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

                {/* 錯誤訊息 */}
                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: COLOR_BRICK_RED,
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        border: `1px solid ${COLOR_BRICK_RED}`
                    }}>
                        {error}
                    </div>
                )}

                {/* 成功訊息 */}
                {success && (
                    <div style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        border: '1px solid #c3e6cb',
                        textAlign: 'center',
                        fontWeight: '500'
                    }}>
                        {success}
                    </div>
                )}

                {/* ------------------------------------ */}
                {/* 獨立頭像預覽區塊 (新增) */}
                {/* ------------------------------------ */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    marginBottom: '20px',
                    paddingBottom: '20px',
                    borderBottom: `1px solid ${COLOR_LIGHT_BORDER}`
                }}>
                    <div style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        backgroundColor: COLOR_OFF_WHITE,
                        border: `4px solid ${COLOR_BRICK_RED}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        overflow: 'hidden', // 確保圖片被圓形裁剪
                        marginBottom: '10px',
                    }}>
                        {renderSelectedAvatar()}
                    </div>
                    <p style={{ color: COLOR_OLIVE_GREEN, fontSize: '14px', fontWeight: '500' }}>
                        你的個人頭像
                    </p>
                </div>

                {/* 頭像選擇區塊 */}
                <label style={labelStyle}>選擇頭像 (或上傳自己的):</label>
                <div style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {AVATAR_OPTIONS.map((avatar) => (
                            <div
                                key={avatar.key}
                                // 判斷是否為當前選中的 Emoji
                                style={avatarOptionStyle(formData.avatar_url === avatar.key)}
                                onClick={() => handleAvatarSelect(avatar.key)}
                                title={avatar.label}
                            >
                                <AvatarIcon avatar={avatar.key} size={28} color={COLOR_OLIVE_GREEN} />
                            </div>
                        ))}
                    </div>
                    
                    {/* 自訂上傳區塊 */}
                    <div style={{ marginTop: '15px' }}>
                        <input
                            type="file"
                            id="avatar-upload"
                            name="custom_avatar"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById('avatar-upload').click()}
                            style={{...customUploadButtonStyle}}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_LIGHT_BORDER}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            上傳自己的頭像
                        </button>
                    </div>
                </div>

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
                    onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN} 
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
                        <label style={labelStyle}>姓氏 <span style={{color: COLOR_BRICK_RED}}>*</span>:</label>
                        <input 
                            type="text" 
                            name="last_name" 
                            value={formData.last_name} 
                            onChange={handleChange} 
                            style={inputStyle} 
                            placeholder="姓" 
                            required 
                            onFocus={e => e.currentTarget.style.borderColor = COLOR_MORANDI_BROWN}
                            onBlur={e => e.currentTarget.style.borderColor = COLOR_LIGHT_BORDER}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>名字 <span style={{color: COLOR_BRICK_RED}}>*</span>:</label>
                        <input 
                            type="text" 
                            name="first_name" 
                            value={formData.first_name} 
                            onChange={handleChange} 
                            style={inputStyle} 
                            placeholder="名" 
                            required 
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
                    placeholder="若不填，將顯示學號" 
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
                
                {/* 狀態訊息 (取代 alert) */}
                {registrationStatus && (
                    <div style={{ 
                        backgroundColor: '#fef3f2', 
                        color: COLOR_BRICK_RED, 
                        padding: '10px', 
                        borderRadius: '6px', 
                        marginBottom: '15px', 
                        textAlign: 'center',
                        border: `1px solid ${COLOR_BRICK_RED}`
                    }}>
                        {registrationStatus}
                    </div>
                )}

                {/* 提交按鈕 */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...submitButtonStyle,
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    onMouseOver={e => {
                        if (!loading) {
                            e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                    }}
                    onMouseOut={e => {
                        if (!loading) {
                            e.currentTarget.style.backgroundColor = COLOR_BRICK_RED;
                            e.currentTarget.style.transform = 'translateY(0)';
                        }
                    }}
                >
                    {loading ? '註冊中...' : '立即註冊，加入師聲'}
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