// src/pages/EventMapPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaFire, FaMapMarkerAlt, FaTimes, FaUsers, FaClock, FaComment } from 'react-icons/fa'; 
import Header from '../components/Header'; // 引入 Header 元件
// 假設您在 EventMapPage.js 中引入了 useAuth
import { useAuth } from '../contexts/AuthContext'; 

// 顏色和樣式定義 (保持不變)
const COLOR_MORANDI_HIGHLIGHT = '#1e2a38'; 
const COLOR_BRICK_RED = '#c9362a'; 
const COLOR_PRIMARY_TEXT = '#333333';
const COLOR_SECONDARY_TEXT = '#666666'; 
const COLOR_BORDER = '#dddddd';
const COLOR_ACCENT = '#ff6b6b'; 

// 校區數據 (保持不變)
const CAMPUS_DATA = {
    HEPING: { name: '和平校區 (本部)', mapUrl: '/images/hepingcampus1_0.jpg' }, 
    LIBRARY: { name: '圖書館校區', mapUrl: '/images/hepingcampus2_0.jpg' },
    GONGGUAN: { name: '公館校區', mapUrl: '/images/gonguan_0.jpg' },
};
const CAMPUS_KEYS = Object.keys(CAMPUS_DATA);

// 模擬即時揪團資料 (擴充數據結構：新增 creatorId, creatorName 和 comments)
const INITIAL_EVENTS = [
    { 
        id: 1, 
        campus: 'HEPING', 
        title: '綜合大樓前集合借書', 
        description: '急需圖書證幫忙借本書，5分鐘就好！',
        location: { x: 300, y: 150 },
        endTime: Date.now() + 1000 * 60 * 35,
        creatorId: 'user123',
        creatorName: '王小明', // 模擬發文者
        comments: [
            { id: 1, userId: 'user456', userName: '陳同學', text: '我剛好要過去，我可以幫忙！', timestamp: Date.now() - 1000 * 60 * 5 },
        ],
    },
    { 
        id: 2, 
        campus: 'LIBRARY', 
        title: '找人一起吃晚餐', 
        description: '圖書館校區附近找人吃麵，限2人。',
        location: { x: 50, y: 500 },
        endTime: Date.now() + 1000 * 60 * 60 * 1,
        creatorId: 'user789',
        creatorName: '林妹妹', // 模擬發文者
        comments: [],
    },
];

