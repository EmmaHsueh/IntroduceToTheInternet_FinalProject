// src/pages/EventMapPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaFire, FaMapMarkerAlt, FaTimes, FaUsers, FaClock } from 'react-icons/fa'; 
import Header from '../components/Header'; // 引入 Header 元件

// 顏色和樣式定義
const COLOR_MORANDI_HIGHLIGHT = '#1e2a38'; 
const COLOR_BRICK_RED = '#c9362a'; 
const COLOR_PRIMARY_TEXT = '#333333';
const COLOR_SECONDARY_TEXT = '#666666'; 
const COLOR_BORDER = '#dddddd';
const COLOR_ACCENT = '#ff6b6b'; 

// 校區數據 (已替換為您的實際圖片相對路徑)
const CAMPUS_DATA = {
    HEPING: { name: '和平校區 (本部)', mapUrl: '/images/hepingcampus1_0.jpg' }, 
    LIBRARY: { name: '圖書館校區', mapUrl: '/images/hepingcampus2_0.jpg' },
    GONGGUAN: { name: '公館校區', mapUrl: '/images/gonguan_0.jpg' },
};
const CAMPUS_KEYS = Object.keys(CAMPUS_DATA);

// 模擬即時揪團資料 (初始數據)
const INITIAL_EVENTS = [
    { 
        id: 1, 
        campus: 'HEPING', 
        title: '綜合大樓前集合借書', 
        description: '急需圖書證幫忙借本書，5分鐘就好！',
        location: { x: 300, y: 150 }, // 模擬地圖上的座標 (基於 1000x600 像素的比例)
        endTime: Date.now() + 1000 * 60 * 35, // 35分鐘後過期
    },
    { 
        id: 2, 
        campus: 'LIBRARY', 
        title: '找人一起吃晚餐', 
        description: '圖書館校區附近找人吃麵，限2人。',
        location: { x: 50, y: 500 },
        endTime: Date.now() + 1000 * 60 * 60 * 1, // 1小時後過期
    },
];

