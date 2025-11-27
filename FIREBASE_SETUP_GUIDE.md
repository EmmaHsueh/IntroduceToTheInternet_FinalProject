# Firebase 整合指南

## ✅ 已完成：Firebase Authentication（用戶登入註冊）

### 功能已實作：

1. **Email/密碼註冊**
   - 用戶可以使用 Email 和密碼註冊
   - 自動在 Firestore 建立用戶資料
   - 支援個人資料設定（暱稱、姓名、性別、頭像）

2. **Email/密碼登入**
   - 支援 Email + 密碼登入
   - 錯誤訊息提示（帳號不存在、密碼錯誤等）
   - Loading 狀態顯示

3. **Google 登入**
   - 一鍵 Google 帳號登入
   - 自動建立用戶資料

4. **登入狀態管理**
   - 全域 AuthContext 管理用戶狀態
   - 自動監聽登入狀態變化
   - 登出功能

---

## 🧪 測試步驟

### 1. 啟動專案

```bash
npm start
```

### 2. 測試註冊功能

1. 開啟瀏覽器前往 http://localhost:3000/login
2. 點擊「前往註冊」按鈕
3. 填寫以下資訊：
   - 學號：B10901001
   - Email：test@ntnu.edu.tw
   - 密碼：123456（至少6位）
   - 姓名：測試 / 用戶
   - 暱稱：測試帳號
   - 性別：選擇一個
4. 點擊「立即註冊」
5. 註冊成功後會自動跳轉至首頁

### 3. 查看 Firebase 中的用戶資料

**查看 Authentication：**
1. 開啟 Firebase Console：https://console.firebase.google.com/
2. 選擇你的專案「ntnu-talk」
3. 左側選單點擊「Authentication」
4. 在「Users」頁籤可以看到剛剛註冊的用戶

**查看 Firestore 資料：**
1. 左側選單點擊「Firestore Database」
2. 在「users」collection 中可以看到用戶的詳細資料

### 4. 測試登入功能

1. 前往 http://localhost:3000/login
2. 使用剛才註冊的 Email 和密碼登入
3. 登入成功後會跳轉至首頁

### 5. 測試 Google 登入

1. 前往登入頁面
2. 點擊「使用 Google 帳號登入」
3. 選擇你的 Google 帳號
4. 登入成功

---

## 📋 資料庫結構

目前在 Firestore 中建立的資料結構：

```
users (collection)
  └── {userId} (document)
      ├── uid: "firebase-auth-uid"
      ├── email: "user@ntnu.edu.tw"
      ├── user_login: "B10901001"
      ├── nickname: "測試帳號"
      ├── first_name: "用戶"
      ├── last_name: "測試"
      ├── gender: "男性"
      ├── avatar: "emoji-bear_face"
      ├── bio: "這個人很懶，什麼都沒留下。"
      └── createdAt: "2025-01-01T00:00:00.000Z"
```

---

## 🔐 安全性設定（重要！）

目前 Firestore 使用「測試模式」，**任何人都可以讀寫資料**。這只適合開發測試，正式上線前必須修改安全規則。

### 修改 Firestore 安全規則：

1. 進入 Firebase Console > Firestore Database > Rules
2. 將規則改為：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 用戶資料：只能讀取自己的資料，只能寫入自己的資料
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 貼文：所有登入用戶可讀取，只有作者可以修改/刪除
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }

    // 留言：所有登入用戶可讀取，只有作者可以修改/刪除
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

3. 點擊「發布」

### 修改 Storage 安全規則：

1. 進入 Firebase Console > Storage > Rules
2. 將規則改為：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /posts/{postId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🚀 下一步：整合 Firestore 儲存貼文

現在登入系統已經完成，接下來要將：
1. **貼文資料**從 localStorage 遷移到 Firestore
2. **留言資料**儲存到 Firestore
3. **會員資料**從 Firestore 載入

這樣所有用戶就能看到彼此的貼文了！

---

## ⚠️ 常見問題排除

### 1. 登入後頁面沒反應
- 檢查瀏覽器 Console 是否有錯誤
- 確認 firebase.js 的設定正確

### 2. Google 登入失敗
- 確認 Firebase Console 中 Google 登入方式已啟用
- 確認已設定「專案支援電子郵件」

### 3. 註冊時出現「Email already in use」
- 該 Email 已經註冊過
- 可以前往 Firebase Console > Authentication 刪除該用戶後重新註冊

### 4. 出現「auth/network-request-failed」
- 網路連線問題
- 檢查防火牆設定
- 確認 Firebase 服務沒有停機

---

## 📝 程式碼說明

### AuthContext 的功能

`src/contexts/AuthContext.js` 提供以下函數：

```javascript
const {
  currentUser,      // 目前登入的用戶（Firebase Auth）
  userProfile,      // 用戶詳細資料（Firestore）
  signup,           // 註冊函數
  login,            // 登入函數
  loginWithGoogle,  // Google 登入
  logout,           // 登出函數
  resetPassword,    // 重設密碼
  loadUserProfile   // 重新載入用戶資料
} = useAuth();
```

### 在其他組件中使用：

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { currentUser, userProfile, logout } = useAuth();

  if (!currentUser) {
    return <div>請先登入</div>;
  }

  return (
    <div>
      <h1>歡迎，{userProfile?.nickname}</h1>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

---

準備好進行下一步了嗎？請告訴我！
