/**
 * StepLedger - Store & State Management
 * Persistent offline storage via LocalStorage with Footwear-specific models
 */

const STORAGE_KEYS = {
  SETTINGS: 'stepledger_settings_v1',
  DEALERS: 'stepledger_dealers_v1',
  TRANSACTIONS: 'stepledger_transactions_v1',
};

// Initial Realistic Sample Data for Footwear Business
const DEFAULT_SETTINGS = {
  shopName: "Royal Footwear & Wholesale",
  ownerName: "Ali Bhai",
  phone: "+91 98765 43210",
  currency: "₹",
  defaultPaymentDay: "Saturday",
  theme: "dark"
};

const DEFAULT_DEALERS = [
  {
    id: "dlr_agra_gupta",
    name: "Gupta Footwear Agency",
    contactPerson: "Ramesh Gupta",
    phone: "+91 98290 11223",
    city: "Agra (Hing ki Mandi)",
    settlementDay: "Saturday",
    openingBalance: 25000,
    createdAt: "2026-08-01T10:00:00Z",
    notes: "Top supplier for Sports Shoes & Sneaker cartons"
  },
  {
    id: "dlr_delhi_metro",
    name: "Metro Soles & Chappals",
    contactPerson: "Sanjay Verma",
    phone: "+91 98110 44556",
    city: "Delhi (Karol Bagh Mandi)",
    settlementDay: "Monday",
    openingBalance: 15000,
    createdAt: "2026-08-10T11:00:00Z",
    notes: "EVA / PU daily slippers & sliders"
  },
  {
    id: "dlr_kanpur_leather",
    name: "Tannery Leather Craft",
    contactPerson: "Mohammad Irfan",
    phone: "+91 94500 77889",
    city: "Kanpur (Jajmau)",
    settlementDay: "Wednesday",
    openingBalance: 40000,
    createdAt: "2026-08-15T09:30:00Z",
    notes: "Genuine leather formal shoes & school shoes"
  },
  {
    id: "dlr_mumbai_apex",
    name: "Apex Kids & Sandals Hub",
    contactPerson: "Kishore Bhai",
    phone: "+91 97690 33221",
    city: "Mumbai (Dadar Wholesale)",
    settlementDay: "Friday",
    openingBalance: 10000,
    createdAt: "2026-08-20T14:00:00Z",
    notes: "Kids LED sneakers and fancy sandals"
  }
];

const DEFAULT_TRANSACTIONS = [
  {
    id: "tx_101",
    dealerId: "dlr_agra_gupta",
    type: "BILL",
    date: "2026-09-05",
    amount: 48000,
    billNumber: "INV-4091",
    footwearCategory: "Sports Shoes",
    brandOrArticle: "AirFlex Turbo-7 (Campus/Sparx style)",
    cartons: 8,
    pairsPerCarton: 12,
    totalPairs: 96,
    ratePerPair: 500,
    advancePaid: 0,
    transportName: "V-Trans Bilty #8812",
    notes: "Festival stock - sizes 6 to 10 assorted",
    createdAt: "2026-09-05T11:00:00Z"
  },
  {
    id: "tx_102",
    dealerId: "dlr_agra_gupta",
    type: "PAYMENT",
    date: "2026-09-12",
    amount: 30000,
    paymentMode: "UPI / GPay",
    referenceNo: "UPI-902184128",
    notes: "Saturday weekly payment settled via GPay",
    createdAt: "2026-09-12T16:30:00Z"
  },
  {
    id: "tx_103",
    dealerId: "dlr_agra_gupta",
    type: "BILL",
    date: "2026-09-19",
    amount: 36000,
    billNumber: "INV-4155",
    footwearCategory: "Casual Sneakers",
    brandOrArticle: "White Classic Canvas & Loafers",
    cartons: 6,
    pairsPerCarton: 12,
    totalPairs: 72,
    ratePerPair: 500,
    advancePaid: 6000,
    transportName: "Express Roadways Bilty #441",
    notes: "Advance 6000 cash paid on parcel arrival, balance 30000 on udhar",
    createdAt: "2026-09-19T10:15:00Z"
  },
  {
    id: "tx_104",
    dealerId: "dlr_delhi_metro",
    type: "BILL",
    date: "2026-09-08",
    amount: 28800,
    billNumber: "METRO-992",
    footwearCategory: "PU Chappals / Slippers",
    brandOrArticle: "Orthopedic Cushion Comfort Slides",
    cartons: 12,
    pairsPerCarton: 16,
    totalPairs: 192,
    ratePerPair: 150,
    advancePaid: 0,
    transportName: "Delhi Parcel Service",
    notes: "High demand fast moving slipper article",
    createdAt: "2026-09-08T14:20:00Z"
  },
  {
    id: "tx_105",
    dealerId: "dlr_delhi_metro",
    type: "PAYMENT",
    date: "2026-09-15",
    amount: 20000,
    paymentMode: "Bank Transfer (NEFT/RTGS)",
    referenceNo: "NEFT-HDFC09918",
    notes: "Monday weekly clearance",
    createdAt: "2026-09-15T12:00:00Z"
  },
  {
    id: "tx_106",
    dealerId: "dlr_kanpur_leather",
    type: "BILL",
    date: "2026-09-10",
    amount: 55000,
    billNumber: "KAN-7120",
    footwearCategory: "Formal Shoes",
    brandOrArticle: "Pure Leather Derby & Oxford Classic",
    cartons: 5,
    pairsPerCarton: 10,
    totalPairs: 50,
    ratePerPair: 1100,
    advancePaid: 10000,
    transportName: "Kanpur Express",
    notes: "Wedding season leather stock",
    createdAt: "2026-09-10T16:00:00Z"
  },
  {
    id: "tx_107",
    dealerId: "dlr_kanpur_leather",
    type: "PAYMENT",
    date: "2026-09-17",
    amount: 35000,
    paymentMode: "Cheque",
    referenceNo: "CHQ-002819 (SBI)",
    notes: "Wednesday scheduled weekly payment cleared",
    createdAt: "2026-09-17T11:00:00Z"
  },
  {
    id: "tx_108",
    dealerId: "dlr_mumbai_apex",
    type: "BILL",
    date: "2026-09-22",
    amount: 32000,
    billNumber: "APX-304",
    footwearCategory: "Kids Footwear",
    brandOrArticle: "Kids Glow LED & Cartoon Straps",
    cartons: 8,
    pairsPerCarton: 12,
    totalPairs: 96,
    ratePerPair: 333.33,
    advancePaid: 0,
    transportName: "Western Cargo",
    notes: "School and daily wear for Diwali season",
    createdAt: "2026-09-22T13:45:00Z"
  }
];

