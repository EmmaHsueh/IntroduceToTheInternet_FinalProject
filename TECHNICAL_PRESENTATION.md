# 師聲 NTNU Talk - 技術架構與實作講解

## 📊 系統架構總覽

```
┌─────────────────────────────────────────────────────────────┐
│                        使用者介面                              │
│                    React Frontend (Port 3000)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   後端 API 服務層                              │
│              Node.js + Express (Port 10000)                  │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ 內容審核      │ 圖片去背      │ RAG 知識庫系統             │ │
│  │ /moderation  │ /remove-bg   │ /api/rag-test            │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼────────┐ ┌──▼──────────────┐
│ Firebase      │ │ External     │ │ AI/ML Services  │
│ - Auth        │ │ APIs         │ │ - Perspective   │
│ - Firestore   │ │ - Remove.bg  │ │ - RAG Vector    │
│ - Storage     │ │ - MyMemory   │ │   Retrieval     │
└───────────────┘ └──────────────┘ └─────────────────┘
```

---

## 🎯 一、前端架構 (React)

### 1.1 技術棧

```javascript
{
  "核心框架": "React 18.2.0",
  "路由": "React Router 7.9.5",
  "狀態管理": "Context API",
  "UI": "內聯樣式 + 自定義設計系統",
  "後端通訊": "Fetch API",
  "認證": "Firebase Auth",
  "數據庫": "Firebase Firestore"
}
```

### 1.2 目錄結構

```
src/
├── components/          # 可重用組件
│   ├── Header.js       # 導航欄
│   ├── BoardNav.js     # 看板導航
│   ├── BoardTemplate.js # 看板模板（重要！）
│   ├── ChatWidget.js   # 即時聊天室
│   ├── PostForm.js     # 發文表單
│   └── Icons.js        # 圖標組件
├── contexts/           # Context API 狀態管理
│   ├── AuthContext.js      # 認證狀態
│   └── LanguageContext.js  # 語言切換
├── pages/              # 頁面組件
│   ├── HomePage.js         # 首頁
│   ├── LoginPage.js        # 登入頁
│   ├── MatchingPage.js     # 智慧配對
│   ├── BoardsIndexPage.js  # 看板導航頁
│   ├── FoodBoardPage.js    # 美食看板（使用 BoardTemplate）
│   └── ...其他看板頁面
├── services/           # 業務邏輯
│   ├── postService.js  # 貼文 CRUD
│   └── chatService.js  # 聊天室服務
└── firebase.js         # Firebase 配置
```

### 1.3 核心架構模式：Template Pattern

**關鍵設計：BoardTemplate 組件**

所有看板頁面共用一個模板，避免代碼重複：

```javascript
// src/components/BoardTemplate.js (簡化版)
const BoardTemplate = ({ boardName }) => {
  const [posts, setPosts] = useState([]);
  const [showChat, setShowChat] = useState(false);

  // 🔥 重點 1: 實時監聽 Firestore
  useEffect(() => {
    const unsubscribe = listenToPosts(boardName, (newPosts) => {
      setPosts(newPosts);
    });
    return () => unsubscribe(); // 清理訂閱
  }, [boardName]);

  return (
    <>
      <Header />
      <BoardNav />

      {/* 看板標題 */}
      <h1>【{boardName}】看板討論區</h1>

      {/* 發文按鈕 */}
      <button onClick={() => setShowPostForm(true)}>
        + 發表新貼文
      </button>

      {/* 聊天室按鈕 */}
      <button onClick={() => setShowChat(!showChat)}>
        💬 即時聊天室
      </button>

      {/* 貼文列表 */}
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}

      {/* 聊天室 Widget */}
      {showChat && <ChatWidget boardName={boardName} />}
    </>
  );
};
```

**使用範例：**

```javascript
// src/pages/FoodBoardPage.js
const FoodBoardPage = () => {
  return <BoardTemplate boardName="Food" />;
};

// src/pages/EventsBoardPage.js
const EventsBoardPage = () => {
  return <BoardTemplate boardName="Events" />;
};
```

