export const ROASTIFY_CONFIG = {
  test: {
    apiKey: 'rty_test_rEg22yEbQKZYfXa1WqYtv6WSAAkG45odmkUXy8c2TKbenoa1NLzeQE8XpvznGKxFpio',
    baseUrl: 'https://trpc.roastify.app/v1',
  },
  live: {
    apiKey: 'rty_live_rFfGaKPwq9BxGwRi3eUpPwyCXYc9pmU5pReRAtA25o9VoTpz1efgMWVqvu3mz7mjkTp',
    baseUrl: 'https://trpc.roastify.app/v1',
  }
};

export const getCurrentConfig = () => {
  // Check environment variables first, fall back to hardcoded test key
  const mode = process.env.ROASTIFY_MODE || 'test';
  const isLive = mode === 'live';
  
  if (isLive) {
    return {
      apiKey: process.env.ROASTIFY_LIVE_API_KEY || ROASTIFY_CONFIG.live.apiKey,
      baseUrl: ROASTIFY_CONFIG.live.baseUrl,
      mode: 'live'
    };
  } else {
    return {
      apiKey: process.env.ROASTIFY_TEST_API_KEY || ROASTIFY_CONFIG.test.apiKey,
      baseUrl: ROASTIFY_CONFIG.test.baseUrl,
      mode: 'test'
    };
  }
};

export const isTestMode = () => {
  const config = getCurrentConfig();
  return config.mode === 'test';
};
