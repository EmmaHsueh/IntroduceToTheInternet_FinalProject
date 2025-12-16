// src/services/chatService.js
// 這個檔案專門處理聊天室相關的 Firestore 操作

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

// ==========================================
// 📖 原理解說：
// ==========================================
// 聊天訊息會儲存在 Firestore 的 'chatMessages' collection
// 每個訊息包含：
// - boardName: 看板名稱（每個看板獨立聊天室）
// - sender: 發送者名稱
// - senderId: 發送者 UID（用於識別用戶）
// - content: 訊息內容
// - createdAt: 發送時間
// - expiresAt: 過期時間（30天後）

// ==========================================
// 🔹 功能 1：監聽指定看板的聊天訊息（即時更新）
// ==========================================
/**
 * 監聽指定看板的聊天訊息，並在有新訊息時即時更新
 *
 * @param {string} boardName - 看板名稱
 * @param {function} callback - 當訊息變化時呼叫，傳入最新的訊息陣列
 * @returns {function} unsubscribe - 停止監聽的函數
 */
export const listenToChatMessages = (boardName, callback) => {
  try {
    console.log(' 開始監聽【' + boardName + '】聊天室...');

    // 1. 建立查詢：取得指定看板的訊息，按時間排序
    const messagesRef = collection(db, 'chatMessages');
    const q = query(
      messagesRef,
      where('boardName', '==', boardName),
      orderBy('createdAt', 'asc') // 按時間升序排列（最舊的在前）
    );

    // 2. 監聽訊息變化
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          // 將 Firestore Timestamp 轉換為 JavaScript Date
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date()
        });
      });

      console.log(' 收到【' + boardName + '】聊天室的 ' + messages.length + ' 則訊息');
      callback(messages);
    }, (error) => {
      console.error(' 監聽聊天訊息時發生錯誤:', error);
      callback([]);
    });

    return unsubscribe;

  } catch (error) {
    console.error(' 設定聊天訊息監聽時發生錯誤:', error);
    return () => {};
  }
};


// ==========================================
// 🔹 功能 2：發送聊天訊息
// ==========================================
/**
 * 發送一則聊天訊息到 Firestore
 *
 * @param {object} messageData - 訊息資料
 * @param {string} messageData.boardName - 看板名稱
 * @param {string} messageData.sender - 發送者名稱
 * @param {string} messageData.senderId - 發送者 UID
 * @param {string} messageData.content - 訊息內容
 * @returns {Promise<string>} 新訊息的 ID
 */
export const sendChatMessage = async (messageData) => {
  try {
    const now = Timestamp.now();

    // 計算 30 天後的時間戳記
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const expiresAt = Timestamp.fromDate(thirtyDaysLater);

    // 準備訊息資料
    const newMessage = {
      boardName: messageData.boardName,
      sender: messageData.sender,
      senderId: messageData.senderId,
      content: messageData.content,
      createdAt: now,
      expiresAt: expiresAt // 30 天後過期
    };

    // 新增到 Firestore
    const docRef = await addDoc(collection(db, 'chatMessages'), newMessage);

    console.log(' 聊天訊息已發送，ID:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error(' 發送聊天訊息時發生錯誤:', error);
    throw error;
  }
};


// ==========================================
// 🔹 功能 3：清理過期的聊天訊息（30天前的訊息）
// ==========================================
/**
 * 刪除所有已過期的聊天訊息
 * 建議在應用程式啟動時或定期執行此函數
 *
 * @returns {Promise<number>} 刪除的訊息數量
 */
export const cleanupExpiredMessages = async () => {
  try {
    console.log('🧹 開始清理過期的聊天訊息...');

    const messagesRef = collection(db, 'chatMessages');
    const now = Timestamp.now();

    // 查詢所有已過期的訊息
    const q = query(
      messagesRef,
      where('expiresAt', '<=', now)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(' 沒有需要清理的過期訊息');
      return 0;
    }

    // 刪除所有過期訊息
    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);

    console.log(' 已清理 ' + snapshot.size + ' 則過期訊息');
    return snapshot.size;

  } catch (error) {
    console.error(' 清理過期訊息時發生錯誤:', error);
    throw error;
  }
};


// ==========================================
// 🔹 功能 4：刪除指定看板的所有聊天訊息（管理功能）
// ==========================================
/**
 * 刪除指定看板的所有聊天訊息
 *
 * @param {string} boardName - 看板名稱
 * @returns {Promise<number>} 刪除的訊息數量
 */
export const clearBoardChatMessages = async (boardName) => {
  try {
    console.log('🗑️ 開始清理【' + boardName + '】的所有聊天訊息...');

    const messagesRef = collection(db, 'chatMessages');
    const q = query(
      messagesRef,
      where('boardName', '==', boardName)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('✅ 沒有訊息需要清理');
      return 0;
    }

    // 刪除所有訊息
    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);

    console.log('✅ 已清理 ' + snapshot.size + ' 則訊息');
    return snapshot.size;

  } catch (error) {
    console.error('❌ 清理看板訊息時發生錯誤:', error);
    throw error;
  }
};


// ==========================================
// 📝 使用說明
// ==========================================
/*

在 React 組件中的使用方式：

import {
  listenToChatMessages,
  sendChatMessage,
  cleanupExpiredMessages
} from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

function ChatWidget({ boardName }) {
  const [messages, setMessages] = useState([]);
  const { currentUser, userProfile } = useAuth();

  // 1. 監聽聊天訊息
  useEffect(() => {
    const unsubscribe = listenToChatMessages(boardName, (newMessages) => {
      setMessages(newMessages);
    });

    // 清理函數
    return () => unsubscribe();
  }, [boardName]);

  // 2. 發送訊息
  const handleSend = async (content) => {
    try {
      await sendChatMessage({
        boardName,
        sender: userProfile?.nickname || currentUser.email.split('@')[0] || '匿名用戶',
        senderId: currentUser.uid,
        content
      });
    } catch (error) {
      alert('發送失敗：' + error.message);
    }
  };

  // 3. 定期清理過期訊息（可選）
  useEffect(() => {
    cleanupExpiredMessages();
  }, []);

  return (
    // ... JSX
  );
}

*/
