
// Mock for the 'redis' library
export const createClient = () => ({
  connect: async () => Promise.resolve(),
  on: (event: string, callback: any) => {
    // Simulate connect event immediately if needed, or just ignore
    if (event === 'connect') {
        // Optional: simulate connection success
    }
  },
  get: async () => null,
  set: async () => 'OK',
  del: async () => 1,
  disconnect: async () => Promise.resolve(),
  quit: async () => Promise.resolve(),
  isOpen: true,
});

export default {
  createClient,
};
