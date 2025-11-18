// src/components/BoardTemplate.js (只顯示修改後的 ChatWidget 部分)
import React, { useState, useCallback } from 'react';
import Header from './Header';
import BoardNav from './BoardNav';
import PostDetailPage from "../pages/PostDetailPage";

// ------------------------------------
// 統一配色定義 (明亮活潑調整版)
// ------------------------------------
const COLOR_DEEP_NAVY = '#1e2a38';     // 深藍/黑 - 主要文字 (代替 COLOR_PRIMARY_TEXT)
const COLOR_OLIVE_GREEN = '#454f3b';   // 深橄欖綠 - 次要強調/Hover
const COLOR_MORANDI_BROWN = '#a38c6b'; // 莫蘭迪棕 - Chat 主色/強調色 (代替 COLOR_MORANDI_BLUE)
const COLOR_BRICK_RED = '#c9362a';     // 磚紅 - 連結 Hover
const COLOR_OFF_WHITE = '#f3f3e6';     // 米黃/淺色 - 背景/次要按鈕

const COLOR_SECONDARY_TEXT = '#666666'; // 中灰文字
const COLOR_BACKGROUND_LIGHT = '#ffffff';
const COLOR_BORDER = '#dddddd';
const COLOR_HIGHLIGHT_LINE = COLOR_MORANDI_BROWN; // 使用莫蘭迪棕作為強調線

// ------------------------------------
// 輔助組件 (Comment) - 樣式優化 (沿用舊版，調整顏色名稱)
// ------------------------------------
const Comment = ({ comment }) => (
    <div style={{ display: 'flex', padding: '15px 0', borderBottom: `1px dashed ${COLOR_BORDER}`, alignItems: 'flex-start' }}>
        {/* 頭像 */}
        <div style={{ width: '40px', marginRight: '15px', flexShrink: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: COLOR_BORDER, display: 'flex', justifyContent: 'center', alignItems: 'center', color: COLOR_SECONDARY_TEXT, fontWeight: 'bold' }}>
                {comment.authorName.charAt(0)}
            </div>
        </div>
        {/* 內容 */}
        <div style={{ flexGrow: 1 }}>
            <div style={{ fontWeight: '600', fontSize: 'small', color: COLOR_DEEP_NAVY }}>{comment.authorName}</div>
            <div style={{ fontSize: 'x-small', color: COLOR_SECONDARY_TEXT, marginBottom: '5px' }}>
                <time>{comment.date}</time>
                <span style={{ marginLeft: '10px', cursor: 'pointer', transition: 'color 0.3s' }} 
                    onMouseOver={(e) => e.currentTarget.style.color = COLOR_DEEP_NAVY}
                    onMouseOut={(e) => e.currentTarget.style.color = COLOR_SECONDARY_TEXT}
                >| 編輯</span>
            </div>
            <p style={{ margin: '0 0 10px 0', color: COLOR_DEEP_NAVY }}>{comment.content}</p>
            <a href={`/reply/${comment.id}`} style={{ fontSize: 'small', color: COLOR_MORANDI_BROWN, textDecoration: 'none', transition: 'color 0.3s' }}
               onMouseOver={(e) => e.currentTarget.style.color = COLOR_BRICK_RED} // Hover 使用磚紅
               onMouseOut={(e) => e.currentTarget.style.color = COLOR_MORANDI_BROWN}
            >回覆</a>
        </div>
    </div>
);


