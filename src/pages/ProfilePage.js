import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // 1. 導入 useLocation
import Header from '../components/Header'; 

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
    // 使用 useState 來管理可變的個人檔案資料
    const [currentUser, setCurrentUser] = useState(MOCK_INITIAL_USER); 
    const [activeTab, setActiveTab] = useState('posts');
    const userPosts = MOCK_USER_POSTS;
    const userComments = MOCK_USER_COMMENTS;
    const navigate = useNavigate(); 
    const location = useLocation(); // 導入 useLocation

    // 處理從編輯頁面回傳的資料
    useEffect(() => {
        // 檢查 state 中是否有 updatedProfile
        if (location.state && location.state.updatedProfile) {
            console.log('ProfilePage: 成功接收到更新後的個人檔案:', location.state.updatedProfile);
            // 應用更新後的資料
            setCurrentUser(location.state.updatedProfile);
            
            // 清除 state，防止重新整理或其他導航操作再次應用
            // 由於 ProfileEditPage 使用了 replace: true，這裡可以不用額外導航
            // 但如果 App.js 的路由結構允許，也可以選擇清除 state
            // navigate(location.pathname, { replace: true, state: {} }); 
        }
    }, [location.state]); // 僅依賴 location.state 變化

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
        // 傳遞當前最新的 currentUser 資料到編輯頁面
        navigate('/profile/edit', { 
            state: { initialProfileData: currentUser } 
        }); 
    };

    // ------------------------------------
    // 渲染函數
    // ------------------------------------
    const renderPosts = () => (
        <div style={{ display: 'grid', gap: '15px' }}>
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
                    <Link to={`/boards/someboard/${post.id}`} style={{ 
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
                        看板: {post.board} | 瀏覽: {post.views} | 留言: {post.comments} | 發表於: {post.date}
                    </div>
                </div>
            ))}
            {userPosts.length === 0 && <p style={{ textAlign: 'center', color: COLOR_OLIVE_GREEN }}>尚無貼文。</p>}
        </div>
    );

    const renderComments = () => (
        <div style={{ display: 'grid', gap: '15px' }}>
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
                    <p style={{ margin: '0 0 10px 0', color: COLOR_DEEP_NAVY }}>**留言內容:** {comment.content}</p>
                    <Link to={`/boards/someboard/${comment.postId}`} style={{ 
                        fontSize: '0.9em', 
                        color: COLOR_LINK, 
                        textDecoration: 'none',
                        transition: 'color 0.3s'
                    }}
                    onMouseOver={e => e.currentTarget.style.color = COLOR_BRICK_RED}
                    onMouseOut={e => e.currentTarget.style.color = COLOR_LINK}
                    >
                        **原貼文:** {comment.postTitle}
                    </Link>
                    <div style={{ fontSize: '0.8em', color: COLOR_OLIVE_GREEN, marginTop: '5px', textAlign: 'right' }}>
                        留言於: {comment.date}
                    </div>
                </div>
            ))}
            {userComments.length === 0 && <p style={{ textAlign: 'center', color: COLOR_OLIVE_GREEN }}>尚無留言。</p>}
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
                            flexShrink: 0
                        }}>
                            {AVATAR_MAPPING[currentUser.avatar]} {/* 使用 currentUser */}
                        </div>
                        
                        {/* 1.2 資訊詳情 */}
                        <div style={{ flex: 1 }}>
                            {/* 標題和編輯按鈕 - 使用 Flex 佈局 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: `3px solid ${COLOR_MORANDI_BROWN}` }}>
                                <h1 style={{ 
                                    fontSize: '2em', 
                                    color: COLOR_DEEP_NAVY, 
                                    margin: 0 // 移除 h1 預設 margin
                                }}>
                                    {currentUser.nickname} ({currentUser.user_login}) {/* 使用 currentUser */}
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
                                <div style={{ marginBottom: '5px' }}>📧 電子郵件: <span style={{ color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{currentUser.user_email}</span></div>
                                <div style={{ marginBottom: '5px' }}>👤 真實姓名: <span style={{ color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{currentUser.last_name}{currentUser.first_name}</span></div>
                                <div>🚻 性別: <span style={{ color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{currentUser.gender}</span></div>
                            </div>
                            
                            <p style={{ 
                                fontSize: '16px', 
                                color: COLOR_DEEP_NAVY, 
                                padding: '15px',
                                borderLeft: `3px solid ${COLOR_MORANDI_BROWN}`,
                                backgroundColor: COLOR_OFF_WHITE,
                                borderRadius: '5px',
                                whiteSpace: 'pre-wrap' // 允許換行
                            }}>
                                **自我介紹:** {currentUser.bio}
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