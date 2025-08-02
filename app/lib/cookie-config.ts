/**
 * Cookie configuration for Like2Win
 * Handles cross-site cookie settings for Farcaster frame embedding
 */

export const COOKIE_CONFIG = {
  // Default cookie options for cross-site context
  defaultOptions: {
    sameSite: 'none' as const,
    secure: true,
    httpOnly: false, // Allow client-side access for frame communication
    partitioned: true, // Chrome's new partitioned cookies
  },

  // Cookie names used by the app
  cookieNames: {
    session: 'like2win-session',
    preferences: 'like2win-prefs',
    frameState: 'like2win-frame-state',
  },

  // Domain configuration
  domain: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_URL?.replace('https://', '')
    : undefined,
};

/**
 * Set a cookie with secure cross-site options
 */
export function setSecureCookie(
  name: string, 
  value: string, 
  options: Partial<typeof COOKIE_CONFIG.defaultOptions> = {}
) {
  const cookieOptions = {
    ...COOKIE_CONFIG.defaultOptions,
    ...options,
  };

  const optionsString = Object.entries(cookieOptions)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? key : '';
      }
      return `${key}=${value}`;
    })
    .filter(Boolean)
    .join('; ');

  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${value}; ${optionsString}`;
  }
}

/**
 * Get cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string) {
  setSecureCookie(name, '', { 
    ...COOKIE_CONFIG.defaultOptions,
    maxAge: 0 
  });
}