// ------------------------------------
// 輔助組件 (ChatWidget) - 核心修改部分
// ------------------------------------
const ChatWidget = ({ onClose, boardName, messages, onSendMessage }) => {
    const [input, setInput] = useState(''); 
    const handleSend = () => { 
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };
    
    // 聊天室按鈕樣式 (使用莫蘭迪棕)
    const CHAT_BUTTON_STYLE = {
        padding: '8px 15px', 
        backgroundColor: COLOR_MORANDI_BROWN, // **主色：莫蘭迪棕**
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
    };

    return (
        <div style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            width: '300px', 
            height: '400px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)', 
            zIndex: 1000, 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: COLOR_BACKGROUND_LIGHT
        }}>
            {/* 標題欄 */}
            <div style={{ 
                padding: '12px 15px', 
                backgroundColor: COLOR_MORANDI_BROWN, // **標題背景：莫蘭迪棕**
                color: 'white', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
            }}>
                <div style={{ fontWeight: 'bold' }}>💬 {boardName} 即時聊天室</div>
                <button 
                    onClick={onClose} 
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4em', cursor: 'pointer', marginLeft: '10px', opacity: 0.9 }}
                >&times;</button>
            </div>
            {/* 訊息區 */}
            <div style={{ 
                flexGrow: 1, 
                padding: '10px 15px', 
                overflowY: 'auto', 
                backgroundColor: COLOR_OFF_WHITE, // **淺色背景：米黃/淺色**
                display: 'flex', 
                flexDirection: 'column-reverse' 
            }}>
                {messages.slice().reverse().map((msg, index) => (
                    <div key={index} style={{ margin: '5px 0', fontSize: 'small', textAlign: msg.sender === 'User' ? 'right' : 'left' }}>
                        <span style={{ 
                            padding: '8px 12px', 
                            borderRadius: '18px', 
                            // 用戶氣泡使用莫蘭迪棕
                            backgroundColor: msg.sender === 'User' ? COLOR_MORANDI_BROWN : COLOR_BORDER, 
                            color: msg.sender === 'User' ? 'white' : COLOR_DEEP_NAVY, // 系統氣泡文字使用深色
                            display: 'inline-block', 
                            maxWidth: '80%',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            {msg.content}
                        </span>
                    </div>
                ))}
            </div>
            {/* 輸入區 */}
            <div style={{ 
                padding: '12px 15px', 
                borderTop: `1px solid ${COLOR_BORDER}`, 
                display: 'flex',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                backgroundColor: COLOR_BACKGROUND_LIGHT
            }}>
                <input 
                    type="text" 
                    placeholder="輸入訊息..." 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
                    style={{ flexGrow: 1, padding: '10px', border: `1px solid ${COLOR_BORDER}`, borderRadius: '6px', marginRight: '10px', outline: 'none' }} 
                />
                <button 
                    onClick={handleSend} 
                    style={CHAT_BUTTON_STYLE}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_OLIVE_GREEN} // **Hover：深橄欖綠**
                    onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN}
                >
                    發送
                </button>
            </div>
        </div>
    );
};


// ------------------------------------
// 其他組件 (Post, PostForm, BoardTemplate) - 使用新顏色定義
// ------------------------------------

const Post = ({ post, onClick }) => (
    <div 
        onClick={onClick}
        style={{ 
            border: `1px solid ${COLOR_BORDER}`, 
            padding: '18px', 
            borderRadius: '8px', 
            marginBottom: '15px',
            backgroundColor: COLOR_BACKGROUND_LIGHT,
            cursor: 'pointer',
            transition: 'box-shadow 0.3s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
    >
        <h4 style={{ margin: '0 0 8px 0', color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{post.title}</h4>
        <div style={{ fontSize: 'small', color: COLOR_SECONDARY_TEXT, marginBottom: '5px' }}>
            作者: **{post.author}** | 發表於: {post.date} | 留言: <span style={{ color: COLOR_MORANDI_BROWN, fontWeight: 'bold' }}>{post.commentCount}</span>
        </div>
        <p style={{ margin: '0', fontSize: 'small', color: COLOR_SECONDARY_TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.content.substring(0, 100)}...
        </p>
    </div>
);

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

    const BUTTON_PRIMARY_STYLE = { 
        padding: '10px 25px', 
        backgroundColor: COLOR_BRICK_RED, // 主按鈕使用磚紅
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    };
    const BUTTON_SECONDARY_STYLE = { 
        padding: '10px 25px', 
        backgroundColor: COLOR_SECONDARY_TEXT, 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        transition: 'background-color 0.3s'
    };

    return (
        <div style={{ border: `1px solid ${COLOR_BORDER}`, padding: '30px', borderRadius: '10px', backgroundColor: COLOR_OFF_WHITE }}>
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
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: `1px solid ${COLOR_BORDER}`, borderRadius: '6px', outline: 'none' }}
                        placeholder="請輸入貼文標題"
                    />
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: COLOR_DEEP_NAVY }}>內容：</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ width: '100%', height: '200px', padding: '12px', boxSizing: 'border-box', border: `1px solid ${COLOR_BORDER}`, borderRadius: '6px', resize: 'vertical', outline: 'none' }}
                        placeholder="請詳細描述您的貼文內容..."
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        style={BUTTON_SECONDARY_STYLE}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#888'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_SECONDARY_TEXT}
                    >
                        取消
                    </button>
                    <button 
                        type="submit" 
                        style={BUTTON_PRIMARY_STYLE}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN} // Hover 莫蘭迪棕
                        onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
                    >
                        送出貼文
                    </button>
                </div>
            </form>
        </div>
    );
};


