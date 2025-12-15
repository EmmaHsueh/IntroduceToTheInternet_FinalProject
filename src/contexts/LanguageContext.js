// src/contexts/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // 從 localStorage 讀取語言設定，預設為英文
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('appLanguage');
    return savedLanguage || 'en';
  });

  // 當語言改變時，儲存到 localStorage
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    isEnglish: language === 'en',
    isChinese: language === 'zh',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
