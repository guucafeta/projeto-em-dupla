export interface RegistroData {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface AuthResponse {
  mensagem?: string;
  erro?: string;
  token?: string;
}

const API_BASE = "api";

export async function registrarUsuario(
  data: RegistroData,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/registro.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await response.json();
}

export async function loginUsuario(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const resData: AuthResponse = await response.json();

  if (response.ok && resData.token) {
    localStorage.setItem("bp_jwt_token", resData.token);
  }

  return resData;
}

export function obterToken(): string | null {
  return localStorage.getItem("bp_jwt_token");
}

export function logout(): void {
  localStorage.removeItem("bp_jwt_token");
}
