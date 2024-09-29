import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXguignppI1gLV0NlDII8d9P1n4SV1YsU",
  authDomain: "godkendelsesopgave-6d15b.firebaseapp.com",
  projectId: "godkendelsesopgave-6d15b",
  storageBucket: "godkendelsesopgave-6d15b.appspot.com",
  messagingSenderId: "428060544578",
  appId: "1:428060544578:web:32809dc6ec439bf3de67db"
};

let auth;
let db;

export const initializeFirebase = () => {
  // Tjek om Firebase allerede er initialiseret
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);

    // Initialiser Firebase Auth med AsyncStorage
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });

    // Initialiser Firestore
    db = getFirestore(app);
  } else {
    const app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
};

export { auth, db };
