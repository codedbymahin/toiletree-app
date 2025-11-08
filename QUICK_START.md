# 🚀 Quick Start: Fix EAS Build for Mapbox

## The Problem
EAS builds were failing with `401 Unauthorized` because:
- `@rnmapbox/maps` plugin expects `MAPBOX_DOWNLOADS_TOKEN` (with 'S' - plural)
- You were using `MAPBOX_DOWNLOAD_TOKEN` (singular)

## The Solution (3 Steps)

### Step 1: Set EAS Secret with PLURAL Name ⚠️ CRITICAL

```bash
# Delete old secret if it exists
eas secret:delete --name MAPBOX_DOWNLOAD_TOKEN --force

# Create new secret with PLURAL name (this is what @rnmapbox/maps checks first)
eas secret:create --name MAPBOX_DOWNLOADS_TOKEN --value sk.your_token_here --type secret
```

**IMPORTANT**: The secret name MUST be `MAPBOX_DOWNLOADS_TOKEN` (with 'S')!

### Step 2: Verify Your Token

Your Mapbox token must:
- Start with `sk.` (secret token, not `pk.` public token)
- Have `DOWNLOADS:READ` permission
- Be active and not expired

### Step 3: Build

```bash
eas build --profile production --platform android
```

That's it! 🎉

## What Changed

1. **Plugin Updated**: Now supports all variable name formats (`MAPBOX_DOWNLOADS_TOKEN`, `MAPBOX_DOWNLOAD_TOKEN`, `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`)
2. **Token Injection**: Token is set in `gradle.properties` with all three variable names
3. **Repository Cleanup**: All conflicting Mapbox repository blocks are removed
4. **Authentication**: Single, properly authenticated repository is added

## If It Still Fails

1. Verify secret exists: `eas secret:list`
2. Check token permissions in Mapbox account
3. Check build logs for specific error messages
4. See `EAS_BUILD_SOLUTION.md` for detailed troubleshooting

## Files Modified

- `plugins/with-mapbox-gradle.js` - Completely rewritten
- `app.config.js` - Updated to support both variable names
- `eas.json` - Added Gradle command configuration
- `android/build.gradle` - Removed hardcoded tokens
- `android/gradle.properties` - Removed hardcoded token

The plugin will automatically fix the Gradle configuration during EAS prebuild.