const EventMapPage = () => {
    const { currentUser, userProfile } = useAuth(); // 🌟 假設從 AuthContext 取得當前用戶資訊
    const [currentCampus, setCurrentCampus] = useState(CAMPUS_KEYS[0]);
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [postLocation, setPostLocation] = useState(null); 

    // ----------------------
    // 1. 即時性與自動清除邏輯 (不變)
    // ----------------------
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setEvents(prevEvents => 
                prevEvents.filter(event => event.endTime > now)
            );
            
            if (selectedEvent && selectedEvent.endTime <= now) {
                setSelectedEvent(null);
            }
        }, 1000); 

        return () => clearInterval(interval);
    }, [selectedEvent]);


    // ----------------------
    // 2. 倒數計時器邏輯 (不變)
    // ----------------------
    const formatTimeRemaining = useCallback((endTime) => {
        const remainingMs = endTime - Date.now();
        if (remainingMs <= 0) return '已結束/已過期';

        const seconds = Math.floor((remainingMs / 1000) % 60);
        const minutes = Math.floor((remainingMs / 1000 / 60) % 60);
        const hours = Math.floor(remainingMs / 1000 / 60 / 60);
        const days = Math.floor(remainingMs / 1000 / 60 / 60 / 24); 
        
        const pad = (num) => String(num).padStart(2, '0');
        
        if (days > 0) {
            return `剩 ${days} 天 ${pad(hours % 24)} 小時`;
        } else if (hours > 0) {
            return `剩 ${hours} 小時 ${pad(minutes)} 分`;
        } else if (minutes > 0) {
            return `剩 ${pad(minutes)} 分 ${pad(seconds)} 秒`;
        } else {
            return `剩 ${pad(seconds)} 秒`;
        }
    }, []);

    // ----------------------
    // 3. 處理新揪團發布 (新增發文者資訊)
    // ----------------------
    const handlePostEvent = (newTitle, newDescription, newEndTime, x, y) => {
        if (!currentUser) {
            alert("請先登入才能發布揪團！");
            return;
        }

        const newEvent = {
            id: Date.now(), 
            campus: currentCampus,
            title: newTitle,
            description: newDescription,
            location: { x, y },
            endTime: Date.parse(newEndTime),
            creatorId: currentUser.uid,
            creatorName: userProfile?.name || currentUser.email.split('@')[0], // 🌟 顯示發文者
            comments: [],
        };
        setEvents(prev => [...prev, newEvent]);
        setIsPosting(false);
        setPostLocation(null); 
    };

    // ----------------------
    // 4. 處理新留言
    // ----------------------
    const handleNewComment = (eventId, commentText) => {
        if (!currentUser) {
            alert("請先登入才能留言！");
            return;
        }

        const newComment = {
            id: Date.now(),
            userId: currentUser.uid,
            userName: userProfile?.name || currentUser.email.split('@')[0],
            text: commentText,
            timestamp: Date.now(),
        };

        setEvents(prevEvents => prevEvents.map(event => 
            event.id === eventId
                ? { ...event, comments: [...event.comments, newComment] }
                : event
        ));
    };

    // ----------------------
    // 5. 處理地圖點擊事件
    // ----------------------
    const handleMapClick = (e) => {
        if (!currentUser) {
            alert("請先登入才能在地圖上發起揪團！");
            return;
        }
        if (isPosting) return;

        // 避免點擊 Marker 或 InfoCard 觸發發文
        if (e.target.closest('[data-is-marker="true"]') || e.target.closest('[data-is-infocard="true"]')) {
            return;
        }

        const mapRect = e.currentTarget.getBoundingClientRect();
        // 將點擊位置轉換為 1000x600 的相對座標
        const relativeX = Math.round(((e.clientX - mapRect.left) / mapRect.width) * 1000);
        const relativeY = Math.round(((e.clientY - mapRect.top) / mapRect.height) * 600);
        
        setPostLocation({ x: relativeX, y: relativeY });
        setIsPosting(true);
        setSelectedEvent(null);
    };
    
    // 僅顯示當前校區的活動
    const filteredEvents = events.filter(event => event.campus === currentCampus);

    return (
        <>
            <Header />
            <div style={styles.container}>
                <h2 style={styles.title}><FaMapMarkerAlt style={{ marginRight: '10px' }} /> 即時校園揪團地圖</h2>
                
                {/* 校區切換介面 */}
                <div style={styles.campusSelector}>
                    {CAMPUS_KEYS.map(key => (
                        <button
                            key={key}
                            onClick={() => {
                                setCurrentCampus(key);
                                setSelectedEvent(null);
                            }}
                            style={{
                                ...styles.campusButton,
                                backgroundColor: currentCampus === key ? COLOR_MORANDI_HIGHLIGHT : '#f5f5f5',
                                color: currentCampus === key ? 'white' : COLOR_PRIMARY_TEXT,
                            }}
                        >
                            {CAMPUS_DATA[key].name}
                        </button>
                    ))}
                    
                </div>

                {/* 地圖顯示區域  */}
                <div 
                    style={styles.mapContainer} 
                    onClick={handleMapClick} 
                >
                    <img 
                        src={CAMPUS_DATA[currentCampus].mapUrl} 
                        alt={`${CAMPUS_DATA[currentCampus].name} 地圖`} 
                        style={styles.mapImage}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder_map.png'; }} 
                    />

                    {/* 顯示所有活動標籤 */}
                    {filteredEvents.map(event => (
                        <div 
                            key={event.id}
                            onClick={(e) => {
                                e.stopPropagation(); 
                                setSelectedEvent(event);
                            }}
                            data-is-marker="true" 
                            style={{ 
                                ...styles.eventMarker, 
                                left: `${event.location.x / 1000 * 100}%`,
                                top: `${event.location.y / 600 * 100}%`,
                            }}
                            title={event.title}
                        >
                            <FaFire size={16} color="white" />
                        </div>
                    ))}

                    {/* 資訊/留言卡片 (點擊展開) */}
                    {selectedEvent && (
                        <EventInfoCard
                            event={selectedEvent}
                            onClose={() => setSelectedEvent(null)}
                            formatTimeRemaining={formatTimeRemaining}
                            onCommentSubmit={handleNewComment}
                            currentUser={currentUser}
                            styles={styles} // 傳遞樣式
                        />
                    )}
                </div>

                {/* 彈出式表單：發起揪團 */}
                {isPosting && postLocation && <PostEventForm 
                    onClose={() => {
                        setIsPosting(false);
                        setPostLocation(null);
                    }} 
                    onSubmit={handlePostEvent} 
                    currentLocation={postLocation} 
                    styles={styles} // 傳遞樣式
                />}
            </div>
        </>
    );
};

