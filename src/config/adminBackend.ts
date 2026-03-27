const getEnvValue = (key: string): string | undefined => {
  const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
  return env?.[key];
};

export type AdminAuthMode = "dummy" | "rest";

const resolveAuthMode = (): AdminAuthMode => {
  return getEnvValue("VITE_ADMIN_AUTH_MODE") === "rest" ? "rest" : "dummy";
};

export const adminBackendConfig = {
  authMode: resolveAuthMode(),
  apiBaseUrl: getEnvValue("VITE_ADMIN_API_BASE_URL") || "/api/admin",
  royaltyImportUrl: getEnvValue("VITE_ADMIN_ROYALTY_IMPORT_URL") || "",
};

export const isAdminDummyAuthEnabled = (): boolean => adminBackendConfig.authMode === "dummy";