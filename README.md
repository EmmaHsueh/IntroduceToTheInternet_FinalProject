Run:

npm install
npm start

Replace src/firebase.js with your Firebase config to enable Auth/Firestore/Storage.

🔴 高優先級 - 核心功能缺失

  1. 整合 Firebase 實現真實資料持久化

  現況問題：
  - 貼文資料存在 localStorage，只能單機使用，無法跨用戶/裝置共享
  - 會員資料、個人檔案都是寫死的模擬資料
  - 留言資料也存在 localStorage

  建議改善：
  - 將所有貼文、留言資料遷移至 Firestore
  - 建立完整的資料結構：
  collections:
    - users (用戶資料)
    - boards (看板設定)
    - posts (貼文，包含 boardId 欄位)
    - comments (留言，包含 postId 參照)
  - 實作即時資料同步（Firestore onSnapshot）

  2. 完整實作 Firebase Authentication

  現況問題：
  - Auth.js 只是佔位符
  - LoginForm.js 的登入只有 alert，沒有實際功能
  - 沒有註冊流程整合
  - 沒有權限控制機制

  建議改善：
  - 實作 Firebase Auth 的 Email/Password 登入
  - 實作 Google 第三方登入（適合校園帳號整合）
  - 新增 Protected Routes：未登入用戶無法發文、留言
  - 實作「忘記密碼」功能（目前只有連結）
  - 新增登入狀態管理（Context API 或 Redux）

  3. 圖片上傳改用 Firebase Storage

  現況問題：
  - 圖片轉 Base64 存 localStorage 有嚴重大小限制（5-10MB）
  - 多圖上傳會導致 localStorage 爆滿
  - 無法跨裝置查看圖片

  建議改善：
  - 上傳圖片至 Firebase Storage
  - 在 Firestore 只儲存圖片 URL
  - 實作圖片壓縮（降低儲存成本）
  - 設定檔案大小與格式限制

  4. 整合內容審核機制

  現況問題：
  - 後端有 moderation API 但前端完全沒使用
  - 用戶可以發布任何內容

  建議改善：
  - 在 PostForm 送出前呼叫 /moderation API
  - 在 Comments 送出前也進行審核
  - 若內容被標記為不當，阻止發布並提示用戶
  - 考慮改為 Cloud Functions 實作（避免 API Key 暴露）

  ---
  🟡 中優先級 - 重要社群功能

  5. 貼文與留言的編輯/刪除功能

  現況問題：
  - 無法編輯或刪除已發布的貼文
  - Comment 組件有「編輯」字樣但沒功能
  - 無權限控制（任何人都不應能刪除他人貼文）

  建議改善：
  - 新增「編輯貼文」按鈕（僅作者可見）
  - 新增「刪除貼文」功能（作者 + 管理員）
  - 實作留言的編輯/刪除
  - 儲存編輯歷史記錄（可選）

  6. 即時聊天室改用 Firestore 即時同步

  現況問題：
  - ChatWidget 訊息只存在 local state
  - 重新整理頁面訊息就消失
  - 無法與其他用戶即時互動

  建議改善：
  - 使用 Firestore onSnapshot 實作真正的即時聊天
  - 建立 chatMessages collection，按看板分組
  - 顯示發言者頭像與暱稱
  - 新增訊息時間戳記
  - 考慮訊息數量限制（如保留最近 100 條）

  7. 完整的會員系統

  現況問題：
  - MemberDirectory 使用假資料
  - 無法查看其他用戶的個人檔案
  - ProfilePage 的「我的貼文」「我的留言」都是假資料

  建議改善：
  - 從 Firestore users collection 載入真實會員資料
  - 實作用戶個人檔案頁面路由（/members/:userId）
  - ProfilePage 從 Firestore 查詢用戶實際發文與留言
  - 新增「追蹤/好友」功能（可選）

  8. 點讚/按讚功能

  現況問題：
  - 完全沒有互動反饋機制

  建議改善：
  - 貼文新增 likes 欄位（陣列存用戶 ID）
  - 留言也可以按讚
  - 顯示按讚數量與狀態
  - 防止重複按讚

  9. 搜尋與篩選功能

  現況問題：
  - 看板內沒有搜尋功能
  - 無法依條件篩選貼文（如最新、熱門、精華）

  建議改善：
  - 新增貼文標題/內容搜尋（Firestore query 或 Algolia）
  - 新增排序選項：最新、熱門（按留言數/讚數）
  - 新增標籤系統（tag），方便分類

  ---
  🟢 低優先級 - 進階功能

  10. 通知系統

  - 有人回覆你的貼文時通知
  - 有人按讚時通知
  - 使用 Firestore 或 Firebase Cloud Messaging

  11. 私訊功能

  - 用戶之間一對一聊天
  - 建立 conversations 與 messages collections

  12. 檢舉/封鎖機制

  - 檢舉不當內容
  - 封鎖特定用戶
  - 管理員審核介面

  13. 精華文章/置頂功能

  - 管理員可置頂重要公告
  - 標記精華文章

  14. 用戶權限分級

  - 一般用戶、版主、管理員
  - 不同權限有不同操作能力

  15. 多媒體支援增強

  - 支援影片上傳
  - 支援嵌入 YouTube/音樂連結
  - 圖片輪播功能優化

  16. 統計分析功能

  - 個人貼文瀏覽數統計
  - 看板活躍度分析
  - 熱門話題排行

  ---
  📋 技術債務與安全性改善

  17. 環境變數管理

  問題：
  - PostForm.js 的 Remove.bg API Key 硬編碼在前端（line 6）
  - 後端 OpenAI API Key 用 .env 但沒有提交範例檔

  建議：
  - 將 Remove.bg 功能移至後端 API
  - 建立 .env.example 檔案
  - 使用 Firebase Functions 保護 API Key

  18. 錯誤處理機制

  - 網路請求失敗時的重試機制
  - 全域錯誤邊界（Error Boundary）
  - Loading 狀態顯示

  19. 效能優化

  - 貼文列表使用無限滾動或分頁（目前全部載入）
  - 圖片 lazy loading
  - Firestore query 使用索引優化

  ---
  🎯 建議實作順序

  如果要快速讓網站可用，建議按此順序：

  1. 先完成 #2 Firebase Auth → 讓用戶能真實登入
  2. 再完成 #1 Firestore 資料庫 → 讓貼文能跨用戶共享
  3. 接著 #3 圖片上傳 → 解決 localStorage 限制
  4. 然後 #4 內容審核 → 確保社群內容品質
  5. 再依需求完成中低優先級功能

  這樣可以讓網站從「前端展示」進化成「真正可運作的社群平台」。

  Firebase 是 Google 提供的後端即服務（Backend-as-a-Service, BaaS）平台。簡單來說：

  傳統開發方式 vs Firebase

  傳統方式：
  你需要自己寫：
  1. Node.js/Python 後端伺服器 ❌
  2. 資料庫（MySQL/MongoDB）❌
  3. 用戶登入系統 ❌
  4. 檔案儲存伺服器 ❌
  5. 主機部署與維護 ❌

  使用 Firebase：
  Google 已經幫你準備好：
  1. Authentication（登入系統）✅
  2. Firestore（NoSQL 資料庫）✅
  3. Storage（檔案儲存）✅
  4. Hosting（網站部署）✅
  5. 全自動擴展，不用管伺服器 ✅

  Firebase 核心服務

  對你的專案來說，需要用到這三個：

  | 服務                      | 用途          | 你專案中的應用               |
  |-------------------------|-------------|-----------------------|
  | Firebase Authentication | 用戶登入註冊系統    | 學號/Email 登入、Google 登入 |
  | Cloud Firestore         | NoSQL 即時資料庫 | 儲存貼文、留言、用戶資料          |
  | Cloud Storage           | 檔案儲存空間      | 儲存貼文圖片、用戶頭像           |

  ---
  🚀 步驟一：建立 Firebase 專案

