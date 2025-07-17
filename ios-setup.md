# iOS Setup Guide for BizFlow

## Prerequisites
- Xcode 14 or higher
- macOS 11 or higher
- iOS 14+ device (for physical testing)
- Apple Developer account (for deployment)

## Setup Steps

1. **Ensure Capacitor is installed**
   The project already has these dependencies:
   - @capacitor/core
   - @capacitor/ios
   - @capacitor/android
   - @capacitor/cli

2. **Configure for Supabase**
   - The app is configured to use Supabase for backend functionality
   - Authentication, database, and storage all work with native apps
   - Deep links will need to be configured for authentication flows

3. **First-time iOS setup**
   ```sh
   # Add iOS platform if not already added
   npx cap add ios
   
   # Build the web app
   npm run build
   
   # Sync to Capacitor
   npx cap sync
   
   # Open in Xcode
   npx cap open ios
   ```

4. **In Xcode:**
   - Set your Bundle Identifier (matches the appId in capacitor.config.ts)
   - Select your Team for signing
   - Configure capabilities as needed (Push Notifications, etc.)
   - Check Info.plist for proper configuration

5. **After code changes:**
   ```sh
   npm run build
   npx cap sync
   ```

6. **Testing offline capabilities**
   - Put your device in airplane mode to test offline features
   - The app should continue to function with local data
   - When back online, data should sync with Supabase

7. **Troubleshooting**
   - Check Xcode logs for native issues
   - Use browser dev tools when running in development
   - Ensure capacitor.config.ts has proper configuration