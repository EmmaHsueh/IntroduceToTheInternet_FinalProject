// src/pages/WeatherBoardPage.js
import React from 'react';
import BoardTemplate from '../components/BoardTemplate';

const WeatherBoardPage = () => {
    return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/weather.jpg)`,
        backgroundSize: 'cover',        // 讓圖片覆蓋整個區域
        backgroundPosition: 'center',   // 圖片置中
        backgroundRepeat: 'no-repeat',  // 避免重複
        padding: '20px'                 // 內邊距
      }}
    >
      <BoardTemplate boardName="天氣" />
    </div>
  );
};

export default WeatherBoardPage;