### 1.4 全局狀態管理：Context API

#### AuthContext - 認證狀態管理

```javascript
// src/contexts/AuthContext.js (重點代碼)
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // 🔥 監聽認證狀態變化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // 從 Firestore 加載用戶資料
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
    });

    return unsubscribe;
  }, []);

  // 🔥 註冊新用戶
  const signup = async (email, password, nickname) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth, email, password
    );

    // 在 Firestore 創建用戶資料
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      nickname: nickname,
      createdAt: new Date()
    });
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    // ...其他方法
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定義 Hook
export const useAuth = () => {
  return useContext(AuthContext);
};
```

#### LanguageContext - 多語言支援

```javascript
// src/contexts/LanguageContext.js (重點代碼)
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // 🔥 從 localStorage 讀取語言設定
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  // 🔥 持久化語言設定
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
```

### 1.5 路由系統

```javascript
// src/App.js (路由配置)
function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* 公開路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/boards" element={<BoardsIndexPage />} />

            {/* 看板路由 */}
            <Route path="/boards/food" element={<FoodBoardPage />} />
            <Route path="/boards/events" element={<EventsBoardPage />} />
            {/* ...其他看板 */}

            {/* 動態路由 */}
            <Route path="/boards/:boardId/:postId"
                   element={<PostDetailPage />} />

            {/* 功能路由 */}
            <Route path="/matching" element={<MatchingPage />} />
            <Route path="/events-map" element={<EventMapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>

          <AITalk /> {/* 全局 AI 助手 */}
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
```

---

## 🔧 二、後端架構 (Node.js + Express)

### 2.1 技術棧

```javascript
{
  "運行環境": "Node.js",
  "Web 框架": "Express.js",
  "文件上傳": "Multer",
  "HTTP 客戶端": "Axios",
  "部署平台": "Render",
  "環境變數": "dotenv"
}
```

### 2.2 Server.js 結構解析

```javascript
// backend/server.js (完整架構)

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

// ============================================
// 1️⃣ 中間件配置
// ============================================

// CORS 配置（允許前端跨域請求）
app.use(cors());

// JSON 解析
app.use(express.json({ limit: '50mb' }));

// 文件上傳配置（使用記憶體存儲）
const upload = multer({ storage: multer.memoryStorage() });

// ============================================
// 2️⃣ RAG 知識庫系統（AI 集成）
// ============================================

let KNOWLEDGE_BASE = [];

// 🔥 載入知識庫文件
function loadKnowledgeBase() {
  const content = fs.readFileSync('knowledge_base.txt', 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.trim().startsWith('#') || !line.trim()) continue;

    // 解析格式: [分類] 問題 | 答案
    const match = line.match(/\[(.+?)\]\s*(.+?)\s*\|\s*(.+)/);
    if (match) {
      const [, category, question, answer] = match;
      KNOWLEDGE_BASE.push({
        category,
        question,
        answer,
        text: `${question} ${answer}`,
        vector: textToVector(`${question} ${answer}`)
      });
    }
  }

  console.log(`✅ 載入 ${KNOWLEDGE_BASE.length} 條知識`);
}

// 🔥 文本向量化（TF-IDF）
function textToVector(text) {
  const tokens = simpleTokenize(text);
  return computeTF(tokens);
}

// 🔥 餘弦相似度計算
function cosineSimilarity(vec1, vec2) {
  const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  let dotProduct = 0, mag1 = 0, mag2 = 0;

  for (const key of allKeys) {
    const v1 = vec1[key] || 0;
    const v2 = vec2[key] || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

// 🔥 RAG 檢索函數
const retrieveFacts = (message, role = null, topK = 3) => {
  const queryVector = textToVector(message);

  // 計算相似度
  const results = KNOWLEDGE_BASE.map(item => ({
    ...item,
    similarity: cosineSimilarity(queryVector, item.vector)
  }));

  // 排序並過濾
  results.sort((a, b) => b.similarity - a.similarity);
  const filtered = results.filter(r => r.similarity > 0.1);

  return filtered.slice(0, topK).map(r => r.answer);
};

// 啟動時載入知識庫
loadKnowledgeBase();

// ============================================
// 3️⃣ API 端點
// ============================================

// 🔥 內容審核 API (Google Perspective)
app.post("/moderation", async (req, res) => {
  const { content } = req.body;

  try {
    const response = await axios.post(
      `${DISCOVERY_URL}`,
      {
        comment: { text: content },
        languages: ["zh", "en"],
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          THREAT: {},
          INSULT: {},
          PROFANITY: {},
          IDENTITY_ATTACK: {}
        }
      },
      {
        params: { key: PERSPECTIVE_API_KEY }
      }
    );

    // 檢查是否違規
    const scores = response.data.attributeScores;
    let flagged = false;
    const violations = [];

    for (const [attr, data] of Object.entries(scores)) {
      if (data.summaryScore.value >= THRESHOLD) {
        flagged = true;
        violations.push(ATTRIBUTE_MAPPING[attr]);
      }
    }

    res.json({ flagged, categories: violations });

  } catch (error) {
    console.error("審核失敗:", error);
    res.status(500).json({ error: "審核失敗" });
  }
});

// 🔥 圖片去背 API (Remove.bg Proxy)
app.post("/remove-bg", upload.single("image_file"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("image_file", req.file.buffer, req.file.originalname);
    formData.append("size", "auto");

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": REMOVE_BG_API_KEY
        },
        responseType: "arraybuffer"
      }
    );

    res.set("Content-Type", "image/png");
    res.send(response.data);

  } catch (error) {
    console.error("去背失敗:", error);
    res.status(500).json({ error: "去背處理失敗" });
  }
});

// 🔥 RAG 測試端點
app.post("/api/rag-test", async (req, res) => {
  const { question, topK = 3 } = req.body;

  const facts = retrieveFacts(question, null, topK);

  res.json({
    success: true,
    question,
    results: facts,
    count: facts.length
  });
});

// ============================================
// 4️⃣ 啟動服務器
// ============================================

const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0'; // Render 部署必須

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
```

---

## 💾 三、數據庫架構 (Firebase Firestore)

### 3.1 Firestore 集合結構

```
ntnu-talk (Project)
│
├── users/                    # 用戶集合
│   └── {userId}              # 文檔 ID = Firebase Auth UID
│       ├── uid: string
│       ├── email: string
│       ├── nickname: string
│       ├── avatar: string?
│       ├── bio: string?
│       ├── createdAt: Timestamp
│       └── ...其他欄位
│
├── posts/                    # 貼文集合
│   └── {postId}              # 自動生成的文檔 ID
│       ├── title: string
│       ├── content: string
│       ├── boardName: string      # 所屬看板
│       ├── authorId: string       # 作者 UID
│       ├── authorName: string
│       ├── imageUrls: array       # 圖片陣列
│       ├── createdAt: Timestamp
│       ├── commentCount: number
│       └── comments: array        # 留言陣列
│           └── [
│               {
│                 author: string,
│                 content: string,
│                 date: string,
│                 id: string
│               }
│             ]
│
└── chatMessages/             # 聊天訊息集合
    └── {messageId}           # 自動生成的文檔 ID
        ├── boardName: string      # 所屬看板
        ├── sender: string
        ├── senderId: string
        ├── content: string
        ├── createdAt: Timestamp
        └── expiresAt: Timestamp   # 30 天後過期
```

### 3.2 Firestore 操作實例

#### postService.js - 貼文服務

```javascript
// src/services/postService.js (重點代碼)

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// 🔥 實時監聽貼文（核心功能）
export const listenToPosts = (boardName, callback) => {
  const postsRef = collection(db, 'posts');

  // 構建查詢：過濾看板 + 按時間排序
  const q = query(
    postsRef,
    where('boardName', '==', boardName),
    orderBy('createdAt', 'desc')
  );

  // 設置實時監聽器
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(posts); // 回調函數更新 UI
  });

  return unsubscribe; // 返回取消訂閱函數
};

// 🔥 創建新貼文
export const createPost = async (postData) => {
  const postsRef = collection(db, 'posts');

  const newPost = {
    ...postData,
    createdAt: serverTimestamp(), // 使用服務器時間戳
    commentCount: 0,
    comments: []
  };

  const docRef = await addDoc(postsRef, newPost);
  return docRef.id;
};

// 🔥 新增留言
export const addCommentToPost = async (postId, comment) => {
  const postRef = doc(db, 'posts', postId);

  // 獲取當前貼文
  const postSnap = await getDoc(postRef);
  const currentComments = postSnap.data().comments || [];

  // 更新留言和計數
  await updateDoc(postRef, {
    comments: [...currentComments, comment],
    commentCount: currentComments.length + 1
  });
};
```

#### chatService.js - 聊天室服務

```javascript
// src/services/chatService.js (重點代碼)

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// 🔥 實時監聽聊天訊息
export const listenToChatMessages = (boardName, callback) => {
  const messagesRef = collection(db, 'chatMessages');

  const q = query(
    messagesRef,
    where('boardName', '==', boardName),
    orderBy('createdAt', 'asc') // 按時間升序
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

// 🔥 發送聊天訊息
export const sendChatMessage = async (boardName, sender, senderId, content) => {
  const messagesRef = collection(db, 'chatMessages');

  // 計算過期時間（30 天後）
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await addDoc(messagesRef, {
    boardName,
    sender,
    senderId,
    content,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt)
  });
};

// 🔥 清理過期訊息
export const cleanupExpiredMessages = async () => {
  const messagesRef = collection(db, 'chatMessages');
  const now = Timestamp.now();

  const q = query(
    messagesRef,
    where('expiresAt', '<', now)
  );

  const snapshot = await getDocs(q);

  let count = 0;
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
    count++;
  }

  return count;
};
```

---

## 🌐 四、外部 API 整合

### 4.1 Google Perspective API - 內容審核

**用途：** 偵測惡意、威脅、侮辱等不當言論

```javascript
// 審核流程
用戶發文/留言
    ↓
前端調用 /moderation 端點
    ↓
後端轉發到 Google Perspective API
    ↓
分析 6 種屬性（惡意、威脅、侮辱...）
    ↓
返回分數 (0-1)
    ↓
超過閾值 (0.5) → 阻擋發布
    ↓
未超過 → 允許發布
```

**關鍵代碼：**

```javascript
// 前端調用
const moderationCheck = async (content) => {
  const response = await fetch(`${BACKEND_URL}/moderation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  const { flagged, categories } = await response.json();

  if (flagged) {
    alert(`內容違規：${categories.join(', ')}`);
    return false;
  }
  return true;
};
```

### 4.2 Remove.bg API - 圖片去背

**用途：** 自動去除圖片背景

```javascript
// 前端使用
const handleRemoveBackground = async (file) => {
  const formData = new FormData();
  formData.append('image_file', file);

  const response = await fetch(`${BACKEND_URL}/remove-bg`, {
    method: 'POST',
    body: formData
  });

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);

  return imageUrl;
};
```

### 4.3 MyMemory Translation API - 翻譯服務

**用途：** 中英文翻譯

```javascript
// 後端實現
app.post("/translate", async (req, res) => {
  const { title, content } = req.body;

  const translateText = async (text) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh|en`;
    const response = await axios.get(url);
    return response.data.responseData.translatedText;
  };

  const translatedTitle = await translateText(title);
  const translatedContent = await translateText(content);

  res.json({ translatedTitle, translatedContent });
});
```

---

## 🤖 五、AI 整合 - RAG 知識庫系統

### 5.1 RAG 架構

```
┌─────────────────────────────────────────────────┐
│              RAG 檢索流程                         │
└─────────────────────────────────────────────────┘

1️⃣ 知識庫載入階段（啟動時執行一次）
   ├─ 讀取 knowledge_base.txt
   ├─ 解析每行：[分類] 問題 | 答案
   ├─ 文本向量化（TF-IDF）
   └─ 存儲在記憶體

2️⃣ 查詢階段（每次用戶提問）
   ├─ 用戶問題 → 向量化
   ├─ 計算餘弦相似度（與所有知識比對）
   ├─ 排序（相似度從高到低）
   ├─ 過濾（相似度 > 0.1）
   └─ 返回前 topK 條（預設 3 條）

3️⃣ 整合階段（與 LLM 結合）
   ├─ 檢索到的知識作為 Context
   ├─ 構建增強的 Prompt
   └─ LLM 基於 Context 生成回答
```

### 5.2 核心演算法

#### 分詞（Tokenization）

```javascript
function simpleTokenize(text) {
  // 移除標點符號
  const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ');
  const tokens = [];

  // 中文：每個字作為一個 token
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (/[\u4e00-\u9fa5]/.test(char)) {
      tokens.push(char);
    }
  }

  // 英文：按詞分割
  const words = cleaned.match(/[a-zA-Z0-9]+/g) || [];
  tokens.push(...words.map(w => w.toLowerCase()));

  return tokens;
}

// 範例
simpleTokenize("選課有哪些階段？")
// → ["選", "課", "有", "哪", "些", "階", "段"]
```

#### 詞頻計算（TF）

```javascript
function computeTF(tokens) {
  const tf = {};
  const totalTokens = tokens.length;

  // 計數
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  // 標準化（除以總數）
  for (const token in tf) {
    tf[token] = tf[token] / totalTokens;
  }

  return tf;
}

// 範例
computeTF(["選", "課", "選", "課"])
// → { "選": 0.5, "課": 0.5 }
```

#### 餘弦相似度

```javascript
function cosineSimilarity(vec1, vec2) {
  // vec1 = { "選": 0.5, "課": 0.5 }
  // vec2 = { "選": 0.3, "課": 0.3, "有": 0.4 }

  const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (const key of allKeys) {
    const v1 = vec1[key] || 0;
    const v2 = vec2[key] || 0;

    dotProduct += v1 * v2;  // 點積
    mag1 += v1 * v1;         // 向量1長度平方
    mag2 += v2 * v2;         // 向量2長度平方
  }

  // 餘弦相似度 = 點積 / (長度1 * 長度2)
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

// 範例
cosineSimilarity(
  { "選": 0.5, "課": 0.5 },
  { "選": 0.3, "課": 0.3, "有": 0.4 }
)
// → 0.707... (越接近 1 表示越相似)
```

### 5.3 知識庫格式

```txt
# knowledge_base.txt 格式

[Academic] 選課有哪些階段？ | 師大選課主要分「初選」和「加退選」兩階段...

[Food] 師大有什麼必吃美食？ | 師大商圈最具代表性的宵夜是師園鹽酥雞...

[Lifestyle] 參加社團有什麼好處？ | 課外活動是大學學習生活中非常重要的一環...
```

---

## 🎨 六、關鍵功能實作

### 6.1 多語言切換

**全局狀態 + localStorage 持久化**

```javascript
// Context 設置
const [language, setLanguage] = useState(() => {
  return localStorage.getItem('appLanguage') || 'en';
});

useEffect(() => {
  localStorage.setItem('appLanguage', language);
}, [language]);

// 使用範例
const Header = () => {
  const { language } = useLanguage();

  const text = {
    zh: { home: '首頁', boards: '看板' },
    en: { home: 'Home', boards: 'Boards' }
  };

  return <nav>{text[language].home}</nav>;
};
```

### 6.2 實時聊天室

**Firestore onSnapshot + 30天過期機制**

```javascript
const ChatWidget = ({ boardName }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 監聽訊息
    const unsubscribe = listenToChatMessages(boardName, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [boardName]);

  const sendMessage = async (content) => {
    await sendChatMessage(
      boardName,
      userProfile.nickname,
      currentUser.uid,
      content
    );
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.sender}:</strong> {msg.content}
        </div>
      ))}
      <input onSubmit={sendMessage} />
    </div>
  );
};
```

### 6.3 智慧配對系統

**基於興趣、語言、時間的匹配演算法**

```javascript
const executeMatching = (users, currentUser, matchType) => {
  // 計算配對分數
  const scores = users.map(user => {
    let score = 0;

    // 興趣匹配 (40%)
    const commonInterests = intersection(
      currentUser.interests,
      user.interests
    );
    score += (commonInterests.length / 10) * 40;

    // 語言互補 (30%)
    if (matchType === 'language') {
      if (currentUser.nativeLanguage === user.targetLanguage &&
          currentUser.targetLanguage === user.nativeLanguage) {
        score += 30;
      }
    }

    // 時間匹配 (30%)
    const timeOverlap = calculateTimeOverlap(
      currentUser.availableTime,
      user.availableTime
    );
    score += timeOverlap * 30;

    return { user, score };
  });

  // 排序並返回
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};
```

---

## 🚀 七、部署架構

### 7.1 前端部署 (Vercel/Netlify)

```bash
# 構建
npm run build

# 部署配置
{
  "build": {
    "command": "npm run build",
    "output": "build"
  },
  "routes": [
    { "src": "/static/(.*)", "dest": "/static/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### 7.2 後端部署 (Render)

```yaml
# render.yaml
services:
  - type: web
    name: ntnu-talk-backend
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: PERSPECTIVE_API_KEY
        sync: false
      - key: REMOVE_BG_API_KEY
        sync: false
      - key: PORT
        value: 10000
```

---

## 📊 八、效能優化

### 8.1 Firestore 查詢優化

```javascript
// ✅ 好的做法：使用索引 + 限制數量
const q = query(
  collection(db, 'posts'),
  where('boardName', '==', 'Food'),
  orderBy('createdAt', 'desc'),
  limit(20) // 限制數量
);

// ❌ 壞的做法：載入所有數據
const allPosts = await getDocs(collection(db, 'posts'));
```

### 8.2 圖片優化

```javascript
// Base64 轉 Blob 減少記憶體使用
const base64ToBlob = (base64) => {
  const [header, data] = base64.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
};
```

---

## 🔐 九、安全性考量

### 9.1 Firebase 安全規則

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用戶只能讀取自己的資料
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // 貼文：已登入可讀，作者可寫
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

### 9.2 API Key 保護

```javascript
// ❌ 錯誤：暴露在前端
const API_KEY = "sk-1234567890";

// ✅ 正確：使用後端代理
// 前端 → 後端 /moderation → Google API
```

---

## 🎯 十、總結

### 技術亮點

1. **模板化設計** - BoardTemplate 避免代碼重複
2. **實時同步** - Firestore onSnapshot 實現即時更新
3. **Context API** - 輕量級狀態管理
4. **RAG 系統** - 向量檢索增強 AI 回答
5. **API 代理** - 保護敏感 Key
6. **多語言支援** - 完整的 i18n 實現

### 架構優勢

- ✅ **可擴展性** - 新增看板只需一行代碼
- ✅ **可維護性** - 清晰的分層架構
- ✅ **效能優化** - 實時訂閱 + 查詢優化
- ✅ **安全性** - Firebase 規則 + API 代理
- ✅ **用戶體驗** - 實時更新 + 多語言

### 改進空間

1. 圖片儲存改用 Firebase Storage
2. 實現分頁載入（infinite scroll）
3. 添加全文搜索功能
4. 使用 Redis 快取熱門貼文
5. 升級 RAG 使用 OpenAI Embeddings

---

**講解完畢！** 🎉

有任何問題歡迎提問！
