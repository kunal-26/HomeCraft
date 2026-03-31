const firebaseConfig = {
    apiKey: "AIzaSyDmlWpe3UInANOIijzkE0AKSaUf9jUj8I4",
    authDomain: "homecraft-88329.firebaseapp.com",
    projectId: "homecraft-88329",
    storageBucket: "homecraft-88329.firebasestorage.app",
    messagingSenderId: "1057372655076",
    appId: "1:1057372655076:web:c51fb70733ba56d1114bf1",
    measurementId: "G-JJ4RLQ093J"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();
