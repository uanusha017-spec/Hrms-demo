export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  tenantId?: string,
  userId?: string
): Promise<T> {
  const activeTenantId = tenantId || localStorage.getItem('natton_tenant_id') || localStorage.getItem('zenith_tenant_id') || 'tenant-apex';
  const activeUserId = userId || localStorage.getItem('natton_user_id') || localStorage.getItem('zenith_user_id') || 'usr-apex-admin';
  const token = localStorage.getItem('natton_token');

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-tenant-id', activeTenantId);
  headers.set('x-user-id', activeUserId);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