⏺ 1. 前往 Firebase Console

  1. 開啟瀏覽器前往：https://console.firebase.google.com/
  2. 使用 Google 帳號登入
  3. 點擊「新增專案」(Add project)

  2. 建立專案（三步驟）

  步驟 1：輸入專案名稱
  專案名稱：師聲論壇（或任何你想要的名稱）

  步驟 2：Google Analytics
  可以選擇「暫時不啟用」（初學不需要）

  步驟 3：等待建立完成
  大約 30 秒，完成後點「繼續」

  3. 新增 Web 應用程式

  進入專案後：

  1. 在專案總覽頁面，點擊 </> 圖示（Web 圖示）
  2. 輸入應用程式暱稱：師聲論壇-Web
  3. 不要勾選 Firebase Hosting（我們先不用）
  4. 點擊「註冊應用程式」

  4. 複製設定檔

  會看到類似這樣的程式碼：

  const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:xxxxxxxxxxxxx"
  };

  重要：先複製這段，等下會用到！

  ---
  🔧 步驟二：啟用 Firebase 服務

  1. 啟用 Authentication（用戶登入）

  在左側選單：
  1. 點擊「Authentication」→「開始使用」
  2. 選擇登入方式：
    - 點擊「電子郵件/密碼」→ 啟用 → 儲存
    - 點擊「Google」→ 啟用 → 輸入專案支援電子郵件 → 儲存

  2. 啟用 Firestore Database（資料庫）

  在左側選單：
  1. 點擊「Firestore Database」→「建立資料庫」
  2. 選擇位置：asia-east1（台灣） 或 asia-northeast1（日本）
  3. 安全性規則選擇：測試模式（暫時，等下會改）
  4. 點擊「啟用」

  3. 啟用 Storage（檔案儲存）

  在左側選單：
  1. 點擊「Storage」→「開始使用」
  2. 安全性規則選擇：測試模式
  3. 位置選擇：asia-east1 或 asia-northeast1
  4. 點擊「完成」

