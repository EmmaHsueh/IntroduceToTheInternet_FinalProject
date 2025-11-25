import React, { useState, useCallback } from 'react';

// ------------------------------------
// API & 配色定義
// ------------------------------------
// ⚠️ 注意：在生產環境中，API Key 應該存放在後端環境變數中
// 實際部署時建議透過後端 proxy 呼叫
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
 * @returns {Promise<string>} 去背後的圖片 URL
 */
const removeBgFromFile = async (file) => {
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto'); // 可選：auto, preview, full, medium, hd, 4k
    
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

    // 取得去背後的圖片 blob
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

const PostForm = ({ boardName, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    // 儲存包含 file, url, processing 狀態的物件陣列
    const [images, setImages] = useState([]); 
    const [globalMessage, setGlobalMessage] = useState(''); // 用於顯示去背處理訊息

    // ------------------------------------
    // 圖片上傳處理
    // ------------------------------------
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = files.map(file => ({
                id: Date.now() + Math.random(), // 唯一ID
                file: file,                      // 原始 File 物件
                url: URL.createObjectURL(file),  // Blob URL (用於預覽)
                isProcessing: false,
                isProcessed: false,
            }));
            setImages(prevImages => [...prevImages, ...newImages]); 
            e.target.value = null; 
        }
    };

    // ------------------------------------
    // 圖片去背邏輯 (remove.bg API Call)
    // ------------------------------------
    const handleRemoveBackground = useCallback(async (targetImage) => {
        if (!targetImage.file) {
            setGlobalMessage('錯誤：缺少圖片文件，無法進行去背。');
            return;
        }

        // 1. 更新狀態，顯示處理中
        setImages(prev => prev.map(img => 
            img.id === targetImage.id ? { ...img, isProcessing: true } : img
        ));
        setGlobalMessage('ℹ️ 正在使用 remove.bg 進行圖片去背處理...');

        try {
            // 2. 呼叫 remove.bg API
            const resultUrl = await removeBgFromFile(targetImage.file);
            
            // 3. 成功：更新該圖片物件的 URL 為去背後的結果
            setImages(prev => prev.map(img => 
                img.id === targetImage.id 
                    ? { 
                          ...img, 
                          url: resultUrl, // 替換為去背後的 blob URL
                          isProcessing: false,
                          isProcessed: true,
                      } 
                    : img
            ));
            setGlobalMessage('✅ 圖片去背成功！');

            // 釋放原來的 Blob URL 記憶體
            if (targetImage.url.startsWith('blob:')) {
                URL.revokeObjectURL(targetImage.url);
            }

        } catch (error) {
            console.error('去背請求失敗:', error);
            setGlobalMessage(`❌ 去背失敗：${error.message || '無法連接到服務。'}`);
            
            // 處理失敗時，取消處理中狀態
            setImages(prev => prev.map(img => 
                img.id === targetImage.id ? { ...img, isProcessing: false } : img
            ));
        }
    }, []);

    // ------------------------------------
    // 移除圖片與送出處理
    // ------------------------------------
    const handleRemoveImage = (targetId) => {
        setImages(prevImages => {
            const targetImage = prevImages.find(img => img.id === targetId);
            if (targetImage && targetImage.url.startsWith('blob:')) {
                // 釋放 blob URL 佔用的記憶體
                URL.revokeObjectURL(targetImage.url);
            }
            return prevImages.filter(img => img.id !== targetId);
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            // 傳遞最終的 URL 陣列 (包含去背或原始圖片的 URL)
            const finalImageUrls = images.map(img => img.url);
            onSubmit(title, content, finalImageUrls); 
            
            // 重置所有狀態
            setTitle('');
            setContent('');
            setImages([]);
            setGlobalMessage('');
        } else {
            setGlobalMessage('標題和內容都不能為空！');
        }
    };

    return (
        <div style={{ border: `1px solid ${COLOR_BORDER}`, padding: '30px', borderRadius: '10px', backgroundColor: COLOR_OFF_WHITE, maxWidth: '800px', margin: '30px auto' }}>
            <h2 style={{ color: COLOR_DEEP_NAVY, borderBottom: `2px solid ${COLOR_HIGHLIGHT_LINE}`, paddingBottom: '15px', marginBottom: '25px', marginTop: '0', fontWeight: '500' }}>
                發表新貼文到 【{boardName || '測試看板'}】
            </h2>
            <div>
                {/* 標題區塊 */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: COLOR_DEEP_NAVY }}>標題：</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={INPUT_STYLE}
                        placeholder="請輸入貼文標題"
                    />
                </div>

                {/* 圖片上傳區 - 支援多圖 */}
                <div style={{ marginBottom: '20px', padding: '15px', border: `1px dashed ${COLOR_BORDER}`, borderRadius: '6px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: COLOR_DEEP_NAVY }}>上傳圖片 (可多選)：</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple 
                        onChange={handleImageChange}
                        style={{ marginBottom: '10px' }}
                    />
                    
                    {/* 圖片預覽與去背區 */}
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
                                    // 添加棋盤格背景以顯示透明度
                                    backgroundImage: 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%)',
                                    backgroundSize: '20px 20px',
                                    backgroundColor: '#fff'
                                }}>
                                    <img 
                                        src={image.url} // 使用物件中的 url
                                        alt={`預覽圖 ${index + 1}`} 
                                        style={{ width: '100%', height: '100px', objectFit: 'contain', display: 'block' }}
                                    />
                                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: '#fff', borderTop: `1px solid ${COLOR_BORDER}` }}>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBackground(image)} // 傳遞整個物件
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

                {/* 內容區塊 */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: COLOR_DEEP_NAVY }}>內容：</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ ...INPUT_STYLE, height: '200px', resize: 'vertical' }}
                        placeholder="請詳細描述您的貼文內容..."
                    />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button 
                        type="button" 
                        onClick={onCancel || (() => alert('已取消'))} 
                        style={{...BUTTON_PRIMARY_STYLE, backgroundColor: COLOR_OFF_WHITE, color: COLOR_DEEP_NAVY}} 
                        onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_BORDER} 
                        onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_OFF_WHITE}
                    >
                        取消
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        style={BUTTON_PRIMARY_STYLE}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN} 
                        onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
                    >
                        送出貼文
                    </button>
                </div>
            </div>
        </div>
    );
};

// 示範用的 App 組件
export default function App() {
    const handleSubmit = (title, content, imageUrls) => {
        console.log('提交的貼文：', { title, content, imageUrls });
        alert(`貼文已送出！\n標題：${title}\n內容：${content}\n圖片數量：${imageUrls.length}`);
    };

    const handleCancel = () => {
        alert('已取消發文');
    };

    return <PostForm boardName="美食分享" onSubmit={handleSubmit} onCancel={handleCancel} />;
}