// ----------------------
// 輔助元件：活動資訊與留言卡片 🌟 NEW COMPONENT
// ----------------------
const EventInfoCard = ({ event, onClose, formatTimeRemaining, onCommentSubmit, currentUser, styles }) => {
    const [commentText, setCommentText] = useState('');
    const mapWidth = 1000;
    const mapHeight = 600;

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim() === '') return;
        onCommentSubmit(event.id, commentText.trim());
        setCommentText('');
    };
    
    // 判斷卡片是否會超出右邊界，如果是，將卡片顯示在標記左邊
    const isNearRightEdge = event.location.x > (mapWidth - 300); 
    const cardLeftPosition = isNearRightEdge 
        ? `${event.location.x / mapWidth * 100 - 2}%` // 標記左側
        : `${event.location.x / mapWidth * 100 + 2}%`; // 標記右側

    return (
        <div 
            data-is-infocard="true"
            style={{
                ...styles.infoCard,
                left: cardLeftPosition,
                top: `${event.location.y / mapHeight * 100 - 8}%`, 
                width: '350px', // 加寬以容納留言區
                maxHeight: '450px',
                overflowY: 'auto',
                transform: isNearRightEdge ? 'translateX(-100%)' : 'none', // 如果靠右，向左平移
            }}
        >
            <button onClick={onClose} style={styles.closeButton}>
                <FaTimes />
            </button>
            <h4 style={styles.cardTitle}>{event.title}</h4>
            <p style={{ ...styles.cardDescription, color: COLOR_MORANDI_HIGHLIGHT, fontWeight: 'bold' }}>
                發文者: **{event.creatorName}**
            </p>
            <p style={styles.cardDescription}>{event.description}</p>
            
            <div style={styles.timer}>
                <FaClock style={{ marginRight: '5px' }} /> 
                **{formatTimeRemaining(event.endTime)}**
            </div>
            
            {/* 留言區 🌟 */}
            <div style={commentStyles.commentSection}>
                <h5 style={commentStyles.commentTitle}><FaComment style={{ marginRight: '5px' }} /> 留言 ({event.comments.length})</h5>
                <div style={commentStyles.commentList}>
                    {event.comments.length === 0 ? (
                        <p style={commentStyles.noComment}>尚無留言，成為第一個加入的人吧！</p>
                    ) : (
                        event.comments.slice(-5).map(comment => ( // 只顯示最新的 5 則
                            <div key={comment.id} style={commentStyles.commentItem}>
                                <span style={commentStyles.commentUser}>{comment.userName}:</span> {comment.text}
                            </div>
                        ))
                    )}
                </div>

                {/* 留言輸入框 🌟 */}
                {currentUser ? (
                    <form onSubmit={handleCommentSubmit} style={commentStyles.commentForm}>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value.slice(0, 50))}
                            placeholder="留下你的訊息... (限50字)"
                            style={commentStyles.commentInput}
                            rows="2"
                            required
                        />
                        <button type="submit" style={commentStyles.commentButton}>
                            回覆
                        </button>
                    </form>
                ) : (
                    <p style={{ ...commentStyles.noComment, color: COLOR_BRICK_RED }}>請登入後才能回覆</p>
                )}
            </div>
        </div>
    );
};

