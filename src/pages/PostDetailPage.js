// src/pages/PostDetailPage.js
import React, { useState } from 'react';

const COLOR_DEEP_NAVY = '#1e2a38'; 	 
const COLOR_MORANDI_BROWN = '#a38c6b'; 
const COLOR_BRICK_RED = '#c9362a'; 	 
const COLOR_OFF_WHITE = '#f3f3e6'; 	 
const COLOR_SECONDARY_TEXT = '#666666'; 
const COLOR_BACKGROUND_LIGHT = '#ffffff';
const COLOR_BORDER = '#dddddd';
const COLOR_HIGHLIGHT_LINE = COLOR_MORANDI_BROWN; 

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:10000";

const Comment = ({ comment }) => (
  <div style={{ display: 'flex', padding: '15px 0', borderBottom: `1px dashed ${COLOR_BORDER}`, alignItems: 'flex-start' }}>
    <div style={{ width: '40px', marginRight: '15px', flexShrink: 0 }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: COLOR_BORDER,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        color: COLOR_SECONDARY_TEXT, fontWeight: 'bold'
      }}>
        {comment.authorName ? comment.authorName.charAt(0) : 'U'}
      </div>
    </div>
    <div style={{ flexGrow: 1 }}>
      <div style={{ fontWeight: '600', fontSize: 'small', color: COLOR_DEEP_NAVY }}>{comment.authorName || '匿名用戶'}</div>
      <div style={{ fontSize: 'x-small', color: COLOR_SECONDARY_TEXT, marginBottom: '5px' }}>
        <time>{comment.date}</time>
      </div>
      <p style={{ margin: '0 0 10px 0', color: COLOR_DEEP_NAVY }}>{comment.content}</p>
    </div>
  </div>
);

const PostDetailPage = ({ post, onBack, onAddComment }) => {
  const [postState, setPostState] = useState(post);
  const [originalPost] = useState(post); // 保存原文
  const [targetLanguage, setTargetLanguage] = useState("zh-TW");
  const [isTranslating, setIsTranslating] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postState.title,
          content: postState.content,
          targetLanguage,
        }),
      });

      const data = await res.json();
      setPostState(prev => ({
        ...prev,
        title: data.translatedTitle,
        content: data.translatedContent,
      }));
    } catch (error) {
      console.error("翻譯失敗:", error);
    }
    setIsTranslating(false);
  };

  const handleCancelTranslate = () => {
    setPostState(originalPost);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentContent.trim()) {
      onAddComment(postState.id, commentContent, "當前用戶(您)"); 
      setCommentContent('');
    } else {
      console.error('留言內容不能為空！'); 
    }
  };

  const BUTTON_STYLE = {
    padding: '10px 20px',
    backgroundColor: COLOR_BRICK_RED,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '10px',
    transition: 'background-color 0.3s'
  };

  const BUTTON_HOVER_STYLE = {
    backgroundColor: COLOR_MORANDI_BROWN
  };

  const TEXTAREA_STYLE = {
    width: '100%',
    height: '100px',
    padding: '12px',
    boxSizing: 'border-box',
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: '6px',
    resize: 'vertical',
    marginBottom: '10px', 
    fontSize: '14px',
    lineHeight: '1.5',
    outline: 'none',
    transition: 'border-color 0.3s'
  };

  const SELECT_STYLE = {
    padding: '10px',
    borderRadius: '6px',
    border: `1px solid ${COLOR_BORDER}`,
    backgroundColor: COLOR_OFF_WHITE,
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '10px'
  };

  return (
    <div style={{ margin: "40px auto", padding: "0 20px", maxWidth: "900px" }}>

      {/* 上方按鈕列 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <button 
          onClick={onBack}
          style={BUTTON_STYLE}
          onMouseOver={e => e.currentTarget.style.backgroundColor = BUTTON_HOVER_STYLE.backgroundColor}
          onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
        >
          ← 返回文章列表
        </button>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={SELECT_STYLE}
          >
            <option value="en">English</option>
            <option value="zh-TW">繁體中文</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="es">Español</option>
          </select>

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            style={BUTTON_STYLE}
            onMouseOver={e => e.currentTarget.style.backgroundColor = BUTTON_HOVER_STYLE.backgroundColor}
            onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
          >
            {isTranslating ? "翻譯中…" : "翻譯貼文"}
          </button>

          <button
            onClick={handleCancelTranslate}
            style={BUTTON_STYLE}
            onMouseOver={e => e.currentTarget.style.backgroundColor = BUTTON_HOVER_STYLE.backgroundColor}
            onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
          >
            取消翻譯
          </button>
        </div>
      </div>

      {/* 文章內容 */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: COLOR_BACKGROUND_LIGHT, border: `1px solid ${COLOR_BORDER}`, borderRadius: '8px' }}>
        <h1 style={{ 
          marginTop: '0', 
          borderBottom: `2px solid ${COLOR_HIGHLIGHT_LINE}`, 
          paddingBottom: '10px',
          color: COLOR_DEEP_NAVY,
          fontWeight: '500'
        }}>
          {postState.title}
        </h1>
        <div style={{ fontSize: 'small', color: COLOR_SECONDARY_TEXT, marginBottom: '20px' }}>
          作者: **{postState.author}** | 發表於: {postState.date}
        </div>
        
        {postState.imageUrls && postState.imageUrls.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
            {postState.imageUrls.map((url, index) => (
              <img 
                key={index}
                src={url} 
                alt={`貼文圖片 ${index + 1}`} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  width: 'auto', 
                  height: 'auto', 
                  objectFit: 'contain', 
                  borderRadius: '8px', 
                  border: `1px solid ${COLOR_BORDER}` 
                }}
              />
            ))}
          </div>
        )}

        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: COLOR_DEEP_NAVY }}>
          {postState.content}
        </p>
      </div>

      {/* 留言列表 */}
      <h3 style={{ 
        borderBottom: `1px solid ${COLOR_HIGHLIGHT_LINE}`, 
        paddingBottom: '5px', 
        marginBottom: '15px',
        color: COLOR_DEEP_NAVY
      }}>
        留言 ({postState.comments ? postState.comments.length : 0})
      </h3>
      <div style={{ marginBottom: '30px' }}>
        {postState.comments?.length > 0 ? (
          postState.comments.slice().reverse().map(comment => (
            <Comment key={comment.id} comment={comment} /> 
          ))
        ) : (
          <div style={{ textAlign: 'center', color: COLOR_SECONDARY_TEXT, padding: '20px', backgroundColor: COLOR_OFF_WHITE, borderRadius: '8px' }}>
            這篇文章還沒有人留言，快來搶沙發吧！
          </div>
        )}
      </div>

      {/* 留言表單 */}
      <div style={{ paddingTop: '20px', borderTop: `1px solid ${COLOR_BORDER}` }}>
        <h3 style={{ marginBottom: '15px', color: COLOR_DEEP_NAVY }}>發表你的評論</h3>
        <form 
          onSubmit={handleCommentSubmit}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} 
        >
          <textarea 
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="留下您的評論..."
            style={{ ...TEXTAREA_STYLE, marginBottom: '0' }}
          />
          <button 
            type="submit"
            style={BUTTON_STYLE}
            onMouseOver={e => e.currentTarget.style.backgroundColor = BUTTON_HOVER_STYLE.backgroundColor}
            onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
          >
            送出留言
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostDetailPage;
