// src/components/PostForm.js
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // 🎯 導入 useNavigate
// ------------------------------------
// API & 配色定義
// ------------------------------------
// 🎯 這裡不再使用本地後端，而是直接使用 Gemini API
const apiKey = typeof __api_key !== 'undefined' ? __api_key : 'AIzaSyAbxdfLkE66WAOuMjhF5pVce2-mBffmUK4';
const GEMINI_IMAGE_API_URL = 
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;


const COLOR_DEEP_NAVY = '#1e2a38';     
const COLOR_OLIVE_GREEN = '#454f3b';   
const COLOR_MORANDI_BROWN = '#a38c6b'; 
const COLOR_BRICK_RED = '#c9362a';     
const COLOR_SECONDARY_TEXT = '#666666'; 
const COLOR_BORDER = '#dddddd';
const COLOR_OFF_WHITE = '#f3f3e6';     
const COLOR_HIGHLIGHT_LINE = COLOR_MORANDI_BROWN; 

// 樣式定義 (保持不變)
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
// 輔助函式：Base64 轉換 & Fetch Retry (從上一個回應複製過來，確保穩定性)
// ------------------------------------
/**
 * 將 File 物件轉換為 Base64 字串
 * @param {File} file - 輸入的圖像檔案
 * @returns {Promise<string>} Base64 格式的圖像資料
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); 
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

/**
 * 執行帶有指數退避重試的 fetch 請求
 */
