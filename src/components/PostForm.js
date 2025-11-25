import React, { useState, useCallback } from 'react';

// ------------------------------------
// API & 配色定義
// ------------------------------------
const REMOVE_BG_API_KEY = "soM57AtY8CuHm8VhkYTyXxBP"; 
const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";

const COLOR_DEEP_NAVY = '#1e2a38';     
const COLOR_OLIVE_GREEN = '#454f3b';   
const COLOR_MORANDI_BROWN = '#a38c6b'; 
const COLOR_BRICK_RED = '#c9362a';     
const COLOR_SECONDARY_TEXT = '#666666'; 
const COLOR_BORDER = '#dddddd';
const COLOR_OFF_WHITE = '#f3f3e6';     
const COLOR_HIGHLIGHT_LINE = COLOR_MORANDI_BROWN; 

// 樣式定義
const INPUT_STYLE = { 
    width: '100%', 
    padding: '12px', 
    boxSizing: 'border-box', 
    border: `1px solid ${COLOR_BORDER}`, 
    borderRadius: '6px', 
    outline: 'none',
    transition: 'border-color 0.3s'
};
const BUTTON_PRIMARY_STYLE = { 
    padding: '10px 25px', 
    backgroundColor: COLOR_BRICK_RED, 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
};

// ------------------------------------
// 輔助函式：Remove.bg API 呼叫
// ------------------------------------
/**
 * 使用 remove.bg API 移除圖片背景
 * @param {File} file - 輸入的圖像檔案
 * @returns {Promise<string>} 去背後的圖片 Blob URL
 */
