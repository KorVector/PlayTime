// src/firebase.ts

import { initializeApp } from "firebase/app";
// 1. Auth(인증)와 Firestore(DB) 도구를 가져옵니다.
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// (본인의 firebaseConfig 내용을 그대로 두세요)
const firebaseConfig = {
  apiKey: "AIzaSyD9ZgvZhSICT1AjJQ661x-6PHO8ixeJLec",
  authDomain: "playtime-7e21b.firebaseapp.com",
  projectId: "playtime-7e21b",
  storageBucket: "playtime-7e21b.firebasestorage.app",
  messagingSenderId: "283746356866",
  appId: "1:283746356866:web:029b3574aed0d2e0caee9b",
  measurementId: "G-QKGGKCHX02"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 2. 여기서 내보내야(export) 다른 파일에서 갖다 쓸 수 있습니다!
export const auth = getAuth(app);
export const db = getFirestore(app);