// src/services/postService.js
// 這個檔案專門處理貼文相關的 Firestore 操作

import {
  collection,      // 用來指定集合
  addDoc,          // 新增文件
  getDocs,         // 取得所有文件（一次性）
  getDoc,          // 🔥 新增：取得單一文件
  query,           // 建立查詢
  where,           // 查詢條件
  orderBy,         // 排序
  onSnapshot,      // 即時監聽資料變化
  doc,             // 指定特定文件
  updateDoc,       // 更新文件
  Timestamp        // Firestore 時間戳記
} from 'firebase/firestore';
import { db } from '../firebase';

// ==========================================
// 📖 原理解說：
// ==========================================
// Firestore 的核心操作分為兩種：
// 1. 「一次性讀取」：getDocs() - 只取得當下的資料
// 2. 「即時監聽」：onSnapshot() - 資料有變化時自動更新

// 我們會使用 onSnapshot()，這樣當其他用戶發文時
// 你的畫面會自動即時更新！

// ==========================================
// 🔹 功能 1：取得指定看板的所有貼文（即時監聽）
// ==========================================
/**
 * 監聽指定看板的貼文，並在資料變化時即時更新
 *
 * @param {string} boardName - 看板名稱（例如 "Food"）
 * @param {function} callback - 當資料變化時會呼叫這個函數，傳入最新的貼文陣列
 * @returns {function} unsubscribe - 呼叫這個函數可以停止監聽
 *
 * 使用範例：
 * const unsubscribe = listenToPosts("Food", (posts) => {
 *   console.log("收到最新貼文:", posts);
 *   setPosts(posts); // 更新 React state
 * });
 *
 * // 當組件卸載時，停止監聽
 * return () => unsubscribe();
 */
export const listenToPosts = (boardName, callback) => {
  try {
    console.log('🔍 DEBUG: 開始設定監聽，boardName =', boardName);

    // 1. 建立對 posts collection 的參照
    const postsRef = collection(db, 'posts');
    console.log('🔍 DEBUG: postsRef 已建立');

    // 2. 先不用任何條件，直接監聽所有貼文
    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      console.log('🔍 DEBUG: onSnapshot 觸發了！');
      console.log('🔍 DEBUG: snapshot.empty =', snapshot.empty);
      console.log('🔍 DEBUG: snapshot.size =', snapshot.size);

      const posts = [];

      // 4. 遍歷所有文件
      snapshot.forEach((doc) => {
        console.log('🔍 DEBUG: 找到文件 ID:', doc.id);
        console.log('🔍 DEBUG: 文件資料:', doc.data());

        const data = doc.data();
        // 手動篩選符合 boardName 的貼文
        if (data.boardName === boardName) {
          posts.push({
            id: doc.id,
            ...data
          });
        }
      });

      console.log('🔍 DEBUG: 篩選後的貼文數量:', posts.length);
      console.log('🔍 DEBUG: 篩選後的貼文:', posts);

      // 5. 呼叫 callback
      callback(posts);
    }, (error) => {
      console.error('❌ 監聽貼文時發生錯誤:', error);
      console.error('❌ 錯誤詳情:', error.code, error.message);
      callback([]);
    });

    // 6. 回傳取消監聽的函數
    return unsubscribe;

  } catch (error) {
    console.error('❌ 設定監聽時發生錯誤:', error);
    return () => {};
  }
};


// ==========================================
// 🔹 功能 2：新增貼文到 Firestore
// ==========================================
/**
 * 新增一篇貼文到 Firestore
 *
 * @param {object} postData - 貼文資料
 * @param {string} postData.title - 標題
 * @param {string} postData.content - 內容
 * @param {string} postData.boardName - 看板名稱
 * @param {string} postData.authorId - 作者 UID
 * @param {string} postData.authorName - 作者名稱
 * @param {array} postData.imageUrls - 圖片網址陣列
 * @returns {Promise<string>} 回傳新建立的文件 ID
 *
 * 使用範例：
 * const newPostId = await createPost({
 *   title: "美味午餐",
 *   content: "今天吃了好吃的拉麵",
 *   boardName: "Food",
 *   authorId: currentUser.uid,
 *   authorName: "小明",
 *   imageUrls: ["data:image/png;base64,..."]
 * });
 */
