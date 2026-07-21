const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export async function login(
  email: string,
  senha: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      statusCode: res.status,
      message: "Erro ao autenticar",
    }));
    throw new AuthError(error.message, error.statusCode);
  }

  return res.json();
}

export async function refreshToken(
  refresh_token: string
): Promise<{ access_token: string; refresh_token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) {
    throw new AuthError("Sessão expirada", 401);
  }

  return res.json();
}

export async function logout(access_token: string): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });
}
