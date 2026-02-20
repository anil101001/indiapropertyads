import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, MoreVertical, ChevronRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type DeviceType = 'ios' | 'android' | 'samsung' | 'desktop' | 'unknown';

function detectDevice(): DeviceType {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSamsung = /SamsungBrowser/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  if (isIOS) return 'ios';
  if (isSamsung) return 'samsung';
  if (isAndroid) return 'android';
  if (!/Mobi|Android/i.test(ua)) return 'desktop';
  return 'unknown';
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [device, setDevice] = useState<DeviceType>('unknown');

  useEffect(() => {
    // Check if already installed / in standalone mode
    if (isInStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    const detectedDevice = detectDevice();
    setDevice(detectedDevice);

    // Check if user dismissed the prompt recently (24h cooldown)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 24 * 60 * 60 * 1000) {
      return;
    }

    // For Android/Chrome/Edge — listen for native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const installedHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    // For iOS — no beforeinstallprompt event, show manual instructions after delay
    if (detectedDevice === 'ios') {
      setTimeout(() => setShowPrompt(true), 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // No native prompt — show manual instructions
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowInstructions(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  // Device-specific instructions
  const getInstructions = () => {
    switch (device) {
      case 'ios':
        return {
          title: 'Install on iPhone / iPad',
          steps: [
            { icon: <Share className="h-5 w-5 text-primary-600" />, text: 'Tap the Share button at the bottom of Safari' },
            { icon: <PlusSquare className="h-5 w-5 text-primary-600" />, text: 'Scroll down and tap "Add to Home Screen"' },
            { icon: <ChevronRight className="h-5 w-5 text-primary-600" />, text: 'Tap "Add" in the top right corner' },
          ],
          note: 'Must use Safari browser. Chrome/Firefox on iOS do not support PWA install.',
        };
      case 'samsung':
        return {
          title: 'Install on Samsung',
          steps: [
            { icon: <MoreVertical className="h-5 w-5 text-primary-600" />, text: 'Tap the menu icon (⋮) or the hamburger menu' },
            { icon: <PlusSquare className="h-5 w-5 text-primary-600" />, text: 'Tap "Add page to" or "Install app"' },
            { icon: <Smartphone className="h-5 w-5 text-primary-600" />, text: 'Select "Home screen" and tap "Add"' },
          ],
          note: 'Samsung Internet browser supports direct app install.',
        };
      case 'android':
        return {
          title: 'Install on Android',
          steps: [
            { icon: <MoreVertical className="h-5 w-5 text-primary-600" />, text: 'Tap the menu icon (⋮) in Chrome' },
            { icon: <Download className="h-5 w-5 text-primary-600" />, text: 'Tap "Install app" or "Add to Home screen"' },
            { icon: <ChevronRight className="h-5 w-5 text-primary-600" />, text: 'Tap "Install" to confirm' },
          ],
          note: 'Works best with Chrome or Edge browser.',
        };
      default:
        return {
          title: 'Install App',
          steps: [
            { icon: <MoreVertical className="h-5 w-5 text-primary-600" />, text: 'Open browser menu (⋮ or ⋯)' },
            { icon: <Download className="h-5 w-5 text-primary-600" />, text: 'Look for "Install app" or "Add to Home screen"' },
            { icon: <ChevronRight className="h-5 w-5 text-primary-600" />, text: 'Follow the prompts to install' },
          ],
          note: 'Use Chrome, Edge, or Safari for best experience.',
        };
    }
  };

  const instructions = getInstructions();

  // Show step-by-step instructions view
  if (showInstructions) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Smartphone className="h-5 w-5" />
              <span className="font-semibold text-sm">{instructions.title}</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Steps */}
          <div className="p-4 space-y-3">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-700">{index + 1}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {step.icon}
                  <span className="text-sm text-gray-700">{step.text}</span>
                </div>
              </div>
            ))}

            {/* Note */}
            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Tip:</strong> {instructions.note}
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full mt-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show initial install banner
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
              src="/pwa-192x192.png"
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
              {deferredPrompt ? 'Install' : 'How to Install'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
