/**
 * StepLedger - UI Rendering & Component Controller
 * Footwear Businessman Experience & Visual Polish
 */

const UI = {
  // Format Indian Currency
  formatCurrency(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN');
  },

  // Format Date for human readability
  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  },

  // Render Dashboard KPIs
  renderKPIs() {
    const kpis = window.appStore.getOverallKPIs();

    const pendingElem = document.getElementById('kpi-pending-udhar');
    const paidElem = document.getElementById('kpi-total-paid');
    const weeklyElem = document.getElementById('kpi-weekly-due');
    const pairsElem = document.getElementById('kpi-total-pairs');

    if (pendingElem) pendingElem.textContent = this.formatCurrency(kpis.totalUdharPayable);
    if (paidElem) paidElem.textContent = this.formatCurrency(kpis.totalPaidAllTime);
    if (weeklyElem) weeklyElem.textContent = this.formatCurrency(kpis.dueThisWeekTotal);
    if (pairsElem) {
      pairsElem.innerHTML = `${kpis.totalPairs.toLocaleString('en-IN')} <span class="unit-text">pairs (${kpis.totalCartons} cartons)</span>`;
    }

    // Weekly settlement banner alert
    const alertBanner = document.getElementById('weekly-alert-banner');
    if (alertBanner) {
      if (kpis.dueTodayTotal > 0) {
        alertBanner.classList.remove('hidden');
        alertBanner.innerHTML = `
          <div class="alert-content">
            <span class="alert-icon">⚡</span>
            <div>
              <strong>Today (${kpis.currentDayName}) Weekly Settlement:</strong>
              <span>${kpis.dueTodayDealers.length} dealer(s) due today totaling <strong>${this.formatCurrency(kpis.dueTodayTotal)}</strong></span>
            </div>
          </div>
          <button class="btn btn-sm btn-accent" onclick="UI.switchTab('weekly')">Review Weekly Dues &rarr;</button>
        `;
      } else {
        alertBanner.classList.add('hidden');
      }
    }
  },

  // Render Dealer Cards
  renderDealers(filterText = '', filterStatus = 'all') {
    const container = document.getElementById('dealers-grid');
    if (!container) return;

    let dealers = window.appStore.getDealers();

    // Text Search
    if (filterText) {
      const q = filterText.toLowerCase();
      dealers = dealers.filter(d => 
        d.name.toLowerCase().includes(q) ||
        (d.city && d.city.toLowerCase().includes(q)) ||
        (d.contactPerson && d.contactPerson.toLowerCase().includes(q)) ||
        (d.phone && d.phone.includes(q))
      );
    }

    // Status Filter
    if (filterStatus === 'pending') {
      dealers = dealers.filter(d => {
        const fin = window.appStore.getDealerFinancials(d.id);
        return fin.balance > 0;
      });
    } else if (filterStatus === 'cleared') {
      dealers = dealers.filter(d => {
        const fin = window.appStore.getDealerFinancials(d.id);
        return fin.balance <= 0;
      });
    } else if (filterStatus === 'weekly') {
      const currentDay = window.appStore.getOverallKPIs().currentDayName.toLowerCase();
      dealers = dealers.filter(d => (d.settlementDay || '').toLowerCase() === currentDay);
    }

    if (dealers.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">👟</div>
          <h3>No Footwear Dealers Found</h3>
          <p>Add a new supplier/dealer or adjust your search filter.</p>
          <button class="btn btn-primary" onclick="UI.openModal('modal-add-dealer')">+ Add New Dealer</button>
        </div>
      `;
      return;
    }

    container.innerHTML = dealers.map(dealer => {
      const fin = window.appStore.getDealerFinancials(dealer.id);
      const isDue = fin.balance > 0;
      const totalTurnover = fin.openingBalance + fin.totalBilled;
      const percentPaid = totalTurnover > 0 ? Math.min(100, Math.round((fin.totalPaid / totalTurnover) * 100)) : 100;

      return `
        <div class="dealer-card ${isDue ? 'has-balance' : 'settled'}" data-dealer-id="${dealer.id}">
          <div class="dealer-card-header">
            <div class="dealer-avatar">
              <span>${dealer.name.substring(0, 2).toUpperCase()}</span>
            </div>
            <div class="dealer-title-wrap">
              <h3 class="dealer-name" onclick="UI.openKhataModal('${dealer.id}')">${dealer.name}</h3>
              <div class="dealer-sub">
                <span class="location-badge">📍 ${dealer.city || 'Wholesale Mandi'}</span>
                ${dealer.contactPerson ? `<span class="contact-badge">👤 ${dealer.contactPerson}</span>` : ''}
              </div>
            </div>
            <span class="day-badge" title="Weekly Settlement Day">🗓️ ${dealer.settlementDay || 'Weekly'}</span>
          </div>

          <!-- Financial Snapshot -->
          <div class="dealer-stats-row">
            <div class="dstat">
              <span class="dstat-label">Total Billed</span>
              <span class="dstat-value">${this.formatCurrency(fin.totalBilled + fin.openingBalance)}</span>
            </div>
            <div class="dstat">
              <span class="dstat-label">Total Paid (Jama)</span>
              <span class="dstat-value text-success">${this.formatCurrency(fin.totalPaid)}</span>
            </div>
            <div class="dstat">
              <span class="dstat-label">Udhar Balance</span>
              <span class="dstat-value ${isDue ? 'text-amber font-bold' : 'text-success'}">
                ${isDue ? this.formatCurrency(fin.balance) : '✓ Settled'}
              </span>
            </div>
          </div>

          <!-- Payment Progress Bar -->
          <div class="progress-wrap">
            <div class="progress-label">
              <span>Paid: ${percentPaid}%</span>
              <span>${fin.totalPairs > 0 ? `📦 ${fin.totalPairs} pairs stock` : ''}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${percentPaid}%;"></div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="dealer-actions">
            <button class="btn btn-sm btn-outline" onclick="UI.openKhataModal('${dealer.id}')" title="View Full Ledger">
              📖 Khata / Ledger
            </button>
            <button class="btn btn-sm btn-success-light" onclick="UI.openPaymentModal('${dealer.id}')" title="Pay Weekly Due">
              💵 Pay Dealer
            </button>
            <button class="btn btn-sm btn-icon" onclick="UI.shareWhatsAppStatement('${dealer.id}')" title="Share Statement on WhatsApp">
              💬
            </button>
            <button class="btn btn-sm btn-icon" onclick="UI.openEditDealerModal('${dealer.id}')" title="Edit Dealer Details">
              ✏️
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // Render Weekly Planner View
  renderWeeklyPlanner() {
    const container = document.getElementById('weekly-planner-container');
    if (!container) return;

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dealers = window.appStore.getDealers();
    const currentDay = window.appStore.getOverallKPIs().currentDayName;

    let dayGroups = {};
    days.forEach(day => { dayGroups[day] = []; });

    dealers.forEach(dealer => {
      const fin = window.appStore.getDealerFinancials(dealer.id);
      const day = dealer.settlementDay || 'Saturday';
      if (dayGroups[day]) {
        dayGroups[day].push({ dealer, fin });
      }
    });

    container.innerHTML = `
      <div class="weekly-planner-grid">
        ${days.map(day => {
          const isToday = day.toLowerCase() === currentDay.toLowerCase();
          const items = dayGroups[day] || [];
          const totalDayDue = items.reduce((sum, item) => sum + Math.max(0, item.fin.balance), 0);
          const activeDealersCount = items.filter(item => item.fin.balance > 0).length;

          return `
            <div class="day-column ${isToday ? 'current-day' : ''}">
              <div class="day-header">
                <div>
                  <span class="day-title">${day}</span>
                  ${isToday ? '<span class="today-pill">TODAY</span>' : ''}
                </div>
                <span class="day-total-badge ${totalDayDue > 0 ? 'badge-due' : 'badge-clear'}">
                  ${UI.formatCurrency(totalDayDue)}
                </span>
              </div>
              <div class="day-cards-list">
                ${items.length === 0 ? `
                  <div class="day-empty">No suppliers scheduled</div>
                ` : items.map(({ dealer, fin }) => `
                  <div class="day-dealer-card ${fin.balance > 0 ? 'needs-pay' : 'done'}">
                    <div class="dd-info">
                      <strong>${dealer.name}</strong>
                      <span class="dd-city">${dealer.city || 'Wholesale'}</span>
                      <span class="dd-bal ${fin.balance > 0 ? 'text-amber' : 'text-success'}">
                        ${fin.balance > 0 ? `Pending: ${UI.formatCurrency(fin.balance)}` : '✓ Cleared'}
                      </span>
                    </div>
                    ${fin.balance > 0 ? `
                      <button class="btn btn-xs btn-success" onclick="UI.openPaymentModal('${dealer.id}')">
                        Pay
                      </button>
                    ` : `
                      <span class="paid-check">✓</span>
                    `}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // Render Master Transactions Feed
  renderTransactions(filterType = 'all', filterDealer = 'all') {
    const container = document.getElementById('transactions-list');
    if (!container) return;

    let txs = window.appStore.getTransactions();

    if (filterType !== 'all') {
      txs = txs.filter(t => t.type === filterType);
    }

    if (filterDealer !== 'all') {
      txs = txs.filter(t => t.dealerId === filterDealer);
    }

    if (txs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🧾</div>
          <h3>No Transactions Found</h3>
          <p>No bills or payments match your selection.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = txs.map(tx => {
      const dealer = window.appStore.getDealerById(tx.dealerId);
      const isBill = tx.type === 'BILL';

      return `
        <div class="tx-row ${isBill ? 'tx-bill' : 'tx-payment'}">
          <div class="tx-badge-icon">
            ${isBill ? '📦' : '💵'}
          </div>
          <div class="tx-info-col">
            <div class="tx-primary-row">
              <span class="tx-type-tag ${isBill ? 'tag-bill' : 'tag-payment'}">
                ${isBill ? 'STOCK INWARD (UDHAR)' : 'PAYMENT PAID (JAMA)'}
              </span>
              <strong class="tx-dealer-name" onclick="UI.openKhataModal('${tx.dealerId}')">
                ${dealer ? dealer.name : 'Unknown Dealer'}
              </strong>
              <span class="tx-date">${this.formatDate(tx.date)}</span>
            </div>
            <div class="tx-details-row">
              ${isBill ? `
                <span class="tx-spec">Bill #${tx.billNumber || 'Challan'}</span>
                <span class="tx-spec">👟 ${tx.footwearCategory || 'Footwear'} (${tx.brandOrArticle || 'Mixed'})</span>
                <span class="tx-spec">📦 ${tx.cartons || 0} Cartons (${tx.totalPairs || 0} Pairs)</span>
                ${tx.transportName ? `<span class="tx-spec">🚛 ${tx.transportName}</span>` : ''}
              ` : `
                <span class="tx-spec">Mode: ${tx.paymentMode || 'Cash'}</span>
                ${tx.referenceNo ? `<span class="tx-spec">Ref: ${tx.referenceNo}</span>` : ''}
                ${tx.notes ? `<span class="tx-spec note-text">"${tx.notes}"</span>` : ''}
              `}
            </div>
          </div>
          <div class="tx-amount-col">
            <span class="tx-amount ${isBill ? 'text-amber' : 'text-success'}">
              ${isBill ? '+' : '-'}${this.formatCurrency(tx.amount)}
            </span>
            <button class="btn-delete-tx" onclick="UI.deleteTx('${tx.id}')" title="Delete transaction">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  },

  // Open Full Ledger / Khata Modal for a specific Dealer
  openKhataModal(dealerId) {
    const dealer = window.appStore.getDealerById(dealerId);
    if (!dealer) return;

    const modal = document.getElementById('modal-khata-detail');
    if (!modal) return;

    const fin = window.appStore.getDealerFinancials(dealerId);
    const txs = window.appStore.getTransactionsByDealer(dealerId);

    // Populate Dealer Header
    document.getElementById('khata-dealer-name').textContent = dealer.name;
    document.getElementById('khata-dealer-location').textContent = `📍 ${dealer.city || 'Wholesale Mandi'}`;
    document.getElementById('khata-dealer-phone').textContent = `📞 ${dealer.phone || '-'}`;
    document.getElementById('khata-dealer-day').textContent = `🗓️ Weekly Day: ${dealer.settlementDay || 'Saturday'}`;

    // Financial Cards
    document.getElementById('khata-stat-billed').textContent = this.formatCurrency(fin.totalBilled);
    document.getElementById('khata-stat-paid').textContent = this.formatCurrency(fin.totalPaid);
    document.getElementById('khata-stat-opening').textContent = this.formatCurrency(fin.openingBalance);
    
    const balElem = document.getElementById('khata-stat-balance');
    balElem.textContent = this.formatCurrency(fin.balance);
    balElem.className = fin.balance > 0 ? 'stat-value text-amber' : 'stat-value text-success';

    // Store current dealer ID on modal for buttons
    modal.dataset.activeDealerId = dealerId;

    // Render Ledger Rows with Running Balance Calculation
    // We compute running balance chronologically (oldest to newest) then display newest first
    const sortedChronological = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningBalance = fin.openingBalance;

    const computedLedger = sortedChronological.map(tx => {
      if (tx.type === 'BILL') {
        runningBalance += (Number(tx.amount) || 0);
      } else {
        runningBalance -= (Number(tx.amount) || 0);
      }
      return { ...tx, currentRunning: runningBalance };
    }).reverse(); // Show newest at top of table

    const tbody = document.getElementById('khata-ledger-tbody');
    if (tbody) {
      if (computedLedger.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-4">No transactions recorded yet.</td>
          </tr>
        `;
      } else {
        tbody.innerHTML = computedLedger.map(tx => {
          const isBill = tx.type === 'BILL';
          return `
            <tr>
              <td>${this.formatDate(tx.date)}</td>
              <td>
                <span class="badge ${isBill ? 'badge-bill' : 'badge-payment'}">
                  ${isBill ? 'STOCK BILL' : 'PAYMENT'}
                </span>
              </td>
              <td>
                <div class="ledger-desc">
                  <strong>${isBill ? `Bill #${tx.billNumber || 'Challan'}` : tx.paymentMode}</strong>
                  ${isBill ? `
                    <small>${tx.footwearCategory || ''} - ${tx.brandOrArticle || ''} (${tx.cartons || 0}ctn / ${tx.totalPairs || 0}prs)</small>
                  ` : `
                    <small>${tx.referenceNo || ''} ${tx.notes ? `• ${tx.notes}` : ''}</small>
                  `}
                </div>
              </td>
              <td class="text-right ${isBill ? 'text-amber font-semibold' : ''}">
                ${isBill ? this.formatCurrency(tx.amount) : '-'}
              </td>
              <td class="text-right ${!isBill ? 'text-success font-semibold' : ''}">
                ${!isBill ? this.formatCurrency(tx.amount) : '-'}
              </td>
              <td class="text-right font-bold">
                ${this.formatCurrency(tx.currentRunning)}
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    this.openModal('modal-khata-detail');
  },

  // Open Payment modal pre-filled with Dealer
  openPaymentModal(dealerId = '') {
    const modal = document.getElementById('modal-record-payment');
    if (!modal) return;

    const select = document.getElementById('pay-dealer-select');
    this.populateDealerDropdown(select, dealerId);

    const dateInput = document.getElementById('pay-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    this.updatePaymentDealerPreview();
    this.openModal('modal-record-payment');
  },

  // Open New Stock Bill modal
  openBillModal(dealerId = '') {
    const modal = document.getElementById('modal-stock-bill');
    if (!modal) return;

    const select = document.getElementById('bill-dealer-select');
    this.populateDealerDropdown(select, dealerId);

    const dateInput = document.getElementById('bill-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    this.openModal('modal-stock-bill');
  },

  populateDealerDropdown(selectElement, selectedId = '') {
    if (!selectElement) return;
    const dealers = window.appStore.getDealers();
    selectElement.innerHTML = `
      <option value="">-- Choose Footwear Supplier/Dealer --</option>
      ${dealers.map(d => `
        <option value="${d.id}" ${d.id === selectedId ? 'selected' : ''}>
          ${d.name} (${d.city || 'Wholesale'})
        </option>
      `).join('')}
    `;
  },

  updatePaymentDealerPreview() {
    const select = document.getElementById('pay-dealer-select');
    const preview = document.getElementById('pay-balance-preview');
    if (!select || !preview) return;

    const dealerId = select.value;
    if (!dealerId) {
      preview.innerHTML = '';
      return;
    }

    const fin = window.appStore.getDealerFinancials(dealerId);
    preview.innerHTML = `
      <div class="balance-preview-box ${fin.balance > 0 ? 'bg-amber-soft' : 'bg-green-soft'}">
        <span>Current Udhar Outstanding:</span>
        <strong class="${fin.balance > 0 ? 'text-amber' : 'text-success'}">${this.formatCurrency(fin.balance)}</strong>
      </div>
    `;

    // Also populate quick preset buttons
    const presetsContainer = document.getElementById('pay-quick-presets');
    if (presetsContainer) {
      if (fin.balance > 0) {
        presetsContainer.innerHTML = `
          <button type="button" class="preset-btn" onclick="document.getElementById('pay-amount').value = ${fin.balance}">Clear Full (${this.formatCurrency(fin.balance)})</button>
          <button type="button" class="preset-btn" onclick="document.getElementById('pay-amount').value = ${Math.round(fin.balance / 2)}">Pay 50%</button>
          <button type="button" class="preset-btn" onclick="document.getElementById('pay-amount').value = 10000">₹10,000</button>
          <button type="button" class="preset-btn" onclick="document.getElementById('pay-amount').value = 25000">₹25,000</button>
          <button type="button" class="preset-btn" onclick="document.getElementById('pay-amount').value = 50000">₹50,000</button>
        `;
      } else {
        presetsContainer.innerHTML = `<span class="text-sm text-success">This dealer has zero outstanding balance!</span>`;
      }
    }
  },

  // Share WhatsApp Statement Generator
  shareWhatsAppStatement(dealerId) {
    const dealer = window.appStore.getDealerById(dealerId);
    if (!dealer) return;

    const fin = window.appStore.getDealerFinancials(dealerId);
    const shopName = window.appStore.settings.shopName || "Our Footwear Shop";

    const message = 
`*FOOTWEAR KHATA STATEMENT* 👟
From: *${shopName}*
To: *${dealer.name}* (${dealer.city || 'Wholesale'})
Date: ${this.formatDate(new Date().toISOString())}
━━━━━━━━━━━━━━━━━━━━
📦 *Total Inward Billed:* ${this.formatCurrency(fin.totalBilled + fin.openingBalance)}
💵 *Total Payment Paid (Jama):* ${this.formatCurrency(fin.totalPaid)}
🔴 *Current Udhar Remaining:* *${this.formatCurrency(fin.balance)}*
━━━━━━━━━━━━━━━━━━━━
Weekly Settlement Day: ${dealer.settlementDay || 'Saturday'}
_Sent via StepLedger Footwear PWA_`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = (dealer.phone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone.length >= 10 ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    
    window.open(waUrl, '_blank');
  },

  // Print Khata Statement
  printKhataStatement() {
    window.print();
  },

  // Tab switching
  switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabId}`);
    const navBtn = document.querySelector(`[data-tab-target="${tabId}"]`);

    if (targetTab) targetTab.classList.add('active');
    if (navBtn) navBtn.classList.add('active');

    // Trigger specific renders
    if (tabId === 'dealers') {
      this.renderDealers();
    } else if (tabId === 'weekly') {
      this.renderWeeklyPlanner();
    } else if (tabId === 'transactions') {
      this.renderTransactions();
    } else if (tabId === 'reports') {
      this.renderReports();
    }
  },

  // Render Reports & Analytics
  renderReports() {
    const dealers = window.appStore.getDealers();
    const txs = window.appStore.getTransactions();

    // Footwear Category Breakdown
    const catCounts = {};
    txs.filter(t => t.type === 'BILL').forEach(t => {
      const cat = t.footwearCategory || 'General Footwear';
      catCounts[cat] = (catCounts[cat] || 0) + (Number(t.totalPairs) || 0);
    });

    const catContainer = document.getElementById('report-category-list');
    if (catContainer) {
      const entries = Object.entries(catCounts);
      if (entries.length === 0) {
        catContainer.innerHTML = '<p class="text-muted">No stock inwarded yet.</p>';
      } else {
        catContainer.innerHTML = entries.map(([cat, pairs]) => `
          <div class="report-stat-row">
            <span class="cat-label">👟 ${cat}</span>
            <strong class="cat-value">${pairs.toLocaleString('en-IN')} pairs</strong>
          </div>
        `).join('');
      }
    }

    // Top Creditor Dealers
    const topCreditors = dealers.map(d => ({
      dealer: d,
      fin: window.appStore.getDealerFinancials(d.id)
    }))
    .filter(x => x.fin.balance > 0)
    .sort((a, b) => b.fin.balance - a.fin.balance)
    .slice(0, 5);

    const creditorContainer = document.getElementById('report-top-creditors');
    if (creditorContainer) {
      if (topCreditors.length === 0) {
        creditorContainer.innerHTML = '<p class="text-success">Awesome! Zero pending udhar across all suppliers.</p>';
      } else {
        creditorContainer.innerHTML = topCreditors.map(({ dealer, fin }) => `
          <div class="report-creditor-row" onclick="UI.openKhataModal('${dealer.id}')">
            <div>
              <strong>${dealer.name}</strong>
              <small class="block text-muted">${dealer.city || 'Wholesale'}</small>
            </div>
            <strong class="text-amber">${this.formatCurrency(fin.balance)}</strong>
          </div>
        `).join('');
      }
    }
  },

  // Modals
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-up`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ️'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  },

  deleteTx(id) {
    if (confirm('Are you sure you want to delete this transaction entry? This will adjust your dealer balance.')) {
      window.appStore.deleteTransaction(id);
      this.showToast('Transaction removed successfully');
      this.refreshAll();
    }
  },

  openEditDealerModal(dealerId) {
    const dealer = window.appStore.getDealerById(dealerId);
    if (!dealer) return;

    document.getElementById('edit-dealer-id').value = dealer.id;
    document.getElementById('edit-dealer-name').value = dealer.name;
    document.getElementById('edit-dealer-contact').value = dealer.contactPerson || '';
    document.getElementById('edit-dealer-phone').value = dealer.phone || '';
    document.getElementById('edit-dealer-city').value = dealer.city || '';
    document.getElementById('edit-dealer-day').value = dealer.settlementDay || 'Saturday';
    document.getElementById('edit-dealer-opening').value = dealer.openingBalance || 0;
    document.getElementById('edit-dealer-notes').value = dealer.notes || '';

    this.openModal('modal-edit-dealer');
  },

  refreshAll() {
    this.renderKPIs();
    this.renderDealers();
    this.renderWeeklyPlanner();
    this.renderTransactions();
    this.renderReports();

    // Populate filter dropdowns
    const txDealerSelect = document.getElementById('tx-filter-dealer');
    if (txDealerSelect) {
      const currentVal = txDealerSelect.value;
      this.populateDealerDropdown(txDealerSelect, currentVal);
      // Prepend 'All Suppliers'
      const firstOpt = txDealerSelect.querySelector('option[value=""]');
      if (firstOpt) firstOpt.textContent = 'All Footwear Dealers';
    }
  }
};

window.UI = UI;
