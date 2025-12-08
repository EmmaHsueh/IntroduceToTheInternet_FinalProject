// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

// 自訂 Hook：讓其他組件可以輕鬆使用認證功能
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必須在 AuthProvider 內使用');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 📝 註冊新用戶（Email + Password）
  const signup = async (email, password, additionalData = {}) => {
    try {
      // 1. 在 Firebase Auth 建立帳號
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. 在 Firestore 建立用戶資料文件
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        user_login: additionalData.user_login || email.split('@')[0],
        nickname: additionalData.nickname || '新用戶',
        first_name: additionalData.first_name || '',
        last_name: additionalData.last_name || '',
        gender: additionalData.gender || '保密',
        avatar: additionalData.avatar || 'emoji-student',
        bio: additionalData.bio || '這個人很懶，什麼都沒留下。',
        createdAt: new Date().toISOString(),
      });

      // 3. 更新 Firebase Auth 的 displayName
      await updateProfile(user, {
        displayName: additionalData.nickname || '新用戶'
      });

      return user;
    } catch (error) {
      console.error('註冊錯誤:', error);
      throw error;
    }
  };

  // 🔐 登入（Email + Password）
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('登入錯誤:', error);
      throw error;
    }
  };

  // 🔐 Google 登入
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // 檢查是否為新用戶，如果是則建立 Firestore 文件
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          user_login: user.email.split('@')[0],
          nickname: user.displayName || '新用戶',
          first_name: '',
          last_name: '',
          gender: '保密',
          avatar: 'emoji-student',
          bio: '這個人很懶，什麼都沒留下。',
          createdAt: new Date().toISOString(),
        });
      }

      return user;
    } catch (error) {
      console.error('Google 登入錯誤:', error);
      throw error;
    }
  };

  // 🚪 登出
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('登出錯誤:', error);
      throw error;
    }
  };

  // 📧 重設密碼
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('重設密碼錯誤:', error);
      throw error;
    }
  };

  // 👤 從 Firestore 載入用戶資料
  const loadUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        // 🔥 如果找不到用戶資料，自動建立一個
        console.warn('⚠️ Firestore 中找不到用戶資料，正在自動建立...');

        const newUserProfile = {
          uid: uid,
          email: auth.currentUser?.email || '',
          user_login: auth.currentUser?.email?.split('@')[0] || 'user',
          nickname: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || '新用戶',
          first_name: '',
          last_name: '',
          gender: '保密',
          avatar: 'emoji-student',
          bio: '這個人很懶，什麼都沒留下。',
          createdAt: new Date().toISOString(),
        };

        // 建立 Firestore 文檔
        await setDoc(doc(db, 'users', uid), newUserProfile);
        console.log('✅ 已自動建立用戶 Firestore 文檔');

        setUserProfile(newUserProfile);
      }
    } catch (error) {
      console.error('❌ 載入用戶資料錯誤:', error);
      // 發生錯誤時也提供基本資訊
      setUserProfile({
        uid: uid,
        email: auth.currentUser?.email || '',
        nickname: auth.currentUser?.displayName || '用戶',
        avatar: 'emoji-student',
        bio: ''
      });
    }
  };

  // 監聽用戶登入狀態變化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // 🔥 優化：先設定 loading 為 false，讓 UI 能立即顯示
        // 然後在背景載入用戶資料
        setLoading(false);
        // 非同步載入用戶資料，不阻塞 UI
        loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe; // 清理監聽器
  }, []);

  const value = {
    currentUser,      // Firebase Auth 用戶物件
    userProfile,      // Firestore 用戶資料
    signup,           // 註冊函數
    login,            // 登入函數
    loginWithGoogle,  // Google 登入
    logout,           // 登出函數
    resetPassword,    // 重設密碼
    loadUserProfile,  // 重新載入用戶資料
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
