// src/pages/MatchingPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers } from '../services/userService';
import {
  matchLanguageExchange,
  matchStudyBuddyOrRoommate,
  matchCulturalExperience,
  updateMatchingPreferences
} from '../services/matchingService';
import { Link } from 'react-router-dom';

// 顏色常數
const COLORS = {
  DEEP_NAVY: '#1e2a38',
  OLIVE_GREEN: '#454f3b',
  MORANDI_BROWN: '#a38c6b',
  BRICK_RED: '#c9362a',
  OFF_WHITE: '#f3f3e6',
  LIGHT_BEIGE: '#faf8f3',
};

// ==========================================
// 🎯 主頁面組件
// ==========================================
const MatchingPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [selectedMatchType, setSelectedMatchType] = useState(null); // 'language' / 'study' / 'roommate' / 'cultural'
  const [matchResults, setMatchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 載入所有用戶
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('載入用戶失敗:', error);
      }
    };
    loadUsers();
  }, []);

  // 執行配對
  const handleMatch = (matchType) => {
    if (!currentUser) {
      alert('請先登入才能使用配對功能');
      return;
    }

    setLoading(true);
    setSelectedMatchType(matchType);

    // 🔥 除錯日誌
    console.log('=== 開始配對 ===');
    console.log('配對類型:', matchType);
    console.log('當前用戶資料:', userProfile);
    console.log('所有用戶數量:', allUsers.length);

    setTimeout(() => {
      let results = [];

      if (matchType === 'language') {
        console.log('執行語言交換配對...');
        results = matchLanguageExchange(userProfile, allUsers);
      } else if (matchType === 'study') {
        console.log('執行學習夥伴配對...');
        results = matchStudyBuddyOrRoommate(userProfile, allUsers, 'study');
      } else if (matchType === 'roommate') {
        console.log('執行室友配對...');
        results = matchStudyBuddyOrRoommate(userProfile, allUsers, 'roommate');
      } else if (matchType === 'cultural') {
        console.log('執行文化體驗配對...');
        results = matchCulturalExperience(userProfile, allUsers);
      }

      console.log('配對結果數量:', results.length);
      console.log('配對結果詳情:', results);
      console.log('=== 配對完成 ===');

      setMatchResults(results);
      setLoading(false);
    }, 800);
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: COLORS.LIGHT_BEIGE }}>
        {/* Hero Section */}
        <HeroSection />

        {/* 配對類型選擇 */}
        {!selectedMatchType && (
          <MatchTypeSelection onSelectMatch={handleMatch} />
        )}

        {/* 配對結果 */}
        {selectedMatchType && (
          <MatchResults
            matchType={selectedMatchType}
            results={matchResults}
            loading={loading}
            onBack={() => {
              setSelectedMatchType(null);
              setMatchResults([]);
            }}
            currentUser={currentUser}
          />
        )}
      </main>
    </>
  );
};

// ==========================================
// 🎨 Hero Section
// ==========================================
const HeroSection = () => (
  <section style={{
    background: `linear-gradient(135deg, ${COLORS.DEEP_NAVY} 0%, ${COLORS.OLIVE_GREEN} 100%)`,
    color: COLORS.OFF_WHITE,
    padding: '80px 20px 60px',
    textAlign: 'center',
  }}>
    <h1 style={{
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      marginBottom: '15px',
      fontWeight: '800',
    }}>
      智慧配對系統 🤝
    </h1>
    <p style={{
      fontSize: 'clamp(1rem, 2vw, 1.3rem)',
      opacity: 0.9,
      maxWidth: '700px',
      margin: '0 auto',
    }}>
      Smart Matching System
    </p>
    <p style={{
      fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
      marginTop: '20px',
      opacity: 0.85,
    }}>
      用 AI 演算法幫你找到最適合的語言交換夥伴、學習小組或室友！
    </p>
  </section>
);

