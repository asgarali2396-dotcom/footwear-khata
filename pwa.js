/**
 * StepLedger - PWA Lifecycle & Installation Handler
 */

let deferredInstallPrompt = null;

const PWA = {
  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkMonitor();
    this.handleUrlActions();
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered successfully scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }
  },

  setupInstallPrompt() {
    const installBanner = document.getElementById('pwa-install-banner');
    const installBtn = document.getElementById('btn-pwa-install');
    const headerInstallBtn = document.getElementById('btn-header-install');

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      deferredInstallPrompt = e;

      // Show user-friendly install prompt
      if (installBanner) installBanner.classList.remove('hidden');
      if (headerInstallBtn) headerInstallBtn.classList.remove('hidden');
    });

    const triggerInstall = async () => {
      if (!deferredInstallPrompt) {
        UI.showToast('To install, open browser menu and select "Install App" or "Add to Home Screen".', 'info');
        return;
      }
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        UI.showToast('StepLedger App installed successfully! 🎉');
      }
      deferredInstallPrompt = null;
      if (installBanner) installBanner.classList.add('hidden');
      if (headerInstallBtn) headerInstallBtn.classList.add('hidden');
    };

    if (installBtn) installBtn.addEventListener('click', triggerInstall);
    if (headerInstallBtn) headerInstallBtn.addEventListener('click', triggerInstall);

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] Application was installed');
      if (installBanner) installBanner.classList.add('hidden');
      if (headerInstallBtn) headerInstallBtn.classList.add('hidden');
    });
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
      UI.showToast('Back online! All transactions synced.', 'success');
    });

    window.addEventListener('offline', () => {
      updateStatus();
      UI.showToast('You are currently offline. Full Khata works offline seamlessly.', 'info');
    });

    updateStatus();
  },

  handleUrlActions() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const tab = params.get('tab');

    if (tab) {
      setTimeout(() => UI.switchTab(tab), 100);
    }
    if (action === 'new_bill') {
      setTimeout(() => UI.openBillModal(), 200);
    } else if (action === 'record_payment') {
      setTimeout(() => UI.openPaymentModal(), 200);
    }
  }
};

window.PWA = PWA;
