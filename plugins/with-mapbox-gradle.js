const { withGradleProperties } = require('@expo/config-plugins');
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to:
 * 1. Inject Mapbox download token into gradle.properties with MULTIPLE variable names for compatibility
 * 2. Ensure Mapbox Maven repository is in build.gradle with proper authentication
 * 3. Remove ALL conflicting repository entries (including @rnmapbox/maps generated ones)
 * 
 * CRITICAL: @rnmapbox/maps plugin expects MAPBOX_DOWNLOADS_TOKEN (plural) or RNMAPBOX_MAPS_DOWNLOAD_TOKEN
 * This plugin supports BOTH naming conventions to ensure compatibility.
 * 
 * This plugin uses withDangerousMod to run LAST, ensuring it overrides any
 * configuration added by @rnmapbox/maps or other plugins.
 */
const withMapboxGradle = (config) => {
  // Get token - check multiple possible environment variable names for maximum compatibility
  // Priority: MAPBOX_DOWNLOADS_TOKEN (what @rnmapbox/maps expects) > MAPBOX_DOWNLOAD_TOKEN > config.extra
  // NOTE: During local config reading, EAS secrets are not available, so token may be undefined.
  // This is OK - the token will be available during EAS builds. We only validate during build phase.
  const mapboxToken =
    process.env.MAPBOX_DOWNLOADS_TOKEN ||
    process.env.MAPBOX_DOWNLOAD_TOKEN ||
    process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN ||
    config.extra?.MAPBOX_DOWNLOADS_TOKEN ||
    config.extra?.MAPBOX_DOWNLOAD_TOKEN;
  
  // Don't throw error here - token may not be available during local config reading
  // We'll validate during the build phase (in withDangerousMod) where EAS secrets are available

  // Step 1: Add token to gradle.properties with MULTIPLE variable names for compatibility
  // If token is not available, we'll still set up the properties (they'll be empty)
  // EAS will inject the actual token during build
  config = withGradleProperties(config, (config) => {
    // Remove any existing Mapbox token entries first
    const keysToRemove = [
      'MAPBOX_DOWNLOAD_TOKEN',
      'MAPBOX_DOWNLOADS_TOKEN',
      'RNMAPBOX_MAPS_DOWNLOAD_TOKEN'
    ];
    
    keysToRemove.forEach(key => {
      config.modResults = config.modResults.filter(
        (item) => item.key !== key
      );
    });

    // Add token with ALL possible variable names to ensure compatibility
    // @rnmapbox/maps checks for MAPBOX_DOWNLOADS_TOKEN (plural) first
    // If token is not available, use empty string - EAS will inject it during build
    const tokenValue = mapboxToken || '';
    
    config.modResults.push({
      type: 'property',
      key: 'MAPBOX_DOWNLOADS_TOKEN',
      value: tokenValue,
    });
    
    // Also add singular form for backward compatibility
    config.modResults.push({
      type: 'property',
      key: 'MAPBOX_DOWNLOAD_TOKEN',
      value: tokenValue,
    });
    
    // And the RNMAPBOX-specific name
    config.modResults.push({
      type: 'property',
      key: 'RNMAPBOX_MAPS_DOWNLOAD_TOKEN',
      value: tokenValue,
    });

    return config;
  });

  // Step 2: Use withDangerousMod to run LAST and directly modify Gradle files
  // This ensures our changes override any configuration from @rnmapbox/maps plugin
  // We capture mapboxToken in the closure to use it in the callback
  const tokenForDangerousMod = mapboxToken;
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      // CRITICAL: EAS secrets are available as environment variables during the Gradle build phase,
      // but may NOT be available during the prebuild phase when withDangerousMod runs.
      // Therefore, we should ALWAYS configure the repository to read from environment variables
      // or gradle.properties, rather than hardcoding the token.
      // 
      // Strategy: Always use the fallback chain in the repository configuration.
      // The token will be available as an environment variable during Gradle execution.
      let mapboxToken = 
        process.env.MAPBOX_DOWNLOADS_TOKEN ||
        process.env.MAPBOX_DOWNLOAD_TOKEN ||
        process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN ||
        tokenForDangerousMod;
      
      // Check if we're in a build context
      const isBuildContext = process.env.EAS_BUILD_ID || process.env.EAS_BUILD_PROFILE || process.env.EAS_BUILD;
      
      // Log token status for debugging (logs may appear in prebuild logs, not Gradle logs)
      console.log('[withMapboxGradle] Plugin executing...');
      console.log('[withMapboxGradle] Build context:', isBuildContext);
      console.log('[withMapboxGradle] Token available in prebuild:', !!mapboxToken);
      if (mapboxToken) {
        console.log('[withMapboxGradle] Token length:', mapboxToken.length);
        console.log('[withMapboxGradle] Token starts with:', mapboxToken.substring(0, 5));
      }
      console.log('[withMapboxGradle] Environment variables:');
      console.log('  - MAPBOX_DOWNLOADS_TOKEN:', !!process.env.MAPBOX_DOWNLOADS_TOKEN);
      console.log('  - MAPBOX_DOWNLOAD_TOKEN:', !!process.env.MAPBOX_DOWNLOAD_TOKEN);
      console.log('  - RNMAPBOX_MAPS_DOWNLOAD_TOKEN:', !!process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN);
      
      // NOTE: We don't throw an error here even if token is missing, because:
      // 1. Token might not be available during prebuild (EAS secrets injected later)
      // 2. Token will be available as environment variable during Gradle build
      // 3. Our repository configuration uses fallback chain to read from environment
      
      // However, if we have the token, we can write it to gradle.properties as a backup
      // This helps in case environment variables aren't accessible

      const platformProjectRoot = config.modRequest.platformProjectRoot;
      
      // Step 2a: Modify project-level build.gradle
      const buildGradlePath = path.join(platformProjectRoot, 'build.gradle');
      
      if (fs.existsSync(buildGradlePath)) {
        let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
        
        // Create authenticated Mapbox repository configuration
        // CRITICAL: Always use the fallback chain to read from environment variables
        // EAS secrets are available as environment variables during Gradle build,
        // but may not be available during prebuild when this plugin runs.
        // 
        // The fallback chain ensures Gradle will find the token from:
        // 1. gradle.properties (if we wrote it)
        // 2. Environment variables (where EAS injects secrets)
        // 
        // We use this approach instead of hardcoding, because:
        // - Token might not be available during prebuild
        // - Environment variables are the standard way EAS provides secrets
        // - Gradle can read environment variables during build execution
        // Create the repository configuration with fallback chain
        // CRITICAL: This reads from environment variables during Gradle build execution
        // EAS secrets are injected as environment variables, so System.getenv() will work
        const mapboxRepository = `
    maven {
        url 'https://api.mapbox.com/downloads/v2/releases/maven'
        authentication {
            create(BasicAuthentication)
        }
        credentials {
            username = 'mapbox'
            // CRITICAL: Fallback chain to read token from multiple sources
            // Priority order:
            // 1. gradle.properties (project.findProperty)
            // 2. Environment variables (System.getenv) - where EAS injects secrets
            // 
            // EAS secrets are available as environment variables during Gradle build,
            // so System.getenv('MAPBOX_DOWNLOADS_TOKEN') should work.
            password = project.findProperty('MAPBOX_DOWNLOADS_TOKEN') 
                ?: project.findProperty('MAPBOX_DOWNLOAD_TOKEN') 
                ?: project.findProperty('RNMAPBOX_MAPS_DOWNLOAD_TOKEN')
                ?: System.getenv('MAPBOX_DOWNLOADS_TOKEN') 
                ?: System.getenv('MAPBOX_DOWNLOAD_TOKEN') 
                ?: System.getenv('RNMAPBOX_MAPS_DOWNLOAD_TOKEN') 
                ?: ''
        }
    }`;
        
        // CRITICAL: Remove ALL existing Mapbox repository entries using multiple regex patterns
        // Pattern 1: Standard maven blocks with api.mapbox.com (matches most cases)
        buildGradle = buildGradle.replace(/maven\s*\{[\s\S]*?api\.mapbox\.com[\s\S]*?\}/g, '');
        
        // Pattern 2: @rnmapbox/maps generated blocks (multi-line with comments)
        // Remove the entire @generated begin/end block for @rnmapbox/maps-v2-maven
        buildGradle = buildGradle.replace(
          /\/\/ @generated begin @rnmapbox\/maps-v2-maven[\s\S]*?\/\/ @generated end @rnmapbox\/maps-v2-maven/g,
          ''
        );
        
        // Pattern 3: Remove any remaining mapbox.com references (catch-all)
        buildGradle = buildGradle.replace(/maven\s*\{[\s\S]*?mapbox\.com[\s\S]*?\}/g, '');
        
        // Pattern 4: Remove any hardcoded secret tokens (sk.eyJ...)
        // Match any line containing a Mapbox secret token pattern
        buildGradle = buildGradle.replace(/password\s*=\s*["']sk\.eyJ[^"']*["']/g, '');
        
        // Remove any empty allprojects blocks that might have been left behind
        buildGradle = buildGradle.replace(/allprojects\s*\{\s*repositories\s*\{\s*\}\s*\}/g, '');
        
        // Clean up excessive blank lines
        buildGradle = buildGradle.replace(/\n{3,}/g, '\n\n');
        
        // Now add the authenticated repository to allprojects.repositories
        // Simple strategy: Find existing allprojects.repositories and append our repo, or create new block
        
        // Try to find and modify existing allprojects { repositories { ... } }
        // This regex handles the common case where allprojects contains repositories
        const allProjectsRepoPattern = /(allprojects\s*\{[\s\S]*?repositories\s*\{)([\s\S]*?)(\s*\})([\s\S]*?\})/;
        const allProjectsMatch = buildGradle.match(allProjectsRepoPattern);
        
        if (allProjectsMatch) {
          // Found existing allprojects.repositories block
          let repositoriesContent = allProjectsMatch[2];
          
          // Remove any remaining Mapbox repos (shouldn't exist after cleanup above)
          repositoriesContent = repositoriesContent.replace(/maven\s*\{[\s\S]*?mapbox\.com[\s\S]*?\}/g, '');
          
          // Add our repository if not already present
          if (!repositoriesContent.includes('api.mapbox.com')) {
            // Clean up content
            repositoriesContent = repositoriesContent.trim();
            const needsNewline = repositoriesContent && !repositoriesContent.endsWith('\n');
            
            // Reconstruct the block with our repository
            buildGradle = buildGradle.replace(
              allProjectsMatch[0],
              `${allProjectsMatch[1]}${repositoriesContent}${needsNewline ? '\n    ' : ''}${mapboxRepository}${allProjectsMatch[3]}${allProjectsMatch[4]}`
            );
          }
        } else {
          // No allprojects.repositories found - create it
          // Look for existing allprojects block without repositories
          if (buildGradle.includes('allprojects')) {
            // Add repositories to existing allprojects block
            const allProjectsSimplePattern = /(allprojects\s*\{)([\s\S]*?)(\})/;
            const simpleMatch = buildGradle.match(allProjectsSimplePattern);
            if (simpleMatch) {
              buildGradle = buildGradle.replace(
                simpleMatch[0],
                `${simpleMatch[1]}${simpleMatch[2]}\n    repositories {${mapboxRepository}\n    }${simpleMatch[3]}`
              );
            }
          } else {
            // No allprojects block at all - create it after buildscript
            const buildscriptEnd = buildGradle.indexOf('}\n', buildGradle.indexOf('buildscript'));
            if (buildscriptEnd !== -1) {
              buildGradle = buildGradle.substring(0, buildscriptEnd + 2) +
                `\nallprojects {\n    repositories {${mapboxRepository}\n    }\n}` +
                buildGradle.substring(buildscriptEnd + 2);
            } else {
              // Last resort: append at end
              buildGradle += `\n\nallprojects {\n    repositories {${mapboxRepository}\n    }\n}`;
            }
          }
        }
        
        // Also ensure buildscript.repositories has the Mapbox repo if it exists
        const buildscriptPattern = /(buildscript\s*\{[^}]*repositories\s*\{)([\s\S]*?)(\s*\})/s;
        const buildscriptMatch = buildGradle.match(buildscriptPattern);
        
        if (buildscriptMatch) {
          let buildscriptRepos = buildscriptMatch[2];
          
          // Remove any Mapbox repos from buildscript (shouldn't exist after cleanup)
          buildscriptRepos = buildscriptRepos.replace(/maven\s*\{[\s\S]*?mapbox\.com[\s\S]*?\}/g, '');
          
          // Add authenticated repository if not present
          if (!buildscriptRepos.includes('api.mapbox.com')) {
            buildGradle = buildGradle.replace(
              buildscriptMatch[0],
              `${buildscriptMatch[1]}${buildscriptRepos}${mapboxRepository}${buildscriptMatch[3]}`
            );
          }
        }
        
        fs.writeFileSync(buildGradlePath, buildGradle, 'utf8');
      }
      
      // Step 2b: Clean up gradle.properties and ensure all token variable names are set
      const gradlePropertiesPath = path.join(platformProjectRoot, 'gradle.properties');
      
      if (fs.existsSync(gradlePropertiesPath)) {
        let gradleProperties = fs.readFileSync(gradlePropertiesPath, 'utf8');
        
        // Remove ALL hardcoded Mapbox tokens (match any token pattern)
        gradleProperties = gradleProperties.replace(
          /MAPBOX_DOWNLOAD_TOKEN=sk\.eyJ[^\n]*/g,
          ''
        );
        gradleProperties = gradleProperties.replace(
          /MAPBOX_DOWNLOADS_TOKEN=sk\.eyJ[^\n]*/g,
          ''
        );
        gradleProperties = gradleProperties.replace(
          /RNMAPBOX_MAPS_DOWNLOAD_TOKEN=sk\.eyJ[^\n]*/g,
          ''
        );
        
        // Remove any existing Mapbox token lines (to avoid duplicates)
        gradleProperties = gradleProperties.replace(/MAPBOX_DOWNLOAD_TOKEN=.*/g, '');
        gradleProperties = gradleProperties.replace(/MAPBOX_DOWNLOADS_TOKEN=.*/g, '');
        gradleProperties = gradleProperties.replace(/RNMAPBOX_MAPS_DOWNLOAD_TOKEN=.*/g, '');
        
        // Remove comments about Mapbox tokens (optional cleanup)
        gradleProperties = gradleProperties.replace(
          /#.*[Mm]apbox.*[Tt]oken.*/g,
          ''
        );
        
        // Clean up excessive blank lines
        gradleProperties = gradleProperties.replace(/\n{3,}/g, '\n\n');
        
        // Add comments and placeholder entries for Mapbox tokens
        // NOTE: We don't write the actual token value here because:
        // 1. Token might not be available during prebuild
        // 2. EAS secrets are injected as environment variables during Gradle build
        // 3. Our repository configuration reads from environment variables
        // 
        // However, we add the property names so they can be set if needed,
        // and to document what's expected
        gradleProperties += `\n# Mapbox Download Token (set via EAS secrets)\n`;
        gradleProperties += `# @rnmapbox/maps plugin checks for MAPBOX_DOWNLOADS_TOKEN (plural) first\n`;
        gradleProperties += `# CRITICAL: Token is injected by EAS as environment variable during build\n`;
        gradleProperties += `# The repository configuration will read from System.getenv('MAPBOX_DOWNLOADS_TOKEN')\n`;
        gradleProperties += `# If you need to set it in gradle.properties for local builds, uncomment and set:\n`;
        gradleProperties += `# MAPBOX_DOWNLOADS_TOKEN=your_token_here\n`;
        gradleProperties += `# MAPBOX_DOWNLOAD_TOKEN=your_token_here\n`;
        gradleProperties += `# RNMAPBOX_MAPS_DOWNLOAD_TOKEN=your_token_here\n`;
        
        // If we have the token during prebuild, write it as a backup
        // This helps with local builds and provides redundancy
        if (mapboxToken) {
          console.log('[withMapboxGradle] Token found during prebuild - writing to gradle.properties as backup');
          gradleProperties += `\n# Token from prebuild phase (backup - EAS will use environment variable)\n`;
          gradleProperties += `MAPBOX_DOWNLOADS_TOKEN=${mapboxToken}\n`;
          gradleProperties += `MAPBOX_DOWNLOAD_TOKEN=${mapboxToken}\n`;
          gradleProperties += `RNMAPBOX_MAPS_DOWNLOAD_TOKEN=${mapboxToken}\n`;
        } else {
          console.log('[withMapboxGradle] No token during prebuild - repository will read from environment variables during Gradle build');
        }
        
        fs.writeFileSync(gradlePropertiesPath, gradleProperties, 'utf8');
        console.log('[withMapboxGradle] Updated gradle.properties');
      }
      
      // Step 2c: Increase Gradle wrapper timeout
      const gradleWrapperPropertiesPath = path.join(
        platformProjectRoot,
        'gradle',
        'wrapper',
        'gradle-wrapper.properties'
      );
      
      if (fs.existsSync(gradleWrapperPropertiesPath)) {
        let gradleWrapperProps = fs.readFileSync(gradleWrapperPropertiesPath, 'utf8');
        
        gradleWrapperProps = gradleWrapperProps.replace(
          /networkTimeout=\d+/,
          'networkTimeout=60000'
        );
        
        if (!gradleWrapperProps.includes('networkTimeout=')) {
          gradleWrapperProps += '\nnetworkTimeout=60000';
        }
        
        fs.writeFileSync(gradleWrapperPropertiesPath, gradleWrapperProps, 'utf8');
      }
      
      return config;
    },
  ]);

  return config;
};

module.exports = withMapboxGradle;

