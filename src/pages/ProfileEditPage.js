// src/pages/ProfileEditPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 導入公版 Header
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';
// 🔥 不再需要 Firebase Storage
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { storage } from '../firebase'; 

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
        // 🔥 配對系統所需欄位
        nativeLanguage: 'zh',
        learningLanguage: 'en',
        languageLevel: 'intermediate',
        interests: [],
        availability: [],
        department: '',
        courses: [],
        isInternationalStudent: false,
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
                // 🔥 配對系統所需欄位
                nativeLanguage: userProfile.nativeLanguage || 'zh',
                learningLanguage: userProfile.learningLanguage || 'en',
                languageLevel: userProfile.languageLevel || 'intermediate',
                interests: userProfile.interests || [],
                availability: userProfile.availability || [],
                department: userProfile.department || '',
                courses: userProfile.courses || [],
                isInternationalStudent: userProfile.isInternationalStudent || false,
            });
            setLoading(false);
        }
    }, [currentUser, userProfile, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // 處理多選欄位 (興趣、時間等)
    const handleMultiSelectChange = (field, value) => {
        setFormData(prev => {
            const currentValues = prev[field] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
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
            // 🔥 Base64 方案：限制 500KB（避免超過 Firestore 1MB 限制）
            if (file.size > 500 * 1024) {
                alert('圖片大小不能超過 500KB\n請使用圖片壓縮工具縮小檔案大小');
                return;
            }

            // 🔥 直接讀取為 Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result; // 這就是 Base64 編碼的圖片
                setImagePreview(base64String);
                setUploadedImage(file); // 保留檔案物件（用於顯示檔名）
            };
            reader.readAsDataURL(file);
        }
    };

    // 🔥 Base64 方案：不再需要上傳到 Firebase Storage
    // 圖片已經在 handleImageChange 中轉換為 Base64 並存在 imagePreview 中

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert('請先登入');
            return;
        }

        try {
            setSaving(true);
            console.log('=== 開始更新個人資料 ===');
            console.log('📝 表單資料:', formData);
            console.log('📷 是否有上傳圖片:', !!imagePreview);

            let updatedFormData = { ...formData };

            // 🔥 Base64 方案：直接將 Base64 字串存到 avatar 欄位
            if (imagePreview) {
                console.log('📤 使用 Base64 圖片...');
                console.log('Base64 長度:', imagePreview.length);

                // 將 Base64 字串直接設定為頭像
                updatedFormData.avatar = imagePreview;
                console.log('✅ 已將 Base64 圖片設定為 avatar 欄位');
            } else {
                console.log('ℹ️ 沒有上傳圖片，使用現有頭像:', formData.avatar);
            }

            // 呼叫 userService 更新資料
            console.log('💾 準備儲存到 Firestore...');
            await updateUserProfile(currentUser.uid, updatedFormData);
            console.log('✅ Firestore 更新成功');

            // 重新載入用戶資料
            console.log('🔄 重新載入用戶資料...');
            await loadUserProfile(currentUser.uid);
            console.log('✅ 用戶資料已重新載入');

            alert('✅ 個人資料更新成功！');
            console.log('=== 個人資料更新完成 ===');

            // 導回個人資料頁
            navigate('/profile');
        } catch (error) {
            console.error('=== 更新個人資料失敗 ===');
            console.error('❌ 錯誤詳情:', error);
            alert(`❌ 更新失敗：${error.message}\n\n請查看開發者工具 Console 了解詳細錯誤資訊`);
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

                        {/* 🔥 配對系統設定區塊 */}
                        <div style={{
                            padding: '25px',
                            background: `linear-gradient(135deg, ${COLOR_OFF_WHITE} 0%, #fef9f0 100%)`,
                            borderRadius: '12px',
                            marginBottom: '30px',
                            border: `2px solid ${COLOR_BRICK_RED}20`
                        }}>
                            <h3 style={{
                                color: COLOR_BRICK_RED,
                                marginBottom: '20px',
                                fontSize: '1.2em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                🤝 智慧配對系統設定
                            </h3>
                            <p style={{ fontSize: '0.9em', color: COLOR_OLIVE_GREEN, marginBottom: '20px' }}>
                                完善以下資訊，讓系統為你找到最合適的語言交換夥伴、學習小組或室友！
                            </p>

                            {/* 科系 */}
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="department" style={labelStyle}>科系</label>
                                <input
                                    type="text"
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder="例如：資訊工程系、英語系"
                                />
                            </div>

                            {/* 是否為國際生 */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: COLOR_DEEP_NAVY }}>
                                    <input
                                        type="checkbox"
                                        name="isInternationalStudent"
                                        checked={formData.isInternationalStudent}
                                        onChange={handleChange}
                                        style={{ marginRight: '10px', width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontWeight: '600' }}>我是國際生 (International Student)</span>
                                </label>
                            </div>

                            {/* 母語 */}
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="nativeLanguage" style={labelStyle}>母語 Native Language</label>
                                <select
                                    id="nativeLanguage"
                                    name="nativeLanguage"
                                    value={formData.nativeLanguage}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="zh">中文 (Chinese)</option>
                                    <option value="en">英文 (English)</option>
                                    <option value="ja">日文 (Japanese)</option>
                                    <option value="ko">韓文 (Korean)</option>
                                    <option value="es">西班牙文 (Spanish)</option>
                                    <option value="fr">法文 (French)</option>
                                    <option value="de">德文 (German)</option>
                                    <option value="other">其他 (Other)</option>
                                </select>
                            </div>

                            {/* 想學習的語言 */}
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="learningLanguage" style={labelStyle}>想學習的語言 Learning Language</label>
                                <select
                                    id="learningLanguage"
                                    name="learningLanguage"
                                    value={formData.learningLanguage}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="zh">中文 (Chinese)</option>
                                    <option value="en">英文 (English)</option>
                                    <option value="ja">日文 (Japanese)</option>
                                    <option value="ko">韓文 (Korean)</option>
                                    <option value="es">西班牙文 (Spanish)</option>
                                    <option value="fr">法文 (French)</option>
                                    <option value="de">德文 (German)</option>
                                    <option value="other">其他 (Other)</option>
                                </select>
                            </div>

                            {/* 語言程度 */}
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="languageLevel" style={labelStyle}>語言程度 Language Level</label>
                                <select
                                    id="languageLevel"
                                    name="languageLevel"
                                    value={formData.languageLevel}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="beginner">初學者 (Beginner)</option>
                                    <option value="intermediate">中級 (Intermediate)</option>
                                    <option value="advanced">高級 (Advanced)</option>
                                </select>
                            </div>

                            {/* 興趣 */}
                            <div style={{ marginBottom: '20px' }}>
                                <span style={labelStyle}>興趣 Interests (可複選)</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                    {['運動', '電影', '音樂', '閱讀', '旅遊', '美食', '遊戲', '攝影', '藝術', '程式設計'].map(interest => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => handleMultiSelectChange('interests', interest)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: `2px solid ${formData.interests.includes(interest) ? COLOR_BRICK_RED : COLOR_LIGHT_BORDER}`,
                                                background: formData.interests.includes(interest) ? COLOR_BRICK_RED : 'white',
                                                color: formData.interests.includes(interest) ? 'white' : COLOR_DEEP_NAVY,
                                                cursor: 'pointer',
                                                fontSize: '0.9em',
                                                fontWeight: formData.interests.includes(interest) ? '600' : '500',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 可用時間 */}
                            <div style={{ marginBottom: '20px' }}>
                                <span style={labelStyle}>可用時間 Availability (可複選)</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                    {['週一早上', '週一下午', '週一晚上', '週二早上', '週二下午', '週二晚上',
                                      '週三早上', '週三下午', '週三晚上', '週四早上', '週四下午', '週四晚上',
                                      '週五早上', '週五下午', '週五晚上', '週末'].map(time => (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => handleMultiSelectChange('availability', time)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: `2px solid ${formData.availability.includes(time) ? COLOR_BRICK_RED : COLOR_LIGHT_BORDER}`,
                                                background: formData.availability.includes(time) ? COLOR_BRICK_RED : 'white',
                                                color: formData.availability.includes(time) ? 'white' : COLOR_DEEP_NAVY,
                                                cursor: 'pointer',
                                                fontSize: '0.85em',
                                                fontWeight: formData.availability.includes(time) ? '600' : '500',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                                    * 建議使用正方形照片，檔案大小不超過 <strong>500KB</strong><br />
                                    * 可使用 <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" style={{ color: COLOR_BRICK_RED }}>TinyPNG</a> 或 <a href="https://squoosh.app" target="_blank" rel="noopener noreferrer" style={{ color: COLOR_BRICK_RED }}>Squoosh</a> 壓縮圖片
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