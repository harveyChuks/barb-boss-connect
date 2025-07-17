#!/bin/bash

# Check if iOS platform has been added
if [ ! -d "ios" ]; then
  echo "iOS platform not found. Adding it now..."
  npx cap add ios
fi

# Build the web app
echo "Building web app..."
npm run build

# Sync to Capacitor
echo "Syncing with Capacitor..."
npx cap sync

# Open in Xcode
echo "Opening project in Xcode..."
npx cap open ios

echo "Project is now ready to be used in Xcode!"
echo "Remember to select your development team in Xcode's signing settings."