// src/pages/PublicProfilePage.js
// 公開的用戶個人檔案頁面（其他用戶可以查看）

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getUserById, getUserPosts, getUserComments } from '../services/userService';

// 統一配色
const COLOR_DEEP_NAVY = '#1e2a38';
const COLOR_OLIVE_GREEN = '#454f3b';
const COLOR_MORANDI_BROWN = '#a38c6b';
const COLOR_BRICK_RED = '#c9362a';
const COLOR_LIGHT_BORDER = '#e0e0e0';
const COLOR_OFF_WHITE = '#f3f3e6';

const AVATAR_MAPPING = {
    'emoji-bear_face': '🐻',
    'emoji-cat_paw': '🐾',
    'emoji-student': '🧑‍🎓',
    'emoji-glasses': '🤓',
    'emoji-coffee': '☕',
    'emoji-book': '📚',
    'emoji-rocket': '🚀',
};

const PublicProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                setLoading(true);
                console.log('📥 載入用戶資料:', userId);

                // 並行載入用戶資料、貼文和留言
                const [userData, userPosts, userComments] = await Promise.all([
                    getUserById(userId),
                    getUserPosts(userId),
                    getUserComments(userId, '') // 先傳空字串，等拿到用戶名稱後再查
                ]);

                setUser(userData);
                setPosts(userPosts);

                // 用用戶名稱重新查詢留言
                const commentsWithName = await getUserComments(
                    userId,
                    userData.nickname || userData.email?.split('@')[0] || '匿名用戶'
                );
                setComments(commentsWithName);

                setLoading(false);
            } catch (err) {
                console.error('❌ 載入用戶資料失敗:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        if (userId) {
            loadUserProfile();
        }
    }, [userId]);

    const getTabStyle = (tabName) => ({
        padding: '10px 20px',
        fontWeight: activeTab === tabName ? '700' : '500',
        color: activeTab === tabName ? COLOR_DEEP_NAVY : COLOR_OLIVE_GREEN,
        borderBottom: activeTab === tabName ? `3px solid ${COLOR_MORANDI_BROWN}` : '3px solid transparent',
        transition: 'border-bottom 0.3s, color 0.3s',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
    });

    if (loading) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: '50px', color: COLOR_OLIVE_GREEN }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    <div>載入中...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2 style={{ color: COLOR_BRICK_RED }}>❌ {error}</h2>
                    <button
                        onClick={() => navigate('/members')}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: COLOR_BRICK_RED,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        返回會員名錄
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div style={{ backgroundColor: COLOR_OFF_WHITE, minHeight: '100vh', padding: '30px 20px' }}>
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    {/* 返回按鈕 */}
                    <button
                        onClick={() => navigate('/members')}
                        style={{
                            marginBottom: '20px',
                            padding: '8px 15px',
                            backgroundColor: 'transparent',
                            border: `1px solid ${COLOR_LIGHT_BORDER}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: COLOR_OLIVE_GREEN,
                            fontSize: '14px'
                        }}
                    >
                        ← 返回會員名錄
                    </button>

                    {/* 個人資訊區塊 */}
                    <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', alignItems: 'flex-start' }}>
                        {/* 大頭貼 */}
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
                            {user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) ? (
                                <img
                                    src={user.avatar}
                                    alt="用戶頭像"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                AVATAR_MAPPING[user.avatar] || '👤'
                            )}
                        </div>

                        {/* 資訊詳情 */}
                        <div style={{ flex: 1 }}>
                            <h1 style={{
                                fontSize: '2em',
                                color: COLOR_DEEP_NAVY,
                                margin: '0 0 15px 0',
                                paddingBottom: '10px',
                                borderBottom: `3px solid ${COLOR_MORANDI_BROWN}`
                            }}>
                                {user.nickname || user.email?.split('@')[0] || '匿名用戶'}
                            </h1>

                            <div style={{ marginBottom: '15px', color: COLOR_OLIVE_GREEN, fontSize: '1em' }}>
                                <div style={{ marginBottom: '5px' }}>
                                    📧 電子郵件: <span style={{ color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{user.email}</span>
                                </div>
                                {user.first_name && user.last_name && (
                                    <div style={{ marginBottom: '5px' }}>
                                        👤 真實姓名: <span style={{ color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{user.last_name}{user.first_name}</span>
                                    </div>
                                )}
                                {user.gender && (
                                    <div>
                                        🚻 性別: <span style={{ color: COLOR_DEEP_NAVY, fontWeight: '500' }}>{user.gender}</span>
                                    </div>
                                )}
                            </div>

                            {user.bio && (
                                <p style={{
                                    fontSize: '16px',
                                    color: COLOR_DEEP_NAVY,
                                    padding: '15px',
                                    borderLeft: `3px solid ${COLOR_MORANDI_BROWN}`,
                                    backgroundColor: COLOR_OFF_WHITE,
                                    borderRadius: '5px',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    <strong>自我介紹:</strong> {user.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 貼文/留言切換 Tab */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${COLOR_LIGHT_BORDER}`, marginBottom: '25px' }}>
                        <div style={getTabStyle('posts')} onClick={() => setActiveTab('posts')}>
                            📝 貼文 ({posts.length})
                        </div>
                        <div style={getTabStyle('comments')} onClick={() => setActiveTab('comments')}>
                            💬 留言 ({comments.length})
                        </div>
                    </div>

                    {/* 內容列表 */}
                    {activeTab === 'posts' ? (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {posts.map(post => (
                                <div key={post.id} style={{
                                    padding: '15px',
                                    border: `1px solid ${COLOR_LIGHT_BORDER}`,
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <Link
                                        to={`/boards/${post.boardName.toLowerCase()}/${post.id}`}
                                        style={{
                                            fontSize: '1.2em',
                                            fontWeight: '600',
                                            color: COLOR_DEEP_NAVY,
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {post.title}
                                    </Link>
                                    <div style={{ fontSize: '0.9em', color: COLOR_OLIVE_GREEN, marginTop: '5px' }}>
                                        看板: {post.boardName} | 留言: {post.commentCount} | {new Date(post.createdAt).toLocaleDateString('zh-TW')}
                                    </div>
                                </div>
                            ))}
                            {posts.length === 0 && (
                                <p style={{ textAlign: 'center', color: COLOR_OLIVE_GREEN }}>尚無貼文</p>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {comments.map((comment, index) => (
                                <div key={index} style={{
                                    padding: '15px',
                                    border: `1px solid ${COLOR_LIGHT_BORDER}`,
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <p style={{ margin: '0 0 10px 0', color: COLOR_DEEP_NAVY }}>{comment.content}</p>
                                    <div style={{ fontSize: '0.9em', color: COLOR_OLIVE_GREEN }}>
                                        原貼文: {comment.postTitle} | {comment.date}
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <p style={{ textAlign: 'center', color: COLOR_OLIVE_GREEN }}>尚無留言</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PublicProfilePage;
