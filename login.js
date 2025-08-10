
const firebaseConfig = {
    apiKey: "AIzaSyDV5V__6NnZU7CY0TQunRKXTePx1mYhJJA",
    authDomain: "learninglog-fd591.firebaseapp.com",
    projectId: "learninglog-fd591"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = 'index.html';
    }
});

document.getElementById('google-login-btn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            console.log("ログイン成功:", result.user.displayName);
        })
        .catch(error => {
            console.error("ログイン失敗:", error.message);
        });
});