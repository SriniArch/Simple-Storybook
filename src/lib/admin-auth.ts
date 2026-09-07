import { useSyncExternalStore } from "react";

const ADMIN_AUTH_STORAGE_KEY = "simple-storybook-admin-auth";
const ADMIN_CODE = (import.meta.env.VITE_ADMIN_CODE as string | undefined)?.trim() || "admin@1234Q";

let initialized = false;
let isAdminState = false;
const listeners = new Set<() => void>();

function readStoredAdminState() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true";
}

function writeStoredAdminState(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, value ? "true" : "false");
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  isAdminState = readStoredAdminState();
}

function notify() {
  listeners.forEach((listener) => listener());
}

function setAdminState(next: boolean) {
  ensureInitialized();
  isAdminState = next;
  writeStoredAdminState(next);
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureInitialized();
  return isAdminState;
}

function getServerSnapshot() {
  return false;
}

export function isAdminAuthenticated() {
  return getSnapshot();
}

export function useAdminAuth() {
  const isAdmin = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    isAdmin,
    login(code: string) {
      const isValid = code.trim() === ADMIN_CODE;
      if (isValid) {
        setAdminState(true);
      }
      return isValid;
    },
    logout() {
      setAdminState(false);
    },
  };
}
