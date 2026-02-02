const request = async <T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Error');
  }

  return data;
};

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
