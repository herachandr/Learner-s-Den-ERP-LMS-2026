import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// In some environments, the file might not be bundled or path may vary, so we define a safe default
const firebaseConfig = {
  apiKey: "AIzaSyDWfSXIlWrX_CWOAfnUg5rDtBfBQ6SsOxU",
  authDomain: "complete-platform-dwrl4.firebaseapp.com",
  projectId: "complete-platform-dwrl4",
  storageBucket: "complete-platform-dwrl4.firebasestorage.app",
  messagingSenderId: "812370509880",
  appId: "1:812370509880:web:bde3f07a41c2c7c328a6cd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
