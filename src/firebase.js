import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC14I2IiBlRcnYOY-hIssI_-xjNVqEQnrA",
    authDomain: "nail-polish-hex.firebaseapp.com",
    projectId: "nail-polish-hex",
    storageBucket: "nail-polish-hex.firebasestorage.app",
    messagingSenderId: "300666615213",
    appId: "1:300666615213:web:c9d3976098e97828ff9d24",
    measurementId: "G-PTRXFN35DG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
