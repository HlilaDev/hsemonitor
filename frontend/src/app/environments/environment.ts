
export const environment = {
  production: false,
  baseUrl: (window as any).__env?.baseUrl || 'http://localhost:3002',
  apiBaseUrl: (window as any).__env?.apiBaseUrl || 'http://localhost:3002/api',
  uploadUrl: (window as any).__env?.uploadUrl || 'http://localhost:3002/uploads',
};