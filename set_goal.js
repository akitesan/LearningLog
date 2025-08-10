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
            goalTimeInput: null,
            goalTimeUnit: 'minutes',
        };
    },
    created() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.user = user;
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists() && docSnap.data().goalTime > 0) {
                    // 目標時間が既に設定されている場合は、メインページにリダイレクト
                    window.location.href = 'index.html';
                }
            } else {
                // 認証されていない場合はログインページへ
                window.location.href = 'login.html';
            }
        });
    },
    methods: {
        async setGoal() {
            if (!this.user) return;
            let timeInMinutes = this.goalTimeInput;
            if (this.goalTimeUnit === 'hours') {
                timeInMinutes *= 60;
            }

            if (!timeInMinutes || timeInMinutes <= 0) {
                alert("有効な目標時間を入力してください。");
                return;
            }

            const userDocRef = doc(db, 'users', this.user.uid);
            await updateDoc(userDocRef, {
                goalTime: timeInMinutes
            });
            alert("目標時間を設定しました！");
            window.location.href = 'index.html';
        },
    }
});

setGoalApp.mount('#set-goal-app');