const EventMapPage = () => {
    const [currentCampus, setCurrentCampus] = useState(CAMPUS_KEYS[0]);
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    // 儲存用戶點擊地圖時的座標，用於發布活動
    const [postLocation, setPostLocation] = useState(null); 

    // ----------------------
    // 1. 即時性與自動清除邏輯
    // ----------------------
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            // 過濾掉所有已經過期的活動 (實現自動消失)
            setEvents(prevEvents => 
                prevEvents.filter(event => event.endTime > now)
            );
            
            // 如果當前點擊的活動過期了，關閉資訊卡片
            if (selectedEvent && selectedEvent.endTime <= now) {
                setSelectedEvent(null);
            }
        }, 1000); 

        return () => clearInterval(interval);
    }, [selectedEvent]);


    // ----------------------
    // 2. 倒數計時器邏輯
    // ----------------------
    const formatTimeRemaining = useCallback((endTime) => {
        const remainingMs = endTime - Date.now();
        if (remainingMs <= 0) return '已結束/已過期';

        const seconds = Math.floor((remainingMs / 1000) % 60);
        const minutes = Math.floor((remainingMs / 1000 / 60) % 60);
        const hours = Math.floor(remainingMs / 1000 / 60 / 60);
        const days = Math.floor(remainingMs / 1000 / 60 / 60 / 24); // 新增天數計算
        
        const pad = (num) => String(num).padStart(2, '0');
        
        if (days > 0) {
            return `剩 ${days} 天 ${pad(hours % 24)} 小時`; // 如果超過一天顯示天數
        } else if (hours > 0) {
            return `剩 ${hours} 小時 ${pad(minutes)} 分`;
        } else if (minutes > 0) {
            return `剩 ${pad(minutes)} 分 ${pad(seconds)} 秒`;
        } else {
            return `剩 ${pad(seconds)} 秒`;
        }
    }, []);

    // ----------------------
    // 3. 處理新揪團發布
    // ----------------------
    const handlePostEvent = (newTitle, newDescription, newEndTime, x, y) => {
        // 🚨 這裡移除了三小時的時間限制檢查
        
        const newEvent = {
            id: Date.now(), // 使用更獨特的 ID
            campus: currentCampus,
            title: newTitle,
            description: newDescription,
            location: { x, y },
            endTime: Date.parse(newEndTime),
        };
        setEvents(prev => [...prev, newEvent]);
        setIsPosting(false);
        setPostLocation(null); // 清除暫存的座標
    };

    // ----------------------
    // 4. 處理地圖點擊事件 🌟
    // ----------------------
    const handleMapClick = (e) => {
        // 如果表單已經彈出，不重複處理
        if (isPosting) return;

        // 檢查點擊是否來自 EventMarker 或 InfoCard
        if (e.target.closest('[data-is-marker="true"]') || e.target.closest('[data-is-infocard="true"]')) {
            return;
        }

        const mapRect = e.currentTarget.getBoundingClientRect();
        // 根據地圖的實際尺寸計算相對座標 (0-1000, 0-600) 的比例
        const relativeX = Math.round(((e.clientX - mapRect.left) / mapRect.width) * 1000);
        const relativeY = Math.round(((e.clientY - mapRect.top) / mapRect.height) * 600);
        
        setPostLocation({ x: relativeX, y: relativeY });
        setIsPosting(true);
        setSelectedEvent(null); // 確保資訊卡片關閉
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
                    
                    {/* 發起揪團按鈕 (保留，但點擊地圖也能發起) */}
                    <button
                        onClick={() => {
                            setPostLocation({ x: 500, y: 300 }); // 預設中央座標
                            setIsPosting(true);
                        }}
                        style={{ ...styles.campusButton, ...styles.postButton }}
                    >
                        <FaUsers style={{ marginRight: '5px' }} /> 發起揪團
                    </button>
                </div>

                {/* 地圖顯示區域  */}
                <div 
                    style={styles.mapContainer} 
                    onClick={handleMapClick} // 🌟 新增地圖點擊事件
                >
                    {/* 模擬地圖背景 */}
                    <img 
                        src={CAMPUS_DATA[currentCampus].mapUrl} 
                        alt={`${CAMPUS_DATA[currentCampus].name} 地圖`} 
                        style={styles.mapImage}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder_map.png'; }} 
                    />

                    {/* 顯示所有活動標籤 (使用 FaFire 圖標增加醒目度) */}
                    {filteredEvents.map(event => (
                        <div 
                            key={event.id}
                            onClick={(e) => {
                                e.stopPropagation(); // 阻止事件傳播到地圖容器的 onClick
                                setSelectedEvent(event);
                            }}
                            data-is-marker="true" // 標記為 Marker
                            style={{ 
                                ...styles.eventMarker, 
                                left: `${event.location.x / 1000 * 100}%`, // 使用百分比定位
                                top: `${event.location.y / 600 * 100}%`,
                            }}
                            title={event.title}
                        >
                            <FaFire size={16} color="white" />
                        </div>
                    ))}

                    {/* 資訊卡片 (點擊展開) */}
                    {selectedEvent && (
                        <div 
                            data-is-infocard="true" // 標記為 InfoCard
                            style={{
                                ...styles.infoCard,
                                left: `${selectedEvent.location.x / 1000 * 100 + 2}%`, // 調整定位使其位於標記右側
                                top: `${selectedEvent.location.y / 600 * 100 - 8}%`, 
                            }}
                        >
                            <button onClick={() => setSelectedEvent(null)} style={styles.closeButton}>
                                <FaTimes />
                            </button>
                            <h4 style={styles.cardTitle}>{selectedEvent.title}</h4>
                            <p style={styles.cardDescription}>{selectedEvent.description}</p>
                            
                            {/* 倒數計時顯示 */}
                            <div style={styles.timer}>
                                <FaClock style={{ marginRight: '5px' }} /> 
                                **{formatTimeRemaining(selectedEvent.endTime)}**
                            </div>
                        </div>
                    )}
                </div>

                {/* 彈出式表單：發起揪團 */}
                {isPosting && postLocation && <PostEventForm 
                    onClose={() => {
                        setIsPosting(false);
                        setPostLocation(null);
                    }} 
                    onSubmit={handlePostEvent} 
                    // 傳遞點擊的座標給表單
                    currentLocation={postLocation} 
                />}
            </div>
        </>
    );
};

// ----------------------
// 輔助元件：發布揪團表單 (移除時間限制)
// ----------------------
const PostEventForm = ({ onClose, onSubmit, currentLocation }) => {
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

        // 使用傳入的座標 (currentLocation)
        onSubmit(title, description, endTime, currentLocation.x, currentLocation.y);
    };

    // 最小時間為現在
    const now = new Date();
    const minTime = now.toISOString().slice(0, 16); 
    // 🚨 移除 maxTime 限制

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
                        // 🚨 移除 max 屬性
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
// 樣式定義 (保持不變)
// ----------------------
const styles = {
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
        cursor: 'crosshair', // 🌟 新增十字游標，提示可點擊
    },
    mapImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.7, 
        pointerEvents: 'none', // 確保點擊事件發生在 mapContainer 上
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