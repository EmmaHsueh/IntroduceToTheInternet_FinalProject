// src/components/LoadingSplash.js
import React, { useState, useEffect } from 'react';

const LoadingSplash = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 2.5 秒後開始淡出
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // 3 秒後完全消失，通知父組件
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e2a38 0%, #454f3b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Logo 圖片 */}
      <div
        style={{
          animation: 'logoFadeInScale 1.5s ease-out',
        }}
      >
        <img
          src="/logo.png"
          alt="師聲 Logo"
          style={{
            width: '280px',
            height: 'auto',
            marginBottom: '30px',
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
          }}
        />
      </div>

      {/* 文字標題 */}
      <h1
        style={{
          color: '#f3f3e6',
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '15px',
          animation: 'textFadeIn 1.5s ease-out 0.3s both',
        }}
      >
        師聲 NTNU Voice
      </h1>

      {/* 副標題 */}
      <p
        style={{
          color: '#f3f3e6',
          fontSize: '1.3rem',
          opacity: 0.9,
          animation: 'textFadeIn 1.5s ease-out 0.6s both',
        }}
      >
        師大國際生的專屬交流平台
      </p>

      {/* 載入動畫點點 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '40px',
          animation: 'textFadeIn 1.5s ease-out 0.9s both',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#c9362a',
              animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes logoFadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes textFadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dotPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSplash;
