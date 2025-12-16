# 師聲 (Teacher's Voice) - 師大校園論壇系統

> 一個結合 React + Firebase + AI 聊天機器人的現代化校園論壇平台

## 專案簡介

「師聲」是一個專為台灣師範大學設計的校園論壇系統，提供學生討論美食、天氣、活動、社團、課程等主題的互動平台。系統整合了即時聊天、AI 智能助手、內容審核、圖片去背等功能，打造完整的校園社群體驗。

### 核心功能

- 用戶認證系統：Email/Password 與 Google OAuth 登入
- 多板塊論壇：美食、天氣、活動、社團、課程、穿搭、其他
- 即時聊天室：每個板塊獨立的 Firebase 即時聊天功能
- AI 智能助手：整合 Google Gemini + RAG 知識庫，提供校園資訊問答
- 圖片處理：多圖上傳、圖片去背功能
- 內容審核：使用 Google Perspective API 自動偵測不當內容
- 翻譯功能：支援貼文多語言翻譯
- 會員系統：個人資料、頭像、自我介紹

---

## 系統架構總覽

```
┌────────────────────────────────────────────────────────────────┐
│                        使用者瀏覽器                              │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              前端 (React 18.2.0)                      │     │
│  │  • React Router (路由管理)                             │     │
│  │  • Context API (全局狀態管理)                          │     │
│  │  • Firebase SDK (客戶端)                              │     │
│  └──────────────┬────────────────┬──────────────────────┘     │
└─────────────────┼────────────────┼─────────────────────────────┘
                  │                │
                  │                │
        ┌─────────▼────────┐  ┌───▼──────────────────────┐
        │  Firebase 服務    │  │  Node.js + Express 後端   │
        │  (Google Cloud)  │  │  (Render 託管)            │
        ├──────────────────┤  ├──────────────────────────┤
        │ • Firestore DB   │  │ API 端點:                 │
        │ • Authentication │  │  /moderation             │
        │ • Storage        │  │  /remove-bg              │
        └──────────────────┘  │  /chat                   │
                              │  /api/translate          │
                              │  /api/health             │
                              │                          │
                              │ RAG 知識庫系統:           │
                              │  • knowledge_base.txt    │
                              │  • 向量檢索邏輯           │
                              └────────┬─────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      │         外部 API 服務            │
                      ├─────────────────────────────────┤
                      │ • Google Perspective API (審核) │
                      │ • Remove.bg API (圖片去背)       │
                      │ • Google Gemini API (AI 聊天)   │
                      │ • MyMemory Translation API      │
                      └─────────────────────────────────┘
```

---

## 技術架構詳解

### 前端技術棧

```
前端
├── React 18.2.0                 UI 框架
├── React Router DOM 7.9.5       頁面路由管理
├── Firebase SDK 10.10.0         後端服務整合
├── React Icons 5.5.0            圖標庫
└── React Scripts 5.0.1          構建工具 (Create React App)
```

### 後端技術棧

```
後端
├── Node.js                      JavaScript 執行環境
├── Express 5.2.1                Web 框架
├── Firebase Admin               Firebase 服務端 SDK
├── Multer 2.0.2                 檔案上傳處理
├── Axios 1.13.2                 HTTP 請求
├── CORS 2.8.5                   跨域資源共享
└── Dotenv 17.2.3                環境變數管理
```

---

## 專案檔案結構

### 前端結構

```
src/
├── components/              # 可重用組件
│   ├── Header.js           # 網站導航列
│   ├── BoardNav.js         # 板塊導航
│   ├── PostForm.js         # 發文表單（含多圖上傳、去背、審核）
│   ├── ChatWidget.js       # 即時聊天室組件
│   ├── MemberCard.js       # 會員卡片
│   └── MemberDirectory.js  # 會員目錄
│
├── contexts/               # React Context 全局狀態
│   └── AuthContext.js      # 認證狀態管理
│
├── pages/                  # 頁面組件
│   ├── HomePage.js         # 首頁
│   ├── LoginPage.js        # 登入/註冊頁面
│   ├── BoardTemplate.js    # 板塊模板（所有板塊共用）
│   ├── PostDetailPage.js   # 貼文詳細頁面
│   ├── ProfilePage.js      # 個人資料頁
│   ├── ProfileEditPage.js  # 編輯個人資料
│   ├── MembersPage.js      # 會員列表
│   ├── MediaPage.js        # 媒體頁面
│   └── BoardIndexPage.js   # 板塊索引
│
├── services/               # 業務邏輯服務
│   ├── postService.js      # 貼文 CRUD (Firestore)
│   └── chatService.js      # 聊天訊息 CRUD (Firestore)
│
├── firebase.js             # Firebase 配置
├── App.js                  # 主應用組件 + 路由配置
└── index.js                # 應用入口
```