const BoardTemplate = ({ boardName }) => {
    // 狀態管理 (不變)
    const [showChat, setShowChat] = useState(false);
    const [isPosting, setIsPosting] = useState(false); 
    const [selectedPost, setSelectedPost] = useState(null);

    const [chatMessages, setChatMessages] = useState([
        { content: `歡迎來到【${boardName}】即時聊天室！`, sender: 'System', time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    const handleSendMessage = useCallback((content) => { 
        setChatMessages(prevMessages => [
            ...prevMessages, 
            { content: content, sender: 'User', time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) }
        ]);
    }, []);
    
    const [posts, setPosts] = useState([
        { id: 101, title: `【公告】${boardName} 看板使用規範`, content: '請大家遵守社群守則，共同維護看板秩序。', author: '管理員', date: '2025-11-01', commentCount: 5 },
        { id: 102, title: `熱門討論：${boardName} 的最新趨勢是什麼？`, content: '最近大家都在討論什麼呢？有沒有什麼新的發現可以分享？', author: `看板用戶-Z`, date: '2025-11-12', commentCount: 12 },
    ]);

    const handleNewPostSubmit = (title, content) => {
        const newPost = { id: Date.now(), title, content, author: '當前用戶 (您)', date: new Date().toLocaleDateString('zh-TW'), commentCount: 0 };
        setPosts(prevPosts => [newPost, ...prevPosts]); 
        setIsPosting(false);
        alert('新貼文已成功發表！');
    };

    const handlePostClick = (post) => {
        setSelectedPost(post);
    };

    // 調整功能按鈕樣式
    const POST_BUTTON_STYLE = { 
        padding: '12px 25px', 
        backgroundColor: COLOR_BRICK_RED, // 發表按鈕使用磚紅
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    };
    const CHAT_ICON_BUTTON_STYLE = { 
        padding: '12px 25px', 
        backgroundColor: COLOR_MORANDI_BROWN, // 即時聊天室使用莫蘭迪棕
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        marginLeft: '15px',
        transition: 'background-color 0.3s'
    };


    return (
        <>
            <Header /> 
            <main style={{ maxWidth: '900px', margin: '20px auto', padding: '0 20px', backgroundColor: COLOR_BACKGROUND_LIGHT }}>

                <BoardNav />

                <div style={{ 
                    border: `1px solid ${COLOR_BORDER}`, 
                    padding: '30px', 
                    borderRadius: '10px', 
                    marginTop: '20px', 
                    backgroundColor: COLOR_BACKGROUND_LIGHT, 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
                }}>

                    {selectedPost ? (
                        /* 🔸 顯示貼文詳情頁 */
                        <PostDetailPage 
                            post={selectedPost}
                            onBack={() => setSelectedPost(null)}
                            onAddComment={(postId, content) => {
                                setPosts(prev =>
                                    prev.map(p =>
                                        p.id === postId
                                            ? { 
                                                ...p, 
                                                commentCount: p.commentCount + 1,
                                                comments: [
                                                    ...(p.comments || []),
                                                    {
                                                        id: Date.now(),
                                                        author: "當前用戶(您)",
                                                        content,
                                                        date: new Date().toLocaleString("zh-TW")
                                                    }
                                                ]
                                            }
                                            : p
                                    )
                                );
                            }}
                        />
                    ) : (
                        /* 🔸 顯示原本看板內容 */
                        <>
                            <h2 style={{ 
                                borderBottom: `2px solid ${COLOR_HIGHLIGHT_LINE}`, 
                                color: COLOR_DEEP_NAVY, 
                                paddingBottom: '15px', 
                                marginBottom: '30px', 
                                marginTop: '0', 
                                fontWeight: '400' 
                            }}>
                                【{boardName}】 看板討論區
                            </h2>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <button 
                                    onClick={() => setIsPosting(true)}
                                    style={POST_BUTTON_STYLE}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_OLIVE_GREEN}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
                                >
                                    + 發表新貼文
                                </button>

                                <button
                                    onClick={() => setShowChat(true)}
                                    style={CHAT_ICON_BUTTON_STYLE}
                                    title="開啟即時聊天室"
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_OLIVE_GREEN}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN}
                                >
                                    💬 即時聊天室 ({chatMessages.length})
                                </button>
                            </div>

                            {isPosting ? (
                                <PostForm 
                                    boardName={boardName}
                                    onSubmit={handleNewPostSubmit} 
                                    onCancel={() => setIsPosting(false)} 
                                />
                            ) : (
                                <>
                                    <h3 style={{ 
                                        borderLeft: `5px solid ${COLOR_HIGHLIGHT_LINE}`, 
                                        color: COLOR_DEEP_NAVY, 
                                        paddingLeft: '15px', 
                                        marginBottom: '20px', 
                                        fontWeight: '500' 
                                    }}>最新文章</h3>

                                    <div className="posts-list" style={{ marginBottom: '20px' }}>
                                        {posts.map(post => (
                                            <Post key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                                        ))}
                                        {posts.length === 0 && (
                                            <div style={{ textAlign: 'center', color: COLOR_SECONDARY_TEXT, padding: '20px' }}>
                                                看板目前沒有文章。
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {showChat && 
                    <ChatWidget 
                        onClose={() => setShowChat(false)} 
                        boardName={boardName} 
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                    />
                }
            </main>
        </>
    );
};
export default BoardTemplate;