# Troubleshooting EAS Build 401 Unauthorized Error

## Current Status
The build is failing with `401 Unauthorized` when trying to download Mapbox dependencies. This means the Mapbox repository is being accessed, but authentication is failing.

## What the Plugin Does Now

The updated plugin now:
1. **Hardcodes the token** directly in `build.gradle` if available (most reliable method)
2. **Checks environment variables** during the build phase
3. **Adds debug logging** to help diagnose issues
4. **Falls back** to reading from gradle.properties or environment variables

## Step 1: Verify EAS Secret is Set

```bash
# List all secrets
eas secret:list

# Verify the secret name is exactly "MAPBOX_DOWNLOADS_TOKEN" (with S - plural)
# If it's named differently, delete and recreate it
```

## Step 2: Check Secret Name

**CRITICAL**: The secret MUST be named `MAPBOX_DOWNLOADS_TOKEN` (with an 'S' - plural).

If you have it named `MAPBOX_DOWNLOAD_TOKEN` (singular), delete it and recreate:

```bash
# Delete old secret (if exists)
eas secret:delete --name MAPBOX_DOWNLOAD_TOKEN --force

# Create new secret with PLURAL name
eas secret:create --name MAPBOX_DOWNLOADS_TOKEN --value sk.your_token_here --type secret
```

## Step 3: Verify Token Value

Make sure your token:
- Starts with `sk.` (secret token, not `pk.` public token)
- Has `DOWNLOADS:READ` permission in your Mapbox account
- Is active and not expired
- Has not been rotated recently

## Step 4: Check Build Logs

After running a build, check the logs for:

1. **Plugin execution logs**:
   Look for lines starting with `[withMapboxGradle]`:
   - `[withMapboxGradle] Build context detected`
   - `[withMapboxGradle] Token available: true/false`
   - `[withMapboxGradle] Token length: X`

2. **Environment variable status**:
   - `MAPBOX_DOWNLOADS_TOKEN: true/false`
   - `MAPBOX_DOWNLOAD_TOKEN: true/false`
   - `RNMAPBOX_MAPS_DOWNLOAD_TOKEN: true/false`

3. **Gradle properties**:
   - `[withMapboxGradle] Successfully wrote Mapbox token to gradle.properties`

## Step 5: Manual Verification

If the build still fails, you can verify the secret is being exposed:

1. Check the build logs for the `[withMapboxGradle]` debug output
2. If "Token available: false", the secret is not being exposed
3. If "Token available: true" but build still fails, there might be an escaping issue

## Common Issues

### Issue 1: Secret Not Found
**Symptoms**: `[withMapboxGradle] Token available: false`

**Solution**:
1. Verify secret exists: `eas secret:list`
2. Check secret name is exactly `MAPBOX_DOWNLOADS_TOKEN` (plural)
3. Try deleting and recreating the secret

### Issue 2: Wrong Token Type
**Symptoms**: Token exists but authentication fails

**Solution**:
1. Verify token starts with `sk.` (not `pk.`)
2. Check token has `DOWNLOADS:READ` permission
3. Generate a new token in Mapbox account

### Issue 3: Token Not Escaped Properly
**Symptoms**: Token is found but Gradle fails to parse it

**Solution**: The plugin now properly escapes the token. If this still happens, check the build logs for parsing errors.

## Next Steps

1. **Verify secret is set correctly** with `eas secret:list`
2. **Run a new build** and check the logs for `[withMapboxGradle]` messages
3. **Share the debug output** if the issue persists

The plugin will now:
- Hardcode the token in build.gradle if available (bypassing gradle.properties)
- Log detailed information about token availability
- Provide clear error messages if the token is missing

## Expected Behavior

When the secret is set correctly, you should see in the build logs:
```
[withMapboxGradle] Build context detected
[withMapboxGradle] Token available: true
[withMapboxGradle] Token length: 150 (or similar)
[withMapboxGradle] Environment variables checked:
  - MAPBOX_DOWNLOADS_TOKEN: true
  - MAPBOX_DOWNLOAD_TOKEN: false
  - RNMAPBOX_MAPS_DOWNLOAD_TOKEN: false
[withMapboxGradle] Successfully wrote Mapbox token to gradle.properties
```

If you see `Token available: false`, the secret is not being exposed by EAS.

