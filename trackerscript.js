// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEYLRQ9mTTYZl2QV1BXHatuRbaOkjkGes",
  authDomain: "harshit-collage.firebaseapp.com",
  projectId: "harshit-collage",
  storageBucket: "harshit-collage.firebasestorage.app",
  messagingSenderId: "437673879917",
  appId: "1:437673879917:web:864e794e8afcd283479264",
  measurementId: "G-GSMM7F275V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const expenseTracker = document.getElementById("expenseTracker");
const balance = document.getElementById("balance");
const moneyPlus = document.getElementById("money-plus");
const moneyMinus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const logoutBtn = document.getElementById("logoutBtn");

// Register User
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("User registered successfully!");
  } catch (error) {
    console.error("Error registering user:", error);
    alert(error.message);
  }
});

// Login User
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("User logged in successfully!");
  } catch (error) {
    console.error("Error logging in user:", error);
    alert(error.message);
  }
});

// Logout User
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("User logged out!");
  } catch (error) {
    console.error("Error logging out:", error);
    alert(error.message);
  }
});

// Add Transaction
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;

  if (user) {
    const transaction = {
      text: text.value,
      amount: +amount.value,
    };

    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), transaction);
      alert("Transaction added!");
      fetchUserTransactions(user.uid);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }

    text.value = "";
    amount.value = "";
  } else {
    alert("Please log in to add transactions.");
  }
});

// Fetch User Transactions
const fetchUserTransactions = async (uid) => {
  list.innerHTML = ""; // Clear existing transactions
  let totalIncome = 0;
  let totalExpense = 0;

  try {
    const q = query(collection(db, "users", uid, "transactions"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const { text, amount } = doc.data();
      const listItem = document.createElement("li");
      listItem.textContent = `${text} : ₹${amount}`;
      list.appendChild(listItem);

      if (amount > 0) totalIncome += amount;
      else totalExpense += Math.abs(amount);
    });

    // Update UI
    balance.textContent = `₹${totalIncome - totalExpense}`;
    moneyPlus.textContent = `+₹${totalIncome}`;
    moneyMinus.textContent = `-₹${totalExpense}`;
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
};

// Handle Auth State Changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    expenseTracker.style.display = "block";
    fetchUserTransactions(user.uid);
  } else {
    expenseTracker.style.display = "none";
  }
});
