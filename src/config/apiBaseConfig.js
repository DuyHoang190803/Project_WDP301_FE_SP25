export const apiBaseConfig = {
  baseURL: `${import.meta.env.VITE_PETHEAVEN_API}`,
  headers: {
    "Content-Type": "application/json",
    // "URL": window.location.href
  }
};