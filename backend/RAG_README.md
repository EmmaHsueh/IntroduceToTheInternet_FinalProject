# RAG 向量知識庫系統使用說明

## 📚 系統概述

這是一個基於向量檢索的 RAG (Retrieval-Augmented Generation) 知識庫系統，使用 TF-IDF 向量化和餘弦相似度來檢索最相關的知識。

## 🔄 工作流程

```
使用者問題
    │
    ▼
[1] textToVector() 轉成向量 (queryVector)
    │
    ▼
[2] 與知識庫中每條知識的向量計算餘弦相似度
    │
    ▼
[3] 按相似度排序
    │
    ▼
[4] 過濾低分結果（閾值 > 0.1）
    │
    ▼
[5] 取前 topK 條（預設 3 條）
    │
    ▼
[6] 返回最相關的答案給 LLM
```

## 📝 知識庫文件格式

知識庫文件：`backend/knowledge_base.txt`

格式：
```
[分類] 問題 | 答案
```

範例：
```
[Academic] 選課有哪些階段？ | 師大選課主要分「初選」和「加退選」兩階段...

[Food] 師大有什麼必吃美食？ | 師大商圈最具代表性的宵夜是師園鹽酥雞...

[Lifestyle] 師大有哪些社團類型？ | 師大社團種類繁多，共可分為七大類...
```

### 分類標籤：
- `[Academic]` - 學術、課程相關
- `[Food]` - 美食推薦
- `[Lifestyle]` - 社團、生活
- `[Dormitory]` - 宿舍相關
- `[Campus]` - 校園設施
- `[International]` - 國際交流
- `[Career]` - 就業職涯

## 🚀 使用方法

### 1. 在程式碼中調用

```javascript
const facts = retrieveFacts(userMessage, role, topK);

// 參數：
// - userMessage: 使用者的問題（字串）
// - role: 角色ID（可選，目前未使用）
// - topK: 返回前 K 條結果（預設 3）

// 返回：
// 字串陣列，包含最相關的答案
```

### 2. 測試範例

在 Node.js 環境中測試：

```javascript
// 測試問題 1
const q1 = "選課有什麼規定？";
const facts1 = retrieveFacts(q1);
console.log('檢索結果:', facts1);

// 測試問題 2
const q2 = "師大有什麼好吃的？";
const facts2 = retrieveFacts(q2);
console.log('檢索結果:', facts2);

// 測試問題 3
const q3 = "如何參加社團？";
const facts3 = retrieveFacts(q3);
console.log('檢索結果:', facts3);
```

### 3. 整合到 AI 對話

```javascript
// 在 AI 對話端點中使用
app.post('/api/chat', async (req, res) => {
    const { message, role } = req.body;

    // 1. 檢索相關知識
    const relevantFacts = retrieveFacts(message, role, 3);

    // 2. 構建包含知識的 Prompt
    let systemPrompt = "你是師大的 AI 助手...";

    if (relevantFacts.length > 0) {
        systemPrompt += "\n\n【參考知識】\n";
        relevantFacts.forEach((fact, i) => {
            systemPrompt += `${i + 1}. ${fact}\n`;
        });
        systemPrompt += "\n請基於以上知識回答用戶問題。";
    }

    // 3. 調用 LLM API
    const response = await callLLM(systemPrompt, message);

    res.json({ answer: response });
});
```

## 🔧 如何新增知識

1. 打開 `backend/knowledge_base.txt`
2. 按照格式添加新的知識條目：
   ```
   [分類] 問題描述 | 詳細答案
   ```
3. 重新啟動 server（知識庫會在啟動時自動載入）

## 📊 向量化原理

### TF-IDF 簡化版本

1. **分詞（Tokenization）**
   - 中文：按字分割
   - 英文：按詞分割
   - 移除標點符號

2. **詞頻計算（Term Frequency）**
   - TF(詞) = 該詞出現次數 / 總詞數

3. **向量表示**
   - 每個文本表示為 { '詞1': TF值, '詞2': TF值, ... }

4. **餘弦相似度**
   ```
   similarity = (vec1 · vec2) / (||vec1|| × ||vec2||)
   ```
   - 範圍：0 到 1
   - 越接近 1 表示越相似

## 🎯 調優建議

### 調整相似度閾值

在 `retrieveFacts` 函數中（第 190 行）：
```javascript
const filtered = results.filter(r => r.similarity > 0.1);
```

- 提高閾值（如 0.2）：更嚴格，只返回高度相關的結果
- 降低閾值（如 0.05）：更寬鬆，返回更多可能相關的結果

### 調整返回數量

調用時指定 topK：
```javascript
const facts = retrieveFacts(message, role, 5); // 返回前 5 條
```

### 豐富知識庫

- 添加更多常見問題和答案
- 確保問題描述清晰、答案詳細
- 使用多種表達方式來描述同一個問題

## 📈 進階優化

如果需要更高級的向量檢索效果，可以考慮：

1. **使用 OpenAI Embeddings API**
   - 更準確的語義理解
   - 需要 API 費用

2. **使用中文分詞庫**
   - 安裝 `nodejieba` 進行更好的中文分詞
   - npm install nodejieba

3. **使用向量數據庫**
   - Pinecone、Weaviate 等
   - 適合大規模知識庫（>10000 條）

## 🐛 故障排除

### 知識庫未載入

檢查 console 輸出：
```
✅ 成功載入 XX 條知識庫條目
```

如果顯示 0 條，檢查：
1. `knowledge_base.txt` 是否存在於 `backend/` 目錄
2. 文件格式是否正確
3. 是否有權限讀取文件

### 檢索結果不準確

1. 檢查知識庫內容是否涵蓋相關主題
2. 嘗試調整相似度閾值
3. 添加更多同義詞和不同表達方式到知識庫

### 效能問題

如果知識庫過大（>1000 條），考慮：
1. 使用索引優化
2. 實現分類過濾
3. 使用專業向量數據庫

## 📞 技術支援

如有問題，請查看：
- Server 啟動日誌
- Console 中的檢索日誌（顯示相似度分數）
- 確認知識庫文件格式正確
