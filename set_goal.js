import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDV5V__6NnZU7CY0TQunRKXTePx1mYhJJA",
    authDomain: "learninglog-fd591.firebaseapp.com",
    projectId: "learninglog-fd591",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const setGoalApp = Vue.createApp({
    data() {
        return {
            user: null,
            studyTimeHours: null,
            studyTimeMinutes: null
        };
    },
    created() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.user = user;
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists() && docSnap.data().goalTime > 0) {
                    window.location.href = 'index.html';
                }
            } else {
                window.location.href = 'login.html';
            }
        });
    },
    methods: {
        async setGoal() {
            if (!this.user) return;

            const hours = parseInt(this.studyTimeHours) || 0;
            const minutes = parseInt(this.studyTimeMinutes) || 0;
            const timeInMinutes = hours * 60 + minutes;

            if (timeInMinutes <= 0) {
                alert("目標時間は0分より大きくする必要があります。");
                return;
            }

            const userDocRef = doc(db, 'users', this.user.uid);
            await updateDoc(userDocRef, {
                goalTime: timeInMinutes
            });
            window.location.href = 'index.html';
        },
    }
});

setGoalApp.mount('#set-goal-app');