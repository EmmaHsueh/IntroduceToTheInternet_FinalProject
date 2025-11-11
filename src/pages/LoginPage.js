// src/pages/LoginPage.js
import React, { useState } from 'react';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm'; 

const LoginPage = () => {
    // 狀態用於切換登入 (true) 和註冊 (false) 模式
    const [isLoginMode, setIsLoginMode] = useState(true);

    const switchToLogin = () => setIsLoginMode(true);
    const switchToRegister = () => setIsLoginMode(false);

    return (
        <>
            {/* 確保 Header.js 存在且能正常引入 */}
            <Header />
            <main>
                <div 
                    className="auth-container" 
                    style={{ 
                        maxWidth: '450px', 
                        margin: '50px auto', 
                        padding: '20px', 
                        border: '1px solid #ccc', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
                    }}
                >
                    
                    {/* 根據 isLoginMode 顯示對應的表單，並傳入切換函數 */}
                    {isLoginMode ? 
                        <LoginForm switchToRegister={switchToRegister} /> : 
                        <RegistrationForm switchToLogin={switchToLogin} />
                    }

                </div>
            </main>
        </>
    );
};

export default LoginPage;