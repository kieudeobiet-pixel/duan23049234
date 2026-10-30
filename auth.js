// auth.js - Tự động hiển thị form Đăng nhập/Đăng ký khi mở tab Tài khoản
function initAuth() {
  let currentUser = JSON.parse(localStorage.getItem("finora_current_user") || "null");

  function updateUI(user) {
    window.finoraProfile = user;
    const nameEl = document.querySelector("#welcome-name");
    const avatarEl = document.querySelector("#user-avatar");
    const captionEl = document.querySelector("#welcome-caption");
    const loginBtn = document.querySelector("#welcome-login");
    const guestSection = document.querySelector("#auth-guest");
    const profileForm = document.querySelector("#profile-form");
    const headingEl = document.querySelector("#account-heading");
    const authMsg = document.querySelector("#auth-message");

    if (authMsg) authMsg.hidden = true;

    if (nameEl) nameEl.textContent = user ? user.displayName : "Khách";
    const initial = user?.displayName ? user.displayName.trim().slice(0, 1).toLocaleUpperCase("vi") : "?";
    if (avatarEl) avatarEl.textContent = initial;
    if (captionEl) captionEl.textContent = user ? `Tài khoản: @${user.username}` : "Đăng nhập để hiển thị hồ sơ của bạn.";
    if (loginBtn) loginBtn.hidden = !!user;
    
    if (guestSection) guestSection.hidden = !!user;
    if (profileForm) profileForm.hidden = !user;
    if (headingEl) headingEl.textContent = user ? "Hồ sơ thành viên" : "Tài khoản của bạn";

    if (user && profileForm) {
      ["displayName", "phone", "username", "email"].forEach(field => {
        if (profileForm.elements[field]) profileForm.elements[field].value = user[field] || "";
      });
      const profileDisplayName = document.querySelector("#profile-display-name");
      const profileUsername = document.querySelector("#profile-username");
      const profileAvatar = document.querySelector("#profile-avatar");
      if (profileDisplayName) profileDisplayName.textContent = user.displayName;
      if (profileUsername) profileUsername.textContent = `@${user.username}`;
      if (profileAvatar) profileAvatar.textContent = initial;
    }
    window.dispatchEvent(new Event("finora-account-change"));
  }

  function showMessage(msg, isError = false) {
    const msgEl = document.querySelector("#auth-message");
    if (!msgEl) return;
    msgEl.textContent = msg;
    msgEl.classList.toggle("error", isError);
    msgEl.hidden = !msg;
  }

  // Chuyển tab Đăng nhập / Đăng ký
  document.querySelectorAll("[data-auth]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.auth;
      const loginF = document.querySelector("#login-form");
      const signupF = document.querySelector("#signup-form");
      const recF = document.querySelector("#recovery-form");
      if (loginF) loginF.hidden = target !== "login";
      if (signupF) signupF.hidden = target !== "signup";
      if (recF) recF.hidden = target !== "recovery";

      document.querySelectorAll("[data-auth]").forEach(b => {
        const active = b.dataset.auth === target;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      showMessage("");
    });
  });

  document.querySelector("#forgot-password")?.addEventListener("click", () => {
    document.querySelector("#login-form").hidden = true;
    document.querySelector("#signup-form").hidden = true;
    document.querySelector("#recovery-form").hidden = false;
    showMessage("");
  });

  document.querySelector("#back-login")?.addEventListener("click", () => {
    document.querySelector("#login-form").hidden = false;
    document.querySelector("#signup-form").hidden = true;
    document.querySelector("#recovery-form").hidden = true;
    showMessage("");
  });

  // Xử lý Form Đăng nhập
  document.querySelector("#login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;

    const users = JSON.parse(localStorage.getItem("finora_users") || "{}");
    if (!users[username] || users[username].password !== password) {
      showMessage("Tên tài khoản hoặc mật khẩu không chính xác.", true);
      return;
    }

    currentUser = users[username];
    localStorage.setItem("finora_current_user", JSON.stringify(currentUser));
    updateUI(currentUser);
    showMessage("Đăng nhập thành công!");
    if (typeof window.showScreen === "function") window.showScreen("home");
  });

  // Xử lý Form Đăng ký
  document.querySelector("#signup-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const displayName = form.elements.displayName.value.trim();
    const phone = form.elements.phone.value.trim();
    const username = form.elements.username.value.trim();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const confirmation = form.elements.confirmation.value;

    if (password !== confirmation) {
      showMessage("Mật khẩu nhập lại chưa khớp.", true);
      return;
    }

    const users = JSON.parse(localStorage.getItem("finora_users") || "{}");
    if (users[username]) {
      showMessage("Tên tài khoản đã tồn tại. Vui lòng chọn tên khác.", true);
      return;
    }

    const newUser = { displayName, phone, username, email, password };
    users[username] = newUser;
    localStorage.setItem("finora_users", JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem("finora_current_user", JSON.stringify(currentUser));
    form.reset();

    document.querySelector("#login-form").hidden = false;
    document.querySelector("#signup-form").hidden = true;
    
    updateUI(currentUser);
    showMessage("Đăng ký thành công!");
    if (typeof window.showScreen === "function") window.showScreen("home");
  });

  // Xử lý Đăng xuất
  document.querySelector("#logout-button")?.addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem("finora_current_user");
    updateUI(null);
    showMessage("Bạn đã đăng xuất.");
  });

  updateUI(currentUser);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuth);
} else {
  initAuth();
}