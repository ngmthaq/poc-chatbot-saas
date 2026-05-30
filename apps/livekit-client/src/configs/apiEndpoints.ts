export const apiEndpoints = {
  // GET requests
  get: {
    health: () => {
      return '/health';
    },
  },

  // POST requests
  post: {
    liveKitToken: () => {
      return '/livekit/token';
    },
  },

  // PUT requests
  put: {},

  // PATCH requests
  patch: {},

  // DELETE requests
  delete: {},
};
