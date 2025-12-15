// RAG 知識庫測試腳本
// 使用方法: node test_rag.js

const axios = require('axios');

// 設定 API 端點
const API_URL = 'http://localhost:10000/api/rag-test';
// 如果測試 Render 部署版本，改為：
// const API_URL = 'https://introducetotheinternet-finalproject-0yrf.onrender.com/api/rag-test';

// 測試問題列表
const testQuestions = [
    {
        name: "選課相關",
        question: "選課有哪些階段？"
    },
    {
        name: "美食推薦",
        question: "師大有什麼好吃的宵夜？"
    },
    {
        name: "社團活動",
        question: "參加社團有什麼好處？"
    },
    {
        name: "宿舍問題",
        question: "如何申請宿舍？"
    },
    {
        name: "校園設施",
        question: "圖書館開放時間是什麼時候？"
    },
    {
        name: "國際交流",
        question: "可以出國交換嗎？"
    },
    {
        name: "課程學習",
        question: "什麼是雙主修？"
    }
];

// 測試函數
async function testRAG(question, topK = 3) {
    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📝 問題: ${question}`);
        console.log(`${'='.repeat(60)}`);

        const response = await axios.post(API_URL, {
            question: question,
            topK: topK
        });

        const { results, count } = response.data;

        console.log(`✅ 找到 ${count} 條相關知識:\n`);

        results.forEach((answer, index) => {
            console.log(`${index + 1}. ${answer}`);
            console.log('');
        });

        if (count === 0) {
            console.log('❌ 沒有找到相關知識');
        }

        return true;

    } catch (error) {
        console.error(`❌ 測試失敗:`, error.response?.data || error.message);
        return false;
    }
}

// 健康檢查
async function healthCheck() {
    try {
        const response = await axios.get('http://localhost:10000/api/health');
        const { knowledgeBase } = response.data;

        console.log('\n🏥 服務健康檢查:');
        console.log(`  知識庫狀態: ${knowledgeBase.loaded ? '✅ 已載入' : '❌ 未載入'}`);
        console.log(`  知識庫數量: ${knowledgeBase.count} 條\n`);

        return knowledgeBase.loaded;

    } catch (error) {
        console.error('❌ 無法連接到服務，請確認 server 是否運行在 http://localhost:10000');
        return false;
    }
}

// 主測試流程
async function runTests() {
    console.log('🚀 開始 RAG 知識庫測試...\n');

    // 1. 健康檢查
    const isHealthy = await healthCheck();
    if (!isHealthy) {
        console.log('\n⚠️ 請先啟動 server: cd backend && node server.js');
        return;
    }

    // 2. 執行測試
    let successCount = 0;
    let failCount = 0;

    for (const test of testQuestions) {
        console.log(`\n📋 測試類別: ${test.name}`);
        const success = await testRAG(test.question);

        if (success) {
            successCount++;
        } else {
            failCount++;
        }

        // 等待一下，避免請求過快
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3. 顯示測試結果
    console.log('\n' + '='.repeat(60));
    console.log('📊 測試完成！');
    console.log('='.repeat(60));
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失敗: ${failCount}`);
    console.log(`📈 成功率: ${((successCount / testQuestions.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');
}

// 單個問題測試模式
async function singleTest() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // 沒有參數，執行完整測試
        await runTests();
    } else {
        // 有參數，測試單個問題
        const question = args.join(' ');
        await healthCheck();
        await testRAG(question, 5); // 返回前 5 條結果
    }
}

// 執行測試
singleTest().catch(error => {
    console.error('測試過程發生錯誤:', error);
});