### 後端結構

```
backend/
├── server.js               # Express 伺服器主程式
│   ├── RAG 系統 (第 34-205 行)
│   │   ├── loadKnowledgeBase()    # 載入知識庫
│   │   ├── simpleTokenize()       # 中文分詞
│   │   ├── textToVector()         # 文字向量化
│   │   ├── cosineSimilarity()     # 相似度計算
│   │   └── retrieveFacts()        # 知識檢索
│   │
│   ├── API 端點
│   │   ├── POST /remove-bg        # 圖片去背
│   │   ├── POST /moderation       # 內容審核
│   │   ├── POST /chat             # AI 聊天
│   │   ├── POST /api/translate    # 翻譯
│   │   └── GET  /api/health       # 健康檢查
│   │
│   └── 環境變數配置
│
├── knowledge_base.txt      # RAG 知識庫資料 (34 條師大校園資訊)
├── test_rag.js            # RAG 系統測試腳本
├── package.json           # 後端依賴配置
└── .env                   # 環境變數 (不上傳 Git)
```

---

## 資料流程圖

### 發文流程

```
使用者填寫貼文
       │
       ├─ 標題 + 內容
       ├─ 上傳多張圖片
       └─ (可選) 圖片去背
       │
       ▼
┌────────────────────┐
│  前端 PostForm.js  │
└──────┬─────────────┘
       │
       ├─ Step 1: 圖片去背 (可選)
       │  POST /remove-bg
       │  ├─ 前端上傳原圖
       │  ├─ 後端轉發給 Remove.bg API
       │  └─ 返回去背後的圖片
       │
       ├─ Step 2: 內容審核
       │  POST /moderation
       │  ├─ 前端傳送：{ content: "標題 + 內容" }
       │  ├─ 後端呼叫 Google Perspective API
       │  ├─ 檢查：惡意言論、人身攻擊、侮辱等
       │  └─ 返回：{ flagged: true/false, categories: {...} }
       │
       │  如果違規 → 阻止發文，顯示違規原因
       │  如果通過 → 繼續下一步
       │
       └─ Step 3: 寫入 Firestore
          createPost() (postService.js)
          ├─ 文章資料：
          │  {
          │    title: "標題",
          │    content: "內容",
          │    boardName: "Food",
          │    authorId: "user123",
          │    authorName: "暱稱",
          │    imageUrls: ["data:image/png;base64,..."],
          │    createdAt: Timestamp,
          │    commentCount: 0,
          │    comments: []
          │  }
          └─ 寫入 Firestore "posts" collection
       │
       ▼
所有訂閱此板塊的用戶即時看到新貼文 (onSnapshot)
```

### AI 聊天流程

```
使用者提問：「師大有什麼好吃的？」
       │
       ▼
前端發送請求
POST /chat
Body: { message: "師大有什麼好吃的？", role: "gentle" }
       │
       ▼
┌─────────────────────────────────┐
│  後端 RAG 系統處理               │
├─────────────────────────────────┤
│ Step 1: 文字向量化               │
│  simpleTokenize()               │
│  → ["師","大","有","什","麼"...] │
│  textToVector()                 │
│  → { "師": 0.125, "大": 0.125... }│
│                                 │
│ Step 2: 知識庫檢索               │
│  與 34 條知識計算相似度           │
│  cosineSimilarity()             │
│  → 找到前 3 條最相關知識：         │
│     1. [Food] 師大有什麼必吃美食？│
│     2. [Food] 師大有什麼甜點推薦？│
│     3. [Food] 師大有什麼平價小吃？│
│                                 │
│ Step 3: 生成 Prompt              │
│  角色設定：溫柔學姊               │
│  檢索到的知識：[上述 3 條]        │
│  使用者問題：師大有什麼好吃的？    │
└─────────────┬───────────────────┘
              │
              ▼
呼叫 Google Gemini API
model: "gemini-2.5-flash"
       │
       ▼
返回 AI 生成回覆
{ reply: "學姊告訴你～師大商圈最具代表性的宵夜是師園鹽酥雞..." }
       │
       ▼
前端顯示回覆給使用者
```

### 即時聊天流程

