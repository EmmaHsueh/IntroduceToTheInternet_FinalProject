// src/services/userService.js
// 這個檔案專門處理用戶相關的 Firestore 操作

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

// ==========================================
// 🔹 功能 1：取得所有會員列表
// ==========================================
/**
 * 取得所有註冊用戶的資料（用於會員名錄）
 *
 * @returns {Promise<Array>} 用戶陣列
 */
export const getAllUsers = async () => {
  try {
    console.log('👥 開始取得所有會員資料...');

    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const users = [];
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ 成功取得 ${users.length} 位會員資料`);
    return users;

  } catch (error) {
    console.error('❌ 取得會員列表時發生錯誤:', error);
    throw error;
  }
};

// ==========================================
// 🔹 功能 2：取得單一用戶的公開資料
// ==========================================
/**
 * 根據用戶 ID 取得用戶的公開資料
 *
 * @param {string} userId - 用戶的 Firebase UID
 * @returns {Promise<Object>} 用戶資料物件
 */
export const getUserById = async (userId) => {
  try {
    console.log('👤 開始取得用戶資料:', userId);

    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      throw new Error('找不到該用戶');
    }

    const userData = {
      id: userSnapshot.id,
      ...userSnapshot.data()
    };

    console.log('✅ 成功取得用戶資料');
    return userData;

  } catch (error) {
    console.error('❌ 取得用戶資料時發生錯誤:', error);
    throw error;
  }
};

// ==========================================
// 🔹 功能 3：取得用戶的所有貼文
// ==========================================
/**
 * 取得指定用戶的所有貼文
 *
 * @param {string} userId - 用戶的 Firebase UID
 * @returns {Promise<Array>} 貼文陣列
 */
export const getUserPosts = async (userId) => {
  try {
    console.log('📝 開始取得用戶貼文:', userId);

    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const posts = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });

    console.log(`✅ 成功取得 ${posts.length} 篇貼文`);
    return posts;

  } catch (error) {
    console.error('❌ 取得用戶貼文時發生錯誤:', error);
    throw error;
  }
};

// ==========================================
// 🔹 功能 4：取得用戶的所有留言
// ==========================================
/**
 * 取得指定用戶在所有貼文中的留言
 *
 * @param {string} userId - 用戶的 Firebase UID
 * @param {string} userName - 用戶的顯示名稱（用於匹配留言）
 * @returns {Promise<Array>} 留言陣列（包含貼文資訊）
 */
export const getUserComments = async (userId, userName) => {
  try {
    console.log('💬 開始取得用戶留言:', userId);

    // 1. 取得所有貼文
    const postsRef = collection(db, 'posts');
    const snapshot = await getDocs(postsRef);

    const userComments = [];

    // 2. 遍歷每篇貼文，找出該用戶的留言
    snapshot.forEach((doc) => {
      const postData = doc.data();
      const postId = doc.id;

      // 檢查這篇貼文的留言陣列
      if (postData.comments && Array.isArray(postData.comments)) {
        postData.comments.forEach((comment) => {
          // 匹配留言作者（可以用名稱匹配，未來可改用 authorId）
          if (comment.author === userName) {
            userComments.push({
              ...comment,
              postId: postId,
              postTitle: postData.title,
              boardName: postData.boardName
            });
          }
        });
      }
    });

    // 3. 按日期排序（最新的在前）
    userComments.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    console.log(`✅ 成功取得 ${userComments.length} 則留言`);
    return userComments;

  } catch (error) {
    console.error('❌ 取得用戶留言時發生錯誤:', error);
    throw error;
  }
};

// ==========================================
// 🔹 功能 5：刪除貼文
// ==========================================
/**
 * 刪除指定的貼文（只有作者本人可以刪除）
 *
 * @param {string} postId - 貼文 ID
 * @param {string} currentUserId - 當前登入用戶的 UID
 * @returns {Promise<void>}
 */
export const deletePost = async (postId, currentUserId) => {
  try {
    console.log('🗑️ 準備刪除貼文:', postId);

    // 1. 先檢查這篇貼文是否屬於當前用戶
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      throw new Error('找不到該貼文');
    }

    const postData = postSnapshot.data();

    if (postData.authorId !== currentUserId) {
      throw new Error('您沒有權限刪除此貼文');
    }

    // 2. 刪除貼文
    await deleteDoc(postRef);

    console.log('✅ 貼文已成功刪除');

  } catch (error) {
    console.error('❌ 刪除貼文時發生錯誤:', error);
    throw error;
  }
};

// ==========================================
// 🔹 功能 6：刪除留言
// ==========================================
/**
 * 刪除指定貼文中的特定留言
 *
 * @param {string} postId - 貼文 ID
 * @param {string} commentId - 留言 ID
 * @param {string} currentUserId - 當前登入用戶的 UID
 * @param {string} currentUserName - 當前登入用戶的名稱
 * @returns {Promise<void>}
 */
export const deleteComment = async (postId, commentId, currentUserId, currentUserName) => {
  try {
    console.log('🗑️ 準備刪除留言:', commentId);

    // 1. 取得貼文資料
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      throw new Error('找不到該貼文');
    }

    const postData = postSnapshot.data();
    const comments = postData.comments || [];

    // 2. 找到要刪除的留言
    const commentIndex = comments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      throw new Error('找不到該留言');
    }

    // 3. 檢查權限（只有留言作者本人可以刪除）
    if (comments[commentIndex].author !== currentUserName) {
      throw new Error('您沒有權限刪除此留言');
    }

    // 4. 刪除留言
    comments.splice(commentIndex, 1);

    // 5. 更新貼文
    await updateDoc(postRef, {
      comments: comments,
      commentCount: comments.length
    });

    console.log('✅ 留言已成功刪除');

  } catch (error) {
    console.error('❌ 刪除留言時發生錯誤:', error);
    throw error;
  }
};

// ==========================================
// 🔹 功能 7：更新用戶資料
// ==========================================
/**
 * 更新用戶的個人資料
 *
 * @param {string} userId - 用戶的 Firebase UID
 * @param {Object} updateData - 要更新的資料
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    console.log('✏️ 開始更新用戶資料:', userId);

    const userRef = doc(db, 'users', userId);

    // 只更新允許修改的欄位
    const allowedFields = [
      'nickname', 'first_name', 'last_name', 'gender', 'avatar', 'bio',
      // 🔥 配對系統所需欄位
      'nativeLanguage', 'learningLanguage', 'languageLevel',
      'interests', 'availability', 'department', 'courses',
      'isInternationalStudent', 'studyHabits', 'budgetRange',
      'sleepSchedule', 'lifestylePreferences', 'roommateGenderPreference',
      'culturalInterests', 'activityPreferences'
    ];
    const filteredData = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    await updateDoc(userRef, filteredData);

    console.log('✅ 用戶資料已成功更新');

  } catch (error) {
    console.error('❌ 更新用戶資料時發生錯誤:', error);
    throw error;
  }
};

// ==========================================
// 🔹 功能 8：搜尋會員
// ==========================================
/**
 * 根據關鍵字搜尋會員（搜尋 nickname 和 email）
 *
 * @param {string} keyword - 搜尋關鍵字
 * @returns {Promise<Array>} 符合的用戶陣列
 */
export const searchUsers = async (keyword) => {
  try {
    console.log('🔍 搜尋會員:', keyword);

    // Firestore 不支援全文搜尋，所以我們先取得所有用戶再在客戶端篩選
    const allUsers = await getAllUsers();

    const lowerKeyword = keyword.toLowerCase();

    const filteredUsers = allUsers.filter(user => {
      const nickname = (user.nickname || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const firstName = (user.first_name || '').toLowerCase();
      const lastName = (user.last_name || '').toLowerCase();

      return nickname.includes(lowerKeyword) ||
             email.includes(lowerKeyword) ||
             firstName.includes(lowerKeyword) ||
             lastName.includes(lowerKeyword);
    });

    console.log(`✅ 找到 ${filteredUsers.length} 位符合的會員`);
    return filteredUsers;

  } catch (error) {
    console.error('❌ 搜尋會員時發生錯誤:', error);
    throw error;
  }
};

// ==========================================
// 📝 使用說明
// ==========================================
/*

在 React 組件中的使用方式：

import {
  getAllUsers,
  getUserById,
  getUserPosts,
  getUserComments,
  deletePost,
  deleteComment,
  updateUserProfile,
  searchUsers
} from '../services/userService';

// 1. 取得所有會員
const users = await getAllUsers();

// 2. 取得特定用戶資料
const user = await getUserById('firebase-uid-123');

// 3. 取得用戶的貼文
const posts = await getUserPosts('firebase-uid-123');

// 4. 取得用戶的留言
const comments = await getUserComments('firebase-uid-123', '用戶名稱');

// 5. 刪除貼文
await deletePost('post-id-123', currentUser.uid);

// 6. 刪除留言
await deleteComment('post-id-123', 'comment-id-456', currentUser.uid, currentUser.name);

// 7. 更新用戶資料
await updateUserProfile(currentUser.uid, {
  nickname: '新暱稱',
  bio: '新的自我介紹'
});

// 8. 搜尋會員
const results = await searchUsers('小明');

*/
