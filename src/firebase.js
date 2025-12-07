import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';


// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCh4BkV1rSkk5OK-ZhUrDRq7rDnyzYIxi0",
  authDomain: "ntnu-talk.firebaseapp.com",
  databaseURL: "https://ntnu-talk-default-rtdb.firebaseio.com",
  projectId: "ntnu-talk",
  storageBucket: "ntnu-talk.firebasestorage.app",
  messagingSenderId: "822517096739",
  appId: "1:822517096739:web:428d2d901bc21f113eec96",
  measurementId: "G-RQ378DQYQ1"
};


// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Analytics
const analytics = getAnalytics(app);

// 匯出服務
export const db = getFirestore(app);      // 資料庫
export const storage = getStorage(app);   // 檔案儲存
export const auth = getAuth(app);         // 用戶認證