import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCNEGDpDLuWYrxTkoONy4oQujnatx6KIS8",
    authDomain: "cineveok.firebaseapp.com",
    databaseURL: "https://cineveok-default-rtdb.firebaseio.com",
    projectId: "cineveok",
    storageBucket: "cineveok.appspot.com",
    messagingSenderId: "805536124347",
    appId: "1:805536124347:web:b408c28cb0a4dc914d089e"
};

// Initialize Firebase with the modern modular syntax
export const firebaseApp = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

// Set auth persistence
setPersistence(auth, browserLocalPersistence);