export const createPost = async (postData) => {
  try {
    // 1. 準備要存入 Firestore 的資料
    const newPost = {
      title: postData.title,
      content: postData.content,
      boardName: postData.boardName,
      authorId: postData.authorId,
      authorName: postData.authorName,
      imageUrls: postData.imageUrls || [],
      createdAt: Timestamp.now(),      // 使用 Firestore 伺服器時間
      commentCount: 0,                 // 初始留言數為 0
      comments: []                     // 初始留言陣列為空
    };

    // 2. 將資料新增到 posts collection
    // 🔑 重點：addDoc 會自動產生一個唯一的 document ID
    const docRef = await addDoc(collection(db, 'posts'), newPost);

    console.log('✅ 貼文已成功新增到 Firestore，ID:', docRef.id);

    // 3. 回傳新建立的文件 ID
    return docRef.id;

  } catch (error) {
    console.error('❌ 新增貼文時發生錯誤:', error);
    throw error; // 將錯誤往上拋，讓呼叫的地方可以處理
  }
};


// ==========================================
// 🔹 功能 3：更新貼文的留言
// ==========================================
/**
 * 新增留言到指定的貼文
 *
 * @param {string} postId - 貼文 ID
 * @param {object} comment - 留言資料
 * @param {string} comment.author - 留言者名稱
 * @param {string} comment.content - 留言內容
 * @returns {Promise<void>}
 *
 * 使用範例：
 * await addCommentToPost("abc123", {
 *   author: "小華",
 *   content: "看起來好好吃！"
 * });
 */
export const addCommentToPost = async (postId, comment) => {
  try {
    // 1. 取得指定貼文的參照
    const postRef = doc(db, 'posts', postId);

    // 2. 先取得現有的貼文資料 -  修正：使用 getDoc 而不是 getDocs
    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      throw new Error('找不到指定的貼文');
    }

    const postData = postSnapshot.data();
    const existingComments = postData.comments || [];

    // 3. 準備新留言資料
    const newComment = {
      id: Date.now().toString(),
      author: comment.author,
      content: comment.content,
      date: new Date().toLocaleString('zh-TW')
    };

    // 4. 更新貼文：新增留言並增加留言數量
    //  重點：updateDoc 只會更新指定的欄位，不會覆蓋整個文件
    await updateDoc(postRef, {
      comments: [...existingComments, newComment],
      commentCount: existingComments.length + 1
    });

    console.log(' 留言已成功新增');

  } catch (error) {
    console.error(' 新增留言時發生錯誤:', error);
    throw error;
  }
};


// ==========================================
// 🔹 功能 4：取得單一貼文（用於貼文詳情頁）
// ==========================================
/**
 * 取得單一貼文的完整資料
 *
 * @param {string} postId - 貼文 ID
 * @returns {Promise<object>} 貼文資料
 */
export const getPostById = async (postId) => {
  try {
    // 🔥 修正：直接使用 doc 參照並用 getDoc 取得
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      throw new Error('找不到指定的貼文');
    }

    return {
      id: postSnapshot.id,
      ...postSnapshot.data()
    };

  } catch (error) {
    console.error('❌ 取得貼文時發生錯誤:', error);
    throw error;
  }
};


// ==========================================
// 📝 使用說明總結
// ==========================================
/*

在 React 組件中的使用方式：

import { listenToPosts, createPost, addCommentToPost } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';

function BoardTemplate({ boardName }) {
  const [posts, setPosts] = useState([]);
  const { currentUser, userProfile } = useAuth();

  // 1. 監聽貼文（組件載入時）
  useEffect(() => {
    const unsubscribe = listenToPosts(boardName, (newPosts) => {
      setPosts(newPosts);
    });

    // 清理函數：組件卸載時停止監聽
    return () => unsubscribe();
  }, [boardName]);

  // 2. 新增貼文
  const handleSubmit = async (title, content, imageUrls) => {
    try {
      await createPost({
        title,
        content,
        boardName,
        authorId: currentUser.uid,
        authorName: userProfile?.nickname || '匿名用戶',
        imageUrls
      });
      // 不需要手動更新 posts state，onSnapshot 會自動觸發！
    } catch (error) {
      alert('發文失敗：' + error.message);
    }
  };

  // 3. 新增留言
  const handleAddComment = async (postId, content) => {
    try {
      await addCommentToPost(postId, {
        author: userProfile?.nickname || '匿名用戶',
        content
      });
      // 同樣不需要手動更新，onSnapshot 會自動觸發！
    } catch (error) {
      alert('留言失敗：' + error.message);
    }
  };

  return (
    // ... JSX
  );
}

*/
