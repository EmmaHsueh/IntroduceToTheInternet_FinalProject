// src/components/MemberDirectory.js
import React, { useState, useEffect } from 'react';
import MemberCard from './MemberCard';

// 模擬會員資料 (在實際專案中，這裡需要從 API 獲取)
const mockMembers = [
    { id: 1, display_name: '匿名使用者A', avatar: '/avatar1.png', gender: '男性' },
    { id: 2, display_name: '課程達人', avatar: '/avatar2.png', gender: '女性' },
    { id: 3, display_name: '師聲管理員', avatar: '/avatar3.png', gender: '保密' },
    { id: 4, display_name: '活動愛好者', avatar: '/avatar4.png', gender: '女性' },
    // 根據 XML 設置，Profiles Per Page: 12
    { id: 5, display_name: '學生五號', avatar: '/avatar5.png', gender: '男性' },
    { id: 6, display_name: '社團瘋', avatar: '/avatar6.png', gender: '男性' },
    { id: 7, display_name: '穿搭小編', avatar: '/avatar7.png', gender: '女性' },
    { id: 8, display_name: '美食獵人', avatar: '/avatar8.png', gender: '保密' },
    { id: 9, display_name: '校園記者', avatar: '/avatar9.png', gender: '女性' },
    { id: 10, display_name: '代購王', avatar: '/avatar10.png', gender: '男性' },
    { id: 11, display_name: '愛貓人士', avatar: '/avatar11.png', gender: '女性' },
    { id: 12, display_name: '天氣觀察家', avatar: '/avatar12.png', gender: '男性' },
];

const MemberDirectory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMembers, setFilteredMembers] = useState(mockMembers);

    // 搜尋邏輯
    useEffect(() => {
        const results = mockMembers.filter(member =>
            member.display_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredMembers(results);
    }, [searchTerm]);

    // 樣式
    const searchInputStyle = { padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                師大會員名錄
            </h2>

            {/* 搜尋欄位 (UM 預設開啟) */}
            <div style={{ maxWidth: '600px', margin: '0 auto 30px auto' }}>
                <input
                    type="text"
                    placeholder="搜尋會員 (輸入暱稱或姓名)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchInputStyle}
                />
            </div>
            
            {/* 會員列表 (網格佈局) */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px', 
                justifyItems: 'center' 
            }}>
                {filteredMembers.map(member => (
                    <MemberCard key={member.id} member={member} />
                ))}
            </div>

            {/* 分頁 (UM 預設: 12 個 / 頁) */}
            {filteredMembers.length > 12 && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    {/* 這裡需要實作分頁邏輯 */}
                    <button style={{ padding: '10px 20px', margin: '0 10px' }}>上一頁</button>
                    <button style={{ padding: '10px 20px', margin: '0 10px' }}>下一頁</button>
                </div>
            )}
            
            {filteredMembers.length === 0 && (
                <p style={{ textAlign: 'center', color: 'gray' }}>查無符合條件的會員。</p>
            )}
        </div>
    );
};

export default MemberDirectory;