export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiClient {
  static get token() {
    return localStorage.getItem('badminton_token');
  }

  static set token(t: string | null) {
    if (t) localStorage.setItem('badminton_token', t);
    else localStorage.removeItem('badminton_token');
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}nocache=${Date.now()}`, { cache: 'no-store', 
      ...options,
      headers,
    });

    if (!response.ok) {
      let msg = response.statusText;
      try {
        const errData = await response.json();
        msg = errData.error || msg;
      } catch (e) {
        // ignore
      }
      throw new Error(msg);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  static get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static put<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static patch<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
