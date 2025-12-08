// src/components/BoardTemplate.js
import React, { useState, useCallback, useEffect } from 'react'; // 🏆 修正: 導入 useEffect
import Header from './Header'; // 假設 Header 存在
import BoardNav from './BoardNav'; // 假設 BoardNav 存在
import PostDetailPage from "../pages/PostDetailPage";
import PostForm from './PostForm';
import ChatWidget from './ChatWidget'; // 🔥 新增：引入獨立的 ChatWidget 元件

// 🔥 新增：引入 Firestore 操作函數
import { listenToPosts, createPost, addCommentToPost } from '../services/postService';

// 🔥 新增：引入認證相關功能
import { useAuth } from '../contexts/AuthContext'; 


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
// 輔助組件 (ChatWidget) - 🔥 已移至獨立檔案 ChatWidget.js
// ------------------------------------
// ChatWidget 現在是從 './ChatWidget' 引入的獨立元件
// 不再需要在這裡定義


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
// 主要組件 (BoardTemplate) - 🔥 整合 Firestore
// ------------------------------------
const BoardTemplate = ({ boardName }) => {
    // 🔥 新增：取得當前登入用戶資訊
    const { currentUser, userProfile } = useAuth();

    // 初始化 posts 狀態為空陣列
    const [posts, setPosts] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(true); // 🔥 新增：載入狀態

    // 🔥 修改：從 Firestore 即時監聽貼文（取代 localStorage）
    useEffect(() => {
        console.log(`📡 開始監聽【${boardName}】看板的貼文...`);

        // 使用 listenToPosts 開始監聽
        const unsubscribe = listenToPosts(boardName, (newPosts) => {
            console.log(`✅ 收到【${boardName}】看板的 ${newPosts.length} 篇貼文`);
            setPosts(newPosts);
            setLoading(false); // 載入完成
        });

        // ⚠️ 重要：當組件卸載或 boardName 改變時，停止監聽
        return () => {
            console.log(`🔌 停止監聽【${boardName}】看板`);
            unsubscribe();
        };
    }, [boardName]); // 當 boardName 改變時重新監聽

    // 🔥 移除舊的聊天室邏輯 - 現在由 ChatWidget 元件自行處理
    // 不再需要在這裡管理 chatMessages state

    // 🔥 修改：新增貼文到 Firestore（取代 localStorage）
    const handleNewPostSubmit = async (title, content, imageUrls) => {
        try {
            if (!currentUser) {
                const errMsg = '⚠️ 請先登入才能發文！';
                alert(errMsg);
                throw new Error(errMsg); 
            }

            console.log('📝 準備發送貼文到 Firestore...');

            // 呼叫 createPost 將貼文存入 Firestore
            const newPostId = await createPost({
                title,
                content,
                boardName,
                authorId: currentUser.uid,
                authorName: userProfile?.nickname || currentUser.email.split('@')[0] || '匿名用戶',
                imageUrls: imageUrls || []
            });

            console.log(`✅ 貼文已成功發表！ID: ${newPostId}`);

            // ----------------------------------------------------
            // 🎯 關鍵動作：這裡會把狀態設為 false，畫面就會自動跳回文章列表
            // ----------------------------------------------------
            setIsPosting(false); 

        } catch (error) {
            console.error('❌ 發文失敗:', error);
            alert(`發文失敗：${error.message}`);
            // 🔥 重要：拋出錯誤，讓 PostForm 知道失敗了，不要清空表單
            throw error;
        }
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
                            onAddComment={async (postId, content) => {
                                try {
                                    // ⚠️ 檢查用戶是否已登入
                                    if (!currentUser) {
                                        alert('⚠️ 請先登入才能留言！');
                                        return;
                                    }

                                    console.log('💬 準備新增留言到 Firestore...');

                                    // 🔥 使用 addCommentToPost 將留言存入 Firestore
                                    await addCommentToPost(postId, {
                                        author: userProfile?.nickname || currentUser.email.split('@')[0] || '匿名用戶',
                                        content
                                    });

                                    console.log('✅ 留言已成功新增！');

                                    // 🔑 重點：不需要手動更新 posts state！
                                    // onSnapshot 會自動偵測 Firestore 的變化
                                    // 但為了讓 PostDetailPage 立即更新，我們需要更新 selectedPost
                                    // 從最新的 posts 中找到更新後的貼文
                                    const updatedPost = posts.find(p => p.id === postId);
                                    if (updatedPost) {
                                        // 等一下下讓 Firestore 更新完成
                                        setTimeout(() => {
                                            const latestPost = posts.find(p => p.id === postId);
                                            if (latestPost) {
                                                setSelectedPost(latestPost);
                                            }
                                        }, 500);
                                    }

                                } catch (error) {
                                    console.error('❌ 留言失敗:', error);
                                    alert(`留言失敗：${error.message}`);
                                }
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
                                    💬 即時聊天室
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
                                        {/* 🔥 新增：顯示載入狀態 */}
                                        {loading ? (
                                            <div style={{ textAlign: 'center', color: COLOR_SECONDARY_TEXT, padding: '40px' }}>
                                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                                                <div>正在載入貼文...</div>
                                            </div>
                                        ) : (
                                            <>
                                                {posts.map(post => (
                                                    <Post key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                                                ))}
                                                {posts.length === 0 && (
                                                    <div style={{ textAlign: 'center', color: COLOR_SECONDARY_TEXT, padding: '20px' }}>
                                                        看板目前沒有文章。
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* 🔥 使用新的 ChatWidget 元件 - 自動處理 Firebase 即時同步 */}
                {showChat &&
                    <ChatWidget
                        onClose={() => setShowChat(false)}
                        boardName={boardName}
                    />
                }
            </main>
        </>
    );
};
export default BoardTemplate;