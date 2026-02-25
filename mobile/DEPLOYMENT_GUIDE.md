# PantryPilot Mobile - Deployment Guide

## Pre-Deployment Verification

### Code Quality Check
```bash
npm run lint    # Should show 0 errors
npm test        # Should show 21+ passing tests
```

### Build Prerequisites
- Node.js 16+ installed
- EAS CLI installed: `npm install -g eas-cli`
- Expo account created and logged in: `eas login`
- Android/iOS signing certificates configured (see below)

## Deployment Steps

### 1. Prepare for Release

```bash
# Update version in app.json if needed
# Example: "version": "1.0.1"

# Run final tests
npm test

# Run linter
npm run lint
```

### 2. Android Deployment

#### Option A: Google Play Store (Recommended)

```bash
# Build for production
eas build --platform android --profile production

# This creates a signed AAB (Android App Bundle)
# Download the AAB file from EAS dashboard
# Upload to Google Play Console:
# 1. Go to Google Play Console
# 2. Select PantryPilot app
# 3. Create new release
# 4. Upload AAB file
# 5. Fill in release notes
# 6. Review and publish
```

#### Option B: Direct APK Distribution

```bash
# Build APK instead of AAB
# Modify eas.json to build APK
# Then distribute directly
```

### 3. iOS Deployment

```bash
# Build for production
eas build --platform ios --profile production

# This creates an IPA file
# Can be distributed via TestFlight or App Store:

# For TestFlight (easiest):
eas submit --platform ios
# Automatically submits to TestFlight

# For App Store:
eas submit --platform ios --profile production
# Requires App Store Connect configuration
```

### 4. Configure Signing Certificates

#### First Time Setup:
```bash
eas credentials
# Follow prompts to generate signing certificates
# EAS handles automatic key management
```

## Configuration for Production

### API Endpoint
- Current: `https://pantrypilot-api.onrender.com/api`
- Verify backend is running and accessible
- Check API health endpoint: `/health`

### App Configuration (app.json)

Key settings for production:
```json
{
  "version": "1.0.0",           // Update for each release
  "orientation": "portrait",      // Locked to portrait
  "userInterfaceStyle": "dark",   // OLED-optimized dark theme
  "android": {
    "package": "com.dylanmarriner.pantrypilot"
  }
}
```

## Testing Before Release

### Manual Testing Checklist
- [ ] Login/signup flow works
- [ ] Inventory logging works offline
- [ ] Sync works when online
- [ ] Camera permissions work
- [ ] Microphone/voice input works
- [ ] Household management works
- [ ] All screens load without errors
- [ ] Settings persist after restart

### Device Testing
- [ ] Test on Android 8.0+ (minimum API 28)
- [ ] Test on iOS 13.4+ (minimum)
- [ ] Test on physical device (not just emulator)
- [ ] Test offline → online transitions
- [ ] Test with slow network (3G simulation)

## Monitoring Post-Deployment

### Essential Monitoring
1. **Error Tracking**: Set up Sentry or similar
   - Install: `npm install @sentry/react-native`
   - Configure in app startup

2. **Analytics**: Track user engagement
   - Recommended: Amplitude or Mixpanel

3. **Crash Reports**: Monitor app stability
   - Check Google Play/App Store crash metrics

### Key Metrics to Monitor
- Crash rate (target: < 0.1%)
- Session length
- Feature usage (inventory logging, sync)
- API response times
- Offline sync success rate

## Rollback Procedure

If critical issues found post-release:

1. **Immediately**:
   - Disable app in store (if critical)
   - Post-game broadcast to users via email/in-app

2. **Rollback**:
   - Revert to previous version tag in git
   - Build and deploy previous version
   - Update store listings

3. **Fix & Retest**:
   - Fix the issue
   - Complete full test suite
   - Re-deploy as patch version (e.g., 1.0.1)

## Version Numbering

Follow Semantic Versioning (semver):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (1.1.0): New features
- **PATCH** (1.0.1): Bug fixes

Examples:
- 1.0.0 → Initial release
- 1.1.0 → Add barcode scanning
- 1.0.1 → Fix offline sync bug

## Release Notes Template

```
🎉 PantryPilot v1.0.0

New Features
- Inventory logging with voice input
- Offline-first local sync
- Household management
- Smart lunch planning

Bug Fixes
- Fixed household invite flow
- Improved sync reliability

Performance
- Optimized list rendering
- Reduced app startup time

Known Issues
- None

System Requirements
- Android 8.0+ / iOS 13.4+
- 50MB free storage
- Requires internet for sync
```

## Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules
npm install
npm start -- --clear
```

### Signing Issues
```bash
# Reset credentials
eas credentials --clear
eas credentials
```

### EAS Build Timeout
- Check network connection
- Retry build
- Check EAS service status

## Emergency Contacts

- EAS Support: support@expo.io
- Google Play Support: https://support.google.com/googleplay
- Apple App Store Support: https://developer.apple.com/support

## Final Checklist Before Publishing

- [ ] Version updated in app.json
- [ ] All tests passing (21+/23)
- [ ] Lint check passes (0 errors)
- [ ] Manual testing complete
- [ ] Privacy policy updated (if needed)
- [ ] Terms of service updated (if needed)
- [ ] Release notes written
- [ ] Screenshots and preview images updated
- [ ] Description updated in stores
- [ ] Support email configured
- [ ] Backend verified to be running

---

**Good luck! 🚀**

For issues or questions:
- Check PRODUCTION_CHECKLIST.md
- Review app.json configuration
- Verify backend API is accessible
