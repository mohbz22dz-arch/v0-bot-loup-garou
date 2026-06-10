export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error ? JSON.stringify(error, null, 2) : '');
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  debug: (message: string, data?: unknown) => {
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
};
