const API_BASE = "api";
export async function registrarUsuario(data) {
    const response = await fetch(`${API_BASE}/registro.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return await response.json();
}
export async function loginUsuario(data) {
    const response = await fetch(`${API_BASE}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (response.ok && resData.token) {
        localStorage.setItem("bp_jwt_token", resData.token);
    }
    return resData;
}
export function obterToken() {
    return localStorage.getItem("bp_jwt_token");
}
export function logout() {
    localStorage.removeItem("bp_jwt_token");
}
