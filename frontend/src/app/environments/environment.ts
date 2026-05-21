export const environment = {
  production: false,
  baseUrl: (window as any).__env?.baseUrl || 'http://localhost:5000',
  apiBaseUrl: (window as any).__env?.apiBaseUrl || 'http://localhost:5000/api',
  uploadUrl: (window as any).__env?.uploadUrl || 'http://localhost:5000/uploads',
};