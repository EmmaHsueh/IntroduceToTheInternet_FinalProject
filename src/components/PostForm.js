// src/components/PostForm.js
import React, { useState } from 'react';

const PostForm = ({ boardName, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            onSubmit(title, content);
        } else {
            alert('標題和內容都不能為空！');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h2 style={{ color: 'red', borderBottom: '2px dashed red', paddingBottom: '10px', marginTop: '0' }}>發表新貼文到 【{boardName}】</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>標題：</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                        placeholder="請輸入貼文標題"
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>內容：</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ width: '100%', height: '200px', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                        placeholder="請詳細描述您的貼文內容..."
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        取消
                    </button>
                    <button 
                        type="submit" 
                        style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        送出貼文
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;