"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");
  const toast = document.querySelector("#toast");
  const moneyTitle = document.querySelector("#money-title");
  const moneyCaption = document.querySelector("#money-caption");
  const moneyIcon = document.querySelector("#money-icon");
  const depositFields = document.querySelector("#deposit-fields");
  const withdrawFields = document.querySelector("#withdraw-fields");
  const moneyAction = document.querySelector("#money-action");

  const balanceDisplay = document.querySelector("#balance-display");
  const assetVal1 = document.querySelector("#asset-val-1");
  const assetVal2 = document.querySelector("#asset-val-2");
  const assetVal3 = document.querySelector("#asset-val-3");
  const depositAmountInput = document.querySelector("#deposit-amount");
  const qrBox = document.querySelector("#qr-box");
  const qrAmountText = document.querySelector("#qr-amount-text");
  const qrCodeId = document.querySelector("#qr-code-id");
  const confirmDepositBtn = document.querySelector("#confirm-deposit-btn");
  const transactionHistory = document.querySelector("#transaction-history");
  const applyPromoBtn = document.querySelector("#apply-promo-200k");
  const promoNoticeText = document.querySelector("#promo-notice-text");

  let userBalance = 0;
  let isPromoActive = false;
  let toastTimer;
  let historyData = [];

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
  }

  function updateBalanceUI() {
    if (balanceDisplay) balanceDisplay.textContent = formatCurrency(userBalance);
    if (assetVal1) assetVal1.textContent = formatCurrency(Math.floor(userBalance * 0.4));
    if (assetVal2) assetVal2.textContent = formatCurrency(Math.floor(userBalance * 0.4));
    if (assetVal3) assetVal3.textContent = formatCurrency(Math.floor(userBalance * 0.2));
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3500);
  }

  window.showToast = showToast;

  function showScreen(name) {
    screens.forEach((screen) => {
      screen.hidden = screen.id !== `screen-${name}`;
    });
    document.querySelectorAll("[data-screen]").forEach((control) => {
      const active = control.dataset.screen === name;
      control.classList.toggle("active", active);
      if (control.matches(".tab")) {
        control.setAttribute("aria-selected", String(active));
      }
    });
    document.querySelectorAll(".bottom-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.screen === name);
    });
    if (toast) toast.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.showScreen = showScreen;

  document.querySelectorAll("[data-screen]").forEach((control) => {
    control.addEventListener("click", () => showScreen(control.dataset.screen));
  });

  document.querySelectorAll("[data-screen-jump]").forEach((control) => {
    control.addEventListener("click", () => showScreen(control.dataset.screenJump));
  });

  document.querySelectorAll(".subtab[data-money]").forEach((button) => {
    button.addEventListener("click", () => {
      const isDeposit = button.dataset.money === "deposit";
      document.querySelectorAll(".subtab[data-money]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });

      if (depositFields) depositFields.hidden = !isDeposit;
      if (withdrawFields) withdrawFields.hidden = isDeposit;

      if (isDeposit) {
        if (moneyTitle) moneyTitle.textContent = "Nạp tiền tài khoản";
        if (moneyCaption) moneyCaption.textContent = "Chuyển khoản qua VietQR nhận tiền tự động.";
        if (moneyIcon) moneyIcon.textContent = "QR";
        if (moneyAction) moneyAction.textContent = "Tạo lệnh nạp tiền";
      } else {
        if (moneyTitle) moneyTitle.textContent = "Rút tiền tài khoản";
        if (moneyCaption) moneyCaption.textContent = "Gửi yêu cầu rút tiền về tài khoản ngân hàng.";
        if (moneyIcon) moneyIcon.textContent = "⇄";
        if (moneyAction) moneyAction.textContent = "Gửi yêu cầu rút";
        if (qrBox) qrBox.hidden = true;
      }
    });
  });

  function renderHistoryUI() {
    if (!transactionHistory) return;
    if (historyData.length === 0) {
      transactionHistory.innerHTML = `<p class="empty-msg" style="text-align: center; color: #94a3b8; font-size: 11px;">Chưa có giao dịch nào.</p>`;
      return;
    }

    transactionHistory.innerHTML = historyData.map(item => {
      const isPlus = item.type === "deposit" || item.type === "pnl_plus";
      const sign = isPlus ? "+" : "-";
      const cls = isPlus ? "plus" : "minus";
      
      let statusBadge = "";
      if (item.status === "pending") {
        statusBadge = `<span class="tx-status-badge pending">Đang xử lý</span>`;
      } else if (item.status === "success") {
        statusBadge = `<span class="tx-status-badge success">Thành công</span>`;
      } else if (item.status === "rejected") {
        statusBadge = `<span class="tx-status-badge rejected">Đã hủy</span>`;
      }

      return `
        <div class="tx-item">
          <div class="tx-info">
            <strong>${item.title} ${statusBadge}</strong>
            <small>${item.time} · ID: ${item.id}</small>
          </div>
          <span class="tx-amount ${cls}">${sign}${formatCurrency(item.amount)} ₫</span>
        </div>
      `;
    }).join("");
  }

  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", () => {
      if (depositAmountInput) depositAmountInput.value = 200000;
      isPromoActive = true;
      showToast("Đã áp dụng mã khuyến mãi: Nạp 200k nhận 1tr!");
    });
  }

  if (depositAmountInput) {
    depositAmountInput.addEventListener("input", () => {
      if (parseInt(depositAmountInput.value, 10) !== 200000) {
        isPromoActive = false;
      }
    });
  }

  if (moneyAction) {
    moneyAction.addEventListener("click", () => {
      if (!requireAccount()) return;
      const depositTabBtn = document.querySelector(".subtab[data-money='deposit']");
      const isDepositTab = depositTabBtn ? depositTabBtn.classList.contains("active") : true;
      if (isDepositTab) {
        const amount = depositAmountInput ? parseInt(depositAmountInput.value, 10) : 0;
        if (!amount || amount <= 0) {
          showToast("Vui lòng nhập số tiền nạp hợp lệ lớn hơn 0.");
          return;
        }
        const randomId = "FINORA " + Math.floor(100000 + Math.random() * 900000);
        if (qrCodeId) qrCodeId.textContent = randomId;
        if (qrAmountText) qrAmountText.textContent = formatCurrency(amount) + " ₫";
        
        if (amount === 200000 && isPromoActive) {
          if (promoNoticeText) promoNoticeText.hidden = false;
        } else {
          if (promoNoticeText) promoNoticeText.hidden = true;
        }

        if (qrBox) qrBox.hidden = false;
        showToast("Đã tạo lệnh nạp tiền VietQR VIB thành công!");
      } else {
        const withdrawAmountInput = document.querySelector("#withdraw-amount");
        const withdrawBankInput = document.querySelector("#withdraw-bank");
        const withdrawAccountInput = document.querySelector("#withdraw-account");

        const withdrawAmount = withdrawAmountInput ? parseInt(withdrawAmountInput.value, 10) : 0;
        const bank = withdrawBankInput ? withdrawBankInput.value : "";
        const account = withdrawAccountInput ? withdrawAccountInput.value : "";
        
        if (!bank || !account || !withdrawAmount || withdrawAmount <= 0) {
          showToast("Vui lòng điền đầy đủ thông tin ngân hàng và số tiền rút.");
          return;
        }
        if (withdrawAmount > userBalance) {
          showToast("Số dư khả dụng không đủ để thực hiện giao dịch này.");
          return;
        }
        
        userBalance -= withdrawAmount;
        updateBalanceUI();

        const newTxId = "TX" + Math.floor(10000 + Math.random() * 90000);
        historyData.unshift({
          id: newTxId,
          type: "withdraw",
          title: `Rút tiền về ${bank}`,
          amount: withdrawAmount,
          time: "Vừa xong",
          status: "success",
          user: window.finoraProfile?.username || "Khách",
          gate: `${bank} - ${account}`
        });

        renderHistoryUI();
        showToast(`Đã gửi yêu cầu rút ${formatCurrency(withdrawAmount)} ₫ thành công!`);
        if (withdrawAmountInput) withdrawAmountInput.value = "";
        if (withdrawAccountInput) withdrawAccountInput.value = "";
      }
    });
  }

  if (confirmDepositBtn) {
    confirmDepositBtn.addEventListener("click", () => {
      if (!requireAccount()) return;
      const amount = depositAmountInput ? parseInt(depositAmountInput.value, 10) : 0;
      if (amount && amount > 0) {
        const creditedAmount = (amount === 200000 && isPromoActive) ? 1000000 : amount;
        
        userBalance += creditedAmount;
        updateBalanceUI();
        if (qrBox) qrBox.hidden = true;
        
        const newTxId = "TX" + Math.floor(10000 + Math.random() * 90000);
        const txLabel = (amount === 200000 && isPromoActive) ? "Nạp khuyến mãi 200k nhận 1tr (VIB)" : `Nạp tiền qua VietQR (VIB)`;
        
        historyData.unshift({
          id: newTxId,
          type: "deposit",
          title: txLabel,
          amount: creditedAmount,
          time: "Vừa xong",
          status: "success",
          user: window.finoraProfile?.username || "Khách",
          gate: "VietQR VIB"
        });

        renderHistoryUI();
        showToast(`Xác nhận thành công! Đã cộng +${formatCurrency(creditedAmount)} ₫ vào tài khoản.`);
        isPromoActive = false;
        setTimeout(() => {
          showScreen("home");
        }, 1000);
      }
    });
  }

  updateBalanceUI();
  renderHistoryUI();

  function requireAccount() {
    if (window.finoraProfile) return true;
    showScreen("account");
    showToast("Vui lòng đăng nhập trước khi tiếp tục.");
    return false;
  }

  window.addEventListener("finora-account-change", () => {
    userBalance = 0;
    historyData = [];
    if (qrBox) qrBox.hidden = true;
    isPromoActive = false;
    updateBalanceUI();
    renderHistoryUI();
  });
});