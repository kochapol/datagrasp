// 1. Initialize Firebase (Get these keys from your Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCh4mpf5t19iFUylAHvJ9WCs0LDPgC8RaQ",
  authDomain: "mkdv-5aa3e.firebaseapp.com",
  projectId: "mkdv-5aa3e",
  storageBucket: "mkdv-5aa3e.firebasestorage.app",
  messagingSenderId: "127033995693",
  appId: "1:127033995693:web:653a3fa3949e169c00b124",
  measurementId: "G-XG87VP9705"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const fileInput = document.getElementById('csv-file');
const resultBox = document.getElementById('result-box');
const aiResponseDiv = document.getElementById('ai-response');
const loadingDiv = document.getElementById('loading');

// 2. Handle Login / Sign Up
// 2. Handle Login / Sign Up
document.getElementById('login-btn').addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    // Try to login first
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            // If the login fails because of credentials, try creating a new account!
            if (error.code === 'auth/user-not-found' || 
                error.code === 'auth/wrong-password' || 
                error.code === 'auth/invalid-login-credentials') {
                
                 auth.createUserWithEmailAndPassword(email, password)
                     .then(() => alert("New account created successfully!"))
                     .catch(err => alert("Sign up error: " + err.message));
            } else {
                // If it's a different error (like a bad email format), show it
                alert(error.message);
            }
        });
});
// Handle Logout
document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

// Listen for Auth State Changes
auth.onAuthStateChanged(user => {
    if (user) {
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        document.getElementById('user-email').innerText = user.email;
    } else {
        authSection.style.display = 'block';
        appSection.style.display = 'none';
    }
});

// 3. Document Processing (Read CSV and send to Backend)
document.getElementById('analyze-btn').addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return alert("Please upload a CSV file first!");

    loadingDiv.style.display = 'block';
    resultBox.style.display = 'none';

    // Read the file using standard JS FileReader
    const reader = new FileReader();
    reader.onload = async function(e) {
        const csvText = e.target.result;

        // Send text to our local/deployed backend
        // Send text to our local/deployed backend
        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csvData: csvText })
            });

            // NEW: If the server returns 503, 500, or any other error status
            if (!response.ok) {
                const errorText = await response.text(); 
                throw new Error(`HTTP ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            loadingDiv.style.display = 'none';
            resultBox.style.display = 'block';
            
            if (data.error) {
                aiResponseDiv.innerText = "❌ Backend Error: " + data.error;
            } else {
                aiResponseDiv.innerText = data.summary || "No text was returned by AI.";
            }

        } catch (error) {
            console.error(error);
            loadingDiv.style.display = 'none';
            resultBox.style.display = 'block';
            // Print the exact error to the screen instead of undefined
            aiResponseDiv.innerText = "❌ " + error.message; 
        }
    };
    
    reader.readAsText(file);
});