import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyDpzSGUQupjgj8C_Fm5kYq1siAoIoehw3s",
    authDomain: "speakwise-7c440.firebaseapp.com",
    projectId: "speakwise-7c440",
    storageBucket: "speakwise-7c440.firebasestorage.app",
    messagingSenderId: "40584858985",
    appId: "1:40584858985:web:b43602d395603a639d81f8",
    measurementId: "G-N871C1BF47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