```
使用者在板塊點擊「即時聊天室」
       │
       ▼
┌──────────────────────────┐
│  ChatWidget.js 掛載      │
└────────┬─────────────────┘
         │
         ├─ useEffect 設定監聽器
         │  listenToChatMessages(boardName)
         │  onSnapshot(query(chatMessages, where("boardName", "==", "Food")))
         │
         ├─ 即時接收訊息
         │  所有該板塊的聊天訊息自動同步
         │
         └─ 使用者發送訊息
            sendChatMessage()
            │
            ├─ 檢查登入狀態 (currentUser)
            ├─ 寫入 Firestore:
            │  {
            │    boardName: "Food",
            │    sender: "暱稱",
            │    senderId: "user123",
            │    content: "訊息內容",
            │    createdAt: Timestamp,
            │    expiresAt: Timestamp + 30 天
            │  }
            └─ 所有在此板塊的用戶即時看到新訊息
```

---

## 資料庫結構 (Firestore)

### Collection: users

```javascript
{
  uid: "firebase_user_id",
  email: "user@example.com",
  nickname: "暱稱",
  user_login: "username",
  first_name: "名",
  last_name: "姓",
  gender: "男/女/保密",
  avatar: "emoji-student",
  bio: "自我介紹",
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

### Collection: posts

```javascript
{
  title: "師園鹽酥雞真的超好吃！",
  content: "昨天去吃了師園鹽酥雞...",
  boardName: "Food",
  authorId: "user123",
  authorName: "美食愛好者",
  imageUrls: ["data:image/png;base64,..."],
  createdAt: Timestamp,
  commentCount: 5,
  comments: [
    {
      id: "comment1",
      author: "回覆者",
      authorId: "user456",
      content: "我也覺得超好吃！",
      createdAt: Timestamp
    }
  ]
}
```

### Collection: chatMessages

```javascript
{
  boardName: "Food",
  sender: "聊天者暱稱",
  senderId: "user789",
  content: "有人知道師園今天有開嗎？",
  createdAt: Timestamp,
  expiresAt: Timestamp  // 30 天後自動刪除
}
```

---

## API 端點說明

### 後端 API (Render 託管)

**Base URL**: `https://introducetotheinternet-finalproject-0yrf.onrender.com`

| 端點 | 方法 | 功能 | 請求格式 | 回應格式 |
|------|------|------|----------|----------|
| `/moderation` | POST | 內容審核 | `{ content: string }` | `{ flagged: boolean, categories: object }` |
| `/remove-bg` | POST | 圖片去背 | `FormData { image_file: File }` | `PNG 圖片二進位資料` |
| `/chat` | POST | AI 聊天 | `{ message: string, role: string }` | `{ reply: string }` |
| `/api/translate` | POST | 文字翻譯 | `{ title: string, content: string, targetLanguage: string }` | `{ translatedTitle: string, translatedContent: string }` |
| `/api/health` | GET | 健康檢查 | - | `{ status: string, knowledgeBase: object }` |

---

## 安裝與執行

### 前置需求

- Node.js 16+
- npm 或 yarn
- Firebase 專案 (已配置)
- 各項 API Keys (見環境變數配置)

### 前端安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start

# 開啟瀏覽器
# http://localhost:3000
```

### 後端安裝與啟動

```bash
# 進入後端目錄
cd backend

# 安裝依賴
npm install

# 創建 .env 檔案（見下方環境變數配置）
touch .env

# 啟動後端伺服器
node server.js

# 伺服器運行在
# http://localhost:10000
```

---

## 環境變數配置

### 後端 .env 檔案

```bash
# Google Perspective API (內容審核)
PERSPECTIVE_API_KEY=your_perspective_api_key

# Remove.bg API (圖片去背)
REMOVE_BG_API_KEY=your_removebg_api_key

# Google Gemini API (AI 聊天)
GEMINI_API_KEY=your_gemini_api_key

# 伺服器設定
PORT=10000
NODE_ENV=production
```

### 前端 Firebase 配置

已配置在 `src/firebase.js`：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCwWX...",
  authDomain: "ntnu-talk.firebaseapp.com",
  projectId: "ntnu-talk",
  storageBucket: "ntnu-talk.firebasestorage.app",
  messagingSenderId: "851424068343",
  appId: "1:851424068343:web:..."
};
```

---

## 測試

### RAG 知識庫測試

```bash
cd backend

# 執行完整測試套件
node test_rag.js

# 測試單個問題
node test_rag.js 師大有什麼好吃的？
```

### 健康檢查

```bash
# 本地測試
curl http://localhost:10000/api/health

# 正式環境測試
curl https://introducetotheinternet-finalproject-0yrf.onrender.com/api/health
```

---

## 核心組件說明

