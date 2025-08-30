/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/api.ts
// Lee de import.meta.env (Vite) o de process.env (Jest/Node) como fallback.
export const API_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) ||
  '';
