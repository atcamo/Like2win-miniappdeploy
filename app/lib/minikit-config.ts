import type { MiniKitConfig } from '@/app/types/minikit';

/**
 * MiniKit configuration utility with environment validation
 */

export class MiniKitConfigError extends Error {
  constructor(
    message: string,
    public field: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'MiniKitConfigError';
  }
}

export const DEFAULT_CONFIG: MiniKitConfig = {
  apiKey: '',
  projectName: 'Like2Win',
  autoInitialize: true,
  retryAttempts: 3,
  retryDelay: 1000,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Validates required environment variables for Like2Win
 */
export function validateEnvironment(): string[] {
  const errors: string[] = [];
  
  // Only require URL for production deployment
  if (!process.env.NEXT_PUBLIC_URL && process.env.NODE_ENV === 'production') {
    errors.push('NEXT_PUBLIC_URL is required for production deployment');
  }
  
  // OnchainKit is optional for Like2Win - only warn if missing
  if (!process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY && process.env.NODE_ENV === 'production') {
    errors.push('NEXT_PUBLIC_ONCHAINKIT_API_KEY recommended for enhanced features');
  }

  // Validate Farcaster manifest variables if notifications are needed
  const manifestVars = [
    'FARCASTER_HEADER',
    'FARCASTER_PAYLOAD', 
    'FARCASTER_SIGNATURE'
  ];
  
  const missingManifest = manifestVars.filter(varName => !process.env[varName]);
  if (missingManifest.length > 0 && missingManifest.length < manifestVars.length) {
    errors.push('Partial Farcaster manifest configuration detected. All manifest variables are required for notifications.');
  }

  return errors;
}

/**
 * Creates validated MiniKit configuration
 */
export function createMiniKitConfig(overrides: Partial<MiniKitConfig> = {}): MiniKitConfig {
  const errors = validateEnvironment();
  
  if (errors.length > 0) {
    console.warn('MiniKit configuration warnings:', errors);
    
    // In development, just warn - don't block the app
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined';
    const isServerSide = typeof window === 'undefined';
    
    if (isDevelopment) {
      // Just log warnings in development, don't block
      console.warn('⚠️ Like2Win: Some environment variables are missing (this is OK for local development)');
      console.warn('For full functionality, check ENVIRONMENT_SETUP.md');
    } else if (!isBuildTime && !isServerSide && errors.length > 0) {
      // Only show error in production client-side
      console.error('❌ Like2Win: Missing environment variables. Check Vercel settings.');
      console.error('Required variables:', errors);
    }
    
    // Always return config, never crash the app
    // return DEFAULT_CONFIG;
  }

  const config: MiniKitConfig = {
    ...DEFAULT_CONFIG,
    apiKey: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '',
    projectName: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || DEFAULT_CONFIG.projectName,
    iconUrl: process.env.NEXT_PUBLIC_ICON_URL || `${process.env.NEXT_PUBLIC_URL || ''}/icon.png`,
    splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL || `${process.env.NEXT_PUBLIC_URL || ''}/splash.png`,
    splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || '#F59E0B',
    ...overrides,
  };

  // Validate final configuration (skip during build time)
  const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!config.apiKey && !isBuildTime && typeof window !== 'undefined' && !isDevelopment) {
    console.warn('⚠️ Like2Win: OnchainKit API key missing - some features may not work');
  }

  if (config.retryAttempts < 0 || config.retryAttempts > 10) {
    throw new MiniKitConfigError(
      'Retry attempts must be between 0 and 10',
      'retryAttempts'
    );
  }

  if (config.retryDelay < 100 || config.retryDelay > 10000) {
    throw new MiniKitConfigError(
      'Retry delay must be between 100ms and 10s',
      'retryDelay'
    );
  }

  return config;
}

/**
 * Checks if running in frame environment
 */
export function isFrameEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Farcaster frame indicators
  return !!(
    window.parent !== window ||
    window.location !== window.parent?.location ||
    document.referrer.includes('farcaster') ||
    window.navigator.userAgent.includes('Farcaster')
  );
}

/**
 * Gets frame-specific environment information
 */
export function getFrameEnvironmentInfo() {
  if (typeof window === 'undefined') {
    return {
      isFrame: false,
      userAgent: null,
      referrer: null,
      parentOrigin: null,
    };
  }

  return {
    isFrame: isFrameEnvironment(),
    userAgent: window.navigator.userAgent,
    referrer: document.referrer,
    parentOrigin: window.location.ancestorOrigins?.[0] || null,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
}

/**
 * Debug logging utility
 */
export function debugLog(message: string, data?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MiniKit Debug] ${message}`, data || '');
  }
}