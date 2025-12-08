// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🔥 引入 AuthProvider
import { AuthProvider } from './contexts/AuthContext';

// 🔥 引入聊天訊息清理功能
import { cleanupExpiredMessages } from './services/chatService';

// 引入基本頁面組件
import MemberPage from './pages/MemberPage';
import MediaPage from './pages/MediaPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BoardsIndexPage from './pages/BoardsIndexPage';
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';

// 引入看板頁面組件
import FoodBoardPage from './pages/FoodBoardPage';
import WeatherBoardPage from './pages/WeatherBoardPage';
import EventsBoardPage from './pages/EventsBoardPage';
import ClubsBoardPage from './pages/ClubsBoardPage';
import CoursesBoardPage from './pages/CoursesBoardPage';
import OutfitBoardPage from './pages/OutfitBoardPage';
import OtherBoardPage from './pages/OtherBoardPage';

// 引入貼文相關組件
import PostForm from './components/PostForm';
import PostDetailPage from './pages/PostDetailPage';
import AITalk from './components/AITalk';
import EventMapPage from './pages/EventMapPage'; // ⬅️ 確保引入 EventMapPage
import PublicProfilePage from './pages/PublicProfilePage'; // 🔥 新增：公開的用戶個人檔案頁面

function App() {
  // 🔥 應用啟動時自動清理過期的聊天訊息（30天前的訊息）
  useEffect(() => {
    console.log('🚀 應用啟動：開始清理過期的聊天訊息...');
    cleanupExpiredMessages()
      .then((count) => {
        if (count > 0) {
          console.log(`✅ 已清理 ${count} 則過期訊息`);
        }
      })
      .catch((error) => {
        console.error('❌ 清理過期訊息時發生錯誤:', error);
      });
  }, []); // 只在應用啟動時執行一次

  return (
    <AuthProvider>
      <Router>
      <Routes>
        {/* 首頁 */}
        <Route path="/" element={<HomePage />} />
        
        {/* 登入表單與會員功能 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 會員目錄頁面路由 */}
        <Route path="/members" element={<MemberPage />} />

        {/* 🔥 公開的用戶個人檔案頁面路由 (查看其他用戶) */}
        <Route path="/members/:userId" element={<PublicProfilePage />} />

        {/* 🎯 會員個人檔案頁面路由 */
        /* /profile 顯示個人資料 */
        /* /profile/edit 編輯個人資料 */
        }
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        
        {/* 看板導覽頁 */}
        <Route path="/boards" element={<BoardsIndexPage />} />
        
        {/* 1. 各別看板頁面路由 (保持不變) */}
        <Route path="/boards/food" element={<FoodBoardPage />} />
        <Route path="/boards/weather" element={<WeatherBoardPage />} />
        <Route path="/boards/events" element={<EventsBoardPage />} />
        <Route path="/boards/clubs" element={<ClubsBoardPage />} />
        <Route path="/boards/courses" element={<CoursesBoardPage />} />
        <Route path="/boards/outfit" element={<OutfitBoardPage />} />
        <Route path="/boards/other" element={<OtherBoardPage />} />

        {/* 2. 貼文相關路由 (動態路由) */}
        
        {/* 發表新貼文：/boards/:boardId/new (假設您在 BoardPage 內管理表單狀態，此路由用於全域創建) */}
        {/* 如果每個看板頁面（如 FoodBoardPage）內嵌了發布邏輯，則可能不需要這個全域路由。 */}
        {/* 為了彈性，我們新增一個動態發布路由。 */}
        <Route path="/boards/:boardId/new" element={<PostForm />} />
        
        {/* 貼文詳情頁面：/boards/:boardId/:postId */}
        {/* 例如：/boards/food/123456 或 /boards/courses/7890 */}
        <Route path="/boards/:boardId/:postId" element={<PostDetailPage />} />
        {/* 🔥 關鍵修改：新增即時揪團地圖路由 🔥 */}
        <Route path="/events-map" element={<EventMapPage />} />
        {/* 媒體資源頁面路由 */}
        <Route path="/media" element={<MediaPage />} />

      </Routes>
      <AITalk />
    </Router>
    </AuthProvider>
  );
}

export default App;