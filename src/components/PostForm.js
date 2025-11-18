// src/components/PostForm.js
import React, { useState } from 'react';

// 從 BoardTemplate.js 複製統一配色定義
const COLOR_DEEP_NAVY = '#1e2a38';     
const COLOR_OLIVE_GREEN = '#454f3b';   
const COLOR_MORANDI_BROWN = '#a38c6b'; 
const COLOR_BRICK_RED = '#c9362a';     
const COLOR_SECONDARY_TEXT = '#666666'; 
const COLOR_BORDER = '#dddddd';
const COLOR_OFF_WHITE = '#f3f3e6';     
const COLOR_HIGHLIGHT_LINE = COLOR_MORANDI_BROWN; 

// 樣式定義 (保持與 BoardTemplate.js 一致)
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

const PostForm = ({ boardName, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    // 🏆 修正: 儲存圖片 URL 陣列，包含預覽圖或處理後的圖
    const [imageUrls, setImageUrls] = useState([]); 
    // 儲存正在處理去背的圖片 ID 或 URL
    const [processingUrl, setProcessingUrl] = useState(null); 

    // ------------------------------------
    // 圖片處理與去背模擬
    // ------------------------------------
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newUrls = files.map(file => URL.createObjectURL(file));
            // 🏆 修正: 將新圖片追加到陣列中
            setImageUrls(prevUrls => [...prevUrls, ...newUrls]); 
            e.target.value = null; // 重設 input 讓使用者可以選擇相同的檔案
        }
    };

    // 🏆 修正: 針對特定的圖片 URL 進行去背 (模擬)
    const handleRemoveBackground = async (targetUrl) => {
        setProcessingUrl(targetUrl);
        alert('ℹ️ 開始模擬呼叫去背 API。實際應用中請透過後端代理。');

        await new Promise(resolve => setTimeout(resolve, 2000)); 
        const newMockUrl = 'https://picsum.photos/100/100?random=' + Date.now(); // 模擬去背後的新 URL
        alert('✅ 模擬去背成功！ (已替換為隨機圖片)');
        
        // 🏆 修正: 更新陣列中特定 URL
        setImageUrls(prevUrls => 
            prevUrls.map(url => (url === targetUrl ? newMockUrl : url))
        );
        
        setProcessingUrl(null);
    };

    const handleRemoveImage = (targetUrl) => {
        setImageUrls(prevUrls => prevUrls.filter(url => url !== targetUrl));
        // 釋放 blob URL 佔用的記憶體
        if (targetUrl.startsWith('blob:')) {
            URL.revokeObjectURL(targetUrl);
        }
    }


    // ------------------------------------
    // 送出處理
    // ------------------------------------
    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            // 傳遞標題、內容和最終的 imageUrls 陣列
            onSubmit(title, content, imageUrls); 
        } else {
            alert('標題和內容都不能為空！');
        }
    };

    return (
        <div style={{ border: `1px solid ${COLOR_BORDER}`, padding: '30px', borderRadius: '10px', backgroundColor: COLOR_OFF_WHITE }}>
            <h2 style={{ color: COLOR_DEEP_NAVY, borderBottom: `2px solid ${COLOR_HIGHLIGHT_LINE}`, paddingBottom: '15px', marginBottom: '25px', marginTop: '0', fontWeight: '500' }}>
                發表新貼文到 【{boardName}】
            </h2>
            <form onSubmit={handleSubmit}>
                {/* 標題區塊... (略) */}
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
                        multiple // 🏆 修正: 啟用多選
                        onChange={handleImageChange}
                        style={{ marginBottom: '10px' }}
                    />
                    
                    {/* 圖片預覽與去背區 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px' }}>
                        {imageUrls.map((url, index) => {
                            const isCurrentProcessing = processingUrl === url;
                            return (
                                <div key={index} style={{ width: '120px', border: `1px solid ${COLOR_BORDER}`, borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                                    <img 
                                        src={url} 
                                        alt={`預覽圖 ${index + 1}`} 
                                        style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }}
                                    />
                                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: '#fff' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBackground(url)}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: COLOR_OLIVE_GREEN,
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
                                            {isCurrentProcessing ? '處理中...' : '✂️ 去背'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(url)}
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
                </div>

                {/* 內容區塊... (略) */}
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
                        onClick={onCancel} 
                        // ... 樣式保持不變
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