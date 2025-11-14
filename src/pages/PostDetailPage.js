// src/pages/PostDetailPage.js
import React, { useState } from 'react';
import Comment from '../components/Comment'; // 導入 Comment 組件

const PostDetailPage = ({ post, onBack, onAddComment }) => {
    const [commentContent, setCommentContent] = useState('');
    
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentContent.trim()) {
            onAddComment(post.id, commentContent);
            setCommentContent('');
        } else {
            alert('留言內容不能為空！');
        }
    };

    return (
        <div style={{ margin: "40px auto", padding: "0 20px", maxWidth: "900px" }}>
            <button 
                onClick={onBack}
                style={{
                    marginBottom: '20px',
                    padding: '8px 15px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                ← 返回看板列表
            </button>

            {/* 文章內容 */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ marginTop: '0', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
                    {post.title}
                </h1>
                <div style={{ fontSize: 'small', color: '#888', marginBottom: '20px' }}>
                    作者: {post.author} | 發表於: {post.date}
                </div>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{post.content}</p>
            </div>

            {/* 留言列表 */}
            <h3 style={{ borderBottom: '1px solid orange', paddingBottom: '5px', marginBottom: '15px' }}>
                留言 ({post.comments ? post.comments.length : 0})
            </h3>
            <div style={{ marginBottom: '30px' }}>
                {post.comments?.length > 0 ? (
                    post.comments.slice().reverse().map(comment => (
                        <Comment key={comment.id} comment={comment} />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                        這篇文章還沒有人留言，快來搶沙發吧！
                    </div>
                )}
            </div>

            {/* 留言表單 */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <h3 style={{ marginBottom: '15px' }}>發表你的評論</h3>
                <form onSubmit={handleCommentSubmit}>
                    <textarea 
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="留下您的評論..."
                        style={{
                            width: '100%',
                            height: '100px',
                            padding: '10px',
                            boxSizing: 'border-box',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                    <button 
                        type="submit"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'green',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        送出留言
                    </button>
                </form>
            </div>
        </div>
    );
};
export default PostDetailPage;