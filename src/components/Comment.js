// src/components/Comment.js
import React from 'react';

const Comment = ({ comment }) => (
    <div style={{ display: 'flex', padding: '15px 0', borderBottom: '1px dashed #eee', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', marginRight: '10px', flexShrink: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
                {comment.authorName.charAt(0)}
            </div>
        </div>
        <div style={{ flexGrow: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: 'small' }}>{comment.authorName}</div>
            <div style={{ fontSize: 'x-small', color: '#666', marginBottom: '5px' }}>
                <time>{comment.date}</time>
                <span style={{ marginLeft: '10px' }}>| 編輯</span>
            </div>
            <p style={{ margin: '0 0 10px 0' }}>{comment.content}</p>
            <a href={`/reply/${comment.id}`} style={{ fontSize: 'small', color: 'blue' }}>回覆</a>
        </div>
    </div>
);

export default Comment;