// src/components/MemberDirectory.js
import React, { useState, useEffect } from 'react';
import MemberCard from './MemberCard';
import { getAllUsers, searchUsers } from '../services/userService';
import Icon from './Icons';

const MemberDirectory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [allMembers, setAllMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 載入所有會員資料
    useEffect(() => {
        const loadMembers = async () => {
            try {
                setLoading(true);
                console.log('開始載入會員名錄...');
                const users = await getAllUsers();
                setAllMembers(users);
                setFilteredMembers(users);
                setLoading(false);
                console.log(`成功載入 ${users.length} 位會員`);
            } catch (err) {
                console.error('載入會員失敗:', err);
                setError('載入會員資料失敗，請稍後再試');
                setLoading(false);
            }
        };

        loadMembers();
    }, []);

    // 搜尋邏輯
    useEffect(() => {
        if (!searchTerm.trim()) {
            // 沒有搜尋詞時顯示所有會員
            setFilteredMembers(allMembers);
        } else {
            // 在本地端過濾（已經載入所有資料）
            const lowerKeyword = searchTerm.toLowerCase();
            const results = allMembers.filter(member => {
                const nickname = (member.nickname || '').toLowerCase();
                const email = (member.email || '').toLowerCase();
                const firstName = (member.first_name || '').toLowerCase();
                const lastName = (member.last_name || '').toLowerCase();

                return nickname.includes(lowerKeyword) ||
                       email.includes(lowerKeyword) ||
                       firstName.includes(lowerKeyword) ||
                       lastName.includes(lowerKeyword);
            });
            setFilteredMembers(results);
        }
    }, [searchTerm, allMembers]);

    // 樣式
    const searchInputStyle = { padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };

    // 如果發生錯誤
    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: '#c9362a' }}>{error}</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                師大會員名錄
            </h2>

            {/* 搜尋欄位 */}
            <div style={{ maxWidth: '600px', margin: '0 auto 30px auto' }}>
                <input
                    type="text"
                    placeholder="搜尋會員 (輸入暱稱、姓名或 Email)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchInputStyle}
                    disabled={loading}
                />
            </div>

            {/* 載入狀態 */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    <div>載入會員資料中...</div>
                </div>
            ) : (
                <>
                    {/* 會員列表 (網格佈局) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        justifyItems: 'center'
                    }}>
                        {filteredMembers.map(member => (
                            <MemberCard
                                key={member.id}
                                member={{
                                    id: member.id,
                                    display_name: member.nickname || member.email?.split('@')[0] || '匿名用戶',
                                    avatar: member.avatar,
                                    gender: member.gender || '保密',
                                    email: member.email
                                }}
                            />
                        ))}
                    </div>

                    {/* 空狀態 */}
                    {filteredMembers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                                <Icon type="users" size={48} color="#666" />
                            </div>
                            <p>查無符合條件的會員</p>
                        </div>
                    )}

                    {/* 顯示會員總數 */}
                    {filteredMembers.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontSize: '14px' }}>
                            共找到 {filteredMembers.length} 位會員
                            {searchTerm && ` (從 ${allMembers.length} 位會員中篩選)`}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MemberDirectory;