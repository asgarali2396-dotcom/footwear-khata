/**
 * StepLedger - PWA Lifecycle & Installation Handler
 * Full Mobile Support for Android Chrome, iOS Safari, and Desktop
 */

let deferredInstallPrompt = null;

const PWA = {
  isInstalled: false,
  isIOS: false,
  isAndroid: false,

  init() {
    this.detectDeviceAndMode();
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkMonitor();
    this.handleUrlActions();
    this.checkHttpsContext();
  },

  detectDeviceAndMode() {
    const ua = navigator.userAgent || '';
    this.isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    this.isAndroid = /Android/.test(ua);
    this.isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      localStorage.getItem('pwa-installed') === 'true';

    // Add standalone class to body for custom app-like mobile styling
    if (this.isInstalled) {
      document.body.classList.add('is-standalone');
    }
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
            
            // Check for updates
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New version available, reload to update');
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration error:', err);
          });
      });
    }
  },

  setupInstallPrompt() {
    const installBanner = document.getElementById('pwa-install-banner');
    const headerInstallBtn = document.getElementById('btn-header-install');
    const installBtn = document.getElementById('btn-pwa-install');

    // If already installed in standalone mode, hide install prompts
    if (this.isInstalled) {
      if (installBanner) installBanner.classList.add('hidden');
      if (headerInstallBtn) headerInstallBtn.classList.add('hidden');
      return;
    }

    // Android / Chrome: Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      console.log('[PWA] beforeinstallprompt event captured');

      if (installBanner) installBanner.classList.remove('hidden');
      if (headerInstallBtn) headerInstallBtn.classList.remove('hidden');
    });

    // On iOS Safari, beforeinstallprompt never fires, so proactively make install accessible
    if (this.isIOS && !this.isInstalled) {
      if (installBanner) installBanner.classList.remove('hidden');
      if (headerInstallBtn) headerInstallBtn.classList.remove('hidden');
    }

    // Always make header install button visible on mobile if not installed yet
    if (!this.isInstalled && (this.isAndroid || this.isIOS)) {
      if (headerInstallBtn) headerInstallBtn.classList.remove('hidden');
    }

    const handleInstallClick = async () => {
      // 1. If native deferred prompt is available (Android / Chromium)
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log('[PWA] User response to install:', outcome);
        if (outcome === 'accepted') {
          localStorage.setItem('pwa-installed', 'true');
          if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast('StepLedger App installed! 🎉', 'success');
          }
          if (installBanner) installBanner.classList.add('hidden');
          if (headerInstallBtn) headerInstallBtn.classList.add('hidden');
        }
        deferredInstallPrompt = null;
        return;
      }

      // 2. If deferred prompt is not available, show the interactive Install Guide Modal
      this.showInstallGuideModal();
    };

    if (installBtn) installBtn.addEventListener('click', handleInstallClick);
    if (headerInstallBtn) headerInstallBtn.addEventListener('click', handleInstallClick);

    // App installed event listener
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App successfully installed');
      this.isInstalled = true;
      localStorage.setItem('pwa-installed', 'true');
      if (installBanner) installBanner.classList.add('hidden');
      if (headerInstallBtn) headerInstallBtn.classList.add('hidden');
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('StepLedger added to your Home Screen! 📲', 'success');
      }
    });
  },

  showInstallGuideModal() {
    let guideModal = document.getElementById('modal-install-guide');
    if (!guideModal) {
      this.createInstallGuideModal();
      guideModal = document.getElementById('modal-install-guide');
    }
    if (guideModal) {
      guideModal.classList.add('open');
    }
  },

  createInstallGuideModal() {
    const isIOS = this.isIOS;
    const isAndroid = this.isAndroid;
    const isInsecure = !window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';

    const div = document.createElement('div');
    div.id = 'modal-install-guide';
    div.className = 'modal-overlay';
    div.innerHTML = `
      <div class="modal-card modal-card-sm install-guide-card">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="brand-logo-wrap" style="width: 36px; height: 36px;">
              <svg width="24" height="24" viewBox="0 0 512 512" fill="none">
                <path d="M 90 320 C 130 320 180 325 240 325 C 310 325 360 315 390 310 C 405 308 418 318 418 332 C 418 348 402 360 382 360 C 310 360 210 362 105 360 C 85 360 70 345 70 328 Z" fill="#10b981" />
                <path d="M 95 315 C 95 315 110 240 160 220 C 200 205 230 230 265 190 C 285 168 315 180 340 215 C 365 250 380 280 395 305 L 95 315 Z" fill="#6366f1" stroke="#818cf8" stroke-width="8" />
                <circle cx="380" cy="150" r="60" fill="#f59e0b" />
                <text x="380" y="172" font-family="sans-serif" font-size="68" font-weight="900" fill="#ffffff" text-anchor="middle">₹</text>
              </svg>
            </div>
            <div>
              <h3 style="font-size: 1.1rem; margin: 0;">Install StepLedger App</h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Offline Khata on your Home Screen</p>
            </div>
          </div>
          <button class="modal-close" type="button" onclick="document.getElementById('modal-install-guide').classList.remove('open')">&times;</button>
        </div>
        <div class="modal-body" style="padding: 18px 20px;">
          ${isInsecure ? `
            <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 10px; padding: 12px; margin-bottom: 16px; font-size: 0.85rem; line-height: 1.4;">
              <strong style="color: var(--amber);">⚠️ Browser Security Requirement:</strong><br>
              Phone browsers (Chrome/Safari) require <strong>HTTPS</strong> to download apps to home screen. If testing on a phone over local Wi-Fi, host on HTTPS (e.g. GitHub Pages, Vercel) or use an ngrok/Cloudflare HTTPS tunnel.
            </div>
          ` : ''}

          ${isIOS ? `
            <div class="install-steps-list">
              <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--text-main);">Apple iPhone / iPad (Safari):</h4>
              <div class="install-step-item">
                <span class="step-num">1</span>
                <div>Tap the <strong>Share</strong> button <span style="display:inline-block; font-size: 1.1rem;">⎋</span> at the bottom of Safari.</div>
              </div>
              <div class="install-step-item">
                <span class="step-num">2</span>
                <div>Scroll down and select <strong style="color: var(--primary);">"Add to Home Screen" ➕</strong>.</div>
              </div>
              <div class="install-step-item">
                <span class="step-num">3</span>
                <div>Tap <strong>Add</strong> in the top right corner. The app icon will appear on your phone screen!</div>
              </div>
            </div>
          ` : `
            <div class="install-steps-list">
              <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--text-main);">Android (Chrome / Samsung / Edge):</h4>
              <div class="install-step-item">
                <span class="step-num">1</span>
                <div>Tap the <strong>three dots menu (⋮)</strong> at the top right of Chrome.</div>
              </div>
              <div class="install-step-item">
                <span class="step-num">2</span>
                <div>Tap <strong style="color: var(--primary);">"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
              </div>
              <div class="install-step-item">
                <span class="step-num">3</span>
                <div>Tap <strong>Install</strong>. StepLedger will download and appear in your apps drawer like an APK!</div>
              </div>
            </div>
          `}

          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
            <span>⚡ 100% Offline Capable</span>
            <span>🔒 Data Saved Locally</span>
          </div>
        </div>
        <div class="modal-footer" style="padding: 12px 20px;">
          <button type="button" class="btn btn-primary" style="width: 100%;" onclick="document.getElementById('modal-install-guide').classList.remove('open')">Got It</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    div.addEventListener('click', (e) => {
      if (e.target === div) div.classList.remove('open');
    });
  },

  checkHttpsContext() {
    if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      console.warn('[PWA] Warning: Application running in an insecure context (HTTP). Service worker and install prompts require HTTPS on mobile devices.');
    }
  },

  setupNetworkMonitor() {
    const badge = document.getElementById('network-status-badge');
    if (!badge) return;

    const updateStatus = () => {
      if (navigator.onLine) {
        badge.innerHTML = '<span class="status-dot online"></span> <span>Online</span>';
        badge.title = 'Online & Synchronized';
      } else {
        badge.innerHTML = '<span class="status-dot offline"></span> <span>Offline (Saved)</span>';
        badge.title = 'Working Offline - All entries saved locally';
      }
    };

    window.addEventListener('online', () => {
      updateStatus();
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('Back online! All transactions synced.', 'success');
      }
    });

    window.addEventListener('offline', () => {
      updateStatus();
      if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('You are offline. Full Khata works offline seamlessly.', 'info');
      }
    });

    updateStatus();
  },

  handleUrlActions() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const tab = params.get('tab');

    if (tab && typeof UI !== 'undefined' && UI.switchTab) {
      setTimeout(() => UI.switchTab(tab), 100);
    }
    if (action === 'new_bill' && typeof UI !== 'undefined' && UI.openBillModal) {
      setTimeout(() => UI.openBillModal(), 200);
    } else if (action === 'record_payment' && typeof UI !== 'undefined' && UI.openPaymentModal) {
      setTimeout(() => UI.openPaymentModal(), 200);
    }
  }
};

window.PWA = PWA;
