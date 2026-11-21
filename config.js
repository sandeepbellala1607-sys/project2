/**
 * ============================================================================
 * SMART EXPENSE TRACKER - RUNTIME ENVIRONMENT CONFIGURATION
 * ============================================================================
 * Production configuration settings.
 * Can be overridden by VITE environment variables if built with Vite.
 */
(function(window) {
  'use strict';

  // Read Vite env if available, otherwise use production defaults
  const viteEnv = (typeof importMeta !== 'undefined' && importMeta.env) ? importMeta.env : {};

  const Config = {
    // Canonical production domain
    APP_URL: viteEnv.VITE_APP_URL || 'https://myexpensetracker.com',

    // Alternative www domain
    APP_URL_WWW: viteEnv.VITE_APP_URL_WWW || 'https://www.myexpensetracker.com',

    // App identity
    APP_NAME: viteEnv.VITE_APP_NAME || 'NTSY.AI',
    CURRENCY: viteEnv.VITE_APP_CURRENCY || 'INR',
    LOCALE: viteEnv.VITE_APP_LOCALE || 'en-IN',
    ENV: viteEnv.VITE_APP_ENV || 'production',

    // Production routing config
    ROUTES: {
      HOME: '/',
      DASHBOARD: '/dashboard',
      TRANSACTIONS: '/transactions',
      ADD_TRANSACTION: '/add-transaction',
      REPORTS: '/reports',
      BUDGET: '/budget'
    },

    // Enforce HTTPS and canonical domain redirection in production browser
    enforceCanonical: function() {
      if (typeof window === 'undefined' || !window.location) return;

      const hostname = window.location.hostname;
      const protocol = window.location.protocol;

      // Skip redirection on local development servers
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local') || protocol === 'file:') {
        return;
      }

      // Upgrade HTTP to HTTPS if on production host
      if (protocol === 'http:' && !hostname.includes('localhost')) {
        window.location.href = window.location.href.replace('http:', 'https:');
        return;
      }

      // Redirect www.myexpensetracker.com to apex myexpensetracker.com
      if (hostname === 'www.myexpensetracker.com') {
        const canonicalTarget = 'https://myexpensetracker.com' + window.location.pathname + window.location.search + window.location.hash;
        window.location.replace(canonicalTarget);
      }
    }
  };

  // Run canonical check
  Config.enforceCanonical();

  // Export to global scope
  window.AppConfig = Object.freeze(Config);
})(typeof window !== 'undefined' ? window : this);
