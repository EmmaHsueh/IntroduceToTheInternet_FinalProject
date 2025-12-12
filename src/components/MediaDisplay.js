// src/components/MediaDisplay.js
import React from 'react';

const MediaDisplay = () => {
    // 圖片路徑：從 public/images 資料夾引用
    const image800x530 = '/images/woocommerce-placeholder-800x530.webp'; //
    const image530x530 = '/images/woocommerce-placeholder-530x530.webp'; //

    const imageStyle = {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    };

    const sectionStyle = {
        maxWidth: '1000px',
        margin: '50px auto',
        padding: '20px',
        textAlign: 'center'
    };

    return (
        <div style={sectionStyle}>
            <h2>網站媒體資源展示</h2>
            <p style={{ color: 'gray' }}>這些是從 WordPress 附件列表中提取出的圖片佔位符。</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', marginTop: '30px' }}>
                
                {/* 範例 1: 800x530 WebP 圖片 */}
                <div style={{ width: '400px' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>封面圖 / 橫幅</h3>
                    <img 
                        src={image800x530} 
                        alt="橫幅佔位符 (800x530)" 
                        style={imageStyle} 
                    />
                    <p style={{ fontSize: 'small', color: '#555' }}>檔案名: woocommerce-placeholder-800x530.webp</p>
                </div>

                {/* 範例 2: 530x530 WebP 圖片 */}
                <div style={{ width: '300px' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>產品圖 / 方形縮圖</h3>
                    <img 
                        src={image530x530} 
                        alt="方形佔位符 (530x530)" 
                        style={imageStyle} 
                    />
                    <p style={{ fontSize: 'small', color: '#555' }}>檔案名: woocommerce-placeholder-530x530.webp</p>
                </div>
            </div>
        </div>
    );
};

export default MediaDisplay;