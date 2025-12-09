import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getUserPosts, getUserComments, deletePost, deleteComment } from '../services/userService'; 

// ------------------------------------
// 統一配色定義 (淺色活潑大學風格)
// ------------------------------------
const COLOR_DEEP_NAVY = '#1e2a38';     // 深藍/黑 - 主要文字/標題
const COLOR_OLIVE_GREEN = '#454f3b';   // 深橄欖綠 - 次要文字
const COLOR_MORANDI_BROWN = '#a38c6b'; // 莫蘭迪棕 - 強調線/邊框/Hover
const COLOR_BRICK_RED = '#c9362a';     // 磚紅 - 主要行動按鈕/刪除
const COLOR_LIGHT_BORDER = '#e0e0e0';  // 極淺邊框
const COLOR_OFF_WHITE = '#f3f3e6';     // 米黃/淺色 - 主要背景色
const COLOR_LINK = '#3498db';          // 連結顏色

// ------------------------------------
// 模擬資料 (初始值)
// ------------------------------------
const AVATAR_MAPPING = {
    'emoji-bear_face': '🐻',
    'emoji-cat_paw': '🐾',
    'emoji-student': '🧑‍🎓',
    'emoji-glasses': '🤓',
    'emoji-coffee': '☕',
    'emoji-book': '📚',
    'emoji-rocket': '🚀',
};

const MOCK_INITIAL_USER = {
    id: 'user-001',
    user_login: 'B10901001', // 學號或登入名
    user_email: 'b10901001@ntnu.edu.tw',
    nickname: '師大阿宅',
    last_name: '陳',
    first_name: '小明',
    gender: '男',
    avatar: 'emoji-bear_face',
    bio: '熱愛程式設計的師大學生，平常喜歡在論壇上分享科技新知和校園生活。致力於提升校園資訊透明度。',
};

const MOCK_USER_POSTS = [
    { id: 'p1', title: '學校餐廳新菜色評價！', board: '美食看板 🍽️', views: 850, comments: 12, date: '2024/10/01' },
    { id: 'p2', title: '請問OOO教授的「數據結構」好過嗎？', board: '課程討論 📚', views: 1200, comments: 45, date: '2024/09/25' },
];

const MOCK_USER_COMMENTS = [
    { id: 'c1', content: '我覺得這個活動很有意義，期待參與！', postId: 'e1', postTitle: '校園年度黑客松活動公告', date: '2024/10/05' },
    { id: 'c2', content: '我推薦去圖書館旁的咖啡廳讀書，氣氛很好。', postId: 'l3', postTitle: '哪裡有適合讀書的地方？', date: '2024/09/30' },
];


