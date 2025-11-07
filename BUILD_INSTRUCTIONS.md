# Development Build Instructions for Mapbox

## Why a Development Build is Required

`@rnmapbox/maps` requires native code that is **not available in Expo Go**. You must create a custom development build that includes the Mapbox native modules.

## Quick Start: Create Development Build

### Step 1: Install Dependencies (Already Done ✅)
- `expo-dev-client` - Already installed
- `@rnmapbox/maps` - Already installed

### Step 2: Build Development Client

**Option A: Cloud Build (Recommended - Easiest)**
```bash
# Build for Android (takes ~15-20 minutes)
eas build --profile development --platform android

# Wait for build to complete, then:
# 1. Download the .apk from the EAS dashboard
# 2. Install it on your Android device
# 3. Run: npx expo start --dev-client
# 4. Scan QR code with the development build app (not Expo Go)
```

**Option B: Local Build (Faster Iteration)**
```bash
# Generate native projects
npx expo prebuild

# Build and run on connected Android device
npx expo run:android

# For subsequent runs:
npx expo start --dev-client
```

### Step 3: Start Development Server

After installing the development build:
```bash
npx expo start --dev-client
```

**Important:** Use `--dev-client` flag, NOT regular `expo start`

### Step 4: Connect to Your Build

1. Open the **development build app** on your device (NOT Expo Go)
2. Scan the QR code from the terminal
3. Your app will load with Mapbox native modules included

## Key Differences from Expo Go

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Native Modules | Limited (only Expo's) | All (including Mapbox) |
| Build Time | None (instant) | 15-20 min (first time) |
| Updates | Instant | Instant (hot reload works) |
| Custom Native Code | ❌ No | ✅ Yes |

## Troubleshooting

**Error: "native code not available"**
- Make sure you're using the development build app, not Expo Go
- Verify `expo-dev-client` is installed: `npx expo install expo-dev-client`
- Rebuild if you added new native dependencies

**Build fails with Mapbox token error**
- Set EAS secret: `eas env:create --scope project --name MAPBOX_PUBLIC_ACCESS_TOKEN`
- Or ensure token is in `.env` file for local builds

**App won't connect to dev server**
- Use `--dev-client` flag: `npx expo start --dev-client`
- Make sure device and computer are on same network
- Check firewall settings

## Next Steps

1. ✅ Code is ready (Mapbox migration complete)
2. ⏳ Create development build (cloud or local)
3. ⏳ Install build on device
4. ⏳ Test Mapbox functionality
5. ✅ Deploy to production when ready