class Store {
  constructor() {
    this.settings = this.load(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.dealers = this.load(STORAGE_KEYS.DEALERS, DEFAULT_DEALERS);
    this.transactions = this.load(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Error loading key ${key}:`, e);
      return fallback;
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      localStorage.setItem(STORAGE_KEYS.DEALERS, JSON.stringify(this.dealers));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      window.dispatchEvent(new CustomEvent('store-updated'));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --- DEALER OPERATIONS ---
  getDealers() {
    return this.dealers;
  }

  getDealerById(id) {
    return this.dealers.find(d => d.id === id);
  }

  addDealer(dealerData) {
    const id = 'dlr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newDealer = {
      id,
      name: dealerData.name.trim(),
      contactPerson: (dealerData.contactPerson || '').trim(),
      phone: (dealerData.phone || '').trim(),
      city: (dealerData.city || 'Wholesale Mandi').trim(),
      settlementDay: dealerData.settlementDay || 'Saturday',
      openingBalance: Number(dealerData.openingBalance) || 0,
      notes: (dealerData.notes || '').trim(),
      createdAt: new Date().toISOString()
    };
    this.dealers.unshift(newDealer);
    this.save();
    return newDealer;
  }

  updateDealer(id, updatedData) {
    const index = this.dealers.findIndex(d => d.id === id);
    if (index !== -1) {
      this.dealers[index] = {
        ...this.dealers[index],
        ...updatedData,
        openingBalance: Number(updatedData.openingBalance) || 0
      };
      this.save();
      return this.dealers[index];
    }
    return null;
  }

  deleteDealer(id) {
    // Delete dealer and associated transactions
    this.dealers = this.dealers.filter(d => d.id !== id);
    this.transactions = this.transactions.filter(t => t.dealerId !== id);
    this.save();
  }

  // --- TRANSACTION OPERATIONS ---
  getTransactions() {
    // Return sorted newest first
    return [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getTransactionsByDealer(dealerId) {
    return this.transactions
      .filter(t => t.dealerId === dealerId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  addStockBill(data) {
    const id = 'tx_bill_' + Date.now();
    const totalBill = Number(data.amount) || 0;
    const advancePaid = Number(data.advancePaid) || 0;

    const newTx = {
      id,
      dealerId: data.dealerId,
      type: 'BILL',
      date: data.date || new Date().toISOString().split('T')[0],
      amount: totalBill,
      billNumber: (data.billNumber || '').trim(),
      footwearCategory: data.footwearCategory || 'Sports Shoes',
      brandOrArticle: (data.brandOrArticle || '').trim(),
      cartons: Number(data.cartons) || 0,
      pairsPerCarton: Number(data.pairsPerCarton) || 12,
      totalPairs: Number(data.totalPairs) || (Number(data.cartons) * Number(data.pairsPerCarton)) || 0,
      ratePerPair: Number(data.ratePerPair) || 0,
      advancePaid: advancePaid,
      transportName: (data.transportName || '').trim(),
      notes: (data.notes || '').trim(),
      createdAt: new Date().toISOString()
    };

    this.transactions.unshift(newTx);

    // If an advance was paid at the time of inward, create a linked payment transaction
    if (advancePaid > 0) {
      const advPaymentTx = {
        id: 'tx_adv_' + Date.now(),
        dealerId: data.dealerId,
        type: 'PAYMENT',
        date: data.date || new Date().toISOString().split('T')[0],
        amount: advancePaid,
        paymentMode: data.advanceMode || 'Cash',
        referenceNo: `Advance for Bill ${data.billNumber || ''}`,
        notes: `Immediate advance paid against inward bill #${data.billNumber || 'Challan'}`,
        createdAt: new Date().toISOString()
      };
      this.transactions.unshift(advPaymentTx);
    }

    this.save();
    return newTx;
  }

