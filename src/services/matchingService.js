// src/services/matchingService.js
// 智慧配對演算法服務

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ==========================================
// 🔹 配對演算法 1: Language Exchange
// ==========================================
/**
 * 語言交換配對演算法
 *
 * @param {Object} userProfile - 當前用戶資料
 * @param {Array} allUsers - 所有用戶列表
 * @returns {Array} 配對結果 (包含配對度分數)
 */
export const matchLanguageExchange = (userProfile, allUsers) => {
  const matches = [];

  allUsers.forEach(user => {
    // 排除自己
    if (user.id === userProfile.id) return;

    let score = 0;

    // 1. 語言需求互補 (最重要，權重 40%)
    const userNative = userProfile.nativeLanguage || 'zh';
    const userLearning = userProfile.learningLanguage || 'en';
    const targetNative = user.nativeLanguage || 'zh';
    const targetLearning = user.learningLanguage || 'en';

    // 完美互補：我的母語是對方想學的，對方的母語是我想學的
    if (userNative === targetLearning && targetNative === userLearning) {
      score += 40;
    } else if (userNative === targetLearning || targetNative === userLearning) {
      // 部分匹配
      score += 20;
    }

    // 2. 語言程度匹配 (權重 20%)
    const userLevel = userProfile.languageLevel || 'intermediate';
    const targetLevel = user.languageLevel || 'intermediate';

    if (userLevel === targetLevel) {
      score += 20;
    } else if (
      (userLevel === 'beginner' && targetLevel === 'intermediate') ||
      (userLevel === 'intermediate' && targetLevel === 'beginner') ||
      (userLevel === 'intermediate' && targetLevel === 'advanced') ||
      (userLevel === 'advanced' && targetLevel === 'intermediate')
    ) {
      score += 10;
    }

    // 3. 共同興趣 (權重 20%)
    const userInterests = userProfile.interests || [];
    const targetInterests = user.interests || [];
    const commonInterests = userInterests.filter(interest =>
      targetInterests.includes(interest)
    );
    score += Math.min(commonInterests.length * 5, 20);

    // 4. 可用時間重疊 (權重 20%)
    const userAvailability = userProfile.availability || [];
    const targetAvailability = user.availability || [];
    const commonTimes = userAvailability.filter(time =>
      targetAvailability.includes(time)
    );
    score += Math.min(commonTimes.length * 5, 20);

    // 只推薦配對度 > 30 的用戶
    if (score >= 30) {
      matches.push({
        ...user,
        matchScore: score,
        matchReasons: generateMatchReasons(userProfile, user, 'language')
      });
    }
  });

  // 按配對度排序
  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

// ==========================================
// 🔹 配對演算法 2: Study Buddy / Roommate
// ==========================================
/**
 * 學習夥伴 / 室友配對演算法
 *
 * @param {Object} userProfile - 當前用戶資料
 * @param {Array} allUsers - 所有用戶列表
 * @param {string} matchType - 'study' 或 'roommate'
 * @returns {Array} 配對結果
 */
export const matchStudyBuddyOrRoommate = (userProfile, allUsers, matchType = 'study') => {
  const matches = [];

  allUsers.forEach(user => {
    if (user.id === userProfile.id) return;

    let score = 0;

    if (matchType === 'study') {
      // === 學習夥伴配對 ===

      // 1. 科系相同 (權重 30%)
      if (userProfile.department && user.department === userProfile.department) {
        score += 30;
      }

      // 2. 修讀相同課程 (權重 25%)
      const userCourses = userProfile.courses || [];
      const targetCourses = user.courses || [];
      const commonCourses = userCourses.filter(course =>
        targetCourses.includes(course)
      );
      score += Math.min(commonCourses.length * 8, 25);

      // 3. 學習習慣相似 (權重 20%)
      const userStudyHabits = userProfile.studyHabits || [];
      const targetStudyHabits = user.studyHabits || [];
      const commonHabits = userStudyHabits.filter(habit =>
        targetStudyHabits.includes(habit)
      );
      score += Math.min(commonHabits.length * 7, 20);

      // 4. 可用時間重疊 (權重 15%)
      const userAvailability = userProfile.availability || [];
      const targetAvailability = user.availability || [];
      const commonTimes = userAvailability.filter(time =>
        targetAvailability.includes(time)
      );
      score += Math.min(commonTimes.length * 5, 15);

      // 5. 共同興趣 (權重 10%)
      const userInterests = userProfile.interests || [];
      const targetInterests = user.interests || [];
      const commonInterests = userInterests.filter(interest =>
        targetInterests.includes(interest)
      );
      score += Math.min(commonInterests.length * 3, 10);

    } else if (matchType === 'roommate') {
      // === 室友配對 ===

      // 1. 租金預算相近 (權重 25%)
      const userBudget = userProfile.budgetRange || 'medium';
      const targetBudget = user.budgetRange || 'medium';
      if (userBudget === targetBudget) {
        score += 25;
      }

      // 2. 作息習慣 (權重 25%)
      const userSleepSchedule = userProfile.sleepSchedule || 'normal';
      const targetSleepSchedule = user.sleepSchedule || 'normal';
      if (userSleepSchedule === targetSleepSchedule) {
        score += 25;
      }

      // 3. 生活習慣匹配 (權重 20%)
      const userLifestyle = userProfile.lifestylePreferences || [];
      const targetLifestyle = user.lifestylePreferences || [];
      const commonLifestyle = userLifestyle.filter(pref =>
        targetLifestyle.includes(pref)
      );
      score += Math.min(commonLifestyle.length * 7, 20);

      // 4. 性別偏好 (權重 15%)
      const userGenderPref = userProfile.roommateGenderPreference || 'any';
      const targetGender = user.gender || 'other';
      if (userGenderPref === 'any' || userGenderPref === targetGender) {
        score += 15;
      }

      // 5. 共同興趣 (權重 15%)
      const userInterests = userProfile.interests || [];
      const targetInterests = user.interests || [];
      const commonInterests = userInterests.filter(interest =>
        targetInterests.includes(interest)
      );
      score += Math.min(commonInterests.length * 5, 15);
    }

    if (score >= 30) {
      matches.push({
        ...user,
        matchScore: score,
        matchReasons: generateMatchReasons(userProfile, user, matchType)
      });
    }
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

// ==========================================
// 🔹 配對演算法 3: 文化體驗配對
// ==========================================
/**
 * 文化體驗配對演算法
 *
 * @param {Object} userProfile - 當前用戶資料
 * @param {Array} allUsers - 所有用戶列表
 * @returns {Array} 配對結果
 */
export const matchCulturalExperience = (userProfile, allUsers) => {
  const matches = [];

  allUsers.forEach(user => {
    if (user.id === userProfile.id) return;

    let score = 0;

    // 1. 國際生 ↔ 本地生配對 (權重 30%)
    const userIsInternational = userProfile.isInternationalStudent || false;
    const targetIsInternational = user.isInternationalStudent || false;

    if (userIsInternational !== targetIsInternational) {
      score += 30;
    }

    // 2. 文化興趣匹配 (權重 30%)
    const userCulturalInterests = userProfile.culturalInterests || [];
    const targetCulturalInterests = user.culturalInterests || [];
    const commonCultural = userCulturalInterests.filter(interest =>
      targetCulturalInterests.includes(interest)
    );
    score += Math.min(commonCultural.length * 10, 30);

    // 3. 活動偏好匹配 (權重 20%)
    const userActivityPreferences = userProfile.activityPreferences || [];
    const targetActivityPreferences = user.activityPreferences || [];
    const commonActivities = userActivityPreferences.filter(activity =>
      targetActivityPreferences.includes(activity)
    );
    score += Math.min(commonActivities.length * 7, 20);

    // 4. 可用時間重疊 (權重 10%)
    const userAvailability = userProfile.availability || [];
    const targetAvailability = user.availability || [];
    const commonTimes = userAvailability.filter(time =>
      targetAvailability.includes(time)
    );
    score += Math.min(commonTimes.length * 3, 10);

    // 5. 共同興趣 (權重 10%)
    const userInterests = userProfile.interests || [];
    const targetInterests = user.interests || [];
    const commonInterests = userInterests.filter(interest =>
      targetInterests.includes(interest)
    );
    score += Math.min(commonInterests.length * 3, 10);

    if (score >= 25) {
      matches.push({
        ...user,
        matchScore: score,
        matchReasons: generateMatchReasons(userProfile, user, 'cultural')
      });
    }
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

// ==========================================
// 🔹 生成配對原因說明
// ==========================================
/**
 * 根據配對類型生成配對原因
 *
 * @param {Object} userProfile - 當前用戶
 * @param {Object} targetUser - 配對目標
 * @param {string} matchType - 配對類型
 * @returns {Array} 配對原因列表
 */
const generateMatchReasons = (userProfile, targetUser, matchType) => {
  const reasons = [];

  if (matchType === 'language') {
    if (userProfile.nativeLanguage === targetUser.learningLanguage) {
      reasons.push(`你的母語 ${userProfile.nativeLanguage} 是對方想學習的語言`);
    }
    if (userProfile.learningLanguage === targetUser.nativeLanguage) {
      reasons.push(`對方的母語 ${targetUser.nativeLanguage} 是你想學習的語言`);
    }
  } else if (matchType === 'study') {
    if (userProfile.department === targetUser.department) {
      reasons.push(`相同科系：${userProfile.department}`);
    }
    const userCourses = userProfile.courses || [];
    const targetCourses = targetUser.courses || [];
    const commonCourses = userCourses.filter(c => targetCourses.includes(c));
    if (commonCourses.length > 0) {
      reasons.push(`共同課程：${commonCourses.slice(0, 2).join(', ')}`);
    }
  } else if (matchType === 'roommate') {
    if (userProfile.budgetRange === targetUser.budgetRange) {
      reasons.push(`相同租金預算`);
    }
    if (userProfile.sleepSchedule === targetUser.sleepSchedule) {
      reasons.push(`相似作息習慣`);
    }
  } else if (matchType === 'cultural') {
    const userIsInternational = userProfile.isInternationalStudent || false;
    const targetIsInternational = targetUser.isInternationalStudent || false;
    if (userIsInternational && !targetIsInternational) {
      reasons.push(`本地生可以帶你體驗台灣文化`);
    } else if (!userIsInternational && targetIsInternational) {
      reasons.push(`國際生可以分享不同文化`);
    }
  }

  // 共同興趣
  const userInterests = userProfile.interests || [];
  const targetInterests = targetUser.interests || [];
  const commonInterests = userInterests.filter(i => targetInterests.includes(i));
  if (commonInterests.length > 0) {
    reasons.push(`共同興趣：${commonInterests.slice(0, 3).join(', ')}`);
  }

  return reasons;
};

// ==========================================
// 🔹 更新用戶配對偏好設定
// ==========================================
/**
 * 儲存/更新用戶的配對偏好設定到 Firestore
 *
 * @param {string} userId - 用戶 ID
 * @param {Object} preferences - 偏好設定
 * @returns {Promise<void>}
 */
export const updateMatchingPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      matchingPreferences: preferences,
      updatedAt: serverTimestamp()
    });
    console.log('✅ 配對偏好已更新');
  } catch (error) {
    console.error('❌ 更新配對偏好失敗:', error);
    throw error;
  }
};

// ==========================================
// 🔹 發送配對邀請
// ==========================================
/**
 * 向配對目標發送邀請訊息
 *
 * @param {string} fromUserId - 發送者 ID
 * @param {string} toUserId - 接收者 ID
 * @param {string} matchType - 配對類型
 * @param {string} message - 自訂訊息
 * @returns {Promise<void>}
 */
export const sendMatchInvitation = async (fromUserId, toUserId, matchType, message) => {
  try {
    const invitationsRef = collection(db, 'matchInvitations');
    await addDoc(invitationsRef, {
      fromUserId,
      toUserId,
      matchType,
      message,
      status: 'pending', // pending / accepted / rejected
      createdAt: serverTimestamp()
    });
    console.log('✅ 配對邀請已發送');
  } catch (error) {
    console.error('❌ 發送配對邀請失敗:', error);
    throw error;
  }
};
