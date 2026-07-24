import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/RootNavigation';
import { AuthProvider } from './src/context/AuthContext';
import { SnackbarProvider } from './src/context/SnackbarContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

// Global API Request Interceptor for logging failures
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method || 'GET';
  const body = init?.body;

  // Log every request at runtime
  console.log(`[API REQUEST] 🟢 URL: ${url} | Method: ${method}`);

  try {
    const response = await originalFetch(input, init);
    if (!response.ok) {
      let responseText = '';
      try {
        responseText = await response.clone().text();
      } catch (e) {
        responseText = '[Failed to read response body]';
      }
      console.warn(`[API FAILURE]
🔴 Requested URL: ${url}
🔴 HTTP Method: ${method}
🔴 Request Body: ${body ? (typeof body === 'string' ? body : JSON.stringify(body)) : 'N/A'}
🔴 Status Code: ${response.status}
🔴 Error Message: HTTP error status ${response.status}
🔴 Backend Response: ${responseText}`);
    }
    return response;
  } catch (error: any) {
    console.warn(`[API FAILURE - NETWORK ERROR]
🔴 Requested URL: ${url}
🔴 HTTP Method: ${method}
🔴 Request Body: ${body ? (typeof body === 'string' ? body : JSON.stringify(body)) : 'N/A'}
🔴 Status Code: N/A (Network Failure)
🔴 Error Message: ${error.message || error}
🔴 Backend Response: N/A`);
    throw error;
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <SnackbarProvider>
            <NotificationProvider>
              <NavigationContainer ref={navigationRef}>
                <AppNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </NotificationProvider>
          </SnackbarProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
