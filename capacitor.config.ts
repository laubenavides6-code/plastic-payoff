import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1099b9a78ec742a1b56711154e5aae82',
  appName: 'plastic-payoff',
  webDir: 'dist',
  server: {
    // For development: uncomment to enable hot-reload from Lovable preview
    // url: 'https://1099b9a7-8ec7-42a1-b567-11154e5aae82.lovableproject.com?forceHideBadge=true',
    // cleartext: true,
    
    // For production: comment the above and use the built files
    androidScheme: 'https',
  },
  plugins: {
    Camera: {
      // Request camera permission on first use
      presentationStyle: 'fullScreen',
    },
  },
  android: {
    // Allow loading local files
    allowMixedContent: true,
    // Handle back button navigation
    backgroundColor: '#ffffff',
  },
};

export default config;