const fetchWithRetry = async (url, options, maxRetries = 3) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            if (response.ok) {
                return await response.json();
            }

            if (response.status >= 500 || response.status === 429) {
                if (attempt < maxRetries - 1) {
                    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    console.warn(`[嘗試 ${attempt + 1}/${maxRetries}] 伺服器錯誤 ${response.status}，將在 ${delay.toFixed(0)}ms 後重試...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; 
                }
            }
            const errorText = await response.text();
            throw new Error(`API 錯誤：HTTP 狀態碼 ${response.status}. ${errorText}`);

        } catch (error) {
            console.error(`[嘗試 ${attempt + 1}/${maxRetries}] Fetch 請求失敗:`, error);
            if (attempt === maxRetries - 1) {
                throw new Error(`去背請求最終失敗：${error.message}`);
            }
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.warn(`[嘗試 ${attempt + 1}/${maxRetries}] 網路錯誤，將在 ${delay.toFixed(0)}ms 後重試...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error("達到最大重試次數，請求失敗。");
};


const PostForm = ({ boardName, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    // 儲存包含 file 和 url 的物件陣列
    const [images, setImages] = useState([]); 
    const [globalMessage, setGlobalMessage] = useState(''); // 用於顯示去背處理訊息
const navigate = useNavigate(); // 🎯 獲取 navigate 函數
    // ------------------------------------
    // 圖片處理與去背邏輯 (直接呼叫 Gemini API)
    // ------------------------------------
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = files.map(file => ({
                id: Date.now() + Math.random(), // 唯一ID
                file: file,                      // 原始 File 物件 (用於 API 呼叫)
                url: URL.createObjectURL(file),  // Blob URL (用於預覽)
                isProcessing: false,
                isProcessed: false,
                originalFile: file,              // 存儲原始 File 物件，以備後續處理
            }));
            setImages(prevImages => [...prevImages, ...newImages]); 
            e.target.value = null; 
        }
    };

    /**
     * 呼叫 Gemini API 進行去背
     * @param {object} targetImage - 包含 file 和 url 的圖片物件
     */
    const handleRemoveBackground = useCallback(async (targetImage) => {
        if (!targetImage.file) {
            setGlobalMessage('錯誤：缺少圖片文件，無法進行去背。');
            return;
        }

        // 更新狀態，顯示處理中
        setImages(prev => prev.map(img => 
            img.id === targetImage.id ? { ...img, isProcessing: true } : img
        ));
        setGlobalMessage('ℹ️ 正在呼叫 Gemini 模型，進行圖片去背處理...');

        try {
            // 1. 轉換圖像為 Base64
            const base64Data = await fileToBase64(targetImage.file);
            
            // 2. 構建 API 請求的 Payload
            const userPrompt = "Remove the background from this image completely and make it transparent. The result should only contain the subject.";
            const payload = {
                contents: [
                    {
                        parts: [
                            { text: userPrompt },
                            {
                                inlineData: {
                                    mimeType: targetImage.file.type || 'image/png',
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseModalities: ['IMAGE'] // 請求圖像輸出
                },
            };

            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            };

            // 3. 執行帶有重試的 API 請求
            const result = await fetchWithRetry(GEMINI_IMAGE_API_URL, options);

            // 4. 解析響應並提取 Base64 圖像
            const candidate = result.candidates?.[0];
            const base64Part = candidate?.content?.parts?.find(p => p.inlineData);

            if (base64Part && base64Part.inlineData?.data) {
                const imageMimeType = base64Part.inlineData.mimeType || 'image/png';
                const imageUrl = `data:${imageMimeType};base64,${base64Part.inlineData.data}`;
                
                // 成功：更新該圖片物件的 URL 為去背後的 base64 數據
                setImages(prev => prev.map(img => 
                    img.id === targetImage.id 
                        ? { 
                            ...img, 
                            url: imageUrl, // 替換為去背後的 base64 URL
                            isProcessing: false,
                            isProcessed: true,
                            // 注意：我們沒有替換原始 file 物件，但 URL 已更新
                          } 
                        : img
                ));
                setGlobalMessage('✅ 圖片去背成功！');

                // 釋放原來的 Blob URL 記憶體
                if (targetImage.url.startsWith('blob:')) {
                    URL.revokeObjectURL(targetImage.url);
                }

            } else {
                throw new Error('API 響應中未找到圖像資料，或模型無法處理該圖像。');
            }

        } catch (error) {
            console.error('去背請求失敗:', error);
            setGlobalMessage(`❌ 去背失敗：${error.message || '無法連接到服務。'}`);
            
            // 處理失敗時，取消處理中狀態
            setImages(prev => prev.map(img => 
                img.id === targetImage.id ? { ...img, isProcessing: false } : img
            ));
        }
    }, [GEMINI_IMAGE_API_URL]); // 將 API URL 設為依賴

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert('標題和內容都不能為空！');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `${title}\n${content}` }),
            });

            const result = await response.json();

            if (result.flagged) {
                alert("❌ 貼文內容可能不適當，請修改後再發佈。");
                return;
            }

            // 安全 → 繼續發文
            onSubmit(title, content, images.map(img => img.url));

        } catch (error) {
            console.error('Moderation error:', error);
            alert('無法檢查貼文內容，請稍後再試');
        }
    };


    return (
        <div style={{ border: `1px solid ${COLOR_BORDER}`, padding: '30px', borderRadius: '10px', backgroundColor: COLOR_OFF_WHITE }}>
            <h2 style={{ color: COLOR_DEEP_NAVY, borderBottom: `2px solid ${COLOR_HIGHLIGHT_LINE}`, paddingBottom: '15px', marginBottom: '25px', marginTop: '0', fontWeight: '500' }}>
                發表新貼文到 【{boardName}】
            </h2>
            <form onSubmit={handleSubmit}>
                {/* 標題區塊 */}
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
                                    backgroundImage: image.isProcessed ? 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%)' : 'none',
                                    backgroundSize: image.isProcessed ? '20px 20px' : 'auto',
                                    backgroundColor: '#fff'
                                }}>
                                    <img 
                                        src={image.url} // 使用物件中的 url
                                        alt={`預覽圖 ${index + 1}`} 
                                        style={{ width: '100%', height: '100px', objectFit: 'contain', display: 'block' }}
                                    />
                                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: '#fff' }}>
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
                        required
                    />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        style={{...BUTTON_PRIMARY_STYLE, backgroundColor: COLOR_OFF_WHITE, color: COLOR_DEEP_NAVY}} // 修正取消按鈕樣式
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