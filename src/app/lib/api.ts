const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  auth?: boolean; // set false to skip attaching the token (e.g. login/register)
}

// Session expired or invalid — clear stored auth and bounce to /login.
// Guard against the login page itself (a 401 there just means wrong credentials).
function handleUnauthorized() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');

  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => null);

  if (res.status === 401) {
    handleUnauthorized();
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

async function request(path: string, options: RequestOptions = {}) {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  return handleResponse(res);
}

export const api = {
  get: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'GET' }),

  post: (path: string, body?: unknown, options?: RequestOptions) =>
    request(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: (path: string, body?: unknown, options?: RequestOptions) =>
    request(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'DELETE' }),

  upload: async (path: string, formData: FormData) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers, // no Content-Type - browser sets multipart boundary automatically
      body: formData,
    });

    return handleResponse(res);
  },
};