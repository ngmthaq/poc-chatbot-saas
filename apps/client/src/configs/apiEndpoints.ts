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
    chat: () => {
      return '/chat';
    },
  },

  // PUT requests
  put: {},

  // PATCH requests
  patch: {},

  // DELETE requests
  delete: {},
};
