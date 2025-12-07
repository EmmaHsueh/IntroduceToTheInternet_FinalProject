// src/pages/HomePage.js
import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
const HeroSection = () => {
  const coverImageUrl = "https://img.rawpixel.com/s3fs-private/rawpixel_images/website_content/a017-eberhard-19-fog-lifts-up-after-raind.jpg?w=1200&h=1200&fit=clip&crop=default&dpr=1&q=75&vib=3&con=3&usm=15&cs=srgb&bg=F4F4F3&ixlib=js-2.2.1&s=f60b088dac6c7cc04eeebf67f600e079"; //

  return (
    // 模擬 wp:cover 區塊
    <div 
        className="hero-cover" 
        style={{ 
            minHeight: '525px', 
            backgroundImage: `url(${coverImageUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white', // 假定文字為白色以便在背景圖上可見
            position: 'relative',
            zIndex: 1,
            // 由於 dimRatio:0，不加深色覆蓋層
        }}
    >
      <h2 style={{ fontSize: '3em', margin: '0 0 10px 0' }}>歡迎來到師聲</h2> {/* */}
      <p style={{ fontSize: '1.2em', marginBottom: '30px' }}>快進來發表你的想法</p> {/* */}

      {/* 模擬 wp:stackable/button-group */}
      <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '300px' }}>
        <a 
          href="/login" 
          style={{ padding: '10px 20px', backgroundColor: 'var(--primary-color, #c9362a)', color: '#f3f3e6', textDecoration: 'none', borderRadius: '5px' }}
        >
          立即登入
        </a>
        <a 
          href="/boards" 
          style={{ padding: '10px 20px', border: '2px solid white', color: 'white', textDecoration: 'none', borderRadius: '5px' }}
        >
          逛逛看板
        </a>
      </div>
    </div>
  );
};

const HomePage = () => (
    <>
        <Header />
        <main>
            <HeroSection />
        </main>
        {/* 實際應用中通常會加入 Footer */}
    </>
);

export default HomePage;