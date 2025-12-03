import React, { useState, useCallback } from 'react';

// ------------------------------------
// API & 配色定義
// ------------------------------------
// ⚠️ 修改點：指向您自己的後端 API，不再直接呼叫 remove.bg
// 在本地開發時是 localhost，部署後請換成 Render 的網址
const BACKEND_URL = "https://introducetotheinternet-finalproject-0yrf.onrender.com"; 
const REMOVE_BG_API_URL = `${BACKEND_URL}/remove-bg`;
const MODERATION_API_URL = `${BACKEND_URL}/moderation`;

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
    transition: 'background-color 0.3s',
    whiteSpace: 'nowrap'
};

// ------------------------------------
// 輔助函式區
// ------------------------------------
const removeBgFromFile = async (file) => {
    const formData = new FormData();
    formData.append('image_file', file);
    // formData.append('size', 'auto'); // 後端處理也可以

    // ⚠️ 修改點：直接 POST 到自己的後端，不需要附帶 API Key
    const response = await fetch(REMOVE_BG_API_URL, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

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
    const [imageMessage, setImageMessage] = useState(''); 

    // ------------------------------------
    // 圖片處理
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
            setImages(prev => [...prev, ...newImages]); 
            setImageMessage(''); 
            e.target.value = null; 
        }
    };

    const handleRemoveBackground = useCallback(async (targetImage) => {
        setImages(prev => prev.map(img => 
            img.id === targetImage.id ? { ...img, isProcessing: true } : img
        ));
        setImageMessage('ℹ️ 正在處理圖片去背...');

        try {
            const resultUrl = await removeBgFromFile(targetImage.file);
            setImages(prev => prev.map(img => 
                img.id === targetImage.id 
                    ? { ...img, url: resultUrl, isProcessing: false, isProcessed: true } 
                    : img
            ));
            setImageMessage('✅ 圖片去背成功！');
        } catch (error) {
            console.error('去背失敗:', error);
            setImageMessage(`❌ 去背失敗：${error.message}`);
            setImages(prev => prev.map(img => 
                img.id === targetImage.id ? { ...img, isProcessing: false } : img
            ));
        }
    }, []); 

    const handleRemoveImage = (targetId) => {
        setImages(prev => prev.filter(img => img.id !== targetId));
    };

    // ------------------------------------
    // 送出處理
    // ------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setGlobalMessage('⚠️ 標題和內容都不能為空！');
            return;
        }

        setGlobalMessage('🤖 正在進行 AI 內容審查...');

        try {
            // 1. 呼叫後端 Moderation API
            const textCheckResponse = await fetch(MODERATION_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `${title}\n${content}` })
            });

            if (!textCheckResponse.ok) {
                throw new Error('無法連接到審查伺服器');
            }

            const checkResult = await textCheckResponse.json();

            // 2. 判斷審查結果
            if (checkResult.flagged) {
                const reasons = Object.keys(checkResult.categories)
                    .filter(key => checkResult.categories[key])
                    .join(', ');

                setGlobalMessage(`❌ 內容包含敏感詞彙，無法發布。\n(偵測原因: ${reasons})`);
                return; // ⛔️ 擋住
            }
            
            // 審查通過，處理圖片
            setGlobalMessage('✅ 審查通過！正在發布貼文...');
            const base64Images = await Promise.all(
                images.map(img => blobUrlToBase64(img.url))
            );

            onSubmit(title, content, base64Images);

            // 重置
            setTitle('');
            setContent('');
            setImages([]);
            setGlobalMessage('');
            setImageMessage('');

        } catch (error) {
            console.error('處理失敗:', error);
            setGlobalMessage(`❌ 發生錯誤：${error.message}`);
        }
    };

    return (
        <div style={{ border: `1px solid ${COLOR_BORDER}`, padding: '30px', borderRadius: '10px', backgroundColor: COLOR_OFF_WHITE, maxWidth: '800px', margin: '30px auto' }}>
            <h2 style={{ color: COLOR_DEEP_NAVY, borderBottom: `2px solid ${COLOR_HIGHLIGHT_LINE}`, paddingBottom: '15px', marginBottom: '25px', marginTop: '0', fontWeight: '500' }}>
                發表新貼文到 【{boardName}】
            </h2>
            <form onSubmit={handleSubmit}>
                {/* 標題 */}
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

                {/* 圖片上傳 */}
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
                        {images.map((image, index) => (
                            <div key={image.id} style={{ width: '120px', border: `1px solid ${COLOR_BORDER}`, borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                                <img src={image.url} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'contain' }} />
                                <div style={{ padding: '5px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveBackground(image)}
                                        style={{ fontSize: '12px', padding: '3px 8px', cursor: 'pointer', border: 'none', borderRadius: '4px', backgroundColor: image.isProcessed ? COLOR_MORANDI_BROWN : COLOR_OLIVE_GREEN, color: 'white' }}
                                        disabled={image.isProcessing}
                                    >
                                        {image.isProcessing ? '...' : (image.isProcessed ? '已去背' : '去背')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(image.id)}
                                        style={{ fontSize: '12px', padding: '3px 8px', cursor: 'pointer', border: 'none', borderRadius: '4px', backgroundColor: COLOR_SECONDARY_TEXT, color: 'white' }}
                                    >
                                        刪除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {imageMessage && (
                        <p style={{ 
                            color: imageMessage.startsWith('❌') ? COLOR_BRICK_RED : COLOR_OLIVE_GREEN, 
                            fontSize: 'small', 
                            marginTop: '15px' 
                        }}>
                            {imageMessage}
                        </p>
                    )}
                </div>

                {/* 內容 */}
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
                
                {/* 底部區域：顯示審查訊息與按鈕 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    
                    {/* 這裡顯示 globalMessage (審查與發布相關訊息) */}
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                        {globalMessage && (
                            <p style={{ 
                                color: globalMessage.startsWith('❌') ? COLOR_BRICK_RED : COLOR_OLIVE_GREEN, 
                                fontSize: '14px', 
                                margin: 0,
                                fontWeight: 'bold',
                                whiteSpace: 'pre-wrap', 
                                lineHeight: '1.4'
                            }}>
                                {globalMessage}
                            </p>
                        )}
                    </div>

                    {/* 按鈕區 */}
                    <div style={{ display: 'flex', gap: '15px', flexShrink: 0 }}>
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
                </div>
            </form>
        </div>
    );
};

export default PostForm;