// ----------------------
// 輔助元件：發布揪團表單 (移除時間限制，改為使用傳入的座標)
// ----------------------
const PostEventForm = ({ onClose, onSubmit, currentLocation, styles }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endTime, setEndTime] = useState(''); 
    
    // 顯示用戶點擊的位置
    const locationInput = `已選位置: X=${currentLocation.x}, Y=${currentLocation.y}`;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!title || !description || !endTime) {
            alert("請填寫所有欄位！");
            return;
        }

        onSubmit(title, description, endTime, currentLocation.x, currentLocation.y);
    };

    // 最小時間為現在
    const now = new Date();
    const minTime = now.toISOString().slice(0, 16); 

    return (
        <div style={styles.overlay}>
            <div style={styles.postForm}>
                <h3 style={{ borderBottom: `1px solid ${COLOR_BORDER}`, paddingBottom: '10px' }}>發起即時揪團</h3>
                <form onSubmit={handleSubmit}>
                    
                    <label style={styles.label}>主題/標題 (限15字):</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value.slice(0, 15))}
                        style={styles.input}
                        required
                    />

                    <label style={styles.label}>說明文字 (限100字):</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                        style={{ ...styles.input, height: '80px' }}
                        required
                    />

                    <label style={styles.label}>截止時間 (無最長限制):</label>
                    <input 
                        type="datetime-local" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)}
                        min={minTime}
                        style={styles.input}
                        required
                    />
                    
                    <label style={styles.label}>活動地點:</label>
                    <input 
                        type="text" 
                        value={locationInput} 
                        readOnly 
                        style={styles.input}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={styles.cancelButton}>
                            取消
                        </button>
                        <button type="submit" style={styles.submitButton}>
                            發布揪團
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ----------------------
// 樣式定義 (新增留言區樣式)
// ----------------------
const commentStyles = {
    commentSection: {
        marginTop: '15px',
        paddingTop: '10px',
        borderTop: `1px solid ${COLOR_BORDER}`,
    },
    commentTitle: {
        fontSize: '14px',
        margin: '0 0 10px 0',
        color: COLOR_MORANDI_HIGHLIGHT,
        display: 'flex',
        alignItems: 'center',
    },
    commentList: {
        maxHeight: '120px',
        overflowY: 'auto',
        paddingRight: '5px',
        marginBottom: '10px',
        border: `1px solid ${COLOR_BORDER}`,
        padding: '8px',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
    },
    commentItem: {
        fontSize: '13px',
        marginBottom: '5px',
        lineHeight: '1.4',
        wordBreak: 'break-word',
    },
    commentUser: {
        fontWeight: 'bold',
        color: COLOR_PRIMARY_TEXT,
    },
    noComment: {
        fontSize: '13px',
        color: COLOR_SECONDARY_TEXT,
        textAlign: 'center',
        margin: '5px 0',
    },
    commentForm: {
        display: 'flex',
        gap: '5px',
        marginTop: '10px',
    },
    commentInput: {
        flexGrow: 1,
        padding: '5px',
        border: `1px solid ${COLOR_BORDER}`,
        borderRadius: '5px',
        resize: 'none',
        fontSize: '13px',
    },
    commentButton: {
        backgroundColor: COLOR_MORANDI_HIGHLIGHT,
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '13px',
        alignSelf: 'flex-start',
    }
};

// 原始樣式定義 (保持不變)
const styles = {
    // ... (保持 EventMapPage.js 提供的原始 styles 內容)
    container: {
        maxWidth: '1200px',
        margin: '30px auto',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
    title: {
        color: COLOR_MORANDI_HIGHLIGHT,
        borderBottom: `2px solid ${COLOR_BORDER}`,
        paddingBottom: '10px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
    },
    campusSelector: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    },
    campusButton: {
        padding: '10px 15px',
        border: `1px solid ${COLOR_BORDER}`,
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        fontSize: '14px',
    },
    postButton: {
        backgroundColor: COLOR_ACCENT,
        color: 'white',
        border: 'none',
        marginLeft: 'auto',
    },
    mapContainer: {
        position: 'relative',
        width: '100%',
        minHeight: '600px', 
        backgroundColor: '#eee', 
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'crosshair', 
    },
    mapImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.7, 
        pointerEvents: 'none',
    },
    eventMarker: {
        position: 'absolute',
        width: '24px',
        height: '24px',
        backgroundColor: COLOR_ACCENT,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 10px 3px ${COLOR_ACCENT}`,
    },
    infoCard: {
        position: 'absolute',
        backgroundColor: 'white',
        border: `1px solid ${COLOR_ACCENT}`,
        borderRadius: '8px',
        padding: '15px',
        maxWidth: '250px',
        zIndex: 20,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
    cardTitle: {
        margin: '0 0 5px 0',
        color: COLOR_MORANDI_HIGHLIGHT,
        fontSize: '16px',
    },
    cardDescription: {
        margin: '0 0 10px 0',
        color: COLOR_SECONDARY_TEXT,
        fontSize: '14px',
    },
    timer: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: COLOR_BRICK_RED,
        display: 'flex',
        alignItems: 'center',
        marginTop: '10px',
        borderTop: `1px dashed ${COLOR_BORDER}`,
        paddingTop: '5px',
    },
    closeButton: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: COLOR_SECONDARY_TEXT,
        fontSize: '16px',
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    postForm: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        width: '400px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
    },
    label: {
        display: 'block',
        marginTop: '15px',
        marginBottom: '5px',
        fontWeight: '500',
        color: COLOR_PRIMARY_TEXT,
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: `1px solid ${COLOR_BORDER}`,
        borderRadius: '5px',
        boxSizing: 'border-box',
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: COLOR_MORANDI_HIGHLIGHT,
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#ccc',
        color: COLOR_PRIMARY_TEXT,
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    }
};

export default EventMapPage;