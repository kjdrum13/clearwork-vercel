// clearwork-config.js
// Central config for all API endpoints.
// Vercel: functions live at /api/*
// Update this file if the deployment platform changes — nowhere else.

const CW_CONFIG = {
  api: {
    base:           '/api',
    vision:         '/api/vision',
    runway:         '/api/runway',
    newThought:     '/api/newthought',
    phaseReview:    '/api/phasereview',
    retro:          '/api/retro',
    captureEmail:   '/api/capture-email',
    saveProject:    '/api/save-project',
    restoreSession: '/api/restore-session',
    lemonWebhook:   '/api/lemonwebhook'
  },
  checkout: {
    monthly: (typeof window !== 'undefined' && window.__CW_MONTHLY_URL__)
      || 'https://oddlyuseful.co/checkout/buy/5ffc8171-48ee-4937-9191-1c73f44a7d57',
    yearly:  (typeof window !== 'undefined' && window.__CW_YEARLY_URL__)
      || 'https://oddlyuseful.co/checkout/buy/d5ecba1f-056b-4ab7-9d59-2dbbcc09d052'
  }
};

// Make available globally (app.html uses window.CW_CONFIG or falls back to direct paths)
if (typeof window !== 'undefined') {
  window.CW_CONFIG = CW_CONFIG;
}
