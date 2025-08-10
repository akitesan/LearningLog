import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDV5V__6NnZU7CY0TQunRKXTePx1mYhJJA",
    authDomain: "learninglog-fd591.firebaseapp.com",
    projectId: "learninglog-fd591",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const vueApp = Vue.createApp({
    data() {
        return {
            user: null,
            goalTime: 0,
            totalStudyTime: 0,
            studyTimeHours: null, 
            studyTimeMinutes: null, 
            imageMode: 'animal',
        };
    },
    computed: {
        achievementRate() {
            if (this.goalTime > 0) {
                return Math.min(100, Math.floor((this.totalStudyTime / this.goalTime) * 100));
            }
            return 0;
        },
        imageLevel() {
            return Math.floor(this.achievementRate / 5) * 5;
        },
        currentImageSrc() {
            return this.imageMode === 'animal'
                ? `images/evolution_${this.imageLevel}.png`
                : `images/country_${this.imageLevel}.png`;
        },
        imageAltText() {
            return this.imageMode === 'animal'
                ? `進化レベル ${this.imageLevel} の動物`
                : `達成度 ${this.imageLevel}% の国`;
        },
        formattedGoalTime() {
            return this.formatTime(this.goalTime);
        },
        formattedTotalTime() {
            return this.formatTime(this.totalStudyTime);
        }
    },
    created() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.user = user;
                await this.fetchUserData();
            } else {
                window.location.href = 'login.html';
            }
        });
    },
    methods: {
        async fetchUserData() {
            if (!this.user) return;
            const userDocRef = doc(db, 'users', this.user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                this.goalTime = data.goalTime || 0;
                this.totalStudyTime = data.totalStudyTime || 0;

                if (this.goalTime === 0) {
                    window.location.href = 'set_goal.html';
                }

            } else {
                await setDoc(userDocRef, {
                    goalTime: 0,
                    totalStudyTime: 0
                });
                window.location.href = 'set_goal.html';
            }
        },
        async recordStudy() {
            if (!this.user) return;
            const hours = parseInt(this.studyTimeHours) || 0;
            const minutes = parseInt(this.studyTimeMinutes) || 0;
            const timeInMinutes = hours * 60 + minutes;

            if (timeInMinutes <= 0) {
                alert("有効な学習時間を入力してください。");
                return;
            }

            const userDocRef = doc(db, 'users', this.user.uid);
            await updateDoc(userDocRef, {
                totalStudyTime: this.totalStudyTime + timeInMinutes
            });
            this.totalStudyTime += timeInMinutes;
            this.studyTimeHours = null;
            this.studyTimeMinutes = null;
        },
        async resetAll() {
            if (!this.user) return;
            if (confirm("本当に目標時間と学習時間の両方をリセットしますか？この操作は元に戻せません。")) {
                const userDocRef = doc(db, 'users', this.user.uid);
                await updateDoc(userDocRef, {
                    goalTime: 0,
                    totalStudyTime: 0
                });
                this.goalTime = 0;
                this.totalStudyTime = 0;
                alert("目標時間と学習時間、両方リセットされました。");
                window.location.href = 'set_goal.html';
            }
        },
        logout() {
            signOut(auth)
                .then(() => {
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    console.error("ログアウト失敗:", error);
                });
        },
        formatTime(minutes) {
            if (minutes === 0) return '0 分';
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            let result = '';
            if (h > 0) {
                result += `${h} 時間`;
            }
            if (m > 0) {
                result += ` ${m} 分`;
            }
            return result.trim();
        },
        toggleImageMode() {
            this.imageMode = this.imageMode === 'animal' ? 'country' : 'animal';
        }
    }
});

vueApp.mount('#app');