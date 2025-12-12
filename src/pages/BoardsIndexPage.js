// src/pages/BoardsIndexPage.js  看板(所有討論區)
import React from 'react';
import { Link } from 'react-router-dom'; // 導入 Link 組件
import Header from '../components/Header';
import BoardNav from '../components/BoardNav';

// ------------------------------------
// 統一配色定義 (淺色活潑大學風格)
// ------------------------------------
const COLOR_DEEP_NAVY = '#1e2a38';     // 深藍/黑 - 主要文字/標題
const COLOR_OLIVE_GREEN = '#454f3b';   // 深橄欖綠 - 次要文字 (描述)
const COLOR_MORANDI_BROWN = '#a38c6b'; // 莫蘭迪棕 - 強調線/邊框/Hover
const COLOR_OFF_WHITE = '#f3f3e6';     // 米黃/淺色 - 主要背景色
const COLOR_BRICK_RED = '#c9362a';     // 磚紅 - 熱度/統計數據強調色
const COLOR_LIGHT_BORDER = '#e0e0e0';  // 極淺邊框

// 定義所有看板的資料結構 (不變)
const boardData = [
    { 
        id: 'food', 
        name: '美食看板', 
        description: '分享校園周邊及台北美食的心得與推薦，讓你的味蕾不孤單！',
        stats: '貼文: 1200 | 今日: 50'
    },
    { 
        id: 'weather', 
        name: '國際交流區', 
        description: '交流國家大小事，分享你的家鄉',
        stats: '貼文: 450 | 今日: 15'
    },
    { 
        id: 'events', 
        name: '活動情報站', 
        description: '校內外大小活動、講座、演講資訊集中討論區。',
        stats: '貼文: 890 | 今日: 30'
    },
    { 
        id: 'clubs', 
        name: '社團與招募', 
        description: '社團活動公告、新成員招募、社團心得交流。',
        stats: '貼文: 620 | 今日: 25'
    },
    { 
        id: 'courses', 
        name: '課程討論區', 
        description: '課堂評價、教授推薦、考試心得分享。',
        stats: '貼文: 1500 | 今日: 75'
    },
    { 
        id: 'outfit', 
        name: '宿舍生活', 
        description: '分享你的宿舍生活，讓每天不孤單',
        stats: '貼文: 300 | 今日: 10'
    },
    { 
        id: 'other', 
        name: '綜合討論區', 
        description: '所有無法歸類的雜談、心情抒發、閒聊等。',
        stats: '貼文: 2000 | 今日: 100'
    },
];

// 單個看板的卡片組件 (應用新風格)
const BoardCard = ({ board }) => (
    <Link 
        to={`/boards/${board.id}`}
        style={{ 
            textDecoration: 'none',
            color: COLOR_DEEP_NAVY,
            display: 'block',
            padding: '25px', // 增加內距，更寬鬆活潑
            border: `1px solid ${COLOR_MORANDI_BROWN}`, // 使用莫蘭迪棕邊框
            borderRadius: '10px',
            marginBottom: '15px',
            transition: 'box-shadow 0.3s, transform 0.2s',
            backgroundColor: 'white', // 卡片內使用純白
        }}
        onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = `0 6px 15px ${COLOR_MORANDI_BROWN}55`; // 柔和的莫蘭迪棕陰影
            e.currentTarget.style.transform = 'translateY(-3px)'; // 稍微抬升
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; // 輕微回歸
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        <h3 style={{ margin: '0 0 8px 0', color: COLOR_DEEP_NAVY, fontWeight: '600' }}>{board.name}</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: 'small', color: COLOR_OLIVE_GREEN, fontWeight: '400' }}>{board.description}</p>
        <div style={{ 
            fontSize: 'small', 
            color: COLOR_BRICK_RED, // **熱度數據使用磚紅強調**
            fontWeight: 'bold', 
            borderTop: `1px solid ${COLOR_LIGHT_BORDER}`, 
            paddingTop: '8px' 
        }}>
            {board.stats}
        </div>
    </Link>
);


const BoardsIndexPage = () => (
    <div style={{ backgroundColor: COLOR_OFF_WHITE, minHeight: '100vh' }}> {/* 設置背景色 */}
        <Header />
        <main style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }}>
            
            <BoardNav />
            
            <h2 style={{ 
                borderBottom: `3px solid ${COLOR_MORANDI_BROWN}`, // 莫蘭迪棕底部強調線
                color: COLOR_DEEP_NAVY,
                paddingBottom: '15px', 
                marginTop: '40px', // 增加間距
                marginBottom: '30px',
                fontWeight: '500' 
            }}>
                <span style={{ fontSize: '1.2em', marginRight: '10px' }}></span> 所有討論區索引
            </h2>
            
            <div className="board-cards-container" style={{ 
                marginTop: '20px', 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // 響應式卡片佈局
                gap: '20px' // 卡片間距
            }}>
                {boardData.map(board => (
                    <BoardCard key={board.id} board={board} />
                ))}
            </div>

            {/* 提示文字區塊 */}
            <div style={{ 
                textAlign: 'center', 
                padding: '40px 0 20px 0', 
                fontSize: '1em', 
                color: COLOR_OLIVE_GREEN 
            }}>
                <p>找不到您需要的？試著探索或使用上方的導覽功能。</p>
            </div>
            
        </main>
    </div>
);

export default BoardsIndexPage;