  addPayment(data) {
    const id = 'tx_pay_' + Date.now();
    const newTx = {
      id,
      dealerId: data.dealerId,
      type: 'PAYMENT',
      date: data.date || new Date().toISOString().split('T')[0],
      amount: Number(data.amount) || 0,
      paymentMode: data.paymentMode || 'UPI / GPay',
      referenceNo: (data.referenceNo || '').trim(),
      notes: (data.notes || '').trim(),
      createdAt: new Date().toISOString()
    };

    this.transactions.unshift(newTx);
    this.save();
    return newTx;
  }

  deleteTransaction(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.save();
  }

  // --- FINANCIAL CALCULATIONS & LEDGER METRICS ---
  getDealerFinancials(dealerId) {
    const dealer = this.getDealerById(dealerId);
    if (!dealer) return { totalBilled: 0, totalPaid: 0, balance: 0, openingBalance: 0 };

    const opening = Number(dealer.openingBalance) || 0;
    const txs = this.transactions.filter(t => t.dealerId === dealerId);

    let totalBilled = 0;
    let totalPaid = 0;
    let totalPairs = 0;
    let totalCartons = 0;

    txs.forEach(t => {
      if (t.type === 'BILL') {
        totalBilled += Number(t.amount) || 0;
        totalPairs += Number(t.totalPairs) || 0;
        totalCartons += Number(t.cartons) || 0;
      } else if (t.type === 'PAYMENT') {
        totalPaid += Number(t.amount) || 0;
      }
    });

    const netBalance = (opening + totalBilled) - totalPaid;

    return {
      openingBalance: opening,
      totalBilled,
      totalPaid,
      balance: netBalance,
      totalPairs,
      totalCartons,
      lastTxDate: txs.length > 0 ? txs[0].date : null
    };
  }

  getOverallKPIs() {
    let totalUdharPayable = 0;
    let totalPaidAllTime = 0;
    let totalStockBilled = 0;
    let totalCartons = 0;
    let totalPairs = 0;
    let dealersWithUdharCount = 0;

    // Calculate per dealer to correctly include opening balances
    this.dealers.forEach(dealer => {
      const fin = this.getDealerFinancials(dealer.id);
      if (fin.balance > 0) {
        totalUdharPayable += fin.balance;
        dealersWithUdharCount++;
      }
      totalPaidAllTime += fin.totalPaid;
      totalStockBilled += fin.totalBilled;
      totalCartons += fin.totalCartons;
      totalPairs += fin.totalPairs;
    });

    // Calculate Due This Week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = daysOfWeek[new Date().getDay()];
    
    let dueThisWeekTotal = 0;
    let dueDealersCount = 0;
    let dueTodayTotal = 0;
    let dueTodayDealers = [];

    this.dealers.forEach(dealer => {
      const fin = this.getDealerFinancials(dealer.id);
      if (fin.balance > 0) {
        dueThisWeekTotal += fin.balance;
        dueDealersCount++;
        if (dealer.settlementDay && dealer.settlementDay.toLowerCase() === currentDayName.toLowerCase()) {
          dueTodayTotal += fin.balance;
          dueTodayDealers.push({ dealer, balance: fin.balance });
        }
      }
    });

    return {
      totalUdharPayable,
      totalPaidAllTime,
      totalStockBilled,
      totalCartons,
      totalPairs,
      dealersWithUdharCount,
      dueThisWeekTotal,
      dueDealersCount,
      dueTodayTotal,
      dueTodayDealers,
      currentDayName
    };
  }

  // --- SETTINGS & BACKUP ---
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.save();
    return this.settings;
  }

  exportBackupJSON() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.settings,
      dealers: this.dealers,
      transactions: this.transactions
    }, null, 2);
  }

  importBackupJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.dealers || !parsed.transactions) {
        throw new Error('Invalid backup file format');
      }
      this.settings = parsed.settings || DEFAULT_SETTINGS;
      this.dealers = parsed.dealers;
      this.transactions = parsed.transactions;
      this.save();
      return true;
    } catch (e) {
      console.error('Import error:', e);
      throw e;
    }
  }

  resetToDefaultData() {
    this.settings = DEFAULT_SETTINGS;
    this.dealers = DEFAULT_DEALERS;
    this.transactions = DEFAULT_TRANSACTIONS;
    this.save();
  }

  clearAllData() {
    this.dealers = [];
    this.transactions = [];
    this.save();
  }
}

// Global instance
window.appStore = new Store();