⏺ ---
  💻 步驟三：將 Firebase 整合到專案


 IntroduceToTheInternet_FinalProject/
  ├── 📄 配置檔案
  │   ├── .gitignore                    # Git 忽略規則
  │   ├── package.json                  # 前端依賴管理
  │   ├── package-lock.json             # 依賴鎖定檔
  │   ├── README.md                     # 專案說明文件
  │   ├── CLAUDE.md                     # Claude 開發指引
  │   └── FIREBASE_SETUP_GUIDE.md       # Firebase 設定指南
  │
  ├── 📂 public/                        # 靜態資源
  │   ├── index.html                    # HTML 模板
  │   ├── logo.png                      # 網站 Logo (1.8MB)
  │   ├── site_snapshot.html            # 網站快照
  │   └── images/                       # 圖片資源
  │
  ├── 📂 src/                           # 前端原始碼
  │   ├── index.js                      # React 入口點
  │   ├── index.css                     # 全局樣式
  │   ├── App.js                        # 主應用程式組件
  │   ├── firebase.js                   # Firebase 配置
  │   │
  │   ├── 📂 components/                # React 組件
  │   │   ├── Auth.js                   # 認證組件
  │   │   ├── Header.js                 # 網站導航列 ⭐
  │   │   ├── BoardNav.js               # 看板導航
  │   │   ├── BoardTemplate.js          # 看板模板 (共用)
  │   │   ├── PostForm.js               # 發文表單
  │   │   ├── Comment.js                # 單一留言組件
  │   │   ├── Comments.js               # 留言列表
  │   │   ├── LoginForm.js              # 登入表單 ⭐
  │   │   ├── RegistrationForm.js       # 註冊表單 ⭐
  │   │   ├── MemberCard.js             # 會員卡片
  │   │   ├── MemberDirectory.js        # 會員目錄
  │   │   ├── Gallery.js                # 圖片畫廊
  │   │   └── MediaDisplay.js           # 媒體顯示
  │   │
  │   ├── 📂 pages/                     # 頁面組件
  │   │   ├── HomePage.js               # 首頁
  │   │   ├── LoginPage.js              # 登入頁
  │   │   ├── BoardsIndexPage.js        # 看板索引
  │   │   ├── PostDetailPage.js         # 貼文詳情頁
  │   │   ├── ProfilePage.js            # 個人檔案頁
  │   │   ├── ProfileEditPage.js        # 編輯個人檔案
  │   │   ├── MemberPage.js             # 會員列表頁
  │   │   ├── MediaPage.js              # 媒體頁
  │   │   │
  │   │   └── 📁 看板頁面 (7個)
  │   │       ├── FoodBoardPage.js      # 美食看板
  │   │       ├── WeatherBoardPage.js   # 天氣看板
  │   │       ├── EventsBoardPage.js    # 活動看板
  │   │       ├── ClubsBoardPage.js     # 社團看板
  │   │       ├── CoursesBoardPage.js   # 課程看板
  │   │       ├── OutfitBoardPage.js    # 穿搭看板
  │   │       └── OtherBoardPage.js     # 其他看板
  │   │
  │   ├── 📂 contexts/                  # React Context
  │   │   └── AuthContext.js            # 認證上下文 ⭐
  │   │
  │   └── 📂 services/                  # 服務層
  │       └── postService.js            # Firestore 貼文服務
  │
  ├── 📂 backend/                       # 後端 API 服務
  │   ├── .env                          # 環境變數 (API Keys) 🔒
  │   ├── package.json                  # 後端依賴管理
  │   ├── server.js                     # Express 伺服器
  │   │   ├── POST /moderation          # 內容審核 API (Perspective API)
  │   │   └── POST /remove-bg           # 去背 API (Remove.bg)
  │   └── node_modules/                 # 後端依賴 (本機)
  │
  └── 📂 node_modules/                  # 前端依賴 (本機)

  📊 統計資料

  | 類別      | 數量   | 說明                                                   |
  |---------|------|------------------------------------------------------|
  | 前端組件    | 13 個 | src/components/                                      |
  | 頁面      | 15 個 | src/pages/                                           |
  | 看板      | 7 個  | Food, Weather, Events, Clubs, Courses, Outfit, Other |
  | Context | 1 個  | AuthContext (認證管理)                                   |
  | 服務      | 1 個  | postService (Firestore 操作)                           |
  | 後端 API  | 2 個  | 內容審核 + 圖片去背                                          |

  🔑 關鍵檔案說明

  ⭐ 最近修改的檔案：
  - src/components/Header.js - 導航列
  - src/components/LoginForm.js - 登入功能
  - src/components/RegistrationForm.js - 註冊功能
  - src/contexts/AuthContext.js - 全局認證狀態管理

  🌐 路由結構

  / -----------------------> HomePage
  /login -----------------> LoginPage
  /boards ----------------> BoardsIndexPage
  /boards/food -----------> FoodBoardPage (使用 BoardTemplate)
  /boards/weather --------> WeatherBoardPage
  /boards/events ---------> EventsBoardPage
  /boards/clubs ----------> ClubsBoardPage
  /boards/courses --------> CoursesBoardPage
  /boards/outfit ---------> OutfitBoardPage
  /boards/other ----------> OtherBoardPage
  /boards/:boardId/:postId -> PostDetailPage
  /members ---------------> MemberPage
  /profile ---------------> ProfilePage
  /profile/edit ----------> ProfileEditPage
  /media -----------------> MediaPage

  🔧 技術棧

  - 前端: React, React Router, Firebase (Auth, Firestore, Storage)
  - 後端: Node.js, Express, Google Perspective API, Remove.bg API
  - 部署: Backend on Render (https://introducetotheinternet-finalproject-0yrf.onrender.com)



  🚀 Express 是什麼？

  Express 是 Node.js 最流行的 Web 應用框架，用來建立後端伺服器和 API。

  簡單比喻：

  想像您開一家餐廳：
  - Node.js = 廚房的設備（爐子、冰箱、刀具）
  - Express = 餐廳的營運系統（點餐流程、出餐流程、收銀系統）

  Express 幫您處理：
  - 📥 接收請求 (客人點餐)
  - 🔄 處理邏輯 (廚師做菜)
  - 📤 回傳結果 (上菜給客人)

  ---
  📋 在您的專案中，Express 做了什麼？

  看 backend/server.js，您的 Express 伺服器提供了 2 個 API 端點：

  1️⃣ POST /remove-bg - 圖片去背 API

  app.post("/remove-bg", upload.single("image_file"), async (req, res) => {
    // 接收前端上傳的圖片
    // 轉發給 Remove.bg API 進行去背
    // 回傳去背後的圖片給前端
  });

  流程：
  前端上傳圖片
      ↓
  Express 接收
      ↓
  轉發給 Remove.bg API (使用後端的 API Key)
      ↓
  接收去背後的圖片
      ↓
  回傳給前端

  為什麼需要後端？
  - ✅ 保護 API Key（不暴露在前端程式碼中）
  - ✅ 作為「代理伺服器」(Proxy) 轉發請求

  2️⃣ POST /moderation - 內容審核 API

  app.post("/moderation", async (req, res) => {
    // 接收前端送來的文字內容
    // 呼叫 Google Perspective API 檢查是否有不當內容
    // 回傳審核結果 (是否違規)
  });

  流程：
  前端提交文字 (貼文/留言)
      ↓
  Express 接收
      ↓
  呼叫 Google Perspective API 分析
      ↓
  檢查：惡意言論、侮辱、髒話、威脅等
      ↓
  回傳結果：{ flagged: true/false, categories: {...} }

  審核項目：
  - ❌ 惡意言論 (TOXICITY)
  - ❌ 人身攻擊 (IDENTITY_ATTACK)
  - ❌ 侮辱性言論 (INSULT)
  - ❌ 髒話 (PROFANITY)
  - ❌ 威脅恐嚇 (THREAT)

  ---
  🔧 Express 的核心概念

  1. 建立伺服器

  const express = require('express');
  const app = express();  // 建立 Express 應用

  app.listen(3000);  // 在 port 3000 啟動伺服器

  2. 定義路由 (Route)

  // GET 請求
  app.get('/hello', (req, res) => {
    res.send('你好！');
  });

  // POST 請求
  app.post('/login', (req, res) => {
    res.json({ success: true });
  });

  3. 中介軟體 (Middleware)

  app.use(cors());           // 允許跨域請求
  app.use(express.json());   // 解析 JSON 格式的請求

  ---
  🌐 您的後端架構圖

  ┌─────────────────────────────────────────────┐
  │     React 前端 (http://localhost:3000)       │
  │  - 使用者上傳圖片                             │
  │  - 使用者發文/留言                            │
  └──────────────────┬──────────────────────────┘
                     │ HTTP 請求
                     ↓
  ┌─────────────────────────────────────────────┐
  │  Express 後端 (Render 部署)                  │
  │  https://introducetotheinternet-...         │
  │                                              │
  │  ┌────────────────────────────────────┐    │
  │  │  POST /remove-bg                    │    │
  │  │  - 接收圖片                          │    │
  │  │  - 呼叫 Remove.bg API               │    │
  │  │  - 回傳去背圖片                       │    │
  │  └────────────────────────────────────┘    │
  │                                              │
  │  ┌────────────────────────────────────┐    │
  │  │  POST /moderation                   │    │
  │  │  - 接收文字內容                       │    │
  │  │  - 呼叫 Google Perspective API      │    │
  │  │  - 回傳審核結果                       │    │
  │  └────────────────────────────────────┘    │
  └──────────────────┬──────────────────────────┘
                     │
             ┌───────┴────────┐
             ↓                ↓
      Remove.bg API    Google Perspective API

  ---
  📦 Express 使用的套件

  從 package.json 可以看到：

  | 套件         | 用途                              |
  |------------|---------------------------------|
  | express    | Web 框架（核心）                      |
  | cors       | 允許前端跨域請求                        |
  | dotenv     | 讀取 .env 環境變數                    |
  | multer     | 處理檔案上傳                          |
  | axios      | 發送 HTTP 請求給外部 API               |
  | googleapis | Google API 客戶端（Perspective API） |
  | form-data  | 建構表單資料                          |

  ---
  🎯 為什麼需要 Express 後端？

  ❌ 不用後端的問題：

  // 前端直接呼叫（不安全！）
  const API_KEY = "abc123xyz"; // ⚠️ 暴露在前端程式碼中！
  fetch('https://api.remove.bg/v1.0/removebg', {
    headers: { 'X-Api-Key': API_KEY }  // 任何人都能看到
  });

  ✅ 使用後端的優點：

  // 前端
  fetch('https://your-backend.com/remove-bg', {
    // 不需要 API Key
  });

  // 後端 (server.js)
  const API_KEY = process.env.REMOVE_BG_API_KEY; // ✅ 安全存在伺服器

  優點：
  1. 🔒 保護 API Key - 不會暴露在前端
  2. 🛡️ 安全控制 - 可以加入驗證、限流等保護
  3. 🔄 統一管理 - 所有外部 API 呼叫集中管理
  4. 💰 成本控制 - 避免 API Key 被盜用

  ---
  🚀 如何啟動您的 Express 後端？

  cd backend
  node server.js

  啟動後會看到：
  Server running on http://0.0.0.0:10000

  現在前端就可以呼叫：
  - POST http://localhost:10000/remove-bg
  - POST http://localhost:10000/moderation

  ---
  總結：Express 就是一個幫您輕鬆建立後端 API 伺服器的工具，讓前端可以安全地使用各種第三方服務！ 🎉

 全局語言管理系統

  - ✅ 創建 /src/contexts/LanguageContext.js
    - 提供全局語言狀態管理
    - 支援 localStorage 持久化存儲
    - 預設語言為英文 ('en')
    - 提供 useLanguage() hook 給所有頁面使用
  - ✅ 在 App.js 中整合 LanguageProvider
    - 包裹整個應用，讓所有頁面都能訪問語言設定

  使用 React Context API 進行全局狀態管理
  - localStorage 實現語言偏好持久化
  - 所有組件使用 useLanguage() hook 獲取當前語言
  - 使用三元運算符 language === 'zh' ? '中文' : 'English' 進行條件渲染
  - 保持所有原有功能和代碼結構不變