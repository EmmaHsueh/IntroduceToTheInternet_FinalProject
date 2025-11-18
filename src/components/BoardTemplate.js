// src/components/BoardTemplate.js
import React, { useState, useCallback, useEffect } from 'react'; // 🏆 修正: 導入 useEffect
import Header from './Header'; // 假設 Header 存在
import BoardNav from './BoardNav'; // 假設 BoardNav 存在
import PostDetailPage from "../pages/PostDetailPage";
import PostForm from './PostForm'; 


// ------------------------------------
// 統一配色定義
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


// 初始貼文數據 (已包含 imageUrls 陣列)
// 我們將不再依賴這組數據作為預設狀態，而是用於參考。
const initialPosts = [
    { id: 101, title: `【公告】看板使用規範`, content: '請大家遵守社群守則，共同維護看板秩序。', author: '管理員', date: '2025-11-01', commentCount: 5, imageUrls: ['https://picsum.photos/60/60?random=1'], comments: [] },
    { id: 102, title: `熱門討論：最新趨勢是什麼？`, content: '最近大家都在討論什麼呢？有沒有什麼新的發現可以分享？', author: `看板用戶-Z`, date: '2025-11-12', commentCount: 12, imageUrls: [], comments: [] },
];

// ------------------------------------
// 輔助組件 (Comment) - 樣式優化 (保持不變)
// ------------------------------------
const Comment = ({ comment }) => (
    <div style={{ display: 'flex', padding: '15px 0', borderBottom: `1px dashed ${COLOR_BORDER}`, alignItems: 'flex-start' }}>
        {/* 頭像 */}
        <div style={{ width: '40px', marginRight: '15px', flexShrink: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: COLOR_BORDER, display: 'flex', justifyContent: 'center', alignItems: 'center', color: COLOR_SECONDARY_TEXT, fontWeight: 'bold' }}>
                {comment.author.charAt(0)}
            </div>
        </div>
        {/* 內容 */}
        <div style={{ flexGrow: 1 }}>
            <div style={{ fontWeight: '600', fontSize: 'small', color: COLOR_DEEP_NAVY }}>{comment.author}</div>
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
// 輔助組件 (ChatWidget) (保持不變)
// ------------------------------------
const ChatWidget = ({ onClose, boardName, messages, onSendMessage }) => {
    const [input, setInput] = useState(''); 
    const handleSend = () => { 
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };
    
    const CHAT_BUTTON_STYLE = {
        padding: '8px 15px', 
        backgroundColor: COLOR_MORANDI_BROWN, 
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
                backgroundColor: COLOR_MORANDI_BROWN, 
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
                backgroundColor: COLOR_OFF_WHITE, 
                display: 'flex', 
                flexDirection: 'column-reverse' 
            }}>
                {messages.slice().reverse().map((msg, index) => (
                    <div key={index} style={{ margin: '5px 0', fontSize: 'small', textAlign: msg.sender === 'User' ? 'right' : 'left' }}>
                        <span style={{ 
                            padding: '8px 12px', 
                            borderRadius: '18px', 
                            backgroundColor: msg.sender === 'User' ? COLOR_MORANDI_BROWN : COLOR_BORDER, 
                            color: msg.sender === 'User' ? 'white' : COLOR_DEEP_NAVY, 
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
                    onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_OLIVE_GREEN} 
                    onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN}
                >
                    發送
                </button>
            </div>
        </div>
    );
};


// ------------------------------------
// 輔助組件 (Post) - 調整為顯示第一張圖 (保持不變)
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
		<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
			{/* 貼文預覽圖：只顯示第一張圖 */}
			{post.imageUrls && post.imageUrls.length > 0 && (
				<img 
					src={post.imageUrls[0]} // 顯示陣列中的第一張圖
					alt="貼文圖片預覽" 
					style={{ width: '60px', height: '60px', flexShrink: 0, borderRadius: '4px', objectFit: 'cover', border: `1px solid ${COLOR_BORDER}` }}
				/>
			)}
			<div>
				<h4 style={{ margin: '0 0 8px 0', color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{post.title}</h4>
				<div style={{ fontSize: 'small', color: COLOR_SECONDARY_TEXT, marginBottom: '5px' }}>
					作者: **{post.author}** | 發表於: {post.date} | 留言: <span style={{ color: COLOR_MORANDI_BROWN, fontWeight: 'bold' }}>{post.commentCount}</span>
				</div>
				<p style={{ margin: '0', fontSize: 'small', color: COLOR_SECONDARY_TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
					{post.content.substring(0, 100)}...
				</p>
			</div>
		</div>
	</div>
);


// ------------------------------------
// 主要組件 (BoardTemplate) - 修正 Persistence 邏輯，實現看板隔離
// ------------------------------------
const BoardTemplate = ({ boardName }) => {
    // 🏆 修正 1: 初始化 posts 狀態為空陣列
    const [posts, setPosts] = useState([]); 

    const [showChat, setShowChat] = useState(false);
    const [isPosting, setIsPosting] = useState(false); 
    const [selectedPost, setSelectedPost] = useState(null);

    // 🏆 修正 2: 監聽 boardName 變化，並從 board-specific localStorage 讀取該看板的貼文
    useEffect(() => {
        const localStorageKey = `boardPosts_${boardName}`;
        const savedPosts = localStorage.getItem(localStorageKey);
        
        if (savedPosts) {
            setPosts(JSON.parse(savedPosts));
        } else {
            // 如果該看板沒有儲存數據，讓它從空開始，實現看板隔離
            setPosts([]); 
        }
    }, [boardName]); // 當 boardName 改變時觸發

    // 🏆 修正 3: 監聽 posts 狀態變化，並儲存到 board-specific localStorage key
    useEffect(() => {
        const localStorageKey = `boardPosts_${boardName}`;
        localStorage.setItem(localStorageKey, JSON.stringify(posts));
    }, [posts, boardName]); // 依賴項加入 boardName，確保儲存到正確的位置

    // 聊天室邏輯 (略)
    const [chatMessages, setChatMessages] = useState([
        { content: `歡迎來到【${boardName}】即時聊天室！`, sender: 'System', time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    const handleSendMessage = useCallback((content) => { 
        setChatMessages(prevMessages => [
            ...prevMessages, 
            { content: content, sender: 'User', time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) }
        ]);
    }, []);

    // 修正：現在接受 imageUrls 陣列參數並儲存 (保持不變)
    const handleNewPostSubmit = (title, content, imageUrls) => {
        const newPost = { 
            id: Date.now(), 
            title, 
            content, 
            author: '當前用戶 (您)', 
            date: new Date().toLocaleDateString('zh-TW'), 
            commentCount: 0,
            imageUrls: imageUrls || [], // 儲存圖片 URL 陣列
            comments: [] // 新貼文沒有留言
        };
        setPosts(prevPosts => [newPost, ...prevPosts]); 
        setIsPosting(false);
        // 為了避免 alert 阻礙流程，這裡使用 console.log 或忽略
        console.log('新貼文已成功發表！' + (imageUrls.length > 0 ? ` (包含 ${imageUrls.length} 張圖片)` : ''));
    };

    const handlePostClick = (post) => {
        setSelectedPost(post);
    };

    // 按鈕樣式 (保持不變)
    const POST_BUTTON_STYLE = { 
        padding: '12px 25px', 
        backgroundColor: COLOR_BRICK_RED, 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    };
    const CHAT_ICON_BUTTON_STYLE = { 
        padding: '12px 25px', 
        backgroundColor: COLOR_MORANDI_BROWN, 
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
                                const newComment = {
                                    id: Date.now(),
                                    author: "當前用戶(您)",
                                    content,
                                    date: new Date().toLocaleString("zh-TW")
                                };

                                setPosts(prev => {
                                    const updatedPosts = prev.map(p =>
                                        p.id === postId
                                            ? { 
                                                ...p, 
                                                commentCount: p.commentCount + 1,
                                                comments: [
                                                    ...(p.comments || []),
                                                    newComment
                                                ]
                                            }
                                            : p
                                    );
                                    
                                    // 確保 PostDetailPage 立即更新 (如果 PostDetailPage 依賴 props 並且已經實作)
                                    const updatedPost = updatedPosts.find(p => p.id === postId);
                                    if (updatedPost) {
                                        setSelectedPost(updatedPost); 
                                    }
                                    
                                    return updatedPosts;
                                });
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
                                    onSubmit={handleNewPostSubmit} // 傳遞新的 onSubmit
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