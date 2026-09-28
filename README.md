# StepLedger 👟
### Footwear Dealer Udhar & Weekly Settlement Tracker (Progressive Web App)

A specialized Progressive Web App (PWA) crafted for footwear retailers, wholesalers, and shop owners who buy shoe stocks on credit (**Udhar**) and settle supplier payments weekly.

---

## 🌟 Key Features

1. **Footwear Dealer / Supplier Directory**:
   - Track suppliers across major wholesale mandis (Agra, Kanpur, Delhi, Mumbai, etc.).
   - Set each supplier's customary **Weekly Settlement Day** (e.g., Saturday, Monday, Wednesday).
   - Record opening balances brought forward from traditional bahi-khatas.
   - Quick 1-tap WhatsApp and phone contact integration.

2. **Stock Inward on Credit (Udhar Entry)**:
   - Bill / Challan number, date, and transport bilty details.
   - Footwear categorization: Sports Shoes & Sneakers, Casual Loafers, Formal Leather Shoes, PU Chappals & Slippers, School Shoes, Sandals, Kids Shoes, Safety Shoes.
   - Automated Carton (Peti) and Pairs calculator (`Cartons × Pairs/Carton = Total Pairs`, `Rate × Pairs = Bill Total`).
   - Handles immediate advance payments at delivery with remaining amount automatically added to Udhar.

3. **Weekly Payment Settlement Planner**:
   - Visual day-wise schedule (Monday through Sunday) organizing your weekly supplier payouts.
   - Shows the exact cash / UPI balance required for each day.
   - Prominently alerts you about dues scheduled for **TODAY**.

4. **1-Tap Payment Recording & Quick Presets**:
   - Live preview of remaining outstanding balance when selecting a dealer.
   - Quick preset buttons: **Clear Full Balance**, **Pay 50%**, **₹10,000**, **₹25,000**, **₹50,000**.
   - Supports UPI (GPay, PhonePe, Paytm), Cash, Cheque, and Bank Transfer (NEFT/RTGS).
   - Generates pre-formatted **WhatsApp Khata Statements** to send directly to dealers upon payment.

5. **Detailed Khata Statement (Passbook / Ledger)**:
   - Chronological ledger with **Running Balance** calculation.
   - Separate Debit (Udhar) and Credit (Jama/Paid) columns.
   - Printable formal invoice/statement format (`@media print` optimized).

6. **100% Offline-Ready Progressive Web App (PWA)**:
   - Built with Service Worker (`sw.js`) and Web App Manifest (`manifest.webmanifest`).
   - Works seamlessly inside wholesale mandis, basements, or transport godowns with zero internet connection.
   - Installable on Android, iOS (Add to Home Screen), Windows, and Mac.
   - Persistent LocalStorage + JSON Export / Import backup system.

---

## 🚀 How to Run Locally

Since this PWA is built with standard Vanilla HTML5, modern CSS3, and ES6+ JavaScript, no build step or node_modules are required:

```bash
# Start local Python HTTP server
python3 -m http.server 8080

# Open in your browser
http://localhost:8080
```

---

## 📱 How to Install the PWA on Your Phone

1. **Android (Chrome / Brave / Edge)**:
   - Open `http://<your-ip>:8080` in Chrome.
   - Tap the **📲 Install App** button in the header or tap browser menu (⋮) -> **Install App** / **Add to Home screen**.
   - An app icon will appear on your phone's home screen and open in full-screen standalone mode.

2. **iPhone / iPad (Safari)**:
   - Open in Safari.
   - Tap the **Share** button (box with upward arrow).
   - Scroll down and tap **Add to Home Screen**.

---

## 🛡️ Data Privacy & Safety

- All records remain strictly on your local device.
- Use **Shop Settings & Backup -> Download Complete Khata Backup (.json)** at the end of every week to save your records to Google Drive, WhatsApp, or pen drive.

project structure
/home/ali/SIH solution/
├── index.html              # Main PWA application shell & interactive modals
├── manifest.webmanifest    # Web App Manifest for PWA installation
├── sw.js                   # Service Worker for 100% offline caching
├── css/
│   └── style.css           # Modern executive dark theme, glassmorphism & responsive grid
├── js/
│   ├── store.js            # State management, data persistence, and financial math
│   ├── ui.js               # Dynamic UI rendering, khata ledger, and alerts
│   ├── pwa.js              # PWA lifecycle, install prompt & online/offline monitor
│   └── app.js              # App controller, form submissions & calculations
├── icons/                  # PWA app icons (SVG, 96px, 192px, 512px)
└── README.md               # User guide & operational documentation
