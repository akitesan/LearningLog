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
            imageTitles: {
                5: 'アメーバ',
                10: 'クラゲ',
                15: 'ミミズ',
                20: 'カタツムリ',
                25: 'クモ',
                30: 'カブトムシ',
                35: 'サメ',
                40: 'カエル',
                45: 'カメ',
                50: 'ティラノサウルス',
                55: 'ワニ',
                60: 'ペンギン',
                65: 'カモノハシ',
                70: 'コアラ',
                75: 'キツネザル',
                80: 'ゴリラ',
                85: 'アウストラロピテクス',
                90: 'ネアンデルタール人',
                95: 'ホモ・サピエンス（初期）',
                100: 'サイボーグ'
            },
            imageDescriptions: {
                5: '地球最初の生命体の一種。単細胞生物であり、環境の変化に柔軟に対応しながら生きています。',
                10: '神経系や筋肉を持つ多細胞生物の祖先。脳を持たず、単純な体の作りで海中を漂います。',
                15: '左右対称の体を持つ環形動物。単純ながらも内臓器官が分化し、消化管を持っています。',
                20: '軟体動物の一種で、体を覆う殻を進化させました。陸上生活に適応するための重要な一歩です。',
                25: '節足動物として外骨格と複数の肢を持ち、陸上での生存戦略を確立しました。',
                30: '昆虫の代表的な存在。硬い外骨格と翅を持ち、空を飛ぶ能力を獲得しました。',
                35: '軟骨魚類として、強力な顎と鋭い歯を持ち、海洋の捕食者として君臨しました。',
                40: '両生類として、水と陸の両方で生活できるようになりました。肺呼吸と皮膚呼吸を併用します。',
                45: '爬虫類として、硬い甲羅で身を守る術を身につけ、陸上での生活に完全に適応しました。',
                50: '史上最大の陸上捕食者の一種。恐竜時代の頂点に立ち、巨大な体と強力な顎を持ちました。',
                55: '恐竜の近縁種であり、水辺での生活に特化した形態を持ちます。高い適応力で現在まで生き残りました。',
                60: '鳥類でありながら、空を飛ぶことをやめ、水中生活に特化しました。翼は泳ぐためのヒレに変化しました。',
                65: '哺乳類でありながら卵を産むという、進化の過渡期を示すユニークな特徴を持ちます。',
                70: '有袋類として、育児嚢（いくじのう）で未熟な子を育てます。特定の食物に特化して適応しました。',
                75: '霊長類の祖先の一種。樹上生活に適した長い尾と指を持ち、社会的な行動の始まりが見られます。',
                80: '知能が高く、道具を使う能力を持つ大型の霊長類。家族や群れで複雑な社会を形成します。',
                85: '直立二足歩行を始めた初期の人類。手足が自由に使えるようになり、道具の利用がさらに進みました。',
                90: 'ホモ・サピエンスと共存していた旧人類。優れた狩猟技術と死者を埋葬する文化を持っていました。',
                95: '現代人の直接的な祖先。複雑な言語と抽象的な思考能力を獲得し、芸術や文化を生み出しました。',
                100: '人間と機械が融合した存在。生物的な限界を超え、新しい能力や可能性を獲得した未来の姿です。'
            }
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
                : `達成度 ${this.imageLevel}% の国(今後追加)`;
        },
        formattedGoalTime() {
            return this.formatTime(this.goalTime);
        },
        formattedTotalTime() {
            return this.formatTime(this.totalStudyTime);
        },
        currentImageTitle() {
            if (this.imageMode !== 'animal') {
                return '';
            }
            let level = this.imageLevel;
            if (level === 0 || typeof level === 'undefined') {
                level = 5;
            }
            return this.imageTitles[level];
        },
        currentImageDescription() {
            if (this.imageMode !== 'animal') {
                return '';
            }
            let level = this.imageLevel;
            if (level === 0 || typeof level === 'undefined') {
                level = 5;
            }
            return this.imageDescriptions[level];
        },
        timeToNextLevel() {
            if (this.goalTime === 0) {
                return '目標を設定してください';
            }
            if (this.achievementRate >= 100) {
                return '完了';
            }
            const currentLevel = Math.floor(this.achievementRate / 5) * 5;
            const nextLevelPercentage = currentLevel + 5;
            const timeNeededForNextLevel = this.goalTime * (nextLevelPercentage / 100);
            const timeRemaining = timeNeededForNextLevel - this.totalStudyTime;
            if (timeRemaining <= 0) {
                return 'レベルアップ達成！';
            }
            return this.formatTime(Math.ceil(timeRemaining));
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