// ==========================================
// 🎯 配對類型選擇卡片
// ==========================================
const MatchTypeSelection = ({ onSelectMatch }) => {
  const matchTypes = [
    {
      id: 'language',
      icon: '🗣️',
      titleZh: '語言交換配對',
      titleEn: 'Language Exchange',
      descZh: '找到母語者練習中英文，互相學習、互相進步',
      descEn: 'Find native speakers to practice languages',
      features: ['母語互補配對', '語言程度匹配', '共同興趣篩選', '時間彈性安排'],
      color: '#FF6B6B',
    },
    {
      id: 'study',
      icon: '📚',
      titleZh: '學習夥伴配對',
      titleEn: 'Study Buddy Matching',
      descZh: '根據科系、課程、學習習慣找到最佳讀書夥伴',
      descEn: 'Find study partners by major, courses & habits',
      features: ['相同科系優先', '共同課程媒合', '學習習慣匹配', '專題合作夥伴'],
      color: '#4ECDC4',
    },
    {
      id: 'roommate',
      icon: '🏠',
      titleZh: '室友配對',
      titleEn: 'Roommate Finder',
      descZh: '根據生活習慣、預算、作息找到理想室友',
      descEn: 'Match with ideal roommates by lifestyle & budget',
      features: ['租金預算匹配', '作息習慣相符', '生活方式契合', '性別偏好設定'],
      color: '#95E1D3',
    },
    {
      id: 'cultural',
      icon: '🌏',
      titleZh: '文化體驗配對',
      titleEn: 'Cultural Exchange',
      descZh: '國際生與本地生互相交流，體驗不同文化',
      descEn: 'International & local students cultural exchange',
      features: ['本地生導覽', '文化活動揪團', '美食探索夥伴', '節慶體驗分享'],
      color: '#F38181',
    },
  ];

  return (
    <section style={{ padding: '60px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{
        textAlign: 'center',
        fontSize: '2rem',
        color: COLORS.DEEP_NAVY,
        marginBottom: '50px',
      }}>
        選擇配對類型 Choose Your Match Type
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
      }}>
        {matchTypes.map(type => (
          <div
            key={type.id}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '35px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s',
              cursor: 'pointer',
              border: `3px solid transparent`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = type.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onClick={() => onSelectMatch(type.id)}
          >
            {/* Icon */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              {type.icon}
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '1.5rem',
              color: type.color,
              marginBottom: '10px',
              textAlign: 'center',
              fontWeight: 'bold',
            }}>
              {type.titleZh}
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: COLORS.MORANDI_BROWN,
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              {type.titleEn}
            </p>

            {/* Description */}
            <p style={{
              fontSize: '1rem',
              color: COLORS.OLIVE_GREEN,
              lineHeight: '1.6',
              marginBottom: '20px',
            }}>
              {type.descZh}
            </p>

            {/* Features */}
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              {type.features.map((feature, index) => (
                <li key={index} style={{
                  fontSize: '0.9rem',
                  color: COLORS.DEEP_NAVY,
                  marginBottom: '8px',
                  paddingLeft: '25px',
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: type.color,
                  }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button style={{
              width: '100%',
              marginTop: '25px',
              padding: '12px',
              background: type.color,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.05rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              開始配對 Start Matching
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

// ==========================================
// 📊 配對結果顯示
// ==========================================
const MatchResults = ({ matchType, results, loading, onBack, currentUser }) => {
  const typeNames = {
    language: '語言交換',
    study: '學習夥伴',
    roommate: '室友',
    cultural: '文化體驗',
  };

  return (
    <section style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 返回按鈕 */}
      <button
        onClick={onBack}
        style={{
          padding: '10px 20px',
          background: COLORS.OLIVE_GREEN,
          color: COLORS.OFF_WHITE,
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '30px',
          fontSize: '1rem',
        }}
      >
        ← 返回選擇
      </button>

      <h2 style={{
        fontSize: '2rem',
        color: COLORS.DEEP_NAVY,
        marginBottom: '15px',
      }}>
        {typeNames[matchType]}配對結果
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: COLORS.OLIVE_GREEN }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
          <p style={{ fontSize: '1.2rem' }}>正在為你尋找最佳配對...</p>
        </div>
      ) : results.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '50px',
          borderRadius: '15px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😢</div>
          <h3 style={{ color: COLORS.DEEP_NAVY, marginBottom: '15px' }}>暫時找不到合適的配對</h3>
          <p style={{ color: COLORS.OLIVE_GREEN, marginBottom: '20px' }}>
            建議完善你的個人檔案資料，或稍後再試！
          </p>
          <Link
            to="/profile/edit"
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              background: COLORS.BRICK_RED,
              color: COLORS.OFF_WHITE,
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
            }}
          >
            前往完善資料 →
          </Link>
        </div>
      ) : (
        <>
          <p style={{ color: COLORS.OLIVE_GREEN, marginBottom: '30px', fontSize: '1.1rem' }}>
            為你找到 <strong>{results.length}</strong> 位配對夥伴 (依配對度排序)
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '25px',
          }}>
            {results.map(user => (
              <MatchCard key={user.id} user={user} matchType={matchType} currentUser={currentUser} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

// ==========================================
// 💳 配對卡片
// ==========================================
const MatchCard = ({ user, matchType, currentUser }) => {
  const matchScore = user.matchScore || 0;
  const matchReasons = user.matchReasons || [];

  return (
    <div style={{
      background: 'white',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* 配對度進度條 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '0.9rem', color: COLORS.OLIVE_GREEN, fontWeight: 'bold' }}>
            配對度
          </span>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: matchScore >= 70 ? '#4CAF50' : matchScore >= 50 ? '#FFC107' : '#FF9800',
          }}>
            {matchScore}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#E0E0E0',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${matchScore}%`,
            height: '100%',
            background: matchScore >= 70 ? '#4CAF50' : matchScore >= 50 ? '#FFC107' : '#FF9800',
            transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* 用戶資訊 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: COLORS.MORANDI_BROWN,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          marginRight: '15px',
        }}>
          {user.avatar || '👤'}
        </div>
        <div>
          <h4 style={{
            fontSize: '1.3rem',
            color: COLORS.DEEP_NAVY,
            marginBottom: '5px',
          }}>
            {user.nickname || user.email?.split('@')[0] || '匿名用戶'}
          </h4>
          <p style={{ fontSize: '0.85rem', color: COLORS.OLIVE_GREEN }}>
            {user.department || '未設定科系'} • {user.gender || '保密'}
          </p>
        </div>
      </div>

      {/* 配對原因 */}
      <div style={{ marginBottom: '15px' }}>
        <p style={{
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: COLORS.DEEP_NAVY,
          marginBottom: '8px',
        }}>
          配對原因：
        </p>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}>
          {matchReasons.slice(0, 3).map((reason, index) => (
            <li key={index} style={{
              fontSize: '0.85rem',
              color: COLORS.OLIVE_GREEN,
              marginBottom: '5px',
              paddingLeft: '18px',
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: 0 }}>•</span>
              {reason}
            </li>
          ))}
          {matchReasons.length === 0 && (
            <li style={{ fontSize: '0.85rem', color: COLORS.MORANDI_BROWN }}>
              基於興趣與偏好匹配
            </li>
          )}
        </ul>
      </div>

      {/* 查看詳情按鈕 */}
      <Link
        to={`/members/${user.id}`}
        style={{
          display: 'block',
          width: '100%',
          padding: '12px',
          background: COLORS.BRICK_RED,
          color: COLORS.OFF_WHITE,
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
      >
        查看詳細資料 →
      </Link>
    </div>
  );
};

export default MatchingPage;
