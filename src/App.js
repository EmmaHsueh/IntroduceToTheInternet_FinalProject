
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MemberPage from './pages/MemberPage';
import MediaPage from './pages/MediaPage';
// 引入頁面組件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BoardsIndexPage from './pages/BoardsIndexPage';
import FoodBoardPage from './pages/FoodBoardPage';
import WeatherBoardPage from './pages/WeatherBoardPage';
import EventsBoardPage from './pages/EventsBoardPage';
import ClubsBoardPage from './pages/ClubsBoardPage';
import CoursesBoardPage from './pages/CoursesBoardPage';
import OutfitBoardPage from './pages/OutfitBoardPage';
import OtherBoardPage from './pages/OtherBoardPage';
function App() {
  return (
    <Router>
      <Routes>
        {/* 首頁 */}
        <Route path="/" element={<HomePage />} />
        
        {/* 登入表單與會員功能 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 會員目錄頁面路由 <--- 新增此行 */}
        <Route path="/members" element={<MemberPage />} />
        
        {/* 看板導覽頁 */}
        <Route path="/boards" element={<BoardsIndexPage />} />
        
        {/* 各別看板頁面路由 */}
        <Route path="/boards/food" element={<FoodBoardPage />} />
        <Route path="/boards/weather" element={<WeatherBoardPage />} />
        <Route path="/boards/events" element={<EventsBoardPage />} />
        <Route path="/boards/clubs" element={<ClubsBoardPage />} />
        <Route path="/boards/courses" element={<CoursesBoardPage />} />
        <Route path="/boards/outfit" element={<OutfitBoardPage />} />
        <Route path="/boards/other" element={<OtherBoardPage />} />
        
        {/* 媒體資源頁面路由 <--- 新增此行 */}
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
