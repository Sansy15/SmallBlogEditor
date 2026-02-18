/** API client for Smart Blog Editor backend */
const API_BASE = import.meta.env.VITE_API_URL || 'https://smart-blog-editor-api.onrender.com';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || String(err) || 'Request failed');
    }
    return res.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Failed to connect to server. Please check your connection.');
    }
    throw error;
  }
}

export const api = {
  posts: {
    list: (status?: string) =>
      fetchApi<Array<{ id: number; title: string; content: string | null; status: string; created_at: string; updated_at: string }>>(
        status ? `/api/posts/?status_filter=${status}` : '/api/posts/'
      ),
    get: (id: number) =>
      fetchApi<{ id: number; title: string; content: string | null; status: string; created_at: string; updated_at: string }>(
        `/api/posts/${id}`
      ),
    create: (data: { title?: string; content?: string }) =>
      fetchApi<{ id: number; title: string; content: string | null; status: string; created_at: string; updated_at: string }>(
        '/api/posts/',
        { method: 'POST', body: JSON.stringify(data) }
      ),
    update: (id: number, data: { title?: string; content?: string }) =>
      fetchApi<{ id: number; title: string; content: string | null; status: string; created_at: string; updated_at: string }>(
        `/api/posts/${id}`,
        { method: 'PATCH', body: JSON.stringify(data) }
      ),
    publish: (id: number) =>
      fetchApi<{ id: number; title: string; content: string | null; status: string; created_at: string; updated_at: string }>(
        `/api/posts/${id}/publish`,
        { method: 'POST' }
      ),
    delete: (id: number) =>
      fetchApi<{ ok: boolean }>(`/api/posts/${id}`, { method: 'DELETE' }),
  },
  auth: {
    signup: (email: string, password: string) =>
      fetchApi<{ access_token: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      fetchApi<{ access_token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },
  ai: {
    generate: (text: string, action: 'summary' | 'fix_grammar' | 'expand') =>
      fetchApi<{ result: string }>('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ text, action }),
      }),
  },
};
