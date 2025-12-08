// src/pages/ProfileEditPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 導入公版 Header
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; 

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
    const { currentUser, userProfile, loadUserProfile } = useAuth();

    const [formData, setFormData] = useState({
        nickname: '',
        bio: '',
        gender: '男',
        avatar: 'emoji-bear_face',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null); // 上傳的圖片檔案
    const [imagePreview, setImagePreview] = useState(null); // 圖片預覽 URL
    const [uploading, setUploading] = useState(false); // 上傳中狀態

    // 載入用戶資料
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (userProfile) {
            setFormData({
                nickname: userProfile.nickname || '',
                bio: userProfile.bio || '',
                gender: userProfile.gender || '男',
                avatar: userProfile.avatar || 'emoji-bear_face',
            });
            setLoading(false);
        }
    }, [currentUser, userProfile, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (key) => {
        setFormData(prev => ({ ...prev, avatar: key }));
        // 如果選擇了表情符號頭像，清除上傳的照片
        setUploadedImage(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 檢查檔案類型
            if (!file.type.startsWith('image/')) {
                alert('請選擇圖片檔案');
                return;
            }
            // 檢查檔案大小 (限制 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('圖片大小不能超過 5MB');
                return;
            }
            setUploadedImage(file);
            // 建立預覽 URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImageToStorage = async (file, userId) => {
        try {
            setUploading(true);
            // 建立唯一的檔案名稱
            const timestamp = Date.now();
            const fileName = `avatars/${userId}_${timestamp}.${file.name.split('.').pop()}`;
            const storageRef = ref(storage, fileName);

            // 上傳檔案
            await uploadBytes(storageRef, file);

            // 取得下載 URL
            const downloadURL = await getDownloadURL(storageRef);
            setUploading(false);
            return downloadURL;
        } catch (error) {
            setUploading(false);
            console.error('❌ 上傳圖片失敗:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert('請先登入');
            return;
        }

        try {
            setSaving(true);
            console.log('📝 準備更新個人資料:', formData);

            let updatedFormData = { ...formData };

            // 如果有上傳照片，先上傳到 Firebase Storage
            if (uploadedImage) {
                console.log('📤 正在上傳照片...');
                const photoURL = await uploadImageToStorage(uploadedImage, currentUser.uid);
                console.log('✅ 照片上傳成功:', photoURL);
                // 將照片 URL 設定為頭像
                updatedFormData.avatar = photoURL;
            }

            // 呼叫 userService 更新資料
            await updateUserProfile(currentUser.uid, updatedFormData);

            // 重新載入用戶資料
            await loadUserProfile(currentUser.uid);

            alert('✅ 個人資料更新成功！');
            console.log('✅ 個人資料已成功更新');

            // 導回個人資料頁
            navigate('/profile');
        } catch (error) {
            console.error('❌ 更新個人資料失敗:', error);
            alert(`更新失敗：${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ backgroundColor: COLOR_OFF_WHITE, minHeight: '100vh' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '50px', color: COLOR_OLIVE_GREEN }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    <div>載入中...</div>
                </div>
            </div>
        );
    }

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
                            <p style={{ margin: '0 0 5px 0', color: COLOR_OLIVE_GREEN }}>用戶 ID: <strong style={{ color: COLOR_DEEP_NAVY }}>{currentUser?.uid || '未知'}</strong></p>
                            <p style={{ margin: 0, color: COLOR_OLIVE_GREEN }}>E-mail: <strong style={{ color: COLOR_DEEP_NAVY }}>{currentUser?.email || '未知'}</strong></p>
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
                            <span style={labelStyle}>選擇頭像</span>

                            {/* 表情符號選擇 */}
                            <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                                <p style={{ fontSize: '0.9em', color: COLOR_OLIVE_GREEN, marginBottom: '10px' }}>方式一：選擇表情符號</p>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {AVATAR_OPTIONS.map(option => (
                                        <div
                                            key={option.key}
                                            onClick={() => handleAvatarChange(option.key)}
                                            style={{
                                                fontSize: '2.5em',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: `3px solid ${formData.avatar === option.key && !imagePreview ? COLOR_BRICK_RED : COLOR_LIGHT_BORDER}`,
                                                backgroundColor: formData.avatar === option.key && !imagePreview ? COLOR_OFF_WHITE : 'white',
                                                transition: 'all 0.2s',
                                                boxShadow: formData.avatar === option.key && !imagePreview ? `0 0 10px ${COLOR_BRICK_RED}40` : 'none',
                                            }}
                                        >
                                            {option.emoji}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 照片上傳 */}
                            <div>
                                <p style={{ fontSize: '0.9em', color: COLOR_OLIVE_GREEN, marginBottom: '10px' }}>方式二：上傳個人照片</p>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                        id="avatar-upload"
                                    />
                                    <label
                                        htmlFor="avatar-upload"
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: COLOR_MORANDI_BROWN,
                                            color: 'white',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.95em',
                                            fontWeight: '600',
                                            transition: 'background-color 0.2s',
                                        }}
                                    >
                                        📸 選擇照片
                                    </label>

                                    {imagePreview && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <img
                                                src={imagePreview}
                                                alt="預覽"
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: `3px solid ${COLOR_BRICK_RED}`,
                                                    boxShadow: `0 0 10px ${COLOR_BRICK_RED}40`
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadedImage(null);
                                                    setImagePreview(null);
                                                }}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: 'transparent',
                                                    color: COLOR_BRICK_RED,
                                                    border: `1px solid ${COLOR_BRICK_RED}`,
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85em'
                                                }}
                                            >
                                                移除照片
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.8em', color: COLOR_OLIVE_GREEN, marginTop: '8px' }}>
                                    * 建議使用正方形照片,檔案大小不超過 5MB
                                </p>
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
                                disabled={saving}
                                style={{
                                    ...buttonPrimaryStyle,
                                    opacity: saving ? 0.6 : 1,
                                    cursor: saving ? 'not-allowed' : 'pointer'
                                }}
                                onMouseOver={e => {
                                    if (!saving) {
                                        e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN;
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }
                                }}
                                onMouseOut={e => {
                                    if (!saving) {
                                        e.currentTarget.style.backgroundColor = COLOR_BRICK_RED;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {saving ? '儲存中...' : '儲存修改'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditPage;