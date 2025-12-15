# RAG 向量知識庫 - 快速開始指南

## 🎯 已完成的功能

✅ 創建靜態知識庫文件 (`knowledge_base.txt`)
✅ 實現文本向量化（TF-IDF）
✅ 實現餘弦相似度計算
✅ 實現 RAG 檢索函數
✅ 創建測試端點
✅ 創建測試腳本

## 📁 文件結構

```
backend/
├── server.js              # 主服務器（已整合 RAG）
├── knowledge_base.txt     # 靜態知識庫文件
├── test_rag.js           # RAG 測試腳本
├── RAG_README.md         # 詳細使用說明
└── QUICK_START.md        # 快速開始指南（本文件）
```

## 🚀 快速開始

### 1. 啟動服務器

```bash
cd backend
node server.js
```

你應該看到：
```
✅ 成功載入 XX 條知識庫條目
Server running on http://0.0.0.0:10000
```

### 2. 測試 RAG 系統

#### 方法一：使用測試腳本（推薦）

```bash
# 執行完整測試套件
node test_rag.js

# 測試單個問題
node test_rag.js 選課有哪些階段？
node test_rag.js 師大有什麼好吃的？
```

#### 方法二：使用 curl

```bash
# 測試 RAG 檢索
curl -X POST http://localhost:10000/api/rag-test \
  -H "Content-Type: application/json" \
  -d '{"question": "選課有哪些階段？", "topK": 3}'

# 健康檢查
curl http://localhost:10000/api/health
```

#### 方法三：使用 Postman 或其他 API 工具

**端點:** `POST http://localhost:10000/api/rag-test`

**請求 Body (JSON):**
```json
{
  "question": "選課有哪些階段？",
  "topK": 3
}
```

**響應範例:**
```json
{
  "success": true,
  "question": "選課有哪些階段？",
  "topK": 3,
  "results": [
    "師大選課主要分「初選」和「加退選」兩階段...",
    "通識和體育課程多採志願分發制...",
    "..."
  ],
  "count": 3
}
```

## 🔧 整合到 AI 對話

在你的 AI 對話端點中使用 RAG：

```javascript
// 在 server.js 中添加或修改 AI 對話端點
app.post("/api/chat", async (req, res) => {
    const { message, role } = req.body;

    try {
        // 1. 使用 RAG 檢索相關知識
        const relevantFacts = retrieveFacts(message, role, 3);

        // 2. 構建包含知識的系統提示詞
        let systemPrompt = "你是師大的 AI 助手，請用友善、專業的方式回答問題。";

        if (relevantFacts.length > 0) {
            systemPrompt += "\n\n【參考資料】\n";
            relevantFacts.forEach((fact, i) => {
                systemPrompt += `${i + 1}. ${fact}\n`;
            });
            systemPrompt += "\n請基於以上資料，用自然的語言回答用戶問題。如果資料中沒有相關信息，請誠實告知。";
        }

        // 3. 調用你的 LLM API（OpenAI, Gemini, 等）
        // const aiResponse = await callYourLLM(systemPrompt, message);

        // 4. 返回結果
        res.json({
            answer: aiResponse,
            sources: relevantFacts.length // 告訴用戶參考了幾條資料
        });

    } catch (error) {
        console.error("對話錯誤:", error);
        res.status(500).json({ error: "處理失敗" });
    }
});
```

## 📝 如何新增知識

1. 打開 `backend/knowledge_base.txt`

2. 按照格式添加：
   ```
   [分類] 問題 | 答案
   ```

3. 範例：
   ```
   [Academic] 如何辦理休學？ | 休學需要在學期開始前向教務處提出申請，並填寫休學申請表。休學期間最長為兩年...

   [Food] 校內有什麼餐廳？ | 師大校內有多個餐廳，包括學生餐廳、便利商店等，提供平價且多樣的餐點選擇...
   ```

4. 重啟服務器使更改生效：
   ```bash
   # Ctrl+C 停止服務器
   node server.js  # 重新啟動
   ```

## 🎨 分類標籤說明

- `[Academic]` - 學術、選課、考試相關
- `[Food]` - 美食推薦、餐廳資訊
- `[Lifestyle]` - 社團、活動、校園生活
- `[Dormitory]` - 宿舍、住宿相關
- `[Campus]` - 校園設施、服務
- `[International]` - 國際交流、交換學生
- `[Career]` - 就業、職涯、實習

可以根據需要添加新的分類！

## 📊 系統運作流程

```
用戶提問
    ↓
[1] 問題向量化
    ↓
[2] 與知識庫計算相似度
    ↓
[3] 排序並過濾
    ↓
[4] 返回前 topK 條
    ↓
[5] 整合到 AI 提示詞
    ↓
[6] 生成回答
```

## 🔍 查看檢索日誌

當 RAG 檢索執行時，server console 會顯示：

```
🔍 檢索到 3 條相關知識:
  1. [Academic] 相似度: 0.456 - 選課有哪些階段？...
  2. [Academic] 相似度: 0.342 - 什麼是衝堂？...
  3. [Academic] 相似度: 0.287 - 通識課程如何選課？...
```

## ⚙️ 調整參數

### 調整返回數量

```javascript
const facts = retrieveFacts(message, role, 5); // 返回前 5 條
```

### 調整相似度閾值

在 `server.js` 的 `retrieveFacts` 函數中（約第 190 行）：

```javascript
const filtered = results.filter(r => r.similarity > 0.1); // 改為 0.2 更嚴格
```

## 🐛 常見問題

### Q: 知識庫沒有載入？

**A:** 檢查：
1. `knowledge_base.txt` 是否在 `backend/` 目錄下
2. 文件格式是否正確（`[分類] 問題 | 答案`）
3. 查看 server 啟動日誌是否顯示載入成功

### Q: 檢索結果不準確？

**A:**
1. 增加更多相關的知識條目
2. 使用更多同義詞描述同一個概念
3. 調整相似度閾值
4. 考慮使用更進階的向量化方法（OpenAI Embeddings）

### Q: 如何部署到 Render？

**A:**
1. 確保 `knowledge_base.txt` 已提交到 Git
2. 推送到 GitHub
3. Render 會自動部署（知識庫會在啟動時載入）

## 📚 進階學習

詳細技術說明請參考：
- **RAG_README.md** - 完整的技術文檔和 API 說明
- **knowledge_base.txt** - 查看知識庫範例格式

## 🎉 完成！

現在你已經有一個完整的 RAG 知識庫系統！

下一步：
1. ✅ 測試系統是否正常運作
2. ✅ 添加更多知識到 `knowledge_base.txt`
3. ✅ 整合到你的 AI 對話端點
4. ✅ 根據實際使用效果調整參數

祝使用愉快！🚀
