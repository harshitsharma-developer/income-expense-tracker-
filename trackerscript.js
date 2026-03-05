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

// Header + snackbar elements
const authTabs = document.querySelectorAll(".auth-tab");
const loginCard = document.getElementById("loginContainer");
const registerCard = document.getElementById("registerContainer");
const authSection = document.querySelector(".auth-section");
const headerAuthToggle = document.getElementById("headerAuthToggle");
const headerLogoutShortcut = document.getElementById("headerLogoutShortcut");
const currentUserChip = document.getElementById("currentUserChip");
const currentUserEmailEl = document.getElementById("currentUserEmail");
const snackbarRoot = document.getElementById("snackbar-root");
const headerAuthLabel =
  headerAuthToggle?.querySelector(".header-auth-label") || null;
const authTabsWrapper = document.querySelector(".auth-tabs");
const authFormsWrapper = document.querySelector(".auth-forms");
const trackerHero = document.getElementById("trackerHero");
const authHero = document.getElementById("authHero");
const authHeroIcon = document.getElementById("authHeroIcon");
const authHeroTitle = document.getElementById("authHeroTitle");
const authHeroSubtitle = document.getElementById("authHeroSubtitle");

const showSnackbar = (variant, message) => {
  if (!snackbarRoot) {
    // Fallback to alert if root not found
    alert(message);
    return;
  }

  const snackbar = document.createElement("div");
  snackbar.className = `snackbar snackbar--${variant}`;

  let icon = "check_circle";
  if (variant === "error") icon = "error_outline";
  else if (variant === "warning") icon = "warning_amber";
  else if (variant === "info") icon = "info";

  snackbar.innerHTML = `
    <span class="material-icons-outlined snackbar__icon">${icon}</span>
    <span class="snackbar__message">${message}</span>
  `;

  snackbarRoot.appendChild(snackbar);

  // Trigger animation
  requestAnimationFrame(() => {
    snackbar.classList.add("snackbar--visible");
  });

  setTimeout(() => {
    snackbar.classList.remove("snackbar--visible");
    snackbar.addEventListener(
      "transitionend",
      () => {
        snackbar.remove();
      },
      { once: true }
    );
  }, 3500);
};

let currentAuthView = "login";

const setAuthView = (view) => {
  const isLogin = view === "login";
  currentAuthView = view;

  authTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.target === view);
  });

  if (loginCard && registerCard) {
    loginCard.classList.toggle("auth-card--hidden", !isLogin);
    registerCard.classList.toggle("auth-card--hidden", isLogin);
  }

  if (headerAuthToggle && headerAuthLabel) {
    const iconEl = headerAuthToggle.querySelector(".material-icons-outlined");

    if (isLogin) {
      if (iconEl) iconEl.textContent = "person_add_alt";
      headerAuthLabel.textContent = "Register";
    } else {
      if (iconEl) iconEl.textContent = "login";
      headerAuthLabel.textContent = "Login";
    }
  }

  if (
    authHero &&
    authHeroIcon &&
    authHeroTitle &&
    authHeroSubtitle &&
    !auth.currentUser
  ) {
    if (isLogin) {
      authHeroIcon.textContent = "login";
      authHeroTitle.textContent = "Welcome back";
      authHeroSubtitle.textContent =
        "Sign in to unlock your personal expense dashboard and see where every rupee goes.";
    } else {
      authHeroIcon.textContent = "person_add_alt";
      authHeroTitle.textContent = "Create your free account";
      authHeroSubtitle.textContent =
        "Register once and keep your income and expenses safe in the cloud.";
    }
  }
};

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.target;
    setAuthView(target);
  });
});

// Password visibility toggles
const passwordToggleButtons = document.querySelectorAll(".field-eye");

passwordToggleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    if (!targetId) return;

    const input = document.getElementById(targetId);
    if (!input) return;

    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";

    const icon = btn.querySelector(".material-icons-outlined");
    if (icon) {
      icon.textContent = isHidden ? "visibility" : "visibility_off";
    }
  });
});

// Register User
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showSnackbar("success", "User registered successfully");
    setAuthView("login");
  } catch (error) {
    console.error("Error registering user:", error);
    showSnackbar("error", error.message);
  }
});

// Login User
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showSnackbar("success", "Logged in successfully");
  } catch (error) {
    console.error("Error logging in user:", error);
    showSnackbar("error", error.message);
  }
});

// Logout User
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showSnackbar("info", "Logged out");
  } catch (error) {
    console.error("Error logging out:", error);
    showSnackbar("error", error.message);
  }
});

if (headerLogoutShortcut) {
  headerLogoutShortcut.addEventListener("click", async () => {
    try {
      await signOut(auth);
      showSnackbar("info", "Logged out");
    } catch (error) {
      console.error("Error logging out:", error);
      showSnackbar("error", error.message);
    }
  });
}

if (headerAuthToggle) {
  headerAuthToggle.addEventListener("click", () => {
    const nextView = currentAuthView === "login" ? "register" : "login";
    setAuthView(nextView);
    showSnackbar(
      "info",
      nextView === "login"
        ? "Use the login form on the left"
        : "Use the register form on the left"
    );
  });
}

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
      showSnackbar("success", "Transaction added");
      fetchUserTransactions(user.uid);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }

    text.value = "";
    amount.value = "";
  } else {
    showSnackbar("warning", "Please log in to add transactions first");
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
      const isIncome = amount > 0;

      listItem.classList.add(
        "transaction-item",
        isIncome ? "income" : "expense"
      );

      listItem.innerHTML = `
        <div class="transaction-main">
          <span class="material-icons-outlined transaction-icon">
            ${isIncome ? "trending_up" : "trending_down"}
          </span>
          <div class="transaction-text">
            <span class="transaction-title">${text}</span>
            <span class="transaction-meta">${
              isIncome ? "Income" : "Expense"
            }</span>
          </div>
        </div>
        <div class="transaction-amount">
          ${isIncome ? "+" : "-"}₹${Math.abs(amount)}
        </div>
      `;
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
    if (expenseTracker) {
      expenseTracker.style.display = "flex";
    }
    if (authSection) {
      authSection.style.display = "flex";
    }
    if (authTabsWrapper) {
      authTabsWrapper.style.display = "none";
    }
    if (authFormsWrapper) {
      authFormsWrapper.style.display = "none";
    }
    if (trackerHero) {
      trackerHero.style.display = "flex";
    }
    if (authHero) {
      authHero.style.display = "none";
    }
    if (currentUserChip && currentUserEmailEl) {
      currentUserChip.style.display = "inline-flex";
      currentUserEmailEl.textContent = user.email || "";
    }
    if (headerAuthToggle && headerLogoutShortcut) {
      headerAuthToggle.style.display = "none";
      headerLogoutShortcut.style.display = "inline-flex";
    }
    fetchUserTransactions(user.uid);
  } else {
    if (expenseTracker) {
      expenseTracker.style.display = "none";
    }
    if (authSection) {
      authSection.style.display = "flex";
    }
    if (authTabsWrapper) {
      authTabsWrapper.style.display = "inline-flex";
    }
    if (authFormsWrapper) {
      authFormsWrapper.style.display = "flex";
    }
    if (trackerHero) {
      trackerHero.style.display = "none";
    }
    if (authHero) {
      authHero.style.display = "flex";
    }
    if (currentUserChip) {
      currentUserChip.style.display = "none";
    }
    if (headerAuthToggle && headerLogoutShortcut) {
      headerAuthToggle.style.display = "inline-flex";
      headerLogoutShortcut.style.display = "none";
    }
    setAuthView("login");
  }
});