const removeBgFromFile = async (file) => {
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');
    
    const response = await fetch(REMOVE_BG_API_URL, {
        method: 'POST',
        headers: {
            'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.title || `HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

/**
 * 將 Blob URL 轉換為 Base64（用於儲存到 localStorage）
 */
const blobUrlToBase64 = async (blobUrl) => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const PostForm = ({ boardName, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]); 
    const [globalMessage, setGlobalMessage] = useState('');

    // ------------------------------------
    // 圖片上傳處理
    // ------------------------------------
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = files.map(file => ({
                id: Date.now() + Math.random(),
                file: file,
                url: URL.createObjectURL(file),
                isProcessing: false,
                isProcessed: false,
            }));
            setImages(prevImages => [...prevImages, ...newImages]); 
            e.target.value = null; 
        }
    };

    // ------------------------------------
    // 圖片去背邏輯 (Remove.bg API Call)
    // ------------------------------------
    const handleRemoveBackground = useCallback(async (targetImage) => {
        if (!targetImage.file) {
            setGlobalMessage('錯誤：缺少圖片文件，無法進行去背。');
            return;
        }

        setImages(prev => prev.map(img => 
            img.id === targetImage.id ? { ...img, isProcessing: true } : img
        ));
        setGlobalMessage('ℹ️ 正在使用 remove.bg 進行圖片去背處理...');

        try {
            const resultUrl = await removeBgFromFile(targetImage.file);
            
            setImages(prev => prev.map(img => 
                img.id === targetImage.id 
                    ? { 
                          ...img, 
                          url: resultUrl,
                          isProcessing: false,
                          isProcessed: true,
                      } 
                    : img
            ));
            setGlobalMessage('✅ 圖片去背成功！');

            if (targetImage.url.startsWith('blob:')) {
                URL.revokeObjectURL(targetImage.url);
            }

        } catch (error) {
            console.error('去背請求失敗:', error);
            setGlobalMessage(`❌ 去背失敗：${error.message || '無法連接到服務。'}`);
            
            setImages(prev => prev.map(img => 
                img.id === targetImage.id ? { ...img, isProcessing: false } : img
            ));
        }
    }, []); 

    // ------------------------------------
    // 移除圖片
    // ------------------------------------
    const handleRemoveImage = (targetId) => {
        setImages(prevImages => {
            const targetImage = prevImages.find(img => img.id === targetId);
            if (targetImage && targetImage.url.startsWith('blob:')) {
                URL.revokeObjectURL(targetImage.url);
            }
            return prevImages.filter(img => img.id !== targetId);
        });
    }

    // ------------------------------------
    // 送出處理（轉換為 Base64）
    // ------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            try {
                // 將所有 Blob URL 轉換為 Base64
                const base64Images = await Promise.all(
                    images.map(img => blobUrlToBase64(img.url))
                );
                
                onSubmit(title, content, base64Images); 
                
                setTitle('');
                setContent('');
                setImages([]);
                setGlobalMessage('');
            } catch (error) {
                console.error('圖片處理失敗:', error);
                setGlobalMessage('❌ 圖片處理失敗，請重試');
            }
        } else {
            setGlobalMessage('標題和內容都不能為空！');
        }
    };

    return (
        <div style={{ border: `1px solid ${COLOR_BORDER}`, padding: '30px', borderRadius: '10px', backgroundColor: COLOR_OFF_WHITE, maxWidth: '800px', margin: '30px auto' }}>
            <h2 style={{ color: COLOR_DEEP_NAVY, borderBottom: `2px solid ${COLOR_HIGHLIGHT_LINE}`, paddingBottom: '15px', marginBottom: '25px', marginTop: '0', fontWeight: '500' }}>
                發表新貼文到 【{boardName}】
            </h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: COLOR_DEEP_NAVY }}>標題：</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={INPUT_STYLE}
                        placeholder="請輸入貼文標題"
                        required
                    />
                </div>

                <div style={{ marginBottom: '20px', padding: '15px', border: `1px dashed ${COLOR_BORDER}`, borderRadius: '6px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: COLOR_DEEP_NAVY }}>上傳圖片 (可多選)：</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple 
                        onChange={handleImageChange}
                        style={{ marginBottom: '10px' }}
                    />
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px' }}>
                        {images.map((image, index) => {
                            const isCurrentProcessing = image.isProcessing;
                            return (
                                <div key={image.id} style={{ 
                                    width: '120px', 
                                    border: `1px solid ${COLOR_BORDER}`, 
                                    borderRadius: '6px', 
                                    overflow: 'hidden', 
                                    position: 'relative', 
                                    boxShadow: image.isProcessed ? `0 0 0 2px ${COLOR_OLIVE_GREEN}` : 'none',
                                    backgroundImage: 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%)',
                                    backgroundSize: '20px 20px',
                                    backgroundColor: '#fff'
                                }}>
                                    <img 
                                        src={image.url}
                                        alt={`預覽圖 ${index + 1}`} 
                                        style={{ width: '100%', height: '100px', objectFit: 'contain', display: 'block' }}
                                    />
                                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: '#fff', borderTop: `1px solid ${COLOR_BORDER}` }}>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBackground(image)}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: image.isProcessed ? COLOR_MORANDI_BROWN : COLOR_OLIVE_GREEN,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                opacity: isCurrentProcessing ? 0.7 : 1,
                                                pointerEvents: isCurrentProcessing ? 'none' : 'auto',
                                                transition: 'background-color 0.3s'
                                            }}
                                            disabled={isCurrentProcessing}
                                        >
                                            {isCurrentProcessing ? '處理中...' : (image.isProcessed ? '✅ 已去背' : '✂️ 去背')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(image.id)}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: COLOR_SECONDARY_TEXT,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                transition: 'background-color 0.3s'
                                            }}
                                        >
                                            移除
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {globalMessage && 
                        <p style={{ color: globalMessage.startsWith('❌') ? COLOR_BRICK_RED : COLOR_OLIVE_GREEN, fontSize: 'small', marginTop: '15px' }}>
                            {globalMessage}
                        </p>
                    }
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: COLOR_DEEP_NAVY }}>內容：</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ ...INPUT_STYLE, height: '200px', resize: 'vertical' }}
                        placeholder="請詳細描述您的貼文內容..."
                        required
                    />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        style={{...BUTTON_PRIMARY_STYLE, backgroundColor: COLOR_OFF_WHITE, color: COLOR_DEEP_NAVY}} 
                        onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_BORDER} 
                        onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_OFF_WHITE}
                    >
                        取消
                    </button>
                    <button 
                        type="submit" 
                        style={BUTTON_PRIMARY_STYLE}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN} 
                        onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
                    >
                        送出貼文
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;