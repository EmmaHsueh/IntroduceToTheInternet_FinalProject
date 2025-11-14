
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 引入基本頁面組件
import MemberPage from './pages/MemberPage';
import MediaPage from './pages/MediaPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BoardsIndexPage from './pages/BoardsIndexPage';

// 引入看板頁面組件
import FoodBoardPage from './pages/FoodBoardPage';
import WeatherBoardPage from './pages/WeatherBoardPage';
import EventsBoardPage from './pages/EventsBoardPage';
import ClubsBoardPage from './pages/ClubsBoardPage';
import CoursesBoardPage from './pages/CoursesBoardPage';
import OutfitBoardPage from './pages/OutfitBoardPage';
import OtherBoardPage from './pages/OtherBoardPage';

// *** 新增：引入貼文相關組件 ***
import PostForm from './components/PostForm'; // 假設 PostForm 是 components 級別
import PostDetailPage from './pages/PostDetailPage'; // 假設 PostDetailPage 是 pages 級別


function App() {
  return (
    <Router>
      <Routes>
        {/* 首頁 */}
        <Route path="/" element={<HomePage />} />
        
        {/* 登入表單與會員功能 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 會員目錄頁面路由 */}
        <Route path="/members" element={<MemberPage />} />
        
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
        
        {/* 媒體資源頁面路由 */}
        <Route path="/media-assets" element={<MediaPage />} />

        {/* 404 頁面（選用） */}
        <Route path="*" element={
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h1>404 Not Found</h1>
                <p>找不到該頁面。</p>
            </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
