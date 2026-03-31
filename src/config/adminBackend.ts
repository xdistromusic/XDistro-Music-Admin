const getEnvValue = (key: string): string | undefined => {
  const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
  return env?.[key];
};

export type AdminAuthMode = "dummy" | "rest";
export type AdminDataMode = "dummy" | "rest";

const resolveAuthMode = (): AdminAuthMode => {
  return "rest";
};

const resolveDataMode = (): AdminDataMode => {
  return "rest";
};

export const adminBackendConfig = {
  authMode: resolveAuthMode(),
  dataMode: resolveDataMode(),
  apiBaseUrl: getEnvValue("VITE_ADMIN_API_BASE_URL") || "/api/admin",
  royaltyImportUrl: getEnvValue("VITE_ADMIN_ROYALTY_IMPORT_URL") || "",
  supabaseAnonKey: getEnvValue("VITE_SUPABASE_ANON_KEY") || "",
};

export const isAdminDummyAuthEnabled = (): boolean => adminBackendConfig.authMode === "dummy";
export const isAdminDummyDataEnabled = (): boolean => adminBackendConfig.dataMode === "dummy";