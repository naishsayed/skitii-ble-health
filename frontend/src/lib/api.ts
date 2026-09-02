const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function api(
  path: string,
  options: RequestInit = {},
) {
  const token = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}