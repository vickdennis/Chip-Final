import { useState, useEffect } from 'react';

// Type definitions for the Network Information API
type EffectiveConnectionType = '2g' | '3g' | '4g' | 'slow-2g';

interface NetworkInformation extends EventTarget {
  readonly effectiveType: EffectiveConnectionType;
  readonly saveData: boolean;
  onchange: EventListener | null;
}

declare global {
  interface Navigator {
    readonly connection?: NetworkInformation;
    readonly mozConnection?: NetworkInformation;
    readonly webkitConnection?: NetworkInformation;
  }
}

export function useNetworkStatus() {
  const [isLiteMode, setIsLiteMode] = useState<boolean>(false);

  useEffect(() => {
    // Safely access the connection object with vendor prefixes for broader support
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
      // Fallback for unsupported browsers (like Safari/iOS)
      // Default to rendering the heavy experience to prevent breaking the app
      setIsLiteMode(false);
      return;
    }

    const checkConnection = () => {
      const isSlow = ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
      const isSaveData = connection.saveData === true;
      setIsLiteMode(isSlow || isSaveData);
    };

    // Initial check
    checkConnection();

    // Listen for real-time network changes (e.g., user moves from Wi-Fi to cellular)
    connection.addEventListener('change', checkConnection);

    return () => {
      connection.removeEventListener('change', checkConnection);
    };
  }, []);

  return { isLiteMode };
}
