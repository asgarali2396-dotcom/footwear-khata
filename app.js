/**
 * StepLedger - Main Application Controller
 * Handles user interactions, form submissions, calculations, and initialization
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize PWA features
  window.PWA.init();

  // Initialize UI
  UI.refreshAll();
  loadSettingsIntoUI();

  // Event: Store updated
  window.addEventListener('store-updated', () => {
    UI.refreshAll();
  });

  // --- NAVIGATION TABS ---
  document.querySelectorAll('.nav-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const target = tabBtn.getAttribute('data-tab-target');
      UI.switchTab(target);
    });
  });

  // --- SEARCH & FILTERS ---
  const dealerSearchInput = document.getElementById('dealer-search');
  const filterPills = document.querySelectorAll('.filter-pill');

  let currentSearchQuery = '';
  let currentFilterStatus = 'all';

  if (dealerSearchInput) {
    dealerSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      UI.renderDealers(currentSearchQuery, currentFilterStatus);
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilterStatus = pill.getAttribute('data-filter');
      UI.renderDealers(currentSearchQuery, currentFilterStatus);
    });
  });

  // Transaction Filters
  const txFilterType = document.getElementById('tx-filter-type');
  const txFilterDealer = document.getElementById('tx-filter-dealer');

  if (txFilterType && txFilterDealer) {
    const handleTxFilterChange = () => {
      UI.renderTransactions(txFilterType.value, txFilterDealer.value);
    };
    txFilterType.addEventListener('change', handleTxFilterChange);
    txFilterDealer.addEventListener('change', handleTxFilterChange);
  }

  // --- MODAL CLOSE BUTTONS & BACKDROP ---
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      document.body.style.overflow = '';
    }
  });

  // --- STOCK BILL CALCULATOR ASSISTANT ---
  const cartonsInput = document.getElementById('bill-cartons');
  const pairsPerCartonInput = document.getElementById('bill-pairs-per-carton');
  const totalPairsInput = document.getElementById('bill-total-pairs');
  const rateInput = document.getElementById('bill-rate-per-pair');
  const amountInput = document.getElementById('bill-amount');

  const recalculateStockBill = () => {
    const cartons = Number(cartonsInput.value) || 0;
    const pairsPerCarton = Number(pairsPerCartonInput.value) || 12;
    const calcPairs = cartons * pairsPerCarton;
    
    if (cartons > 0 && (!totalPairsInput.dataset.manual || totalPairsInput.value == 0)) {
      totalPairsInput.value = calcPairs;
    }

    const rate = Number(rateInput.value) || 0;
    const finalPairs = Number(totalPairsInput.value) || calcPairs;
    if (rate > 0 && finalPairs > 0 && (!amountInput.dataset.manual || amountInput.value == 0)) {
      amountInput.value = Math.round(finalPairs * rate);
    }
  };

  if (cartonsInput && pairsPerCartonInput && totalPairsInput && rateInput && amountInput) {
    cartonsInput.addEventListener('input', recalculateStockBill);
    pairsPerCartonInput.addEventListener('input', recalculateStockBill);
    rateInput.addEventListener('input', recalculateStockBill);

    // If user manually types in totalPairs or amount, don't overwrite blindly
    totalPairsInput.addEventListener('input', () => { totalPairsInput.dataset.manual = "true"; recalculateStockBill(); });
    amountInput.addEventListener('input', () => { amountInput.dataset.manual = "true"; });
  }

  // --- FORM SUBMISSION: ADD DEALER ---
  const formAddDealer = document.getElementById('form-add-dealer');
  if (formAddDealer) {
    formAddDealer.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(formAddDealer);
      const name = fd.get('name');
      if (!name) return;

      const newDealer = window.appStore.addDealer({
        name,
        contactPerson: fd.get('contactPerson'),
        phone: fd.get('phone'),
        city: fd.get('city'),
        settlementDay: fd.get('settlementDay'),
        openingBalance: Number(fd.get('openingBalance')) || 0,
        notes: fd.get('notes')
      });

      UI.closeModal('modal-add-dealer');
      formAddDealer.reset();
      UI.showToast(`Dealer "${newDealer.name}" added successfully!`);
      UI.refreshAll();
    });
  }

  // --- FORM SUBMISSION: EDIT DEALER ---
  const formEditDealer = document.getElementById('form-edit-dealer');
  if (formEditDealer) {
    formEditDealer.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-dealer-id').value;
      if (!id) return;

      window.appStore.updateDealer(id, {
        name: document.getElementById('edit-dealer-name').value,
        contactPerson: document.getElementById('edit-dealer-contact').value,
        phone: document.getElementById('edit-dealer-phone').value,
        city: document.getElementById('edit-dealer-city').value,
        settlementDay: document.getElementById('edit-dealer-day').value,
        openingBalance: Number(document.getElementById('edit-dealer-opening').value) || 0,
        notes: document.getElementById('edit-dealer-notes').value
      });

      UI.closeModal('modal-edit-dealer');
      UI.showToast('Dealer profile updated');
      UI.refreshAll();
    });

    const btnDeleteDealer = document.getElementById('btn-delete-dealer');
    if (btnDeleteDealer) {
      btnDeleteDealer.addEventListener('click', () => {
        const id = document.getElementById('edit-dealer-id').value;
        const dealer = window.appStore.getDealerById(id);
        if (!dealer) return;

        if (confirm(`Are you sure you want to permanently delete "${dealer.name}" and all their purchase & payment records?`)) {
          window.appStore.deleteDealer(id);
          UI.closeModal('modal-edit-dealer');
          UI.showToast(`Deleted ${dealer.name}`, 'info');
          UI.refreshAll();
        }
      });
    }
  }

  // --- FORM SUBMISSION: STOCK BILL (UDHAR) ---
  const formStockBill = document.getElementById('form-stock-bill');
  if (formStockBill) {
    formStockBill.addEventListener('submit', (e) => {
      e.preventDefault();
      const dealerId = document.getElementById('bill-dealer-select').value;
      if (!dealerId) {
        alert('Please select a Footwear Dealer');
        return;
      }

      const totalAmount = Number(document.getElementById('bill-amount').value) || 0;
      if (totalAmount <= 0) {
        alert('Please enter a valid bill amount');
        return;
      }

      const advancePaid = Number(document.getElementById('bill-advance-paid').value) || 0;
      if (advancePaid > totalAmount) {
        alert('Advance paid cannot exceed total bill amount');
        return;
      }

      window.appStore.addStockBill({
        dealerId,
        billNumber: document.getElementById('bill-number').value,
        date: document.getElementById('bill-date').value,
        amount: totalAmount,
        footwearCategory: document.getElementById('bill-category').value,
        brandOrArticle: document.getElementById('bill-brand').value,
        cartons: document.getElementById('bill-cartons').value,
        pairsPerCarton: document.getElementById('bill-pairs-per-carton').value,
        totalPairs: document.getElementById('bill-total-pairs').value,
        ratePerPair: document.getElementById('bill-rate-per-pair').value,
        advancePaid: advancePaid,
        advanceMode: document.getElementById('bill-advance-mode').value,
        transportName: document.getElementById('bill-transport').value,
        notes: document.getElementById('bill-notes').value
      });

      UI.closeModal('modal-stock-bill');
      formStockBill.reset();
      delete totalPairsInput.dataset.manual;
      delete amountInput.dataset.manual;

      const remainingUdhar = totalAmount - advancePaid;
      UI.showToast(`Stock bill recorded! ₹${remainingUdhar.toLocaleString('en-IN')} added to Udhar.`);
      UI.refreshAll();
    });
  }

  // --- FORM SUBMISSION: RECORD PAYMENT ---
  const formRecordPayment = document.getElementById('form-record-payment');
  const payDealerSelect = document.getElementById('pay-dealer-select');
  if (payDealerSelect) {
    payDealerSelect.addEventListener('change', () => {
      UI.updatePaymentDealerPreview();
    });
  }

  if (formRecordPayment) {
    formRecordPayment.addEventListener('submit', (e) => {
      e.preventDefault();
      const dealerId = payDealerSelect.value;
      if (!dealerId) {
        alert('Please select a Footwear Dealer');
        return;
      }

      const amount = Number(document.getElementById('pay-amount').value) || 0;
      if (amount <= 0) {
        alert('Please enter a valid payment amount');
        return;
      }

      const dealer = window.appStore.getDealerById(dealerId);

      window.appStore.addPayment({
        dealerId,
        amount,
        date: document.getElementById('pay-date').value,
        paymentMode: document.getElementById('pay-mode').value,
        referenceNo: document.getElementById('pay-ref').value,
        notes: document.getElementById('pay-notes').value
      });

      UI.closeModal('modal-record-payment');
      formRecordPayment.reset();
      UI.showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${dealer.name}! 💰`);
      UI.refreshAll();

      // Show quick prompt to send WhatsApp receipt
      setTimeout(() => {
        if (confirm(`Payment saved! Do you want to send a WhatsApp confirmation statement to ${dealer.name}?`)) {
          UI.shareWhatsAppStatement(dealerId);
        }
      }, 500);
    });
  }

  // --- KHATA MODAL BUTTONS ---
  const btnKhataAddBill = document.getElementById('btn-khata-add-bill');
  const btnKhataPay = document.getElementById('btn-khata-pay');
  const btnKhataShare = document.getElementById('btn-khata-share');

  if (btnKhataAddBill) {
    btnKhataAddBill.addEventListener('click', () => {
      const activeId = document.getElementById('modal-khata-detail').dataset.activeDealerId;
      UI.closeModal('modal-khata-detail');
      UI.openBillModal(activeId);
    });
  }

  if (btnKhataPay) {
    btnKhataPay.addEventListener('click', () => {
      const activeId = document.getElementById('modal-khata-detail').dataset.activeDealerId;
      UI.closeModal('modal-khata-detail');
      UI.openPaymentModal(activeId);
    });
  }

  if (btnKhataShare) {
    btnKhataShare.addEventListener('click', () => {
      const activeId = document.getElementById('modal-khata-detail').dataset.activeDealerId;
      UI.shareWhatsAppStatement(activeId);
    });
  }

  // --- SETTINGS & BACKUP ACTIONS ---
  const formSettings = document.getElementById('form-settings');
  if (formSettings) {
    formSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      window.appStore.updateSettings({
        shopName: document.getElementById('settings-shop-name').value,
        ownerName: document.getElementById('settings-owner-name').value,
        phone: document.getElementById('settings-phone').value,
        defaultPaymentDay: document.getElementById('settings-default-day').value
      });
      loadSettingsIntoUI();
      UI.showToast('Shop profile settings saved');
    });
  }

  const btnExportData = document.getElementById('btn-export-backup');
  if (btnExportData) {
    btnExportData.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(window.appStore.exportBackupJSON());
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `StepLedger_Footwear_Backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      UI.showToast('Backup file downloaded! Keep it safe.');
    });
  }

  const fileInputRestore = document.getElementById('file-restore-backup');
  if (fileInputRestore) {
    fileInputRestore.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          window.appStore.importBackupJSON(event.target.result);
          loadSettingsIntoUI();
          UI.refreshAll();
          UI.showToast('Khata data restored successfully!');
        } catch {
          alert('Failed to restore data. Please make sure the JSON backup file is valid.');
        }
      };
      reader.readAsText(file);
    });
  }

  const btnResetData = document.getElementById('btn-reset-sample-data');
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (confirm('Reset to original realistic sample footwear data? This will overwrite current entries.')) {
        window.appStore.resetToDefaultData();
        loadSettingsIntoUI();
        UI.refreshAll();
        UI.showToast('Reset to sample footwear data completed');
      }
    });
  }

  const btnClearAll = document.getElementById('btn-clear-all-data');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      if (confirm('CAUTION: Are you sure you want to delete ALL dealers and bills to start completely fresh? Please ensure you have downloaded a backup first!')) {
        window.appStore.clearAllData();
        UI.refreshAll();
        UI.showToast('All data cleared. Ready for your custom entries.', 'info');
      }
    });
  }
});

function loadSettingsIntoUI() {
  const s = window.appStore.settings;
  const shopNameElem = document.getElementById('header-shop-name');
  if (shopNameElem) shopNameElem.textContent = s.shopName || 'Footwear Wholesale Khata';

  const inShop = document.getElementById('settings-shop-name');
  const inOwner = document.getElementById('settings-owner-name');
  const inPhone = document.getElementById('settings-phone');
  const inDay = document.getElementById('settings-default-day');

  if (inShop) inShop.value = s.shopName || '';
  if (inOwner) inOwner.value = s.ownerName || '';
  if (inPhone) inPhone.value = s.phone || '';
  if (inDay) inDay.value = s.defaultPaymentDay || 'Saturday';
}
