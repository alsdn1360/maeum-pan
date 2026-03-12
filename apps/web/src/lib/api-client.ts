const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;
const TIMEOUT_MS = 3 * 60 * 1000; // 3분

interface ApiErrorDetail {
  field?: string;
  message: string;
}

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetail[];
  };
}

const parseErrorMessage = (data: ApiErrorResponse | null) => {
  const errorMessage = data?.error?.message;

  if (errorMessage) {
    return errorMessage;
  }

  if (Array.isArray(data?.error?.details) && data.error.details.length > 0) {
    return (
      data.error.details[0]?.message || '요청 처리 중 오류가 발생했습니다.'
    );
  }

  return '요청 처리 중 오류가 발생했습니다.';
};

const parseResponseBody = <T>(text: string): T | ApiErrorResponse | null => {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T | ApiErrorResponse;
  } catch {
    return null;
  }
};

const request = async <T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    });

    const text = await res.text();
    const data = parseResponseBody<T>(text);

    if (!res.ok) {
      throw new Error(parseErrorMessage(data as ApiErrorResponse | null));
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out (3분 초과)');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),
  put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