### 前端核心組件

#### AuthContext.js - 全局認證狀態管理

功能：
- 提供全局的用戶登入狀態 (currentUser, userProfile)
- 註冊/登入/登出功能
- Google OAuth 登入
- 自動同步 Firestore 用戶資料

#### BoardTemplate.js - 板塊模板

功能：
- 所有板塊（美食、天氣等）共用的 UI 模板
- 整合 PostForm (發文)、貼文列表、ChatWidget (聊天)
- 使用 onSnapshot 即時監聽 Firestore 貼文變化

#### PostForm.js - 發文表單

功能：
- 多圖片上傳（支援預覽）
- 呼叫 /remove-bg API 進行圖片去背
- 呼叫 /moderation API 進行內容審核
- 審核通過後寫入 Firestore

#### ChatWidget.js - 即時聊天室

功能：
- 每個板塊獨立的聊天室
- 使用 onSnapshot 即時同步訊息
- 訊息保留 30 天自動刪除
- 支援表情符號、換行

### 後端核心模組

#### RAG 知識庫系統 (server.js 第 34-205 行)

功能：
- 載入 knowledge_base.txt (34 條師大資訊)
- 中文分詞與向量化 (TF 模型)
- 餘弦相似度檢索
- 為 Gemini API 提供上下文知識

#### API 代理層

功能：
- 隱藏 API Keys (不暴露在前端)
- 統一錯誤處理
- 請求轉發 (Remove.bg, Perspective, Gemini, MyMemory)

---

## 特色功能實作

### RAG 增強式生成 (Retrieval-Augmented Generation)

**技術實作**：
- 自製 TF 向量化 (Term Frequency)
- 餘弦相似度計算
- 記憶體內向量檢索
- 整合 Gemini API 生成回覆

**知識庫**：`knowledge_base.txt` (34 條)
- 選課規則
- 美食推薦
- 社團活動
- 宿舍資訊
- 校園設施
- 課程學習
- 國際交流

### 多角色 AI 聊天

支援 3 種 AI 角色：

| 角色 ID | 人設 | 語氣 |
|---------|------|------|
| `gentle` | 溫柔學姊 | 體貼、有耐心、鼓勵性 |
| `funny` | 搞笑學長 | 幽默風趣、白爛但善良 |
| `default` | 大笨鳥 | 呆萌、提供情緒價值 |

### 即時聊天室

**技術實作**：
- Firestore onSnapshot 即時監聽
- 板塊隔離 (每個板塊獨立聊天室)
- 自動過期機制 (30 天後刪除)
- 登入才能發言

### 內容審核機制

**審核項目**：
- 惡意言論 (TOXICITY)
- 嚴重惡意言論 (SEVERE_TOXICITY)
- 人身攻擊 (IDENTITY_ATTACK)
- 侮辱性言論 (INSULT)
- 髒話/不雅字眼 (PROFANITY)
- 威脅恐嚇 (THREAT)

**閾值**：0.5 (可在 server.js 調整)

---

## 專案亮點

1. **前後端分離架構**：React 前端 + Node.js 後端 + Firebase BaaS
2. **即時同步**：Firestore onSnapshot 實現即時更新
3. **AI 整合**：Gemini + 自建 RAG 知識庫
4. **安全性**：內容審核、API Key 隔離、Firebase Security Rules
5. **使用者體驗**：即時聊天、多圖上傳、圖片去背、翻譯功能
6. **可擴展性**：模板化設計、服務層抽離、環境變數配置

---

## 未來改進方向

- 圖片改用 Firebase Storage (取代 Base64)
- 貼文分頁/無限滾動
- 用戶權限系統 (編輯/刪除自己的貼文)
- 貼文按讚/收藏功能
- 進階 RAG (使用 OpenAI Embeddings + 向量資料庫)
- 搜尋功能 (標題、內容、作者)
- 通知系統 (被回覆時通知)
- PWA 支援 (離線存取)

---

## 開發者注意事項

### 修改知識庫

編輯 `backend/knowledge_base.txt`，格式：

```
[分類] 問題 | 答案
```

重啟伺服器後自動載入。

### 調整內容審核敏感度

編輯 `backend/server.js` 第 216 行：

```javascript
const THRESHOLD = 0.5;  // 降低 = 更嚴格，提高 = 更寬鬆
```

### 新增板塊

1. 建立頁面組件 (如 `NewBoardPage.js`)
2. 渲染 `<BoardTemplate boardName="新板塊" />`
3. 在 `App.js` 加入路由
4. 在 `BoardNav.js` 加入導航連結

---


