// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import Icon from '../components/Icons';

// 顏色常數
const COLORS = {
  DEEP_NAVY: '#1e2a38',
  OLIVE_GREEN: '#454f3b',
  MORANDI_BROWN: '#a38c6b',
  BRICK_RED: '#c9362a',
  OFF_WHITE: '#f3f3e6',
  LIGHT_BEIGE: '#faf8f3',
};

const HeroSection = ({ language, setLanguage }) => {
  const content = {
    zh: {
      title: '歡迎來到師聲',
      subtitle: '師大國際生的專屬交流平台',
      description: '語言交換 • 美食探索 • 活動揪團 • AI 智能助手',
      btnJoin: '立即加入',
      btnExplore: '探索看板',
      btnAI: 'AI 助手',
    },
    en: {
      title: 'Welcome to NTNU Voice',
      subtitle: 'Your Community for International Students',
      description: 'Language Exchange • Food & Culture • Events • AI Helper',
      btnJoin: 'Join Now',
      btnExplore: 'Explore Boards',
      btnAI: 'AI Chat',
    }
  };

  const text = content[language];

  return (
    <div
      style={{
        minHeight: '450px',
        background: `linear-gradient(135deg, ${COLORS.DEEP_NAVY} 0%, ${COLORS.OLIVE_GREEN} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'center',
        color: COLORS.OFF_WHITE,
        position: 'relative',
        padding: '30px 20px 40px',
      }}
    >
      {/* 語言切換按鈕 */}
      <div style={{ position: 'absolute', top: '25px', right: '30px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setLanguage('zh')}
          style={{
            padding: '8px 16px',
            background: language === 'zh' ? COLORS.BRICK_RED : 'transparent',
            color: COLORS.OFF_WHITE,
            border: `2px solid ${COLORS.OFF_WHITE}`,
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: language === 'zh' ? 'bold' : 'normal',
          }}
        >
          中文
        </button>
        <button
          onClick={() => setLanguage('en')}
          style={{
            padding: '8px 16px',
            background: language === 'en' ? COLORS.BRICK_RED : 'transparent',
            color: COLORS.OFF_WHITE,
            border: `2px solid ${COLORS.OFF_WHITE}`,
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: language === 'en' ? 'bold' : 'normal',
          }}
        >
          English
        </button>
      </div>

      {/* Hero Logo - 帶浮動動畫 */}
      <div
        style={{
          marginBottom: '30px',
          animation: 'logoFloat 3s ease-in-out infinite',
        }}
      >
        <img
          src="/logo.png"
          alt="師聲 Logo"
          style={{
            width: '180px',
            height: 'auto',
            filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
          }}
        />
      </div>

      {/* 主標題 */}
      <h1 style={{
        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
        margin: '0 0 20px 0',
        fontWeight: '800',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      }}>
        {text.title}
      </h1>

      {/* 副標題 */}
      <p style={{
        fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
        marginBottom: '15px',
        fontWeight: '500',
      }}>
        {text.subtitle}
      </p>

      {/* 描述 */}
      <p style={{
        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
        marginBottom: '40px',
        opacity: 0.9,
        maxWidth: '700px',
      }}>
        {text.description}
      </p>

      {/* CTA 按鈕組 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
        maxWidth: '600px',
      }}>
        <Link
          to="/login"
          style={{
            padding: '15px 35px',
            backgroundColor: COLORS.BRICK_RED,
            color: COLORS.OFF_WHITE,
            textDecoration: 'none',
            borderRadius: '30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          {text.btnJoin}
        </Link>
        <Link
          to="/boards"
          style={{
            padding: '15px 35px',
            border: `2px solid ${COLORS.OFF_WHITE}`,
            color: COLORS.OFF_WHITE,
            textDecoration: 'none',
            borderRadius: '30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = COLORS.OFF_WHITE;
            e.target.style.color = COLORS.DEEP_NAVY;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = COLORS.OFF_WHITE;
          }}
        >
          {text.btnExplore}
        </Link>
      </div>

      {/* 裝飾性波浪 SVG */}
      <svg style={{ position: 'absolute', bottom: '-60px', left: 0, width: '100%', pointerEvents: 'none' }} viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill={COLORS.OFF_WHITE}/>
      </svg>
    </div>
  );
};

// 功能特色卡片組件
const FeatureCard = ({ iconType, titleZh, titleEn, descZh, descEn, link, language }) => (
  <Link
    to={link}
    style={{
      flex: '1 1 250px',
      maxWidth: '300px',
      padding: '30px',
      background: 'white',
      borderRadius: '15px',
      textAlign: 'center',
      textDecoration: 'none',
      color: COLORS.DEEP_NAVY,
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      transition: 'all 0.3s',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-10px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
    }}
  >
    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
      <Icon type={iconType} size={48} color={COLORS.BRICK_RED} />
    </div>
    <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: COLORS.BRICK_RED }}>
      {language === 'zh' ? titleZh : titleEn}
    </h3>
    <p style={{ fontSize: '1rem', color: COLORS.OLIVE_GREEN, lineHeight: '1.6' }}>
      {language === 'zh' ? descZh : descEn}
    </p>
  </Link>
);

const FeaturesSection = ({ language }) => {
  const features = [
    {
      iconType: 'comments',
      titleZh: '語言交換',
      titleEn: 'Language Exchange',
      descZh: '與母語者練習中英文，提升語言能力',
      descEn: 'Practice languages with native speakers',
      link: '/boards/other',
    },
    {
      iconType: 'food',
      titleZh: '美食探索',
      titleEn: 'Food & Culture',
      descZh: '發掘師大周邊隱藏美食與文化景點',
      descEn: 'Discover local food and cultural spots',
      link: '/boards/food',
    },
    {
      iconType: 'calendar',
      titleZh: '活動揪團',
      titleEn: 'Events & Meetups',
      descZh: '參加校園活動，認識新朋友',
      descEn: 'Join campus events and make friends',
      link: '/boards/events',
    },
    {
      iconType: 'chat',
      titleZh: 'AI 智能助手',
      titleEn: 'AI Helper',
      descZh: '24小時智能客服，解答你的疑問',
      descEn: '24/7 AI assistant for your questions',
      link: '/boards',
    },
    {
      iconType: 'book',
      titleZh: '課程討論',
      titleEn: 'Course Forum',
      descZh: '分享課程心得，找讀書夥伴',
      descEn: 'Share course reviews, find study buddies',
      link: '/boards/courses',
    },
    {
      iconType: 'handshake',
      titleZh: '智慧配對',
      titleEn: 'Smart Matching',
      descZh: 'AI 智能配對最適合的語言交換、學習夥伴',
      descEn: 'AI-powered matching for partners & roommates',
      link: '/matching',
    },
  ];

  return (
    <section style={{
      padding: '80px 20px',
      background: COLORS.OFF_WHITE,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '50px',
          color: COLORS.DEEP_NAVY,
        }}>
          {language === 'zh' ? '為什麼選擇師聲？' : 'Why Choose NTNU Voice?'}
        </h2>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          justifyContent: 'center',
        }}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} language={language} />
          ))}
        </div>
      </div>
    </section>
  );
};

// 最新貼文預覽區塊
const LiveFeedSection = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);

        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setRecentPosts(posts);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  return (
    <section style={{
      padding: '80px 20px',
      background: 'white',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '50px',
          color: COLORS.DEEP_NAVY,
        }}>
          最新動態 <span style={{ fontSize: '1.5rem', color: COLORS.MORANDI_BROWN }}>Latest Updates</span>
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: COLORS.OLIVE_GREEN }}>載入中...</p>
        ) : recentPosts.length === 0 ? (
          <p style={{ textAlign: 'center', color: COLORS.OLIVE_GREEN }}>目前還沒有貼文，快來發表第一篇吧！</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
          }}>
            {recentPosts.map(post => (
              <Link
                key={post.id}
                to={`/boards/${post.boardName}/${post.id}`}
                style={{
                  padding: '25px',
                  background: COLORS.LIGHT_BEIGE,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: COLORS.DEEP_NAVY,
                  border: `2px solid ${COLORS.OFF_WHITE}`,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = COLORS.BRICK_RED;
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = COLORS.OFF_WHITE;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '0.9rem',
                  color: COLORS.BRICK_RED,
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <Icon type="pin" size={14} color={COLORS.BRICK_RED} />
                  {post.boardName || '其他'}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  marginBottom: '10px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {post.title}
                </h3>
                <p style={{
                  color: COLORS.OLIVE_GREEN,
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {post.content}
                </p>
                <div style={{
                  marginTop: '15px',
                  fontSize: '0.85rem',
                  color: COLORS.MORANDI_BROWN,
                }}>
                  {post.authorName || '匿名'} • {post.commentCount || 0} 則留言
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link
            to="/boards"
            style={{
              padding: '12px 30px',
              background: COLORS.BRICK_RED,
              color: COLORS.OFF_WHITE,
              textDecoration: 'none',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              display: 'inline-block',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            查看所有看板 View All Boards →
          </Link>
        </div>
      </div>
    </section>
  );
};

// 社群數據統計區塊
const StatsSection = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalMembers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 獲取貼文總數
        const postsRef = collection(db, 'posts');
        const postsSnapshot = await getCountFromServer(postsRef);

        // 獲取會員總數
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getCountFromServer(usersRef);

        setStats({
          totalPosts: postsSnapshot.data().count,
          totalMembers: usersSnapshot.data().count,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { iconType: 'users', number: stats.totalMembers, label: '活躍會員', labelEn: 'Active Members' },
    { iconType: 'pencil', number: stats.totalPosts, label: '社群貼文', labelEn: 'Posts' },
    { iconType: 'worldglobe', number: '20+', label: '國家地區', labelEn: 'Countries' },
    { iconType: 'chat', number: '24/7', label: 'AI 客服', labelEn: 'AI Support' },
  ];

  return (
    <section style={{
      padding: '80px 20px',
      background: `linear-gradient(135deg, ${COLORS.OLIVE_GREEN} 0%, ${COLORS.MORANDI_BROWN} 100%)`,
      color: COLORS.OFF_WHITE,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '50px',
        }}>
          師聲社群正在成長 Growing Community
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          textAlign: 'center',
        }}>
          {statItems.map((item, index) => (
            <div key={index}>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                <Icon type={item.iconType} size={56} color={COLORS.OFF_WHITE} />
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>
                {item.number}
              </div>
              <div style={{ fontSize: '1.2rem' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                {item.labelEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 最終 CTA 區塊
const FinalCTA = () => (
  <section style={{
    padding: '100px 20px',
    background: COLORS.DEEP_NAVY,
    color: COLORS.OFF_WHITE,
    textAlign: 'center',
  }}>
    <h2 style={{
      fontSize: '2.8rem',
      marginBottom: '20px',
      fontWeight: 'bold',
    }}>
      準備好加入我們了嗎？
    </h2>
    <p style={{
      fontSize: '1.3rem',
      marginBottom: '40px',
      opacity: 0.9,
    }}>
      Ready to Join the Community?
    </p>
    <Link
      to="/login"
      style={{
        padding: '18px 50px',
        background: COLORS.BRICK_RED,
        color: COLORS.OFF_WHITE,
        textDecoration: 'none',
        borderRadius: '35px',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        display: 'inline-block',
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      立即註冊 Sign Up Now →
    </Link>
  </section>
);

// 主頁面組件
const HomePage = () => {
  // 統一管理語言狀態，預設為英文
  const [language, setLanguage] = useState('en');

  return (
    <>
      <Header />
      <main>
        <HeroSection language={language} setLanguage={setLanguage} />
        <FeaturesSection language={language} />
        <LiveFeedSection />
        <StatsSection />
        <FinalCTA />
      </main>
      {/* 可選：加入 Footer */}

      {/* CSS Keyframes for Logo Animation */}
      <style>{`
        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </>
  );
};

export default HomePage;
