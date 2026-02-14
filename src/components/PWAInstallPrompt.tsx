import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed the prompt recently (24h cooldown)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay so it doesn't appear immediately on load
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Smartphone className="h-5 w-5" />
            <span className="font-semibold text-sm">Install App</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <img
              src="/pwa-192x192.svg"
              alt="India Property Ads"
              className="w-12 h-12 rounded-xl flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">India Property Ads</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Install our app for faster access, offline browsing, and push notifications.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Not Now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