const ProfilePage = () => {
    // 從 AuthContext 獲取登入用戶資料
    const { currentUser: authUser, userProfile } = useAuth();

    const [activeTab, setActiveTab] = useState('posts');
    const [userPosts, setUserPosts] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // 如果未登入，導向登入頁
    useEffect(() => {
        if (!authUser) {
            navigate('/login');
        }
    }, [authUser, navigate]);

    // 🔥 載入用戶的貼文和留言
    useEffect(() => {
        const loadUserData = async () => {
            if (!authUser || !userProfile) return;

            try {
                setLoading(true);
                console.log('📥 載入用戶貼文和留言...');

                const userName = userProfile.nickname || authUser.email?.split('@')[0] || '匿名用戶';

                // 並行載入貼文和留言
                const [posts, comments] = await Promise.all([
                    getUserPosts(authUser.uid),
                    getUserComments(authUser.uid, userName)
                ]);

                setUserPosts(posts);
                setUserComments(comments);
                setLoading(false);

                console.log(`✅ 成功載入 ${posts.length} 篇貼文和 ${comments.length} 則留言`);
            } catch (error) {
                console.error('❌ 載入用戶資料失敗:', error);
                setLoading(false);
            }
        };

        loadUserData();
    }, [authUser, userProfile]);

    // 如果還在載入或未登入，顯示載入中
    if (!authUser || !userProfile) {
        return (
            <div>
                <Header />
                <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    fontSize: '18px',
                    color: COLOR_OLIVE_GREEN
                }}>
                    載入中...
                </div>
            </div>
        );
    }

    // ------------------------------------
    // 樣式定義
    // ------------------------------------

    // 編輯按鈕樣式
    const buttonPrimaryStyle = { 
        padding: '8px 18px',
        backgroundColor: COLOR_BRICK_RED,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s, transform 0.3s',
        fontSize: '1em',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        alignSelf: 'flex-start', // 讓按鈕靠上對齊
    };

    const getTabStyle = (tabName, currentActiveTab) => ({
        padding: '10px 20px',
        fontWeight: currentActiveTab === tabName ? '700' : '500',
        color: currentActiveTab === tabName ? COLOR_DEEP_NAVY : COLOR_OLIVE_GREEN,
        borderBottom: currentActiveTab === tabName ? `3px solid ${COLOR_MORANDI_BROWN}` : '3px solid transparent',
        transition: 'border-bottom 0.3s, color 0.3s',
        whiteSpace: 'nowrap',
        marginBottom: '-1px', // 讓下邊框與父元素的 borderBottom 重疊
    });

    // ------------------------------------
    // 事件處理
    // ------------------------------------
    const handleEditProfile = () => {
        console.log('導航到個人檔案編輯頁面，並傳遞當前資料');
        // 傳遞當前登入用戶的資料到編輯頁面
        navigate('/profile/edit', {
            state: { initialProfileData: userProfile }
        });
    };

    // 🔥 刪除貼文
    const handleDeletePost = async (postId) => {
        if (!window.confirm('確定要刪除這篇貼文嗎？此操作無法復原。')) {
            return;
        }

        try {
            console.log('🗑️ 刪除貼文:', postId);
            await deletePost(postId, authUser.uid);

            // 從列表中移除
            setUserPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

            alert('✅ 貼文已成功刪除');
        } catch (error) {
            console.error('❌ 刪除貼文失敗:', error);
            alert(`刪除失敗：${error.message}`);
        }
    };

    // 🔥 刪除留言
    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm('確定要刪除這則留言嗎？此操作無法復原。')) {
            return;
        }

        try {
            console.log('🗑️ 刪除留言:', commentId);
            const userName = userProfile.nickname || authUser.email?.split('@')[0] || '匿名用戶';
            await deleteComment(postId, commentId, authUser.uid, userName);

            // 從列表中移除
            setUserComments(prevComments => prevComments.filter(c => c.id !== commentId));

            alert('✅ 留言已成功刪除');
        } catch (error) {
            console.error('❌ 刪除留言失敗:', error);
            alert(`刪除失敗：${error.message}`);
        }
    };

    // ------------------------------------
    // 渲染函數
    // ------------------------------------
    const renderPosts = () => (
        <div style={{ display: 'grid', gap: '15px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: COLOR_OLIVE_GREEN }}>
                    載入中...
                </div>
            ) : (
                <>
                    {userPosts.map(post => (
                        <div key={post.id} style={{
                            padding: '15px',
                            border: `1px solid ${COLOR_LIGHT_BORDER}`,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            transition: 'box-shadow 0.3s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.1)'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <Link to={`/boards/${post.boardName?.toLowerCase()}/${post.id}`} style={{
                                        fontSize: '1.2em',
                                        fontWeight: '600',
                                        color: COLOR_DEEP_NAVY,
                                        textDecoration: 'none',
                                        transition: 'color 0.3s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.color = COLOR_BRICK_RED}
                                    onMouseOut={e => e.currentTarget.style.color = COLOR_DEEP_NAVY}
                                    >
                                        {post.title}
                                    </Link>
                                    <div style={{ fontSize: '0.9em', color: COLOR_OLIVE_GREEN, marginTop: '5px' }}>
                                        看板: {post.boardName} | 留言: {post.commentCount} | 發表於: {new Date(post.createdAt).toLocaleDateString('zh-TW')}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: COLOR_BRICK_RED,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.85em',
                                        marginLeft: '10px'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#a02820'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
                                >
                                    🗑️ 刪除
                                </button>
                            </div>
                        </div>
                    ))}
                    {userPosts.length === 0 && <p style={{ textAlign: 'center', color: COLOR_OLIVE_GREEN }}>尚無貼文。</p>}
                </>
            )}
        </div>
    );

    const renderComments = () => (
        <div style={{ display: 'grid', gap: '15px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: COLOR_OLIVE_GREEN }}>
                    載入中...
                </div>
            ) : (
                <>
                    {userComments.map(comment => (
                        <div key={comment.id} style={{
                            padding: '15px',
                            border: `1px solid ${COLOR_LIGHT_BORDER}`,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            transition: 'box-shadow 0.3s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.1)'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 10px 0', color: COLOR_DEEP_NAVY }}><strong>留言內容:</strong> {comment.content}</p>
                                    <div style={{ fontSize: '0.9em', color: COLOR_OLIVE_GREEN }}>
                                        原貼文: {comment.postTitle} | 看板: {comment.boardName} | {comment.date}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteComment(comment.postId, comment.id)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: COLOR_BRICK_RED,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.85em',
                                        marginLeft: '10px'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#a02820'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
                                >
                                    🗑️ 刪除
                                </button>
                            </div>
                        </div>
                    ))}
                    {userComments.length === 0 && <p style={{ textAlign: 'center', color: COLOR_OLIVE_GREEN }}>尚無留言。</p>}
                </>
            )}
        </div>
    );

    // ------------------------------------
    // 主組件渲染
    // ------------------------------------
    return (
        <div>
            <Header />
            <div style={{
                backgroundColor: COLOR_OFF_WHITE,
                minHeight: '100vh',
                padding: '30px 20px',
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    
                    {/* 1. 個人資訊區塊 */}
                    <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', alignItems: 'flex-start' }}>
                        {/* 1.1 大頭貼 */}
                        <div style={{
                            fontSize: '6em',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            backgroundColor: COLOR_OFF_WHITE,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                            flexShrink: 0,
                            overflow: 'hidden'
                        }}>
                            {/* 🔥 支援三種頭像格式：URL、Base64、Emoji */}
                            {userProfile.avatar && (
                                userProfile.avatar.startsWith('http://') ||
                                userProfile.avatar.startsWith('https://') ||
                                userProfile.avatar.startsWith('data:image/')  // 🔥 Base64 圖片
                            ) ? (
                                <img
                                    src={userProfile.avatar}
                                    alt="用戶頭像"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <span style={{ fontSize: '3rem' }}>
                                    {AVATAR_MAPPING[userProfile.avatar] || '👤'}
                                </span>
                            )}
                        </div>

                        {/* 1.2 資訊詳情 */}
                        <div style={{ flex: 1 }}>
                            {/* 標題和編輯按鈕 - 使用 Flex 佈局 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: `3px solid ${COLOR_MORANDI_BROWN}` }}>
                                <h1 style={{
                                    fontSize: '2em',
                                    color: COLOR_DEEP_NAVY,
                                    margin: 0
                                }}>
                                    {userProfile.nickname} ({userProfile.user_login})
                                </h1>
                                {/* 編輯按鈕 */}
                                <button
                                    onClick={handleEditProfile}
                                    style={buttonPrimaryStyle}
                                    onMouseOver={e => {
                                        e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN;
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.backgroundColor = COLOR_BRICK_RED;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    ✏️ 編輯個人檔案
                                </button>
                            </div>

                            {/* 其他個人資訊 */}
                            <div style={{ marginBottom: '15px', color: COLOR_OLIVE_GREEN, fontSize: '1em' }}>
                                <div style={{ marginBottom: '5px' }}>📧 電子郵件: <span style={{ color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{userProfile.email}</span></div>
                                <div style={{ marginBottom: '5px' }}>👤 真實姓名: <span style={{ color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{userProfile.last_name}{userProfile.first_name}</span></div>
                                <div>🚻 性別: <span style={{ color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{userProfile.gender}</span></div>
                            </div>

                            <p style={{
                                fontSize: '16px',
                                color: COLOR_DEEP_NAVY,
                                padding: '15px',
                                borderLeft: `3px solid ${COLOR_MORANDI_BROWN}`,
                                backgroundColor: COLOR_OFF_WHITE,
                                borderRadius: '5px',
                                whiteSpace: 'pre-wrap'
                            }}>
                                <strong>自我介紹:</strong> {userProfile.bio}
                            </p>
                        </div>
                    </div>

                    {/* 2. 貼文/留言切換 Tab */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${COLOR_LIGHT_BORDER}`, marginBottom: '25px' }}>
                        <div 
                            style={{ ...getTabStyle('posts', activeTab), cursor: 'pointer' }} 
                            onClick={() => setActiveTab('posts')}
                            onMouseOver={e => e.currentTarget.style.borderBottom = `3px solid ${COLOR_MORANDI_BROWN}`}
                            onMouseOut={e => e.currentTarget.style.borderBottom = activeTab === 'posts' ? `3px solid ${COLOR_MORANDI_BROWN}` : '3px solid transparent'}
                        >
                            📝 我的貼文 ({userPosts.length})
                        </div>
                        <div 
                            style={{ ...getTabStyle('comments', activeTab), cursor: 'pointer' }} 
                            onClick={() => setActiveTab('comments')}
                            onMouseOver={e => e.currentTarget.style.borderBottom = `3px solid ${COLOR_MORANDI_BROWN}`}
                            onMouseOut={e => e.currentTarget.style.borderBottom = activeTab === 'comments' ? `3px solid ${COLOR_MORANDI_BROWN}` : '3px solid transparent'}
                        >
                            💬 我的留言 ({userComments.length})
                        </div>
                    </div>

                    {/* 3. 內容列表 */}
                    {activeTab === 'posts' ? renderPosts() : renderComments()}

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;