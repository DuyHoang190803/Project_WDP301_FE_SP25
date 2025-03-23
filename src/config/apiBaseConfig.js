export const apiBaseConfig = {
  baseURL: `http://${import.meta.env.VITE_PETHEAVEN_IP}:${import.meta.env.VITE_PETHEAVEN_PORT}`,
  headers: {
    "Content-Type": "application/json",
    // "URL": window.location.href
  }
};