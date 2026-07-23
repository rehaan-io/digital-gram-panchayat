import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // Retry periodically until ready
    const interval = setInterval(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
        clearInterval(interval);
      }
    }, 150);
    // Timeout after 10 seconds to avoid infinite loop
    setTimeout(() => {
      clearInterval(interval);
    }, 10000);
  }
}
